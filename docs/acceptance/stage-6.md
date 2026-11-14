# 阶段 6：云服务器自动部署

状态：实现与自动检查通过，真实 CI/CD 和手动回滚通过，待用户验收。

- 地址：博客 http://117.72.196.0；WordPress http://117.72.196.0:8080。
- 授权：用户明确要求将 WordPress 移至其他端口、博客使用 80。实际选择空闲的 8080，先备份 Nginx 与数据库，nginx -t 成功后平滑重载。
- 服务器：Ubuntu 24.04.2，Nginx；部署用户 shiori-deploy，无 sudo，独立目录 /srv/shiori-notebook。
- 首版使用已通过 stage 5 CI 的 d9eed29dddbec3b1fc743e6c6555d693e23bbc19 产物，先本机 8081 验证，再迁入 80。公网 version.json 与预期一致。
- WordPress 本机 8080 正常，home/siteurl 已变更，WP-CLI 共替换 13 处旧网址。用户放行云安全组后，公网首页 200，后台 302 正确跳转至 :8080 登录页。
- Linux smoke：首次失败移除链接、首次成功、升级、重复部署、旧页面 404、健康失败恢复、手动回滚、参数校验、损坏旧版本拒绝、TERM 中断恢复均通过。
- 最终独立 review 发现旧版本缺少全量校验和中断恢复；新增回归用例在原脚本上失败，修复后全套通过。
- Ruling：暂用 IP + HTTP，用户尚未提供域名；HTTPS 留待域名配置。当前访问与发布不依赖域名。
- Ruling：不向公开站点发布测试文章；撤下验证在隔离站点完成，正式内容继续为空。

用户验收：打开博客与 WordPress；本地新增自己的 Markdown 并推送 main；确认 Actions 成功后文章上线。

## 真实运行证据

- 部署分支完整 CI：[43551759786](https://github.com/ouyu69/shiori-notebook/actions/runs/43551759786)，成功，开发分支未发布。
- main 构建及部署：[43551897549](https://github.com/ouyu69/shiori-notebook/actions/runs/43551897549)，成功，线上 version.json 为 57f11eb8d49b7489171dc7a437f452f2e0d248e5。
- GitHub 手动回滚：[43552325879](https://github.com/ouyu69/shiori-notebook/actions/runs/43552325879)，成功，线上恢复 d9eed29dddbec3b1fc743e6c6555d693e23bbc19。
- 浏览器检查：首页、文章列表、搜索、归档、关于均 200；不存在页面 404；无资源加载失败和 JS 异常；390px 无横向溢出。WordPress 公网页面正常。
- Nginx 检查：首页 Cache-Control no-cache，version.json no-store，manifest.json 403。
- 上传优化：rsync --checksum --copy-dest 复用上一版未改变的资源；隔离测试中只传输变更页面的 8 字节，旧版本保持原样。
- 分支集成：ci/server-deployment 已快进合并 main，保留分支追溯。
- 无正式文章，未在生产发布演示内容。真实 Markdown 发布由用户以自己的首篇文章验收。
- 恢复新版：[43552365768](https://github.com/ouyu69/shiori-notebook/actions/runs/43552365768)，成功，线上再次为 57f11eb8d49b7489171dc7a437f452f2e0d248e5。
