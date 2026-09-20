let wastedTime = 0;
let isDistracted = false;
let intervalId = null;
// Default allowlist (website produktif)
let allowlist = ['github.com', 'stackoverflow.com', 'localhost', 'google.com'];

// Ambil data yang tersimpan saat service worker menyala
chrome.storage.local.get(['allowlist', 'wastedTime'], (result) => {
  if (result.allowlist) allowlist = result.allowlist;
  if (result.wastedTime) wastedTime = result.wastedTime;
});

// Update data lokal jika pengguna mengubah allowlist di popup
chrome.storage.onChanged.addListener((changes) => {
  if (changes.allowlist) allowlist = changes.allowlist.newValue;
  if (changes.wastedTime) wastedTime = changes.wastedTime.newValue;
});

// Mengecek apakah tab yang sedang dilihat termasuk dalam allowlist atau tidak
function checkActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      setDistracted(false);
      return;
    }
    const activeTab = tabs[0];
    // Abaikan halaman internal browser (seperti pengaturan, tab baru)
    if (!activeTab.url || activeTab.url.startsWith('chrome://') || activeTab.url.startsWith('edge://') || activeTab.url.startsWith('about:')) {
       setDistracted(false);
       return;
    }
    try {
      const url = new URL(activeTab.url);
      const isAllowed = allowlist.some(domain => url.hostname.includes(domain));
      setDistracted(!isAllowed); // Jika tidak allowed, berarti distracted (terdistraksi)
    } catch (e) {
      setDistracted(false);
    }
  });
}

function setDistracted(distracted) {
  if (distracted && !isDistracted) {
    isDistracted = true;
    // Mulai stopwatch
    intervalId = setInterval(() => {
      wastedTime++;
      chrome.storage.local.set({ wastedTime });
      // Kirim waktu terbaru ke content script di halaman web untuk ditampilkan
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        if(tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { action: 'updateTime', time: wastedTime }).catch(() => {});
        }
      });
    }, 1000); // 1 detik
  } else if (!distracted && isDistracted) {
    isDistracted = false;
    // Hentikan stopwatch karena user sudah kembali fokus
    clearInterval(intervalId);
  }
}

// Pantau setiap ada tab yang berpindah, diperbarui, atau jendela berganti
chrome.tabs.onActivated.addListener(checkActiveTab);
chrome.tabs.onUpdated.addListener(checkActiveTab);
chrome.windows.onFocusChanged.addListener(checkActiveTab);

