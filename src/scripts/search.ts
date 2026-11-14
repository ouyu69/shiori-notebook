interface Hit { data(): Promise<{ url: string; meta: { title: string }; excerpt: string }> }
interface Index { search(query: string): Promise<{ results: Hit[] }> }
const input = document.querySelector<HTMLInputElement>('#query');
if (input) {
  const status = document.querySelector<HTMLElement>('#search-status')!;
  const list = document.querySelector<HTMLElement>('#search-results')!;
  let pending: Promise<Index> | undefined;
  let revision = 0;
  let timer: number;
  input.addEventListener('input', () => {
    const id = ++revision;
    clearTimeout(timer);
    list.replaceChildren();
    const query = input.value.trim();
    status.textContent = query ? '正在搜索…' : '';
    if (!query) return;
    timer = window.setTimeout(async () => {
      try {
        const path = '/pagefind/pagefind.js';
        pending ??= import(/* @vite-ignore */ path);
        const { results } = await (await pending).search(query);
        const hits = await Promise.all(results.map(result => result.data()));
        if (id !== revision) return;
        status.textContent = hits.length ? '找到 ' + hits.length + ' 篇笔记' : '没有找到相关笔记。';
        for (const hit of hits) {
          const item = document.createElement('li');
          const link = document.createElement('a');
          link.className = 'post-row';
          link.href = hit.url;
          link.textContent = hit.meta.title;
          item.append(link);
          list.append(item);
        }
      } catch {
        pending = undefined;
        if (id === revision) status.textContent = '索引加载失败，请稍后重试。';
      }
    }, 120);
  });
}
