# 圈圈的手记 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有设计实现为本地 Markdown 写作、公开 GitHub 管理版本、自动部署到个人云服务器的博客，每个阶段都有可演示、可验证的结果。

**Architecture:** Astro 在构建时读取和校验 Markdown，生成静态页面；CSS 变量延续现有视觉，少量 TypeScript 实现浏览器交互。Pagefind 在生产构建后生成搜索索引。GitHub Actions 校验并构建同一份产物，经 SSH 发布到云服务器。

**Tech Stack:** Astro、TypeScript、Markdown Content Collections、原生 CSS、Shiki、Pagefind、npm、GitHub Actions；服务器 Web 服务复用现有环境，暂无现有服务时优先考虑 Nginx。

**Spec:** `docs/superpowers/specs/2026-11-13-personal-blog-design.md`

## Global Constraints

- 以技术内容为主，兼有生活记录，不以吸引读者或增长流量为目标。
- 用户已确认：在本地用 Markdown 写作；保留现有视觉；将单文件设计改为 Markdown 驱动的静态博客。
- 第一版不包含登录后台、数据库、评论、点赞、访问统计、热门排行、订阅和真正可交互的角色 agent。
- 正文宽度约 700–760px。
- 新建模板默认草稿。草稿状态缺省时按草稿处理，作者显式设置 `draft: false` 后才发布。
- 本地预览可以查看草稿；生产构建排除草稿页面、链接和搜索内容。
- 日期按作者所在的 Asia/Shanghai 日历语义处理，避免纯日期因时区转换偏移一天。
- 用户已确认使用公开的 GitHub 仓库管理版本，并集成 CI/CD 自动部署。
- 部署凭据放在 GitHub Actions Secrets，服务地址和目录等非敏感配置使用变量；私钥不进入仓库。
- 参考目录只读；素材复制到当前项目。参考文章不默认为正式内容。
- 用户提供的 `index.html` 是初版设计与主要视觉参考；允许优化，不要求完全一致，但不能过于偏离。保留灰绿配色、手记气质、角色与终端核心构图及整体辨识度，新增功能保持协调。字号、间距、阅读布局、交互与响应式可直接优化；改变整体视觉方向或核心构图前先展示差异与理由并由用户确认。

## Review Focus

1. 草稿缺省、改回草稿、重建后仍残留旧页面：阶段 2 验证路由与输出排除，阶段 4 验证索引排除，阶段 6 验证整版切换后旧地址返回 404。
2. 日期在不同机器时区出现偏移：阶段 2 用不同时区运行同一日期测试，得到相同日期和排序。
3. 中文标签、中文查询、空站点和单篇文章：阶段 2 验证空列表与无邻接文章，阶段 4 验证中文搜索和编码后的标签链接。
4. 手机窄屏、长代码、宽表格、减少动态效果：阶段 1 检查首页，阶段 3 验证阅读区没有整体横向溢出且动画可停止。
5. 并发部署、过期提交、首次上线没有上一版、健康检查失败：阶段 6 在临时站点演练，失败保留原站点，存在上一版时可恢复，旧构建不得覆盖新版本。

## 执行规则与阶段验收

- 顺序为阶段 1 → 2 → 3 → 4 → 5 → 6，不提前修改服务器。
- 每阶段完成后先运行该阶段检查，再交付演示入口、操作步骤、实际检查结果和对应提交。
- 每阶段记录在 `docs/acceptance/stage-N.md`：环境与提交、命令与结果、截图或访问地址、用户验收项、遗留项。未执行的检查明确标为未执行，不记作通过。
- 阶段状态区分“实现完成”“自动检查通过”“待用户验收”“用户已验收”。后续依赖阶段在用户验收后继续；如用户另行授权连续执行，则按检查门槛推进并保留验收材料。
- 每阶段至少形成一个有意义的提交；提交前检查差异，不纳入凭据、缓存、构建产物与临时文件。
- 用户授权在合适时机自行新建开发分支，无需逐次询问。建议阶段分支依次为 `feat/blog-foundation`、`feat/markdown-content`、`feat/reading-experience`、`feat/search-authoring`、`ci/github-actions`、`ci/server-deployment`；小修复可留在当前相关分支，不为每个文件单独分支。
- 初始化时建立 `main` 的基础文档提交，再从中创建阶段 1 分支；之后从已验收并合并的最新 main 创建下一阶段分支。先检查当前分支与未提交改动，不覆盖已有工作，不强制推送或重置他人提交。阶段验收后合并 main，保留阶段与提交的可追溯关系。
- 阶段 6 启用自动部署后，开发分支只运行 CI，合并 main 才触发正式发布；生产验收针对明确的提交。阶段分支不得直接触发生产部署。
- 当前只制定计划，不初始化仓库、不安装依赖、不创建远程仓库、不上线。

## 初始事实与实施前提

2026-11-13 检查：工作目录 `D:/code/xiangmu/quanquanblog` 只有设计文档，尚非 Git 仓库；本机 Node.js `24.22.1`、npm `11.19.1`、Git `2.43.0.windows.1` 可用。

实施阶段 1 核对所选 Astro 稳定版的官方 Node 要求，确认本机兼容后初始化并提交锁文件；CI 使用同一兼容 Node 主版本。依赖版本在初始化时锁定，不在计划中猜测未来版本。

阶段 5 需要 GitHub 仓库名或现有地址；已连接账号为 `ouyu69`。阶段 6 需要服务器系统、SSH 地址和端口、部署用户、Web 服务、域名和 HTTPS 状态、站点目录。前四阶段可在这些信息缺失时独立验收；私钥通过 Secrets 配置，不要求用户贴到聊天或文档。

## 文件职责与接口地图

```text
astro.config.mjs                  静态输出、Markdown 和 Shiki 配置
package.json / package-lock.json  固定依赖、开发/检查/构建命令
src/config/site.ts                站点名称、简介、终端文案、正式 URL
src/content.config.ts             Markdown loader、schema 校验
src/content/posts/<slug>/index.md  文章源文件，同目录 images/ 放图片
src/content/about/index.md        关于正文
src/lib/posts.ts                  发布筛选、排序、摘要、标签与归档数据
src/lib/dates.ts                  纯日期校验与格式化
src/layouts/BaseLayout.astro      导航、页脚、主题初始化
src/layouts/PostLayout.astro      文章头部与阅读布局
src/components/                  TerminalWelcome、PostList、PostMeta、Toc
src/styles/tokens.css             明暗配色与全局尺寸变量
src/styles/global.css             全局排版与响应式基础
src/styles/prose.css              正文、表格与代码布局
src/scripts/                     theme.ts、terminal.ts、copy-code.ts、search.ts
src/pages/                       index、articles、archive、about、search、404
src/pages/posts/[slug].astro      独立文章路由
src/pages/tags/[tag].astro        标签路由
public/assets/                   角色、静态角色与图标
scripts/new-post.mjs              文章模板生成
scripts/check-output.mjs          生产输出契约检查
scripts/deploy.sh                 Linux 服务器上传完成后的版本切换
scripts/rollback.sh               Linux 服务器手动回滚
.github/workflows/ci.yml          分支/PR 检查、主分支部署与手动重跑
.github/workflows/rollback.yml    手动回滚已保留版本
deploy/nginx.conf.example         若使用 Nginx 的站点示例
tests/                           内容规则单元测试与关键浏览器检查
docs/writing.md                   写作、图片与草稿说明
docs/deployment.md                配置、部署、排错、回滚说明
docs/acceptance/                  各阶段验收记录
```

单元测试使用 Vitest，浏览器行为使用 Playwright，仅覆盖内容规则、关键交互与发布风险；不为简单静态组件写镜像测试。部署脚本以 Linux 为建议前提；如服务器不是 Linux，在阶段 6 开始时调整该阶段计划后再实现。

---

## 阶段 1：可运行的视觉首页

**交付：** 能在本地打开的博客首页，先验收视觉与基本交互。

**Files:** 创建基础配置、`src/config/site.ts`、`src/layouts/BaseLayout.astro`、`src/components/TerminalWelcome.astro`、`src/styles/{tokens,global}.css`、`src/scripts/{theme,terminal}.ts`、`src/pages/index.astro`、`public/assets/*`、`.gitignore`、`README.md`。

**Interfaces:** `site` 配置导出 `{ title, description, url, terminalLines: string[] }`；`BaseLayout` 接受 `{ title: string; description?: string }`。生产输出固定为 `dist/`。命令 `npm run dev`、`npm run check`、`npm run build:site`、`npm run preview` 在此阶段提供，`build:site` 为纯 Astro 构建。

- [ ] 核对兼容运行环境，初始化 Git，在 main 提交现有设计与计划，创建 `feat/blog-foundation`；初始化 Astro TypeScript 静态项目，设置 `.gitignore` 排除 `node_modules/`、`dist/`、`.astro/`、`.env*`、测试报告，允许无秘密的 `.env.example`。
- [ ] 从参考目录复制角色动画、图标与可用静态角色，记录来源；不修改原文件。
- [ ] 实现前在 390px、768px、1440px 的同一视口下查看原始 HTML，记录首页明暗主题及列表、归档、关于、正文的参考截图；阅读原有 CSS 和脚本，识别需保留的视觉特征及可优化的阅读、布局和交互问题。
- [ ] 实现公共布局和样式变量，移植首页角色叠在终端上的构图；预留最近文章区，不伪造正式记录。
- [ ] 实现主题保存、首次跟随系统、同一会话只播放一次终端对话、减少动态效果时显示完整文字与静态角色；链接始终可点击。
- [ ] 运行 `npm run check` 与 `npm run build:site`，预期退出码均为 0；通过 `npm run preview` 检查构建后首页。
- [ ] 在 390px、768px、1440px 视口人工检查并截图，与原稿同视口、同主题并排对照；确认配色、角色与终端核心构图、细网格和手记气质延续，说明字号、间距、导航、动画及新增内容的优化，不以像素一致为标准。切换明暗并刷新、往返首页、启用减少动态效果，确认行为符合设计。
- [ ] 记录 `docs/acceptance/stage-1.md` 并提交 `feat: establish notebook homepage and theme`。

**用户验收：** 首页能明显辨认出初版 HTML 的设计来源，阅读、布局或交互有所优化且整体没有过度偏离；新增最近文章区协调，手机可用，主题切换正常；此时文章和搜索功能尚未交付。

## 阶段 2：Markdown 到文章的完整链路

**交付：** 新增 Markdown 就能生成文章详情、列表与归档，草稿规则有效。

**Files:** 创建 `src/content.config.ts`、`src/content/posts/`、`src/lib/{posts,dates}.ts`、`src/layouts/PostLayout.astro`、`src/components/{PostList,PostMeta}.astro`、文章/列表/归档路由、`tests/content.test.ts`、`tests/fixtures/content/`、`scripts/check-output.mjs`；修改首页接入真实内容。

**Interfaces:** `PostMeta = { slug: string; title: string; date: string; category: '技术' | '生活'; tags: string[]; draft: boolean; updated?: string; description?: string }`；`getPosts({ includeDrafts }: { includeDrafts: boolean }): Promise<PostSummary[]>`，`PostSummary = PostMeta & { excerpt: string }`，按 date 倒序、同日按 slug 稳定排序。schema 对外保持 `YYYY-MM-DD` 字符串日期；`formatDate(date: string): string` 输出 `YYYY.MM.DD`；`postUrl(slug: string): string` 输出 `/posts/<slug>/`。开发模式允许草稿，生产构建始终筛除。

- [ ] 添加 Vitest 与 `npm run test:unit`，先写内容规则测试：缺省 draft 为 true；生产只保留显式 false；无效日期、缺标题、重复标识和非法分类报错且包含文件路径；标签缺省为空；同日排序稳定。运行确认未实现规则前失败。
- [ ] 实现 Markdown loader、schema 和日期/文章接口；slug 取相对文章目录而非标题，只接受一层目录且匹配 `[a-z0-9]+(?:-[a-z0-9]+)*`，无效目录报错，避免地址歧义。
- [ ] 实现摘要优先使用 description，否则从正文提取纯文本并截取约 120 个字符；单测确认摘要不残留 Markdown 标记、HTML 标签或代码围栏。
- [ ] 实现独立文章页、列表筛选、最近记录和年月归档；列表只读取统一文章接口；更新日期不影响归档排序。空集合显示空状态，单篇文章没有无效的前后篇链接。
- [ ] 使用仅供验证的测试素材构建已发布文、草稿、缺省草稿、相对图片文；`check-output.mjs` 验证正式文可访问、图片资源存在，草稿页和独有字符串均不在输出中；测试素材不进入正式内容。
- [ ] 在 `UTC`、`America/Los_Angeles`、`Asia/Shanghai` 子进程运行日期测试，`2026-11-13` 均显示 `2026.11.13`；验证 `2026-02-30` 被拒绝。
- [ ] 运行 `npm run test:unit`、`npm run check`、`npm run build:site` 和 `node scripts/check-output.mjs`；将已发布测试文改为草稿重建，确认旧输出被清理。用 preview 直接打开并刷新文章地址。
- [ ] 记录 `docs/acceptance/stage-2.md` 并提交 `feat: publish markdown posts with draft filtering`。

**用户验收：** 自己新增一篇技术记录和一篇生活草稿，在本地看到两篇，生产预览只看到已发布记录；改标题后地址不变，归档正确。

## 阶段 3：完整阅读体验与其他页面

**交付：** 可以实际阅读长技术文章，移动端、关于页与错误页可用。

**Files:** 创建 `src/components/Toc.astro`、`src/styles/prose.css`、`src/scripts/copy-code.ts`、`src/content/about/index.md`、`src/pages/{about,404}.astro`、`tests/e2e/reading.spec.ts`、`playwright.config.ts`；修改文章布局和 Markdown 配置。

**Interfaces:** `Toc` 接受 Astro 渲染产出的 `{ depth: number; slug: string; text: string }[]`，展示 h2/h3，链接指向实际标题 ID；代码复制从对应 code 元素读取原始文本。新增 `npm run test:e2e`，浏览器测试启动构建预览服务。

- [ ] 先增加关键浏览器检查：重复标题目录跳转有效、代码复制内容包含原始换行、复制失败有反馈、390px 下文档宽度不超过视口。实现前运行对应测试确认失败。
- [ ] 配置 Shiki 明暗配色，完成正文 700–760px 上限、引用提示、任务列表、图片说明、代码和表格的局部滚动样式。
- [ ] 接入目录与代码复制；电脑空间足够时侧边目录，手机端可收起，缺少标题时不显示空目录。
- [ ] 接入关于 Markdown 与 404 页面；正文使用明确的占位提示，不把参考身份介绍默认为事实。文章与页面标题正确，导航可通过键盘使用。
- [ ] 运行 `npm run check`、`npm run build:site`、`npm run test:e2e -- tests/e2e/reading.spec.ts`；使用含长代码、宽表格、图片、重复标题的测试文章检查明暗和窄屏。
- [ ] 人工检查 390px 与 1440px 阅读页、关于页、404，对照原稿的列表、归档、关于和正文，确认现有样式延续且新增目录与复制按钮协调；检查焦点可见和减少动态效果。记录 `docs/acceptance/stage-3.md` 并提交 `feat: complete article reading experience`。

**用户验收：** 一篇包含代码、图片、表格的长笔记读起来舒适，目录和复制可用，手机页面不会被长内容撑宽。

## 阶段 4：搜索、标签与写作工具

**交付：** 找得到旧记录，用一个命令创建新文章，日常写作流程可用。

**Files:** 创建 `src/pages/tags/[tag].astro`、`src/pages/search.astro`、`src/scripts/search.ts`、`scripts/new-post.mjs`、`tests/new-post.test.ts`、`tests/e2e/search.spec.ts`、`docs/writing.md`；修改文章标签链接和构建命令。

**Interfaces:** `tagUrl(tag: string): string` 在 `src/lib/posts.ts` 定义为 `/tags/${encodeURIComponent(tag)}/`；标签值先 trim、去空并去重，拒绝含 `/`、`\\`、控制字符和仅为 `.`/`..` 的标签，测试覆盖。命令 `npm run new:post -- <slug> --title "标题" --category 技术` 生成 `src/content/posts/<slug>/index.md` 和 `images/`。`npm run build` = 站点构建 + Pagefind 索引；`npm run build:site` 仍保留。搜索只覆盖文章主体、标题和标签，不收录导航、关于、404 和开发草稿。

- [ ] 先编写新建命令测试：合法 slug 生成默认草稿和上海日期；重复目录不覆盖；路径穿越与无效 slug 拒绝，已有文件不变。运行失败后实现生成器。
- [ ] 实现标签页和统一链接编码，加入中文标签、空标签数组、特殊符号标签测试；阶段 2 内容规则接入标签规范。
- [ ] 构建后运行 Pagefind，使用其 JS API 实现符合本站样式的搜索；显示加载、无结果和加载失败状态，索引未生成的本地 dev 页面给出构建预览提示。
- [ ] 增加生产预览浏览器测试：中文正文关键词能定位文章、仅在标签出现的关键词能匹配、草稿独有词不匹配、空查询不报错、零文章时显示空状态、中文标签链接可直接访问。
- [ ] 运行 `npm run test:unit`、`npm run check`、`npm run build`、`node scripts/check-output.mjs`、`npm run test:e2e`；搜索检查必须针对完整生产构建执行。
- [ ] 编写 `docs/writing.md`，涵盖文章生成、元信息、相对图片、预览、发布、更新与撤下；照文档创建一次临时文章并完成生产预览，验收后清理临时素材。
- [ ] 记录 `docs/acceptance/stage-4.md` 并提交 `feat: add search tags and markdown authoring tools`。

**用户验收：** 按文档独立创建一篇笔记，搜索中文关键词能找到它，标签筛选有效，撤下后搜索和列表均消失。

## 阶段 5：公开 GitHub 仓库与持续集成

**交付：** GitHub 上有可追踪的版本，每次推送自动检查，成功构建有可下载产物；本阶段不部署服务器。

**Files:** 创建 `.github/workflows/ci.yml`、`docs/deployment.md` 的 CI 部分；修改 `README.md`。

**Interfaces:** CI 事件为 push（分支）、pull_request、workflow_dispatch；同仓库 PR 的重复 push 检查可去重。检查作业无部署凭据，权限默认 `contents: read`；成功产物名 `site-<commit-sha>`，内容为 dist，附 `version.json` 的 `{ commit, builtAt }`。后续部署消费该产物，不另行重建。

- [ ] 与用户确认仓库名称或现有仓库地址；检查是否已存在，明确使用公开仓库。检查本地提交范围后创建/连接仓库并推送，若工具无创建权限则给出准确的创建方式，不假报完成。
- [ ] 配置 CI 的兼容 Node、`npm ci`、单元检查、类型检查、完整构建、输出检查和关键浏览器检查；使用锁文件缓存依赖，安装必要浏览器运行环境。
- [ ] 在 Actions 中生成提交对应的 `version.json` 并打包同次构建产物；上传产物供人工下载和阶段 6 消费。第三方 action 使用核实过的提交 SHA 固定版本。
- [ ] 推送正常提交，等待实际 Actions 完成，记录运行链接与成功检查；下载产物在本地预览，确认版本标识对应提交且文章直达可用。
- [ ] 在临时分支提交无效元信息，确认检查失败并保留日志；通过 PR 验证检查触发且不会部署，关闭或清理验证分支。正式 main 保持可构建。
- [ ] 记录 `docs/acceptance/stage-5.md` 并提交 `ci: validate and build blog on github actions`。

**用户验收：** 在 GitHub 查看正常提交为绿色、错误提交为红色，能下载构建产物；能从提交找到对应构建记录。

## 阶段 6：云服务器自动部署与回滚

**交付：** main 推送通过 CI 后自动上线，失败保留可用版本，可以手动回滚。

**Files:** 创建 `scripts/{deploy,rollback}.sh`、`.github/workflows/rollback.yml`、`deploy/nginx.conf.example`（若适用）、`tests/deploy-smoke.sh`；修改 `.github/workflows/ci.yml` 加入部署作业、`docs/deployment.md` 和验收记录。

**Interfaces:** 服务器建议目录 `<DEPLOY_ROOT>/releases/<commit-sha>/`、`current`、`previous`；Web 根目录指向 `current`。脚本参数为绝对部署根目录与已校验提交标识，不接受任意相对目录。Secrets：`DEPLOY_SSH_KEY`、`DEPLOY_KNOWN_HOSTS`；变量：`DEPLOY_HOST`、`DEPLOY_PORT`、`DEPLOY_USER`、`DEPLOY_ROOT`、`SITE_URL`。手动回滚仅允许选择已存在且完整的版本，回滚不重新构建。

- [ ] 确认服务器系统、SSH 可达性、已有站点配置、目录、域名和 HTTPS；读取现状后确定部署适配。优先使用专用非 root 部署用户；不覆盖其他站点。若非 Linux，先更新本阶段的脚本与原子切换方案再执行。
- [ ] 使用临时部署根目录编写并运行 smoke 演练：首次上线成功、缺文件不切换、第二版成功后保留第一版、健康检查失败恢复第一版、重复版本不破坏当前版本、非法路径与标识拒绝。先证明失败条件可检测，再实现部署与回滚脚本。
- [ ] 上传到本次运行的临时目录，验证产物完整性后落到 releases；服务器同文件系统内原子更新 current，锁住切换流程。预期版本确认使用 `version.json` 与提交 SHA；切换失败立即退出，不清理现有可用版本。
- [ ] CI 部署仅在 main push 或明确的 main 手动运行且检查成功时执行。生产 concurrency 串行、不取消正在切换的任务；部署前校验当前远程 main 的 SHA，过期运行跳过。手动回滚共享相同部署锁和 concurrency。
- [ ] 配置 Actions Secrets、变量和经独立可信方式核验的主机密钥；配置站点路由、静态缓存与 HTTPS，HTML/版本文件避免长期缓存；如使用 Nginx，先通过 `nginx -t` 才重载。
- [ ] 先在服务器临时站点或独立验证目录运行同一产物，演练成功与失败回滚；验证根目录、文章直达、404、静态图片、搜索索引、版本标识。测试结束只清理验证目录。
- [ ] 首次上线前展示明确目标域名、站点目录与将执行的配置变化；取得对实际目标的上线授权后执行。推送一个可辨识的内容更新，等待实际 CI/CD 成功，确认线上版本 SHA 与该提交一致。
- [ ] 在正式站点演练一次已保留版本的手动回滚，再恢复预期版本；草稿撤下后旧文章 URL 应返回 404，搜索不再匹配。保留至少当前与上一成功版本，版本清理不删除它们。
- [ ] 完成 `docs/deployment.md`：首次配置、日常发布、失败日志定位、手动重跑、回滚、凭据更换和备份范围。记录 `docs/acceptance/stage-6.md` 并提交 `cd: deploy versioned static releases to cloud server`。

**用户验收：** 本地修改一篇 Markdown 并推送，等待 GitHub Actions 成功后线上可见；能看到对应提交；操作手动回滚后恢复上一版，再恢复新版本。

## 阶段完成看板

| 阶段 | 当前状态 | 可交付证据 |
|---|---|---|
| 1 首页 | 已进入下一阶段，合并至本地 main | [阶段记录与截图](../../acceptance/stage-1.md) |
| 2 内容链路 | 已进入下一阶段，合并至本地 main | [样文与验收记录](../../acceptance/stage-2.md) |
| 3 阅读体验 | 已进入下一阶段，合并至本地 main | [阅读样文与截图](../../acceptance/stage-3.md) |
| 4 搜索与写作 | 已合并至 main | [中文搜索演示与验收记录](../../acceptance/stage-4.md) |
| 5 GitHub CI | 远端验证通过，待用户验收 | [运行、产物与失败场景](../../acceptance/stage-5.md) |
| 6 自动部署 | 未开始 | 正式地址、提交对应版本、回滚演练 |

计划自查：设计中的首页、文章、标签、搜索、归档、关于、404、图片、日期、草稿、明暗主题、减少动态效果、发布、回滚均对应以上阶段；未指定服务器和仓库名称不会阻塞本地实现，但阶段 5/6 的外部验收必须等待真实环境和实际运行。
