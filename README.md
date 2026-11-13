# 圈圈的手记

基于 Astro 的静态个人手记，记录技术和生活。当前阶段提供首页与基础导航。

使用 Node.js 24 和 npm，在仓库根目录执行：

```sh
npm ci
npm run dev
```

生产预览使用 `npm run check`、`npm run build:site`、`npm run preview`。打开终端中显示的本机地址。界面文案在 `src/config/site.ts`，角色与图标来自作者提供的 shiori-notebook 原稿。

浏览器验收使用本机 Chrome。启动生产预览后运行 `node scripts/verify-home.mjs`；可用 `PREVIEW_URL` 指定预览地址，用 `BROWSER_CHANNEL` 指定已安装的 Chromium 浏览器。传入原稿 index.html 的绝对路径可生成对照截图。
