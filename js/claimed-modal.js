import { refreshClaimed } from './availability.js';
import { claimedList } from './state.js';
import { el, selectedSport, selectedGender, trapFocus } from './ui.js';

const modal = document.getElementById('claimedModal');
const modalBody = document.getElementById('claimedBody');
const countLabel = document.getElementById('claimedCount');
const closeBtn = document.getElementById('claimedClose');
const tabs = document.getElementById('claimedTabs');

let activeGender = 'Male';
let lastFocused = null;

export function initClaimedModal() {
  document.getElementById('viewClaimedBtn').addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });
  tabs.addEventListener('click', event => {
    const tab = event.target.closest('.tab');
    if (tab) setActiveGender(tab.dataset.gender);
  });
  document.addEventListener('keydown', onKeydown);
}

export function rerenderClaimedModal() {
  if (isOpen()) render();
}

function isOpen() {
  return modal.classList.contains('show');
}

function openModal() {
  lastFocused = document.activeElement;
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
  closeBtn.focus();
  setActiveGender(selectedGender() || 'Male');
  refreshClaimed(selectedSport());
}

function closeModal() {
  modal.classList.remove('show');
  document.body.style.overflow = '';
  if (lastFocused && lastFocused.focus) lastFocused.focus();
}

function onKeydown(event) {
  if (!isOpen()) return;
  if (event.key === 'Escape') closeModal();
  else trapFocus(modal, event);
}

function setActiveGender(gender) {
  activeGender = gender;
  tabs.querySelectorAll('.tab').forEach(tab => {
    const active = tab.dataset.gender === gender;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
  render();
}

function render() {
  const list = claimedList(selectedSport());
  if (!list.loaded) {
    showMessage(list.failed ? "Couldn't load the list. Please try again." : 'Loading…');
    return;
  }

  const rows = list.rows
    .filter(row => row.gender === activeGender)
    .sort((a, b) => a.number - b.number);

  if (!rows.length) {
    showMessage('No numbers claimed in the ' + activeGender.toLowerCase() + ' list yet.');
    return;
  }

  countLabel.textContent = rows.length + (rows.length === 1 ? ' number claimed' : ' numbers claimed');

  const headRow = el('tr');
  headRow.append(el('th', '', 'No.'), el('th', '', 'Player'), el('th', 'right', 'Year'));
  const thead = el('thead');
  thead.appendChild(headRow);

  const tbody = el('tbody');
  rows.forEach(row => {
    const player = el('td', 'player');
    player.append(el('div', '', row.fullName || '—'), el('div', 'player-course', row.course || '—'));
    const tr = el('tr');
    tr.append(el('td', 'num', row.number), player, el('td', 'yr', row.year || '—'));
    tbody.appendChild(tr);
  });

  const table = el('table', 'claimed-table');
  table.append(thead, tbody);
  modalBody.replaceChildren(table);
}

function showMessage(text) {
  countLabel.textContent = '';
  modalBody.replaceChildren(el('div', 'modal-msg', text));
}
