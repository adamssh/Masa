let wastedTime = 0;
let isDistracted = false;
let intervalId = null;
let isActive = true;
let allowlist = ['github.com', 'stackoverflow.com', 'localhost', 'google.com'];

chrome.storage.local.get(['allowlist', 'wastedTime', 'isActive'], (result) => {
  if (result.allowlist) allowlist = result.allowlist;
  if (result.wastedTime) wastedTime = result.wastedTime;
  if (result.isActive !== undefined) isActive = result.isActive;
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.allowlist) allowlist = changes.allowlist.newValue;
  if (changes.wastedTime) wastedTime = changes.wastedTime.newValue;
  
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
  
  // Deteksi window paling aktif (lebih stabil dari currentWindow saat beralih aplikasi)
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      // Fallback
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
    // Kita berikan tab.id agar setDistracted bisa memaksa update seketika ke tab tersebut
    setDistracted(!isAllowed, activeTab.id);
  } catch (e) {
    setDistracted(false);
  }
}

function sendUpdateToTab(tabId) {
  chrome.tabs.sendMessage(tabId, { action: 'updateTime', time: wastedTime }).catch(() => {
    // JIKA GAGAL: Artinya ini adalah tab lama yang sudah terbuka sebelum ekstensi diinstal.
    // Kita akan suntikkan file Javascript & CSS secara paksa ke tab lama tersebut.
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).then(() => {
      chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ['content.css']
      });
      // Kirim ulang info waktunya setelah tab lama berhasil dipasangi sistem ekstensi
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
          if(tabs[0]) {
            sendUpdateToTab(tabs[0].id);
          }
        });
      }, 1000);
    }
    
    // PEMBARUAN: Paksa langsung timer muncul SEKETIKA saat Anda klik tab non-produktif lama.
    // Tidak perlu menunggu 1 detik putaran timer.
    if (tabId) {
      sendUpdateToTab(tabId);
    }
    
  } else {
    if (isDistracted) {
      isDistracted = false;
      clearInterval(intervalId);
      
      chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs){
        if(tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'hideOverlay' }).catch(() => {});
        }
      });
    }
  }
}

chrome.tabs.onActivated.addListener(checkActiveTab);
chrome.tabs.onUpdated.addListener(checkActiveTab);
chrome.windows.onFocusChanged.addListener(checkActiveTab);
