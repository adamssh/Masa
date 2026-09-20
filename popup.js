let allowlist = [];

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}

function renderList() {
  const ul = document.getElementById('allowlist-ul');
  ul.innerHTML = '';
  allowlist.forEach((domain, index) => {
    const li = document.createElement('li');
    li.textContent = domain;
    
    const delBtn = document.createElement('button');
    delBtn.textContent = '✕';
    delBtn.title = 'Hapus dari daftar';
    delBtn.onclick = () => {
      allowlist.splice(index, 1);
      chrome.storage.local.set({ allowlist }, renderList);
    };
    
    li.appendChild(delBtn);
    ul.appendChild(li);
  });
}

// Inisialisasi data saat popup dibuka
chrome.storage.local.get(['allowlist', 'wastedTime'], (result) => {
  allowlist = result.allowlist || ['github.com', 'stackoverflow.com', 'localhost', 'google.com'];
  document.getElementById('time-display').textContent = formatTime(result.wastedTime || 0);
  renderList();
});

// Update UI secara real-time jika waktu bertambah di background
chrome.storage.onChanged.addListener((changes) => {
  if (changes.wastedTime) {
    document.getElementById('time-display').textContent = formatTime(changes.wastedTime.newValue);
  }
});

// Tambah domain baru
document.getElementById('add-btn').onclick = () => {
  const input = document.getElementById('new-domain');
  let domain = input.value.trim().toLowerCase();
  
  // Bersihkan input (misal user masukin https://github.com/ jadi github.com)
  try {
    if (domain.startsWith('http')) {
      domain = new URL(domain).hostname;
    }
  } catch(e) {}
  
  if (domain && !allowlist.includes(domain)) {
    allowlist.push(domain);
    chrome.storage.local.set({ allowlist }, () => {
      input.value = '';
      renderList();
    });
  }
};

// Reset waktu
document.getElementById('reset-btn').onclick = () => {
  if(confirm('Yakin ingin mereset waktu terbuang Anda menjadi 0?')) {
    chrome.storage.local.set({ wastedTime: 0 });
  }
};

// Enter key support untuk input
document.getElementById('new-domain').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      document.getElementById('add-btn').click();
    }
});

