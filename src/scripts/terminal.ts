const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const lines = Array.from(document.querySelectorAll<HTMLElement>('[data-dialogue]'));
async function playDialogue() {
  if (reduced.matches) return;
  try {
    if (sessionStorage.getItem('kanlai-greeted')) return;
    sessionStorage.setItem('kanlai-greeted', '1');
  } catch { return; }
  const pause = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));
  const prompt = document.querySelector<HTMLElement>('[data-prompt]')!;
  const caret = prompt.querySelector<HTMLElement>('.type-caret')!;
  prompt.classList.add('is-pending');
  for (const line of lines) line.classList.add('is-pending');
  for (const line of lines) {
    const live = line.querySelector<HTMLElement>('.type-live')!;
    const sentence = live.textContent ?? '';
    const typed = document.createTextNode('');
    live.replaceChildren(typed, caret);
    line.classList.remove('is-pending');
    const replying = line.dataset.dialogue === 'kanlai';
    if (replying && !reduced.matches) {
      line.classList.add('is-thinking');
      await pause(sentence.length > 10 ? 1800 : 1200);
      line.classList.remove('is-thinking');
    }
    for (const char of sentence) {
      typed.appendData(char);
      if (!reduced.matches) {
        const characterDelay = replying ? 135 : 105;
        await pause(/[、。？！]/u.test(char) ? 360 : characterDelay);
      }
    }
    if (!reduced.matches) await pause(650);
  }
  prompt.append(caret);
  prompt.classList.remove('is-pending');
}
void playDialogue();
document.addEventListener('keydown', event => {
  if (event.key === 'Enter' && event.target === document.body && !event.defaultPrevented) location.assign('/articles/');
});
