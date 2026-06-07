const MENU_DATA = [
  // HOT DRINKS – TEA
  { category: 'tea', name_en: 'Ghada Tea', name_ar: 'شاي غادة', price: 1, available: true },
  { category: 'tea', name_en: 'Smoked Tea', name_ar: 'شاي مدخن', price: 1, available: true },
  { category: 'tea', name_en: 'Oooh Tea', name_ar: 'شاي اوووه', price: 1, available: true },
  { category: 'tea', name_en: 'Iraqi Khiyam Tea', name_ar: 'شاي خيام عراقي', price: 1, available: true },
  { category: 'tea', name_en: 'Arba 7 7 7 Tea', name_ar: 'شاي أربع 777', price: 1, available: true },
  { category: 'tea', name_en: 'Iraqi Maareb Tea', name_ar: 'شاي معارب عراقي', price: 1, available: true },
  { category: 'tea', name_en: 'Khalid Tea', name_ar: 'شاي خالد', price: 1, available: true },
  { category: 'tea', name_en: 'Salmoon Tea', name_ar: 'شاي السلمون', price: 1, available: true },
  { category: 'tea', name_en: 'Al-Fakhn Tea', name_ar: 'شاي الفخن', price: 1, available: true },
  { category: 'tea', name_en: 'Khadeer Tea', name_ar: 'شاي خضير', price: 1, available: true },
  { category: 'tea', name_en: 'Karak Chai (Saffron Masala)', name_ar: 'كرك تشاي (زعفران مسالة)', price_label: 'AED 1.2 / 1.5', available: true },
  // COFFEE
  { category: 'coffee', name_en: 'Turkish Coffee (Al Ameed)', name_ar: 'قهوة تركية (بن السيد)', price: 2, available: true },
  { category: 'coffee', name_en: 'V.6.0', name_ar: 'V.6.0', price: 3.5, available: true },
  // COLD DRINKS
  { category: 'cold', name_en: 'Blueberry Mojito', name_ar: 'موهيتو بلوبيري', price: 3.5, available: true },
  { category: 'cold', name_en: 'Strawberry Mojito', name_ar: 'موهيتو فراولة', price: 2.5, available: true },
  { category: 'cold', name_en: 'Classic Mojito', name_ar: 'موهيتو كلاسيك', price: 2, available: true },
  { category: 'cold', name_en: 'Iced Tea Peach', name_ar: 'آيس تي خوخ', price: 3.5, available: true },
  { category: 'cold', name_en: 'Iced Matcha', name_ar: 'آيس ماتشا', price: 4, available: true },
  { category: 'cold', name_en: 'Water Bottle', name_ar: 'زجاجة ماء', price: 1, available: true },
  // ACAI
  { category: 'acai', name_en: 'Acai Smoothie', name_ar: 'سموذي أساي', price: 4, available: true },
  { category: 'acai', name_en: 'Acai Signature', name_ar: 'أساي سيغنتشر', price: 5, available: true },
  // BREAKFAST
  { category: 'breakfast', name_en: 'Egg Toast', name_ar: 'توست بيض', price: 3, available: true },
  { category: 'breakfast', name_en: 'Halloumi Cheese & Avocado Toast', name_ar: 'توست حلوم وأفوكادو', price: 4, available: true },
  { category: 'breakfast', name_en: 'Halloumi Cheese Croissant', name_ar: 'كرواسون حلوم', price: 3.5, available: true },
  { category: 'breakfast', name_en: 'Cheese Pie', name_ar: 'فطيرة الجبن', price: 4.2, available: true },
  // DESSERTS & SNACKS
  { category: 'desserts', name_en: 'Karak Cake', name_ar: 'كيكة كرك', price: 3, available: true },
  { category: 'desserts', name_en: 'Crème Caramel', name_ar: 'كريم كراميل', price: 2.5, available: true },
  { category: 'desserts', name_en: 'Croissant Beehive', name_ar: 'كرواسون بيهايف', price: 3.5, available: true },
  { category: 'desserts', name_en: 'Beehive with Cheese', name_ar: 'بيهايف بالجبنة', price: 4, available: true },
  { category: 'desserts', name_en: 'Basbousa', name_ar: 'بسبوسة', price: 2, available: true },
];

const CATEGORIES = [
  { id: 'tea',      label_en: 'Hot Tea',         label_ar: 'الشاي الساخن',       icon: '🍵' },
  { id: 'coffee',   label_en: 'Coffee',          label_ar: 'قهوة',               icon: '☕' },
  { id: 'cold',     label_en: 'Cold Drinks',     label_ar: 'المشروبات الباردة',  icon: '🧊' },
  { id: 'acai',     label_en: 'Acai',            label_ar: 'أساي',               icon: '🫙' },
  { id: 'breakfast',label_en: 'Breakfast',       label_ar: 'فطور',               icon: '🍳' },
  { id: 'desserts', label_en: 'Desserts & Snacks',label_ar: 'حلويات وسناكس',   icon: '🍰' },
];

let menuItems = [...MENU_DATA];
let activeCategory = 'all';
let searchQuery = '';

async function loadMenuFromAPI() {
  try {
    const res = await fetch('/api/get-menu');
    if (res.ok) {
      const data = await res.json();
      if (data.length) menuItems = data;
    }
  } catch (_) {}
  renderMenu();
}

function buildCategoryTabs() {
  const container = document.getElementById('menuCats');
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'menu-cat-btn';
    btn.dataset.cat = cat.id;
    btn.innerHTML = `${cat.icon} <span>${currentLang === 'ar' ? cat.label_ar : cat.label_en}</span>`;
    btn.addEventListener('click', () => {
      activeCategory = cat.id;
      document.querySelectorAll('.menu-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderMenu();
    });
    container.appendChild(btn);
  });
}

function renderMenu() {
  const body = document.getElementById('menuBody');
  const lang = currentLang || 'en';
  const query = searchQuery.toLowerCase();

  const filtered = menuItems.filter(item => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = !query ||
      item.name_en.toLowerCase().includes(query) ||
      item.name_ar.includes(query) ||
      (item.description_en || '').toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  if (!filtered.length) {
    body.innerHTML = `<div class="no-results"><span>🔍</span><p>No items found for "${searchQuery}"</p></div>`;
    return;
  }

  const sections = {};
  filtered.forEach(item => {
    if (!sections[item.category]) sections[item.category] = [];
    sections[item.category].push(item);
  });

  body.innerHTML = Object.entries(sections).map(([catId, items]) => {
    const cat = CATEGORIES.find(c => c.id === catId) || { icon: '☕', label_en: catId, label_ar: catId };
    return `
      <div class="menu-section">
        <div class="menu-section-header">
          <div class="menu-section-icon">${cat.icon}</div>
          <div>
            <div class="menu-section-title">${lang === 'ar' ? cat.label_ar : cat.label_en}</div>
            <div class="menu-section-title-ar">${lang === 'ar' ? cat.label_en : cat.label_ar}</div>
          </div>
        </div>
        <div class="menu-grid">
          ${items.map(item => `
            <div class="menu-item${item.available === false ? ' menu-item-unavail' : ''}">
              <div class="menu-item-info">
                <div class="menu-item-name">
                  ${lang === 'ar' ? item.name_ar : item.name_en}
                  ${item.available === false ? '<span class="menu-item-badge">Unavailable</span>' : ''}
                </div>
                <div class="menu-item-name-ar">${lang === 'ar' ? item.name_en : item.name_ar}</div>
                ${item.description_en ? `<div class="menu-item-desc">${lang === 'ar' ? (item.description_ar || item.description_en) : item.description_en}</div>` : ''}
              </div>
              <div class="menu-item-price">
                ${item.price_label ? item.price_label : (item.price ? 'AED ' + item.price.toFixed(2) : '')}
              </div>
            </div>`).join('')}
        </div>
      </div>`;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  buildCategoryTabs();
  loadMenuFromAPI();

  const search = document.getElementById('menuSearch');
  search?.addEventListener('input', e => {
    searchQuery = e.target.value;
    renderMenu();
  });
});

// Re-render when language changes
document.getElementById('langToggle')?.addEventListener('click', () => {
  setTimeout(renderMenu, 50);
});
