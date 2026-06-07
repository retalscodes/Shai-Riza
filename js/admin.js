// ── ADMIN LANGUAGE ───────────────────────────────────
const ADMIN_STRINGS = {
  en: {
    dashboard: ['Dashboard', 'Good to see you 👋'],
    menu:      ['Menu Editor', 'Add, edit or remove items'],
    gallery:   ['Gallery', 'Manage your photos'],
    special:   ["Today's Special", 'Highlight a featured item'],
    about:     ['About & Hours', 'Edit your story and opening times'],
    loyalty:   ['Add a Stamp', 'Log a customer purchase'],
    customers: ['All Customers', 'Browse loyalty card holders'],
    sidebarLinks: { dashboard:'Dashboard', menu:'Menu', gallery:'Gallery', special:"Today's Special", about:'About & Hours', loyalty:'Add a Stamp', customers:'All Customers' },
    viewSite: 'View Website', logout: 'Logout',
    langBtn: 'عربي',
  },
  ar: {
    dashboard: ['لوحة التحكم', 'أهلاً وسهلاً 👋'],
    menu:      ['تعديل القائمة', 'أضف أو عدّل أو احذف الأصناف'],
    gallery:   ['معرض الصور', 'أدر صورك'],
    special:   ['عرض اليوم', 'أبرز صنفاً مميزاً'],
    about:     ['من نحن وأوقات العمل', 'عدّل قصتك وأوقات الدوام'],
    loyalty:   ['أضف طابع', 'سجّل طلب العميل'],
    customers: ['كل العملاء', 'تصفح حاملي بطاقات الولاء'],
    sidebarLinks: { dashboard:'لوحة التحكم', menu:'القائمة', gallery:'الصور', special:'عرض اليوم', about:'من نحن', loyalty:'أضف طابع', customers:'العملاء' },
    viewSite: 'زيارة الموقع', logout: 'تسجيل الخروج',
    langBtn: 'English',
  },
};

let adminLang = localStorage.getItem('rizaAdminLang') || 'en';

function applyAdminLang(lang) {
  adminLang = lang;
  localStorage.setItem('rizaAdminLang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir  = lang === 'ar' ? 'rtl' : 'ltr';
  const s = ADMIN_STRINGS[lang];
  const btn = document.getElementById('adminLangToggle');
  if (btn) btn.textContent = s.langBtn;
  // Sidebar links
  document.querySelectorAll('.sidebar-link[data-page]').forEach(el => {
    const page = el.dataset.page;
    const icon = el.querySelector('.icon')?.outerHTML || '';
    if (s.sidebarLinks[page]) el.innerHTML = `${icon} ${s.sidebarLinks[page]}`;
  });
  // Footer links
  const viewSite = document.querySelector('.sidebar-footer .sidebar-link:not(#logoutBtn)');
  if (viewSite) viewSite.innerHTML = `<span class="icon">🌐</span> ${s.viewSite}`;
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.innerHTML = `<span class="icon">🚪</span> ${s.logout}`;
  // Re-apply current page title
  const activePage = document.querySelector('.sidebar-link.active')?.dataset?.page;
  if (activePage && s[activePage]) {
    document.getElementById('pageTitle').textContent    = s[activePage][0];
    document.getElementById('pageSubtitle').textContent = s[activePage][1];
  }
}

// ── UTILS ───────────────────────────────────────────
function showToast(msg, type = 'info', duration = 3500) {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type]||'ℹ️'}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), duration);
}

function fmtDate(iso) {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }); }
  catch { return iso; }
}

// ── AUTH ─────────────────────────────────────────────
let authToken = sessionStorage.getItem('rizaAdminToken') || '';

async function tryLogin() {
  const pw = document.getElementById('loginPassword').value;
  if (!pw) return;
  try {
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    const data = await res.json();
    if (res.ok && data.token) {
      authToken = data.token;
      sessionStorage.setItem('rizaAdminToken', authToken);
      enterAdmin();
    } else {
      document.getElementById('loginError').style.display = 'block';
    }
  } catch (err) {
    console.error('Admin login error:', err);
    document.getElementById('loginError').style.display = 'block';
  }
}

function enterAdmin() {
  document.getElementById('loginWrap').style.display = 'none';
  document.getElementById('adminLayout').style.display = 'flex';
  initAdmin();
}

function logout() {
  authToken = '';
  sessionStorage.removeItem('rizaAdminToken');
  document.getElementById('adminLayout').style.display = 'none';
  document.getElementById('loginWrap').style.display = 'flex';
  document.getElementById('loginPassword').value = '';
  document.getElementById('loginError').style.display = 'none';
}

// ── NAVIGATION ───────────────────────────────────────

function showPage(id) {
  document.querySelectorAll('[id^="page-"]').forEach(p => p.style.display = 'none');
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const page = document.getElementById(`page-${id}`);
  if (page) page.style.display = 'block';
  const link = document.querySelector(`.sidebar-link[data-page="${id}"]`);
  if (link) link.classList.add('active');
  const [title, sub] = (ADMIN_STRINGS[adminLang]?.[id]) || [id, ''];
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageSubtitle').textContent = sub;
  closeSidebar();
  loadPageData(id);
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

// ── INIT ─────────────────────────────────────────────
function initAdmin() {
  document.getElementById('topbarDate').textContent = new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });
  applyAdminLang(adminLang);
  showPage('dashboard');
  buildHoursEditor();
}

async function apiFetch(path, opts = {}) {
  return fetch(path, {
    ...opts,
    headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json', ...(opts.headers||{}) },
  });
}

// ── PAGE LOADERS ─────────────────────────────────────
async function loadPageData(id) {
  if (id === 'dashboard')  loadDashboard();
  if (id === 'menu')       loadMenuItems();
  if (id === 'gallery')    loadGallery();
  if (id === 'special')    loadSpecial();
  if (id === 'about')      loadAbout();
  if (id === 'customers')  loadCustomers();
}

// DASHBOARD
async function loadDashboard() {
  try {
    const res = await apiFetch('/api/admin-stats');
    const d = await res.json();
    document.getElementById('statCustomers').textContent = d.customers ?? '—';
    document.getElementById('statStamps').textContent = d.stamps ?? '—';
    document.getElementById('statFree').textContent = d.free_drinks ?? '—';
    document.getElementById('statMenu').textContent = d.menu_items ?? '—';

    if (d.recent_stamps) {
      document.getElementById('recentStamps').innerHTML = d.recent_stamps.length
        ? d.recent_stamps.map(s => `
            <div style="display:flex;justify-content:space-between;padding:.5rem 0;border-bottom:1px solid rgba(200,134,10,.06)">
              <span style="color:var(--cream);font-size:.85rem">${s.customer_name || s.customer_phone}</span>
              <span style="color:var(--muted);font-size:.8rem">${fmtDate(s.created_at)}</span>
            </div>`).join('')
        : '<div class="text-muted text-sm">No stamps yet</div>';
    }
  } catch {
    document.getElementById('statCustomers').textContent = '—';
  }
}

// MENU
let menuItems = [];
let menuFilterCat = 'all';

async function loadMenuItems() {
  try {
    const res = await apiFetch('/api/get-menu');
    if (res.ok) { menuItems = await res.json(); }
  } catch { menuItems = getLocalMenuData(); }
  renderMenuTable();
}

function getLocalMenuData() {
  // Fallback menu data (same as menu.js)
  return [
    { id:'1', category:'tea', name_en:'Ghada Tea', name_ar:'شاي غادة', price:1, available:true },
    { id:'2', category:'tea', name_en:'Smoked Tea', name_ar:'شاي مدخن', price:1, available:true },
    { id:'3', category:'tea', name_en:'Oooh Tea', name_ar:'شاي اوووه', price:1, available:true },
    { id:'4', category:'tea', name_en:'Iraqi Khiyam Tea', name_ar:'شاي خيام عراقي', price:1, available:true },
    { id:'5', category:'tea', name_en:'Arba 7 7 7 Tea', name_ar:'شاي أربع 777', price:1, available:true },
    { id:'6', category:'tea', name_en:'Iraqi Maareb Tea', name_ar:'شاي معارب عراقي', price:1, available:true },
    { id:'7', category:'tea', name_en:'Khalid Tea', name_ar:'شاي خالد', price:1, available:true },
    { id:'8', category:'tea', name_en:'Salmoon Tea', name_ar:'شاي السلمون', price:1, available:true },
    { id:'9', category:'tea', name_en:'Al-Fakhn Tea', name_ar:'شاي الفخن', price:1, available:true },
    { id:'10', category:'tea', name_en:'Khadeer Tea', name_ar:'شاي خضير', price:1, available:true },
    { id:'11', category:'tea', name_en:'Karak Chai (Saffron Masala)', name_ar:'كرك تشاي (زعفران مسالة)', price_label:'AED 1.2 / 1.5', available:true },
    { id:'12', category:'coffee', name_en:'Turkish Coffee (Al Ameed)', name_ar:'قهوة تركية (بن السيد)', price:2, available:true },
    { id:'13', category:'coffee', name_en:'V.6.0', name_ar:'V.6.0', price:3.5, available:true },
    { id:'14', category:'cold', name_en:'Blueberry Mojito', name_ar:'موهيتو بلوبيري', price:3.5, available:true },
    { id:'15', category:'cold', name_en:'Strawberry Mojito', name_ar:'موهيتو فراولة', price:2.5, available:true },
    { id:'16', category:'cold', name_en:'Classic Mojito', name_ar:'موهيتو كلاسيك', price:2, available:true },
    { id:'17', category:'cold', name_en:'Iced Tea Peach', name_ar:'آيس تي خوخ', price:3.5, available:true },
    { id:'18', category:'cold', name_en:'Iced Matcha', name_ar:'آيس ماتشا', price:4, available:true },
    { id:'19', category:'cold', name_en:'Water Bottle', name_ar:'زجاجة ماء', price:1, available:true },
    { id:'20', category:'acai', name_en:'Acai Smoothie', name_ar:'سموذي أساي', price:4, available:true },
    { id:'21', category:'acai', name_en:'Acai Signature', name_ar:'أساي سيغنتشر', price:5, available:true },
    { id:'22', category:'breakfast', name_en:'Egg Toast', name_ar:'توست بيض', price:3, available:true },
    { id:'23', category:'breakfast', name_en:'Halloumi Cheese & Avocado Toast', name_ar:'توست حلوم وأفوكادو', price:4, available:true },
    { id:'24', category:'breakfast', name_en:'Halloumi Cheese Croissant', name_ar:'كرواسون حلوم', price:3.5, available:true },
    { id:'25', category:'breakfast', name_en:'Cheese Pie', name_ar:'فطيرة الجبن', price:4.2, available:true },
    { id:'26', category:'desserts', name_en:'Karak Cake', name_ar:'كيكة كرك', price:3, available:true },
    { id:'27', category:'desserts', name_en:'Crème Caramel', name_ar:'كريم كراميل', price:2.5, available:true },
    { id:'28', category:'desserts', name_en:'Croissant Beehive', name_ar:'كرواسون بيهايف', price:3.5, available:true },
    { id:'29', category:'desserts', name_en:'Beehive with Cheese', name_ar:'بيهايف بالجبنة', price:4, available:true },
    { id:'30', category:'desserts', name_en:'Basbousa', name_ar:'بسبوسة', price:2, available:true },
  ];
}

function renderMenuTable() {
  const tbody = document.getElementById('menuTableBody');
  const items = menuFilterCat === 'all' ? menuItems : menuItems.filter(i => i.category === menuFilterCat);
  tbody.innerHTML = items.map(item => `
    <tr>
      <td>${item.name_en}</td>
      <td dir="rtl">${item.name_ar}</td>
      <td><span class="badge badge-muted">${item.category}</span></td>
      <td>${item.price_label || (item.price ? 'AED ' + item.price : '—')}</td>
      <td>
        <label class="toggle">
          <input type="checkbox" ${item.available !== false ? 'checked' : ''}
            onchange="toggleAvailability('${item.id}', this.checked)"/>
          <span class="toggle-slider"></span>
        </label>
      </td>
      <td>
        <button class="btn btn-outline btn-sm btn-icon" onclick="editItem('${item.id}')" title="Edit">✏️</button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="deleteItem('${item.id}')" title="Delete">🗑️</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="6" class="text-muted text-sm" style="text-align:center;padding:2rem">No items</td></tr>';
}

function editItem(id) {
  const item = menuItems.find(i => i.id == id);
  if (!item) return;
  document.getElementById('editItemId').value = item.id;
  document.getElementById('itemNameEn').value = item.name_en;
  document.getElementById('itemNameAr').value = item.name_ar;
  document.getElementById('itemCategory').value = item.category;
  document.getElementById('itemPrice').value = item.price || '';
  document.getElementById('itemPriceLabel').value = item.price_label || '';
  document.getElementById('itemDescEn').value = item.description_en || '';
  document.getElementById('itemDescAr').value = item.description_ar || '';
  document.getElementById('itemAvailable').checked = item.available !== false;
  document.getElementById('itemFormTitle').textContent = 'Edit Menu Item';
  document.getElementById('itemForm').style.display = 'block';
  document.getElementById('itemForm').scrollIntoView({ behavior: 'smooth' });
}

async function saveItem() {
  const id = document.getElementById('editItemId').value;
  const payload = {
    name_en: document.getElementById('itemNameEn').value.trim(),
    name_ar: document.getElementById('itemNameAr').value.trim(),
    category: document.getElementById('itemCategory').value,
    price: parseFloat(document.getElementById('itemPrice').value) || null,
    price_label: document.getElementById('itemPriceLabel').value.trim() || null,
    description_en: document.getElementById('itemDescEn').value.trim() || null,
    description_ar: document.getElementById('itemDescAr').value.trim() || null,
    available: document.getElementById('itemAvailable').checked,
  };
  if (!payload.name_en || !payload.name_ar) { showToast('Both names are required', 'error'); return; }

  try {
    const url = id ? `/api/admin-menu-item?id=${id}` : '/api/admin-menu-item';
    const method = id ? 'PUT' : 'POST';
    const res = await apiFetch(url, { method, body: JSON.stringify(payload) });
    const data = await res.json();
    if (res.ok) {
      showToast(id ? 'Item updated!' : 'Item added!', 'success');
      document.getElementById('itemForm').style.display = 'none';
      document.getElementById('editItemId').value = '';
      loadMenuItems();
    } else { showToast(data.error || 'Save failed', 'error'); }
  } catch {
    showToast('Saved locally (no backend)', 'info');
    document.getElementById('itemForm').style.display = 'none';
  }
}

async function deleteItem(id) {
  if (!confirm('Delete this item?')) return;
  try {
    const res = await apiFetch(`/api/admin-menu-item?id=${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Item deleted', 'success'); loadMenuItems(); }
    else showToast('Delete failed', 'error');
  } catch { showToast('Could not connect to server', 'error'); }
}

async function toggleAvailability(id, available) {
  try { await apiFetch(`/api/admin-menu-item?id=${id}`, { method: 'PATCH', body: JSON.stringify({ available }) }); }
  catch { /* optimistic */ }
}

// GALLERY
let galleryItems = [];

async function loadGallery() {
  try {
    const res = await apiFetch('/api/get-settings?key=gallery');
    if (res.ok) { const d = await res.json(); galleryItems = d.gallery || []; }
  } catch { galleryItems = []; }
  renderGallery();
}

function renderGallery() {
  const grid = document.getElementById('adminGalleryGrid');
  if (!galleryItems.length) { grid.innerHTML = '<div class="text-muted text-sm mt-2">No photos yet. Upload some above!</div>'; return; }
  grid.innerHTML = galleryItems.map((img, i) => `
    <div class="gallery-thumb">
      <img src="${img.url}" alt="${img.alt_en || ''}"/>
      <div class="gallery-thumb-del" onclick="deleteGalleryItem(${i})">×</div>
    </div>`).join('');
}

async function uploadGalleryFiles(files) {
  for (const file of Array.from(files)) {
    if (file.size > 5 * 1024 * 1024) { showToast(`${file.name} is too large (max 5 MB)`, 'error'); continue; }
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: form,
      });
      const d = await res.json();
      if (res.ok && d.url) {
        galleryItems.push({ url: d.url, alt_en: file.name });
        await saveGallery();
        showToast('Photo uploaded!', 'success');
      } else { showToast('Upload failed: ' + (d.error || 'unknown'), 'error'); }
    } catch { showToast('Upload requires backend — add photo URL manually', 'info'); }
  }
  renderGallery();
}

async function deleteGalleryItem(i) {
  if (!confirm('Remove this photo?')) return;
  galleryItems.splice(i, 1);
  await saveGallery();
  renderGallery();
}

async function saveGallery() {
  try { await apiFetch('/api/admin-update-settings', { method: 'POST', body: JSON.stringify({ key: 'gallery', value: galleryItems }) }); }
  catch { /* offline */ }
}

// SPECIAL
async function loadSpecial() {
  try {
    const res = await apiFetch('/api/get-settings?key=special');
    if (res.ok) {
      const d = await res.json();
      document.getElementById('specialEnabled').checked = !!d.special_enabled;
      document.getElementById('specialTitle').value = d.special_title || "Today's Special";
      document.getElementById('specialText').value = d.special_text || '';
      document.getElementById('specialPrice').value = d.special_price || '';
    }
  } catch {}
}

async function saveSpecial() {
  const payload = {
    special_enabled: document.getElementById('specialEnabled').checked,
    special_title: document.getElementById('specialTitle').value.trim(),
    special_text: document.getElementById('specialText').value.trim(),
    special_price: document.getElementById('specialPrice').value || null,
  };
  try {
    const res = await apiFetch('/api/admin-update-settings', { method: 'POST', body: JSON.stringify({ key: 'special', value: payload }) });
    showToast(res.ok ? "Special saved!" : "Save failed", res.ok ? 'success' : 'error');
  } catch { showToast('Saved (offline mode)', 'info'); }
}

// ABOUT & HOURS
const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
let hoursData = DAYS.map(d => ({ day: d, open: '10:00', close: '22:00', closed: d === 'Friday' }));

function buildHoursEditor() {
  const editor = document.getElementById('hoursEditor');
  if (!editor) return;
  editor.innerHTML = hoursData.map((h, i) => `
    <div class="hour-row">
      <span class="day-name">${h.day}</span>
      <input type="time" id="hOpen${i}" value="${h.open}" ${h.closed ? 'disabled' : ''}/>
      <input type="time" id="hClose${i}" value="${h.close}" ${h.closed ? 'disabled' : ''}/>
      <label class="hour-closed-toggle">
        <input type="checkbox" ${h.closed ? 'checked' : ''} onchange="toggleDayClosed(${i}, this.checked)"/>
        Closed
      </label>
    </div>`).join('');
}

function toggleDayClosed(i, closed) {
  hoursData[i].closed = closed;
  document.getElementById(`hOpen${i}`).disabled = closed;
  document.getElementById(`hClose${i}`).disabled = closed;
}

async function loadAbout() {
  try {
    const res = await apiFetch('/api/get-settings?key=about');
    if (res.ok) {
      const d = await res.json();
      document.getElementById('aboutP1').value = d.about_p1 || '';
      document.getElementById('aboutP2').value = d.about_p2 || '';
      document.getElementById('aboutImage').value = d.about_image || '';
      if (d.hours) { hoursData = d.hours; buildHoursEditor(); }
    }
  } catch {}
}

async function saveAbout() {
  const payload = {
    about_p1: document.getElementById('aboutP1').value.trim(),
    about_p2: document.getElementById('aboutP2').value.trim(),
    about_image: document.getElementById('aboutImage').value.trim(),
  };
  try {
    const res = await apiFetch('/api/admin-update-settings', { method: 'POST', body: JSON.stringify({ key: 'about', value: payload }) });
    showToast(res.ok ? 'About saved!' : 'Save failed', res.ok ? 'success' : 'error');
  } catch { showToast('Saved (offline mode)', 'info'); }
}

async function saveHours() {
  const updated = hoursData.map((h, i) => ({
    day: h.day,
    open:  document.getElementById(`hOpen${i}`)?.value  || h.open,
    close: document.getElementById(`hClose${i}`)?.value || h.close,
    closed: h.closed,
  }));
  try {
    const res = await apiFetch('/api/admin-update-settings', { method: 'POST', body: JSON.stringify({ key: 'hours', value: updated }) });
    showToast(res.ok ? 'Hours saved!' : 'Save failed', res.ok ? 'success' : 'error');
  } catch { showToast('Saved (offline mode)', 'info'); }
}

// LOYALTY – STAMP
let stampCustomer = null;

async function findCustomer() {
  const phone = document.getElementById('stampPhone').value.replace(/\s/g, '');
  if (!phone) { showToast('Enter a phone number', 'error'); return; }
  try {
    const res = await apiFetch(`/api/loyalty-lookup?phone=${encodeURIComponent(phone)}`);
    const data = await res.json();
    if (res.status === 404) {
      if (confirm(`No card found for ${phone}. Create one?`)) {
        const name = prompt('Customer name (optional):') || '';
        const cRes = await apiFetch('/api/loyalty-register', { method: 'POST', body: JSON.stringify({ phone, name }) });
        const cData = await cRes.json();
        if (cRes.ok) { stampCustomer = cData; renderStampCard(); }
        else showToast(cData.error || 'Failed to create', 'error');
      }
    } else if (res.ok) {
      stampCustomer = data; renderStampCard();
    } else showToast(data.error || 'Lookup failed', 'error');
  } catch {
    showToast('Cannot reach server — check connection', 'error');
  }
}

function renderStampCard() {
  if (!stampCustomer) return;
  const card = document.getElementById('stampCustomerCard');
  card.style.display = 'block';
  document.getElementById('stampCustomerName').textContent = stampCustomer.name || 'Guest';
  document.getElementById('stampCustomerPhone').textContent = stampCustomer.phone;

  const goal = 10;
  const stamps = stampCustomer.stamps || 0;
  document.getElementById('stampStatus').textContent = `${stamps} / ${goal} stamps`;

  const dots = document.getElementById('stampDots');
  dots.innerHTML = '';
  for (let i = 0; i < goal; i++) {
    const d = document.createElement('div');
    d.className = 'stamp-dot' + (i < stamps ? ' filled' : '');
    d.textContent = i === goal - 1 ? '🎁' : (i < stamps ? '☕' : '');
    dots.appendChild(d);
  }

  const redeemBtn = document.getElementById('redeemBtn');
  redeemBtn.style.display = stamps >= goal ? 'inline-flex' : 'none';
}

async function addStamp() {
  if (!stampCustomer) return;
  const btn = document.getElementById('addStampBtn');
  btn.disabled = true;
  try {
    const res = await apiFetch('/api/loyalty-stamp', {
      method: 'POST',
      body: JSON.stringify({ phone: stampCustomer.phone, action: 'stamp' }),
    });
    const data = await res.json();
    if (res.ok) {
      stampCustomer = data;
      renderStampCard();
      // Animate last stamp
      const dots = document.querySelectorAll('.stamp-dot');
      const filled = Array.from(dots).filter(d => d.classList.contains('filled'));
      if (filled.length) filled[filled.length - 1].classList.add('new-stamp');
      showToast('Stamp added! ☕', 'success');
    } else showToast(data.error || 'Failed', 'error');
  } catch { showToast('Could not connect to server', 'error'); }
  finally { btn.disabled = false; }
}

async function redeemDrink() {
  if (!stampCustomer) return;
  if (!confirm('Redeem free drink for this customer?')) return;
  try {
    const res = await apiFetch('/api/loyalty-stamp', {
      method: 'POST',
      body: JSON.stringify({ phone: stampCustomer.phone, action: 'redeem' }),
    });
    const data = await res.json();
    if (res.ok) {
      stampCustomer = data;
      renderStampCard();
      showToast('Free drink redeemed! 🎉', 'success');
    } else showToast(data.error || 'Failed', 'error');
  } catch { showToast('Could not connect to server', 'error'); }
}

// CUSTOMERS LIST
let allCustomers = [];

async function loadCustomers() {
  try {
    const res = await apiFetch('/api/admin-customers');
    if (res.ok) allCustomers = await res.json();
  } catch { allCustomers = []; }
  renderCustomers(allCustomers);
}

function renderCustomers(list) {
  const tbody = document.getElementById('customersTableBody');
  const empty = document.getElementById('customersEmpty');
  if (!list.length) { tbody.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  tbody.innerHTML = list.map(c => `
    <tr>
      <td>${c.name || '—'}</td>
      <td>${c.phone}</td>
      <td><span class="badge badge-gold">${c.stamps || 0} / 10</span></td>
      <td>${c.total_stamps || 0}</td>
      <td>${c.free_drinks_earned || 0}</td>
      <td class="text-muted text-sm">${fmtDate(c.created_at)}</td>
    </tr>`).join('');
}

// ── EVENT BINDINGS ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Login
  document.getElementById('loginBtn')?.addEventListener('click', tryLogin);
  document.getElementById('loginPassword')?.addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });

  // Sidebar nav
  document.querySelectorAll('.sidebar-link[data-page]').forEach(link => {
    link.addEventListener('click', e => { e.preventDefault(); showPage(link.dataset.page); });
  });

  // Mobile sidebar
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  menuToggle?.addEventListener('click', () => { sidebar.classList.toggle('open'); overlay.classList.toggle('open'); });
  overlay?.addEventListener('click', closeSidebar);

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', logout);

  // Menu editor
  document.getElementById('addItemBtn')?.addEventListener('click', () => {
    document.getElementById('editItemId').value = '';
    document.getElementById('itemFormTitle').textContent = 'Add Menu Item';
    ['itemNameEn','itemNameAr','itemPrice','itemPriceLabel','itemDescEn','itemDescAr'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('itemAvailable').checked = true;
    document.getElementById('itemForm').style.display = 'block';
    document.getElementById('itemForm').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('saveItemBtn')?.addEventListener('click', saveItem);

  document.querySelectorAll('#adminMenuCats .cat-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#adminMenuCats .cat-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      menuFilterCat = btn.dataset.cat;
      renderMenuTable();
    });
  });

  // Gallery upload
  const uploadZone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('galleryFileInput');
  uploadZone?.addEventListener('click', () => fileInput.click());
  uploadZone?.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag'); });
  uploadZone?.addEventListener('dragleave', () => uploadZone.classList.remove('drag'));
  uploadZone?.addEventListener('drop', e => { e.preventDefault(); uploadZone.classList.remove('drag'); uploadGalleryFiles(e.dataTransfer.files); });
  fileInput?.addEventListener('change', e => uploadGalleryFiles(e.target.files));

  // Special
  document.getElementById('saveSpecialBtn')?.addEventListener('click', saveSpecial);

  // About
  document.getElementById('saveAboutBtn')?.addEventListener('click', saveAbout);
  document.getElementById('saveHoursBtn')?.addEventListener('click', saveHours);

  // Loyalty stamp
  document.getElementById('findCustomerBtn')?.addEventListener('click', findCustomer);
  document.getElementById('stampPhone')?.addEventListener('keydown', e => { if (e.key === 'Enter') findCustomer(); });
  document.getElementById('addStampBtn')?.addEventListener('click', addStamp);
  document.getElementById('redeemBtn')?.addEventListener('click', redeemDrink);

  // Customers search
  document.getElementById('customersSearch')?.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    renderCustomers(allCustomers.filter(c =>
      (c.name||'').toLowerCase().includes(q) || c.phone.includes(q)
    ));
  });

  // Admin language toggle
  document.getElementById('adminLangToggle')?.addEventListener('click', () => {
    applyAdminLang(adminLang === 'ar' ? 'en' : 'ar');
  });

  // Auto-login if token exists
  if (authToken) enterAdmin();
});
