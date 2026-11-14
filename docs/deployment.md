# GitHub 构建

仓库为 [ouyu69/shiori-notebook](https://github.com/ouyu69/shiori-notebook)。推送分支、创建或更新 PR 时，GitHub Actions 自动校验内容规则、生成静态页面、运行浏览器测试和构建搜索索引。

打开 [Blog CI](https://github.com/ouyu69/shiori-notebook/actions/workflows/ci.yml)，点进一次成功运行，在 Artifacts 下载 `site-<提交 SHA>`。解压后用静态 HTTP 服务打开目录。`version.json` 记录构建的提交与时间。检查失败时打开红色步骤查看日志，修正内容后再次推送。

正式内容来自 `src/content/posts/`。样文仅用于隔离的测试构建。此阶段发布的是可下载的构建产物，云服务器接入安排在第六阶段。
