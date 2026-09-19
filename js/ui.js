const form = document.getElementById('jerseyForm');

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function checkedValue(name) {
  const input = form.querySelector('input[name="' + name + '"]:checked');
  return input ? input.value : null;
}

export function selectedSport() {
  return checkedValue('sport') || 'Football';
}

export function selectedGender() {
  return checkedValue('gender');
}

export function trapFocus(container, event) {
  if (event.key !== 'Tab') return;
  const focusable = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (!container.contains(document.activeElement)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
