let wastedTime = 0;
let isDistracted = false;
let intervalId = null;
let isActive = true;
let allowlist = ['github.com', 'stackoverflow.com', 'localhost', 'google.com'];

// --- MENU KLIK KANAN (CONTEXT MENU) ---
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "masa-add-whitelist",
    title: "Tambahkan ke Whitelist (&M)",
    contexts: ["all"] // Akan muncul saat klik kanan di mana saja (halaman, gambar, header)
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "masa-add-whitelist") {
    if (!tab || !tab.url) return;
    try {
      const url = new URL(tab.url);
      if (url.protocol.startsWith('http')) {
        const domain = url.hostname;
        // Ambil list terbaru dan tambahkan
        chrome.storage.local.get(['allowlist'], (result) => {
          let currentList = result.allowlist || allowlist;
          if (!currentList.includes(domain)) {
            currentList.push(domain);
            chrome.storage.local.set({ allowlist: currentList });
          }
        });
      }
    } catch(e) {}
  }
});
// ----------------------------------------

chrome.storage.local.get(['allowlist', 'wastedTime', 'isActive'], (result) => {
  if (result.allowlist) allowlist = result.allowlist;
  if (result.wastedTime) wastedTime = result.wastedTime;
  if (result.isActive !== undefined) isActive = result.isActive;
});

// Pantau perubahan Storage (seperti saat domain ditambahkan dari klik kanan)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.wastedTime) wastedTime = changes.wastedTime.newValue;
  
  // Jika allowlist bertambah, langsung evaluasi tab saat ini!
  if (changes.allowlist) {
    allowlist = changes.allowlist.newValue;
    checkActiveTab(); // Memaksa overlay langsung hilang seketika jika web masuk whitelist
  }
  
  if (changes.isActive) {
    isActive = changes.isActive.newValue;
    if (!isActive) {
      setDistracted(false);
      chrome.tabs.query({}, function(tabs) {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, { action: 'hideOverlay' }).catch(() => {});
        });
      });
    } else {
      checkActiveTab();
    }
  }
});

function checkActiveTab() {
  if (!isActive) {
    setDistracted(false);
    return;
  }
  
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      chrome.tabs.query({ active: true, currentWindow: true }, (fallbackTabs) => {
        if (fallbackTabs.length > 0) evaluateTab(fallbackTabs[0]);
        else setDistracted(false);
      });
      return;
    }
    evaluateTab(tabs[0]);
  });
}

function evaluateTab(activeTab) {
  if (!activeTab.url || activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('edge://') || activeTab.url.startsWith('about:')) {
     setDistracted(false);
     return;
  }
  try {
    const url = new URL(activeTab.url);
    const isAllowed = allowlist.some(domain => url.hostname.includes(domain));
    setDistracted(!isAllowed, activeTab.id);
  } catch (e) {
    setDistracted(false);
  }
}

function sendUpdateToTab(tabId) {
  chrome.tabs.sendMessage(tabId, { action: 'updateTime', time: wastedTime }).catch(() => {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).then(() => {
      chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ['content.css']
      });
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, { action: 'updateTime', time: wastedTime }).catch(() => {});
      }, 100);
    }).catch(() => {});
  });
}

function setDistracted(distracted, tabId = null) {
  if (distracted) {
    if (!isDistracted) {
      isDistracted = true;
      intervalId = setInterval(() => {
        wastedTime++;
        chrome.storage.local.set({ wastedTime });
        
        chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs){
          if(tabs[0]) sendUpdateToTab(tabs[0].id);
        });
      }, 1000);
    }
    if (tabId) sendUpdateToTab(tabId);
    
  } else {
    // Mematikan timer dan menyembunyikan overlay
    if (isDistracted) {
      isDistracted = false;
      clearInterval(intervalId);
    }
    // Selalu pastikan tab saat ini menyembunyikan overlay (jika baru saja dimasukkan ke whitelist)
    chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs){
      if(tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'hideOverlay' }).catch(() => {});
      }
    });
  }
}

chrome.tabs.onActivated.addListener(checkActiveTab);
chrome.tabs.onUpdated.addListener(checkActiveTab);
chrome.windows.onFocusChanged.addListener(checkActiveTab);
