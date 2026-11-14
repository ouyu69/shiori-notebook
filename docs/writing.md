# 写一篇笔记

在项目根目录运行以下命令。最后一项可以选「技术」或「生活」。

```sh
npm run new:post -- docker-notes --title "Docker 使用笔记" --category 技术
```

打开 `src/content/posts/docker-notes/index.md` 写正文。命令已填入上海日期和草稿状态。在 `tags: []` 中填写标签，例如 `tags: [Docker, 部署]`。把配图存入同目录的 images，再写 `![说明](./images/example.png)`。

1. 运行 `npm run dev` 阅读草稿。
2. 准备发布时把 `draft` 改为 `false`。运行 `npm run build` 和 `npm run preview`，在「搜索」里试一个正文关键词，点结果打开笔记。
3. 校对后提交 Markdown 与图片。自动部署将在后续阶段接入。
4. 更新正文时可以填入 `updated` 日期。保留目录名即可保留原链接。
5. 撤下时改回 `draft: true` 并重新完整构建。文章、标签列表和搜索索引会一起更新。GitHub 提交历史里仍保留原文。

搜索按标题、正文或标签匹配。标签名称中的大小写和特殊符号会被编码为稳定的地址，页面仍显示原文。
