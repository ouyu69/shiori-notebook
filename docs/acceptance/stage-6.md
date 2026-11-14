# 阶段 6：云服务器自动部署

状态：实施中，待真实 main CI/CD 与手动回滚验收。

- 地址：博客 http://117.72.196.0；WordPress http://117.72.196.0:8080。
- 授权：用户明确要求将 WordPress 移至其他端口、博客使用 80。实际选择空闲的 8080，先备份 Nginx 与数据库，nginx -t 成功后平滑重载。
- 服务器：Ubuntu 24.04.2，Nginx；部署用户 shiori-deploy，无 sudo，独立目录 /srv/shiori-notebook。
- 首版使用已通过 stage 5 CI 的 d9eed29dddbec3b1fc743e6c6555d693e23bbc19 产物，先本机 8081 验证，再迁入 80。公网 version.json 与预期一致。
- WordPress 本机 8080 正常，home/siteurl 已变更，WP-CLI 共替换 13 处旧网址。公网 8080 待云安全组检查。
- Linux smoke：首次失败移除链接、首次成功、升级、重复部署、旧页面 404、健康失败恢复、手动回滚、参数校验、损坏旧版本拒绝、TERM 中断恢复均通过。
- 最终独立 review 发现旧版本缺少全量校验和中断恢复；新增回归用例在原脚本上失败，修复后全套通过。
- Ruling：暂用 IP + HTTP，用户尚未提供域名；HTTPS 留待域名配置。当前访问与发布不依赖域名。
- Ruling：不向公开站点发布测试文章；撤下验证在隔离站点完成，正式内容继续为空。

用户验收：打开博客与 WordPress；本地新增自己的 Markdown 并推送 main；确认 Actions 成功后文章上线。
