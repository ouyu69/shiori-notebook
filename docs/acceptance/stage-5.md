# 第五阶段 · GitHub CI

公开仓库 [ouyu69/shiori-notebook](https://github.com/ouyu69/shiori-notebook) 的默认分支为 main。第五阶段在 ci/github-actions 分支验收。

- [正常构建](https://github.com/ouyu69/shiori-notebook/actions/runs/43548532396)通过依赖安装、单元测试、内容与类型检查、输出检查、浏览器测试及生产构建。
- 下载该运行的 site-d9eed29dddbec3b1fc743e6c6555d693e23bbc19，核对 version.json 的 commit 与源提交一致。用本地静态 HTTP 服务请求首页、文章列表、搜索、关于及版本文件，均返回 200。正式内容目录目前为空。
- 在[独立验收 PR](https://github.com/ouyu69/shiori-notebook/pull/1) 提交日期 2026-02-30。[PR 检查](https://github.com/ouyu69/shiori-notebook/actions/runs/43548595570)失败，错误指向 ci-invalid-date/index.md 的 date 字段。验收后已关闭 PR。
