import { trapFocus } from './ui.js';

const lightbox = document.getElementById('designLightbox');
const image = document.getElementById('lightboxImage');
const status = document.getElementById('lightboxStatus');
const closeBtn = document.getElementById('lightboxClose');

let currentFull = null;
let lastFocused = null;

export function initLightbox() {
  document.querySelectorAll('.design-slot').forEach(slot => {
    slot.addEventListener('click', () => openLightbox(slot));
  });
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', event => {
    if (!lightbox.classList.contains('show')) return;
    if (event.key === 'Escape') closeLightbox();
    else trapFocus(lightbox, event);
  });
}

function openLightbox(slot) {
  const preview = slot.querySelector('img');
  const fullSrc = slot.dataset.full;

  lastFocused = document.activeElement;
  currentFull = fullSrc;
  image.src = preview.src;
  image.alt = preview.alt;
  status.textContent = 'Loading full-size image…';
  lightbox.classList.add('show');
  document.body.style.overflow = 'hidden';
  closeBtn.focus();

  const full = new Image();
  full.onload = () => {
    if (currentFull !== fullSrc) return;
    image.src = fullSrc;
    status.textContent = '';
  };
  full.onerror = () => {
    if (currentFull !== fullSrc) return;
    status.textContent = "Couldn't load the full-size image.";
  };
  full.src = fullSrc;
}

function closeLightbox() {
  currentFull = null;
  lightbox.classList.remove('show');
  document.body.style.overflow = '';
  if (lastFocused && lastFocused.focus) lastFocused.focus();
}
