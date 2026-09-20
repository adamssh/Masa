let overlay = null;

function createOverlay() {
  if (overlay) return;
  overlay = document.createElement('div');
  overlay.id = 'masa-focus-overlay';
  document.body.appendChild(overlay);
}

function removeOverlay() {
  if (overlay) {
    overlay.remove();
    overlay = null;
  }
}

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

// Mendengarkan update waktu dari background.js setiap detik
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateTime') {
    createOverlay();
    overlay.innerText = `⚠️ Waktu Terbuang: ${formatTime(request.time)}`;
  }
});

// Pengecekan awal saat halaman dimuat
chrome.storage.local.get(['allowlist', 'wastedTime'], (result) => {
  const allowlist = result.allowlist || ['github.com', 'stackoverflow.com', 'localhost', 'google.com'];
  const hostname = window.location.hostname;
  
  // Jika URL tidak valid, hindari error
  if (!hostname) return;
  
  const isAllowed = allowlist.some(domain => hostname.includes(domain));
  if (!isAllowed) {
    createOverlay();
    overlay.innerText = `⚠️ Waktu Terbuang: ${formatTime(result.wastedTime || 0)}`;
  }
});

