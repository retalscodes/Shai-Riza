const STAMPS_GOAL = 10;
let currentCustomer = null;

const phoneInput = document.getElementById('phoneInput');
const lookupBtn = document.getElementById('lookupBtn');
const lookupBox = document.getElementById('lookupBox');
const cardWrap = document.getElementById('cardWrap');
const registerBox = document.getElementById('registerBox');
const registerBtn = document.getElementById('registerBtn');
const switchCardBtn = document.getElementById('switchCardBtn');
const freeDrinkBanner = document.getElementById('freeDrinkBanner');
const stampsGrid = document.getElementById('stampsGrid');

function formatPhone(raw) {
  return raw.replace(/\s+/g, '').replace(/[^\d+]/g, '');
}

async function lookupCustomer(phone) {
  lookupBtn.disabled = true;
  lookupBtn.textContent = '…';
  try {
    const res = await fetch(`/api/loyalty-lookup?phone=${encodeURIComponent(phone)}`);
    const data = await res.json();
    if (res.status === 404) {
      showRegisterFlow(phone);
    } else if (res.ok) {
      showCard(data);
    } else {
      showToast(data.error || 'Something went wrong', 'error');
    }
  } catch (_) {
    // Offline / no backend — demo mode
    showDemoCard(phone);
  } finally {
    lookupBtn.disabled = false;
    lookupBtn.textContent = document.documentElement.lang === 'ar' ? 'ابحث عن بطاقتي' : 'Find My Card';
  }
}

function showRegisterFlow(phone) {
  lookupBox.style.display = 'none';
  registerBox.classList.add('show');
  registerBox.dataset.phone = phone;
}

async function registerCustomer() {
  const phone = registerBox.dataset.phone;
  const name = document.getElementById('regName').value.trim();
  registerBtn.disabled = true;
  try {
    const res = await fetch('/api/loyalty-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name }),
    });
    const data = await res.json();
    if (res.ok) {
      registerBox.classList.remove('show');
      showCard(data);
    } else {
      showToast(data.error || 'Registration failed', 'error');
    }
  } catch (_) {
    registerBox.classList.remove('show');
    showDemoCard(phone, name);
  } finally {
    registerBtn.disabled = false;
  }
}

function showDemoCard(phone, name = '') {
  showCard({ phone, name: name || 'Guest', stamps: 0, total_stamps: 0, history: [] });
}

function showCard(customer) {
  currentCustomer = customer;
  lookupBox.style.display = 'none';
  registerBox.classList.remove('show');
  cardWrap.classList.add('visible');

  document.getElementById('cardName').textContent = customer.name || 'Guest';
  document.getElementById('cardPhone').textContent = customer.phone;

  const stamps = customer.stamps || 0;
  const total = customer.total_stamps || stamps;
  document.getElementById('stampsCount').textContent = stamps;
  document.getElementById('stampsGoal').textContent = STAMPS_GOAL;
  document.getElementById('totalEarned').textContent = `${total} total collected`;

  renderStamps(stamps);

  if (stamps >= STAMPS_GOAL) {
    freeDrinkBanner.classList.add('show');
  }

  const historyList = document.getElementById('historyList');
  const history = customer.history || [];
  if (history.length) {
    document.getElementById('historySection').classList.add('show');
    historyList.innerHTML = history.slice(0, 10).map(h => `
      <div class="history-item">
        <span class="htype ${h.action === 'redeem' ? 'redeem' : ''}">${h.action === 'redeem' ? '🎁 Redeemed' : '☕ Stamp'}</span>
        <span class="hdate">${formatDate(h.created_at)}</span>
      </div>`).join('');
  }
}

function renderStamps(count, animate = false) {
  stampsGrid.innerHTML = '';
  for (let i = 0; i < STAMPS_GOAL; i++) {
    const dot = document.createElement('div');
    dot.className = 'stamp';
    if (i === STAMPS_GOAL - 1) dot.classList.add('reward');
    if (i < count) {
      dot.classList.add('filled');
      if (animate && i === count - 1) dot.classList.add('pop');
    }
    stampsGrid.appendChild(dot);
  }
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (_) { return iso; }
}

// Events
lookupBtn?.addEventListener('click', () => {
  const phone = formatPhone(phoneInput.value);
  if (phone.length < 7) { showToast('Please enter a valid phone number', 'error'); return; }
  lookupCustomer(phone);
});

phoneInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') lookupBtn.click();
});

registerBtn?.addEventListener('click', registerCustomer);

switchCardBtn?.addEventListener('click', () => {
  currentCustomer = null;
  cardWrap.classList.remove('visible');
  freeDrinkBanner.classList.remove('show');
  document.getElementById('historySection').classList.remove('show');
  lookupBox.style.display = '';
  phoneInput.value = '';
  phoneInput.focus();
});
