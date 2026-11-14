for (const block of document.querySelectorAll<HTMLPreElement>('.prose pre')) {
  const code = block.querySelector('code');
  if (!code) continue;
  const group = document.createElement('div');
  group.className = 'code-block';
  const tools = document.createElement('div');
  tools.className = 'code-tools';
  const label = document.createElement('span');
  label.textContent = block.dataset.language ?? '';
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '复制代码';
  button.setAttribute('aria-live', 'polite');
  tools.append(label, button);
  block.before(group);
  group.append(tools, block);
  let reset: number | undefined;
  button.addEventListener('click', async () => {
    window.clearTimeout(reset);
    try {
      await navigator.clipboard.writeText(code.textContent ?? '');
      button.textContent = '已复制';
    } catch {
      button.textContent = '复制失败，请手动选择代码';
    }
    reset = window.setTimeout(() => { button.textContent = '复制代码'; }, 2400);
  });
}
