# 圈圈的手记

基于 Astro 的静态个人手记，记录技术和生活。首页最近记录、分类列表、文章详情和年月归档都读取同一组 Markdown。

在 `src/content/posts/docker-notes/index.md` 创建一篇笔记，头部示例：

```yaml
---
title: Docker 使用笔记
date: 2026-11-14
category: 技术
tags: [Docker]
draft: true
---
```

分类填“技术”或“生活”。图片放在同目录的 `images/`，在正文用 `![说明](./images/example.png)` 引用。草稿可以在开发预览中阅读。明确写入 `draft: false` 后，下一次构建会生成独立页面。日期用于排序，未来日期也按该发布开关处理。可选的 `updated` 日期应等于或晚于发布日期。

文件夹名决定文章地址，例如 `/posts/docker-notes/`。修改标题会保留链接，移动或重命名目录会更改链接。仓库公开后，已提交的 Markdown 原文也公开，包括草稿。

使用 Node.js 24 和 npm，在仓库根目录执行：

```sh
npm ci
npm run dev
```

生产预览使用 `npm run check`、`npm run build:site`、`npm run preview`。打开终端中显示的本机地址。界面文案在 `src/config/site.ts`，角色与图标来自作者提供的 shiori-notebook 原稿。

浏览器验收使用本机 Chrome。启动生产预览后运行 `node scripts/verify-home.mjs`；可用 `PREVIEW_URL` 指定预览地址，用 `BROWSER_CHANNEL` 指定已安装的 Chromium 浏览器。传入原稿 index.html 的绝对路径可生成对照截图。
