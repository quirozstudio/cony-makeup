const body = document.body;
const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('.menu-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const makeupIntro = document.querySelector('[data-makeup-intro]');

const closeMakeupIntro = () => {
  if (!makeupIntro || makeupIntro.classList.contains('is-leaving')) return;
  makeupIntro.classList.add('is-leaving');
  body.classList.remove('intro-active');
  window.setTimeout(() => makeupIntro.remove(), 950);
};

if (reducedMotion) {
  body.classList.remove('intro-active');
  makeupIntro?.remove();
} else {
  window.setTimeout(closeMakeupIntro, 2100);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMakeupIntro(); }, { once: true });
}

menuToggle?.addEventListener('click', () => {
  const isOpen = body.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.site-nav a').forEach((link) => link.addEventListener('click', () => {
  body.classList.remove('menu-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));

let lastScroll = 0;
window.addEventListener('scroll', () => {
  const current = window.scrollY;
  if (current > 160 && current > lastScroll && !body.classList.contains('menu-open')) header.classList.add('is-hidden');
  if (current < lastScroll) header.classList.remove('is-hidden');
  if (current < 40) header.classList.remove('is-hidden');
  lastScroll = current;
}, { passive: true });

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); } });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const videoObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const video = entry.target;
    if (entry.isIntersecting) {
      video.querySelectorAll('source[data-src]').forEach((source) => { source.src = source.dataset.src; });
      video.load();
      if (!reducedMotion) video.play().catch(() => {});
      videoObserver.unobserve(video);
    }
  });
}, { rootMargin: '180px' });
document.querySelectorAll('[data-lazy-video]').forEach((video) => videoObserver.observe(video));

if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('[data-depth]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - .5;
      const y = (event.clientY - bounds.top) / bounds.height - .5;
      card.style.setProperty('--tilt-x', `${(-y * 3.2).toFixed(2)}deg`);
      card.style.setProperty('--tilt-y', `${(x * 3.2).toFixed(2)}deg`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
    });
  });
}

const filterButtons = document.querySelectorAll('[data-filter]');
const galleryItems = document.querySelectorAll('.gallery-item');
filterButtons.forEach((button) => button.addEventListener('click', () => {
  filterButtons.forEach((item) => item.classList.remove('is-active'));
  button.classList.add('is-active');
  const filter = button.dataset.filter;
  galleryItems.forEach((item) => { item.hidden = filter !== 'all' && item.dataset.category !== filter; });
}));

const lightbox = document.querySelector('[data-lightbox]');
const lightboxImage = document.querySelector('[data-lightbox-image]');
const lightboxCaption = document.querySelector('[data-lightbox-caption]');
const lightboxItems = [...galleryItems].map((item) => ({ src: item.querySelector('img').src, alt: item.querySelector('img').alt, caption: item.querySelector('span').textContent }));
let lightboxIndex = 0;
const updateLightbox = () => { const item = lightboxItems[lightboxIndex]; lightboxImage.src = item.src; lightboxImage.alt = item.alt; lightboxCaption.textContent = item.caption; };
const openLightbox = (index) => { lightboxIndex = index; updateLightbox(); lightbox.classList.add('is-open'); lightbox.setAttribute('aria-hidden', 'false'); body.classList.add('menu-open'); };
const closeLightbox = () => { lightbox.classList.remove('is-open'); lightbox.setAttribute('aria-hidden', 'true'); body.classList.remove('menu-open'); };
galleryItems.forEach((item, index) => item.addEventListener('click', () => openLightbox(index)));
document.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
document.querySelector('.lightbox-prev')?.addEventListener('click', () => { lightboxIndex = (lightboxIndex - 1 + lightboxItems.length) % lightboxItems.length; updateLightbox(); });
document.querySelector('.lightbox-next')?.addEventListener('click', () => { lightboxIndex = (lightboxIndex + 1) % lightboxItems.length; updateLightbox(); });
lightbox?.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (event) => { if (!lightbox.classList.contains('is-open')) return; if (event.key === 'Escape') closeLightbox(); if (event.key === 'ArrowLeft') document.querySelector('.lightbox-prev').click(); if (event.key === 'ArrowRight') document.querySelector('.lightbox-next').click(); });

let touchStartX = 0;
lightbox?.addEventListener('touchstart', (event) => { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
lightbox?.addEventListener('touchend', (event) => { const distance = event.changedTouches[0].screenX - touchStartX; if (Math.abs(distance) < 50) return; if (distance > 0) document.querySelector('.lightbox-prev').click(); else document.querySelector('.lightbox-next').click(); }, { passive: true });
