const translations = {
  en: {
    nav_home: 'Home', nav_menu: 'Menu', nav_loyalty: 'Loyalty Card', nav_contact: 'Contact',
    hero_badge: 'Specialty Tea House',
    hero_tagline: 'I drink tea hoping my thoughts will grow — yet my thoughts scattered, and the tea grew cold.',
    hero_cta1: 'Explore Menu', hero_cta2: 'My Loyalty Card',
    featured_label: 'Our Favourites', featured_title: 'Made to Savour',
    featured_sub: 'A curated taste of what makes Riza special.',
    featured_more: 'View Full Menu →',
    about_label: 'Our Story', about_title: 'More Than Tea',
    about_p1: 'Riza Tea started with a simple idea — that tea should feel like a moment, not just a drink. Every blend we serve is chosen with care, every cup made to be remembered.',
    about_p2: 'From bold Iraqi teas to our famous saffron karak, we celebrate the classics while always trying something new. Pull up a chair.',
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
    loyalty_sub: 'Enter your phone number to check your stamps and rewards.',
    loyalty_lookup_btn: 'Find My Card',
    loyalty_new_hint: 'First time? We\'ll set up your card automatically.',
    loyalty_free_msg: 'Show this to the cashier to claim your free drink.',
    loyalty_stamps_label: ' stamps',
    loyalty_history: 'Stamp History',
    loyalty_switch: '← Use a different number',
    loyalty_register_title: 'Welcome to Riza! 👋',
    loyalty_register_sub: 'First visit? Add your name to personalise your card.',
    loyalty_register_btn: 'Create My Card',
    loyalty_qr_hint: 'Show this QR to the cashier to add your stamp',
  },
  ar: {
    nav_home: 'الرئيسية', nav_menu: 'القائمة', nav_loyalty: 'بطاقة الولاء', nav_contact: 'اتصل بنا',
    hero_badge: 'بيت الشاي المتخصص',
    hero_tagline: 'أشرب من الشاهي عسى فكري يزيد، ضاعت أفكاري والشاهي برد.',
    hero_cta1: 'شوف القائمة', hero_cta2: 'بطاقتي',
    featured_label: 'أحلى عندنا', featured_title: 'طعم ما ينسى',
    featured_sub: 'اختيارات من أحلى ما عندنا — جرب وشوف الفرق.',
    featured_more: 'القائمة الكاملة ←',
    about_label: 'قصتنا', about_title: 'مو بس شاي',
    about_p1: 'ريزا انبدت من فكرة بسيطة — إن الشاي لازم يكون لحظة، مو بس مشروب. كل مزيج نقدمه مختار بعناية، وكل كوب يستاهل.',
    about_p2: 'من شايات عراقية أصيلة إلى كراكنا المشهور بالزعفران، نحتفي بالأصيل ونجرب الجديد. تعال واجلس معنا.',
    hours_title: 'أوقات الدوام',
    gallery_label: 'لحظات', gallery_title: 'من كوبنا لكوبك',
    loyalty_cta_label: 'برنامج الولاء',
    loyalty_cta_title: 'مشروبك العاشر علينا',
    loyalty_cta_sub: 'اجمع طابع مع كل طلب. اكمل البطاقة واحصل على مشروب مجاني.',
    loyalty_cta_btn: 'تحقق من بطاقتي',
    contact_label: 'وين نحن', contact_title: 'زورونا',
    contact_loc: 'الموقع', contact_hours: 'أوقات العمل',
    footer_tagline: 'كل كوب، لحظة ما تنسى.',
    menu_label: 'ما عندنا', menu_title: 'القائمة',
    menu_sub: 'الأسعار بالدرهم الإماراتي. كل الأصناف تُحضَّر طازجة.',
    menu_search_placeholder: 'دور في القائمة…',
    cat_all: 'الكل',
    loyalty_title: 'بطاقة ولائك',
    loyalty_sub: 'أدخل رقم هاتفك وشوف طوابعك ومكافآتك.',
    loyalty_lookup_btn: 'ابحث عن بطاقتي',
    loyalty_new_hint: 'أول مرة؟ راح ننشئ بطاقتك على طول.',
    loyalty_free_msg: 'ورّ هذا للكاشير وخذ مشروبك المجاني.',
    loyalty_stamps_label: ' طوابع',
    loyalty_history: 'سجل الطوابع',
    loyalty_switch: 'استخدم رقم ثاني ←',
    loyalty_register_title: 'أهلاً بك في ريزا! 👋',
    loyalty_register_sub: 'أول زيارة؟ أضف اسمك عشان تخصص البطاقة.',
    loyalty_register_btn: 'أنشئ بطاقتي',
    loyalty_qr_hint: 'ورّ هذا الـ QR للكاشير عشان يضيف طابعك',
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
