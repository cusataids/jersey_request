import { MAX_NUMBER, POLL_SCHEDULE } from './config.js';
import { fetchClaimedRows } from './api.js';
import { claimedList, setClaimedRows, isClaimed } from './state.js';
import { el, selectedSport, selectedGender } from './ui.js';

const numberInput = document.getElementById('jerseyNumber');
const availabilityMessage = document.getElementById('availMsg');

const pageLoadedAt = Date.now();
const inFlight = {};
const changeListeners = [];
let pollTimer = null;

export function onClaimedChange(listener) {
  changeListeners.push(listener);
}

export function refreshClaimed(sport) {
  if (!inFlight[sport]) {
    inFlight[sport] = load(sport).finally(() => { delete inFlight[sport]; });
  }
  return inFlight[sport];
}

export function loadClaimedIfNeeded(sport) {
  const list = claimedList(sport);
  if (!list.loaded && !list.failed) refreshClaimed(sport);
}

async function load(sport) {
  const list = claimedList(sport);
  let rows;
  try {
    rows = await fetchClaimedRows(sport);
  } catch {
    list.failed = true;
    if (!list.loaded && sport === selectedSport()) notifyChanged();
    return;
  }
  if (setClaimedRows(sport, rows) && sport === selectedSport()) notifyChanged();
}

function notifyChanged() {
  changeListeners.forEach(listener => listener());
}

export function schedulePoll() {
  clearTimeout(pollTimer);
  const wait = pollInterval();
  if (!wait) return;
  pollTimer = setTimeout(async () => {
    await refreshClaimed(selectedSport());
    schedulePoll();
  }, wait);
}

function pollInterval() {
  const age = Date.now() - pageLoadedAt;
  const step = POLL_SCHEDULE.find(s => age < s.untilMs);
  return step ? step.everyMs : 0;
}

export function setAvailabilityMessage(state, text) {
  availabilityMessage.className = 'avail-msg' + (state ? ' ' + state : '');
  availabilityMessage.replaceChildren();
  if (text) availabilityMessage.append(el('span', 'dot'), text);
}

export function checkAvailability() {
  const raw = numberInput.value.trim();
  if (raw === '') return setAvailabilityMessage('', '');

  const number = Number(raw);
  if (!Number.isInteger(number) || number < 0) return setAvailabilityMessage('bad', 'Enter a whole number, 0 or higher.');
  if (number > MAX_NUMBER) return setAvailabilityMessage('bad', 'Enter a number no higher than ' + MAX_NUMBER + '.');

  const gender = selectedGender();
  if (!gender) return setAvailabilityMessage('warn', 'Pick Male or Female first — numbers are counted separately.');

  const sport = selectedSport();
  const list = claimedList(sport);
  if (!list.loaded) {
    return list.failed
      ? setAvailabilityMessage('warn', "Couldn't reach the sheet — you can still submit.")
      : setAvailabilityMessage('checking', 'Checking availability…');
  }

  if (isClaimed(sport, number, gender)) {
    setAvailabilityMessage('bad', 'Already claimed in the ' + gender.toLowerCase() + ' list. Please choose another number.');
  } else {
    setAvailabilityMessage('ok', 'Available.');
  }
}
