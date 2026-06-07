// NAV toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!navToggle.contains(e.target) && !navLinks.contains(e.target))
      navLinks.classList.remove('open');
  });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// Reveal on scroll
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Toast
function showToast(msg, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

// Lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
if (lightbox) {
  document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightbox.classList.add('open');
    });
  });
  lightboxClose?.addEventListener('click', () => lightbox.classList.remove('open'));
  lightbox.addEventListener('click', e => { if (e.target === lightbox) lightbox.classList.remove('open'); });
}

// Hero particles (floating tea leaves)
const canvas = document.getElementById('particles');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: canvas.height + 20,
      size: Math.random() * 6 + 3,
      speedY: -(Math.random() * .8 + .3),
      speedX: (Math.random() - .5) * .5,
      opacity: Math.random() * .4 + .1,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - .5) * .02,
    };
  }

  for (let i = 0; i < 25; i++) {
    const p = createParticle();
    p.y = Math.random() * canvas.height;
    particles.push(p);
  }

  function drawLeaf(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = '#C8860A';
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;
      if (p.y < -20) particles[i] = createParticle();
      drawLeaf(ctx, p);
    });
    requestAnimationFrame(animate);
  }
  animate();
}

// Load settings from API and update home page elements
async function loadHomeSettings() {
  try {
    const res = await fetch('/api/get-settings');
    if (!res.ok) return;
    const data = await res.json();

    // Today's special
    if (data.special_enabled && data.special_text) {
      const sec = document.getElementById('specialSection');
      if (sec) {
        sec.innerHTML = `
          <div class="special-banner">
            <div class="special-icon">⭐</div>
            <div class="special-text">
              <h3>${data.special_title || "Today's Special"}</h3>
              <p>${data.special_text}</p>
            </div>
            ${data.special_price ? `<div class="special-badge">AED ${data.special_price}</div>` : ''}
          </div>`;
      }
    }

    // Hours in about section
    if (data.hours) {
      const grid = document.getElementById('hoursGrid');
      if (grid) {
        grid.innerHTML = data.hours.map(h => `
          <div class="hours-row${h.closed ? ' closed' : ''}">
            <span class="day">${h.day}</span>
            <span class="time">${h.closed ? 'Closed' : `${h.open} – ${h.close}`}</span>
          </div>`).join('');
      }
      const hoursText = document.getElementById('hoursText');
      if (hoursText) {
        const open = data.hours.filter(h => !h.closed);
        const closed = data.hours.filter(h => h.closed);
        hoursText.innerHTML = open.map(h => `${h.day}: ${h.open} – ${h.close}`).join('<br>') +
          (closed.length ? `<br>${closed.map(h => h.day).join(', ')}: Closed` : '');
      }
    }

    // Gallery
    if (data.gallery && data.gallery.length > 0) {
      const grid = document.getElementById('galleryGrid');
      if (grid) {
        grid.innerHTML = data.gallery.map(img => `
          <div class="gallery-item">
            <img src="${img.url}" alt="${img.alt_en || ''}" loading="lazy"/>
          </div>`).join('');
        grid.querySelectorAll('.gallery-item img').forEach(img => {
          img.addEventListener('click', () => {
            const lb = document.getElementById('lightbox');
            const lbImg = document.getElementById('lightboxImg');
            if (lb && lbImg) { lbImg.src = img.src; lb.classList.add('open'); }
          });
        });
      }
    }

    // About image
    if (data.about_image) {
      const wrap = document.getElementById('aboutImg');
      if (wrap) wrap.innerHTML = `<img src="${data.about_image}" alt="About Riza Tea"/>`;
    }
  } catch (_) { /* settings not yet configured */ }
}

// Load featured items from API
async function loadFeatured() {
  try {
    const res = await fetch('/api/get-menu?featured=true');
    if (!res.ok) return;
    const items = await res.json();
    if (!items.length) return;
    const grid = document.getElementById('featuredGrid');
    if (!grid) return;
    const icons = { tea: '🍵', coffee: '☕', cold: '🧊', acai: '🫙', breakfast: '🍳', desserts: '🍰' };
    grid.innerHTML = items.slice(0, 6).map(item => `
      <div class="item-card">
        <div class="item-card-icon">${icons[item.category] || '☕'}</div>
        <div class="item-card-name">${item.name_en}</div>
        <div class="item-card-name-ar">${item.name_ar}</div>
        <div class="item-card-price">${item.price_label || (item.price ? 'AED ' + item.price : '')}</div>
      </div>`).join('');
  } catch (_) {}
}

if (document.getElementById('featuredGrid')) { loadHomeSettings(); loadFeatured(); }
else if (document.getElementById('specialSection')) { loadHomeSettings(); }
