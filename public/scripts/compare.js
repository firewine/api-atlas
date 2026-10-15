// @ts-check
const boxes = [.../** @type {NodeListOf<HTMLInputElement>} */ (document.querySelectorAll('.compare-picker input'))];
const note = document.querySelector('#compare-note');
if (!note) throw new Error('Compare status element is missing');

/** @param {HTMLInputElement} [changed] */
const refresh = (changed) => {
  let selected = boxes.filter((box) => box.checked);
  if (selected.length > 4 && changed) changed.checked = false;
  selected = boxes.filter((box) => box.checked);
  const ids = new Set(selected.map((box) => box.value));
  /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.compare-table [data-provider]')).forEach((cell) => {
    cell.hidden = !ids.has(cell.dataset.provider ?? '');
  });
  note.textContent = selected.length < 2 ? 'Select at least two providers.' : `${selected.length} providers selected.`;
};

boxes.forEach((box) => box.addEventListener('change', () => refresh(box)));
refresh();

export {};
