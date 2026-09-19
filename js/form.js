import { MTECH_RESTRICTED_YEARS } from './config.js';
import { submitRequest } from './api.js';
import { addClaimedRow, isClaimed } from './state.js';
import { validateRequest } from './validation.js';
import { refreshClaimed, loadClaimedIfNeeded, checkAvailability, setAvailabilityMessage } from './availability.js';
import { el, checkedValue, selectedSport } from './ui.js';

const form = document.getElementById('jerseyForm');
const formPanel = document.getElementById('formPanel');
const successPanel = document.getElementById('successPanel');
const formError = document.getElementById('formError');
const submitBtn = document.getElementById('submitBtn');
const fullNameInput = document.getElementById('fullName');
const printedNameInput = document.getElementById('printedName');
const numberInput = document.getElementById('jerseyNumber');
const sizeSelect = document.getElementById('jerseySize');
const summaryList = document.getElementById('summaryList');
const shortsField = document.getElementById('shortsField');
const designSets = document.querySelectorAll('.design-set');
const yearInputs = form.querySelectorAll('input[name="year"]');

const NAME_JUNK = /[^\p{L}\p{M} .'\-]/gu;
const BEATEN_MESSAGE = 'Oops! Someone beat you to it. Try another number!';
const SUBMIT_LABEL = 'Request For This Number';

let submitting = false;

export function initForm() {
  form.addEventListener('change', event => {
    switch (event.target.name) {
      case 'sport': onSportChange(); break;
      case 'course': updateYearOptions(); break;
      case 'gender': checkAvailability(); break;
    }
  });
  fullNameInput.addEventListener('input', cleanFullName);
  numberInput.addEventListener('input', checkAvailability);
  form.addEventListener('submit', handleSubmit);
  document.getElementById('againBtn').addEventListener('click', resetForm);

  updateSportPreview();
  updateYearOptions();
}

function onSportChange() {
  updateSportPreview();
  loadClaimedIfNeeded(selectedSport());
  checkAvailability();
}

function updateSportPreview() {
  const sport = selectedSport();
  designSets.forEach(set => { set.hidden = set.dataset.sport !== sport; });
  shortsField.hidden = sport !== 'Football';
}

function updateYearOptions() {
  const isMTech = checkedValue('course') === 'M.Tech';
  yearInputs.forEach(input => {
    input.disabled = isMTech && MTECH_RESTRICTED_YEARS.includes(input.value);
    if (input.disabled) input.checked = false;
  });
}

function cleanFullName() {
  const clean = fullNameInput.value.replace(NAME_JUNK, '');
  if (clean !== fullNameInput.value) fullNameInput.value = clean;
}

function properCase(text) {
  return text
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/(^|[^\p{L}\p{M}])(\p{L})/gu, (match, before, letter) => before + letter.toUpperCase());
}

function readFormValues() {
  return {
    sport: checkedValue('sport'),
    fullName: properCase(fullNameInput.value.trim()),
    gender: checkedValue('gender'),
    course: checkedValue('course'),
    year: checkedValue('year'),
    printedName: printedNameInput.value.trim(),
    numberRaw: numberInput.value.trim(),
    shorts: checkedValue('shorts'),
    size: sizeSelect.value
  };
}

async function handleSubmit(event) {
  event.preventDefault();
  if (submitting) return;
  clearFormError();

  const values = readFormValues();
  const problem = validateRequest(values);
  if (problem) {
    showFormError(problem.message);
    if (problem.fieldId) document.getElementById(problem.fieldId).focus();
    return;
  }

  const { sport, gender } = values;
  const number = Number(values.numberRaw);
  setSubmitting(true);

  await refreshClaimed(sport);
  if (isClaimed(sport, number, gender)) {
    setSubmitting(false);
    showBeaten();
    return;
  }

  const payload = {
    sport,
    shorts: sport === 'Football' && values.shorts === 'Yes',
    fullName: values.fullName,
    gender,
    course: values.course,
    year: values.year,
    printedName: values.printedName,
    number,
    size: values.size
  };

  let result;
  try {
    result = (await submitRequest(payload)) || {};
  } catch {
    result = { ok: false, reason: 'network' };
  }
  setSubmitting(false);

  if (!result.ok) {
    if (result.reason === 'taken') showBeaten();
    else if (result.reason === 'network') showFormError("Couldn't reach the sheet. Check your connection and try again.");
    else if (result.reason === 'busy') showFormError('The sheet is busy right now. Please try again in a moment.');
    else showFormError('Something went wrong saving your request. Please try again.');
    return;
  }

  addClaimedRow(sport, { number, fullName: values.fullName, gender, course: values.course, year: values.year, sport });
  showSuccess(payload);
}

function setSubmitting(flag) {
  submitting = flag;
  submitBtn.disabled = flag;
  submitBtn.textContent = flag ? 'Requesting…' : SUBMIT_LABEL;
}

function showBeaten() {
  setAvailabilityMessage('bad', BEATEN_MESSAGE);
  showFormError(BEATEN_MESSAGE);
  numberInput.focus();
  numberInput.select();
}

function showFormError(message) {
  formError.textContent = message;
  formError.classList.add('show');
}

function clearFormError() {
  formError.textContent = '';
  formError.classList.remove('show');
}

function showSuccess(request) {
  const rows = [['Sport', request.sport]];
  if (request.sport === 'Football') rows.push(['Shorts', request.shorts ? 'Yes' : 'No']);
  rows.push(
    ['Name', request.fullName],
    ['Gender', request.gender],
    ['Course', request.course],
    ['Year', request.year],
    ['Printed name', request.printedName],
    ['Jersey number', request.number],
    ['Size', request.size]
  );

  summaryList.replaceChildren();
  rows.forEach(([label, value]) => {
    const item = el('li');
    item.append(el('span', 'k', label), el('span', 'v', value));
    summaryList.appendChild(item);
  });

  formPanel.classList.add('hide');
  successPanel.classList.add('show');
}

function resetForm() {
  form.reset();
  clearFormError();
  setAvailabilityMessage('', '');
  setSubmitting(false);
  updateYearOptions();
  updateSportPreview();
  successPanel.classList.remove('show');
  formPanel.classList.remove('hide');
  fullNameInput.focus();
}
