let allowlist = [];
let isActive = true;

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
chrome.storage.local.get(['allowlist', 'wastedTime', 'isActive'], (result) => {
  allowlist = result.allowlist || ['github.com', 'stackoverflow.com', 'localhost', 'google.com'];
  
  if (result.isActive !== undefined) {
    isActive = result.isActive;
  }
  document.getElementById('master-toggle').checked = isActive;
  
  document.getElementById('time-display').textContent = formatTime(result.wastedTime || 0);
  renderList();
});

// Update UI jika state berubah
chrome.storage.onChanged.addListener((changes) => {
  if (changes.wastedTime) {
    document.getElementById('time-display').textContent = formatTime(changes.wastedTime.newValue);
  }
});

// Toggle Master Switch
document.getElementById('master-toggle').addEventListener('change', (e) => {
  const isChecked = e.target.checked;
  chrome.storage.local.set({ isActive: isChecked });
});

// Tambah domain baru
document.getElementById('add-btn').onclick = () => {
  const input = document.getElementById('new-domain');
  let domain = input.value.trim().toLowerCase();
  
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

// Reset Waktu - Inline UI (Menghindari bug window.confirm)
const resetBtn = document.getElementById('reset-btn');
const confirmUI = document.getElementById('reset-confirm');
const yesBtn = document.getElementById('reset-yes');
const noBtn = document.getElementById('reset-no');

resetBtn.onclick = () => {
  resetBtn.classList.add('hidden');
  confirmUI.classList.remove('hidden');
};

yesBtn.onclick = () => {
  chrome.storage.local.set({ wastedTime: 0 }, () => {
    confirmUI.classList.add('hidden');
    resetBtn.classList.remove('hidden');
  });
};

noBtn.onclick = () => {
  confirmUI.classList.add('hidden');
  resetBtn.classList.remove('hidden');
};

// Enter key support untuk input
document.getElementById('new-domain').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      document.getElementById('add-btn').click();
    }
});
