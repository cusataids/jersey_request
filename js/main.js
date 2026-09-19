import { initForm } from './form.js';
import { initClaimedModal, rerenderClaimedModal } from './claimed-modal.js';
import { initLightbox } from './lightbox.js';
import { onClaimedChange, refreshClaimed, checkAvailability, startPolling, pausePolling, resumePolling } from './availability.js';
import { selectedSport } from './ui.js';

initForm();
initClaimedModal();
initLightbox();
onClaimedChange(checkAvailability);
onClaimedChange(rerenderClaimedModal);
refreshClaimed(selectedSport());
startPolling();

document.addEventListener('visibilitychange', () => {
  if (document.hidden) pausePolling();
  else resumePolling();
});
