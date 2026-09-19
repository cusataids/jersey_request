import { initForm } from './form.js';
import { initClaimedModal, rerenderClaimedModal } from './claimed-modal.js';
import { initLightbox } from './lightbox.js';
import { onClaimedChange, refreshClaimed, schedulePoll, checkAvailability } from './availability.js';
import { selectedSport } from './ui.js';

initForm();
initClaimedModal();
initLightbox();
onClaimedChange(checkAvailability);
onClaimedChange(rerenderClaimedModal);
refreshClaimed(selectedSport());
schedulePoll();
