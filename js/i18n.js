const translations = {
  en: {
    nav_home: 'Home', nav_menu: 'Menu', nav_loyalty: 'Loyalty Card', nav_contact: 'Contact',
    hero_badge: 'Specialty Tea House',
    hero_tagline: 'Where every sip tells a story. Handcrafted teas, bold karak, and flavours you won\'t find anywhere else.',
    hero_cta1: 'Explore Menu', hero_cta2: 'My Loyalty Card',
    featured_label: 'Our Favourites', featured_title: 'Made to Savour',
    featured_sub: 'A curated taste of what makes Riza special.',
    featured_more: 'View Full Menu →',
    about_label: 'Our Story', about_title: 'More Than Tea',
    about_p1: 'Riza Tea was born from a love of warmth — the kind you feel in a quiet moment with the perfect cup. Every blend we serve is chosen with care.',
    about_p2: 'From bold Iraqi teas to our famous saffron karak, our menu celebrates tradition while welcoming new flavours. Come sit with us.',
    hours_title: 'Opening Hours',
    gallery_label: 'Moments', gallery_title: 'From Our Cup to Yours',
    loyalty_cta_label: 'Loyalty Programme',
    loyalty_cta_title: 'Your 10th drink is on us',
    loyalty_cta_sub: 'Collect a stamp with every drink. Fill your card and earn a free one.',
    loyalty_cta_btn: 'Check My Card',
    contact_label: 'Find Us', contact_title: 'Come Visit Us',
    contact_loc: 'Location', contact_hours: 'Hours',
    footer_tagline: 'Every cup, a moment worth remembering.',
    menu_label: 'What We Serve', menu_title: 'Our Menu',
    menu_sub: 'Prices in AED. All items freshly prepared.',
    menu_search_placeholder: 'Search menu…',
    cat_all: 'All',
    loyalty_title: 'Your Loyalty Card',
    loyalty_sub: 'Enter your phone number to see your stamps and rewards.',
    loyalty_lookup_btn: 'Find My Card',
    loyalty_new_hint: 'New customer? We\'ll create your card automatically.',
    loyalty_free_msg: 'Show this to the cashier to claim your free drink.',
    loyalty_stamps_label: ' stamps',
    loyalty_history: 'Stamp History',
    loyalty_switch: '← Use a different number',
    loyalty_register_title: 'Welcome to Riza! 👋',
    loyalty_register_sub: 'First time here? Add your name to personalise your card.',
    loyalty_register_btn: 'Create My Card',
  },
  ar: {
    nav_home: 'الرئيسية', nav_menu: 'القائمة', nav_loyalty: 'بطاقة الولاء', nav_contact: 'تواصل معنا',
    hero_badge: 'بيت الشاي المتخصص',
    hero_tagline: 'حيث كل رشفة تحكي قصة. شاي محضّر بعناية، كرك جريء، ونكهات لن تجدها في أي مكان آخر.',
    hero_cta1: 'استعرض القائمة', hero_cta2: 'بطاقتي',
    featured_label: 'أبرز ما لدينا', featured_title: 'لذة لا تُنسى',
    featured_sub: 'اختيارات مميزة تعكس ما يجعل ريزا مختلفة.',
    featured_more: 'القائمة الكاملة ←',
    about_label: 'قصتنا', about_title: 'أكثر من مجرد شاي',
    about_p1: 'وُلد شاي ريزا من شغف بالدفء — ذلك الشعور في لحظة هادئة مع كوب مثالي. كل مزيج نقدمه يُختار بعناية.',
    about_p2: 'من شاي عراقي جريء إلى كراكنا الشهير بالزعفران، قائمتنا تحتفي بالتقليد وتستقبل النكهات الجديدة. تعال اجلس معنا.',
    hours_title: 'أوقات العمل',
    gallery_label: 'لحظات', gallery_title: 'من كوبنا إلى كوبك',
    loyalty_cta_label: 'برنامج الولاء',
    loyalty_cta_title: 'مشروبك العاشر على حسابنا',
    loyalty_cta_sub: 'اجمع طابعاً مع كل مشروب. أكمل البطاقة واحصل على مشروب مجاني.',
    loyalty_cta_btn: 'تحقق من بطاقتي',
    contact_label: 'زورونا', contact_title: 'أين نحن',
    contact_loc: 'الموقع', contact_hours: 'أوقات العمل',
    footer_tagline: 'كل كوب، لحظة تستحق التذكر.',
    menu_label: 'ما نقدمه', menu_title: 'قائمتنا',
    menu_sub: 'الأسعار بالدرهم الإماراتي. جميع الأصناف تُحضَّر طازجة.',
    menu_search_placeholder: 'ابحث في القائمة…',
    cat_all: 'الكل',
    loyalty_title: 'بطاقة ولائك',
    loyalty_sub: 'أدخل رقم هاتفك لعرض طوابعك ومكافآتك.',
    loyalty_lookup_btn: 'ابحث عن بطاقتي',
    loyalty_new_hint: 'عميل جديد؟ سننشئ بطاقتك تلقائياً.',
    loyalty_free_msg: 'أرِ هذا للكاشير للحصول على مشروبك المجاني.',
    loyalty_stamps_label: ' طوابع',
    loyalty_history: 'سجل الطوابع',
    loyalty_switch: 'استخدم رقماً مختلفاً ←',
    loyalty_register_title: 'مرحباً بك في ريزا! 👋',
    loyalty_register_sub: 'أول مرة هنا؟ أضف اسمك لتخصيص بطاقتك.',
    loyalty_register_btn: 'أنشئ بطاقتي',
  }
};

let currentLang = localStorage.getItem('rizaLang') || 'en';

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('rizaLang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  const t = translations[lang];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (t[key] !== undefined) el.placeholder = t[key];
  });

  document.querySelectorAll('[data-i18n-ar]').forEach(el => {
    if (lang === 'ar') el.textContent = el.dataset.i18nAr;
    else el.textContent = '';
  });

  const btn = document.getElementById('langToggle');
  if (btn) btn.textContent = lang === 'ar' ? 'English' : 'عربي';
}

document.addEventListener('DOMContentLoaded', () => {
  applyLang(currentLang);
  const btn = document.getElementById('langToggle');
  if (btn) btn.addEventListener('click', () => applyLang(currentLang === 'ar' ? 'en' : 'ar'));
});
