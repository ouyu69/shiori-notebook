# 发布与运维

仓库：[ouyu69/shiori-notebook](https://github.com/ouyu69/shiori-notebook)。博客地址：http://117.72.196.0 。WordPress 已迁到 http://117.72.196.0:8080（已放行并通过公网检查）。当前使用 IP 和 HTTP；取得域名后再配置 HTTPS。

## 日常发布

本地编辑 `src/content/posts/` 中的 Markdown，按 [写作说明](writing.md) 填写字段。正式内容需 `draft: false`。提交并推送 main 后，GitHub Actions 自动测试、构建、校验产物、上传并切换版本。开发分支和 PR 只检查，不发布。

在 [Blog CI](https://github.com/ouyu69/shiori-notebook/actions/workflows/ci.yml) 查看运行结果；`/version.json` 的 commit 应与提交 SHA 相同。草稿文件也会进入公开 Git 仓库，因此不要把私密内容或密钥提交到仓库。

## 服务器与首次配置

Ubuntu / Nginx；部署账号 `shiori-deploy`，无 sudo 权限，目录 `/srv/shiori-notebook`。Nginx 配置模板在 `deploy/shiori.conf`，实际配置在 `/etc/nginx/sites-available/shiori-notebook`。修改 Nginx 后先执行 `nginx -t`，成功才 reload。

目录：`incoming/<SHA>` 上传中，`releases/<SHA>` 保留版本，`current` 当前，`previous` 上次成功版本，`shared/_astro` 与 `shared/pagefind` 保留旧页面所需资源。上传通过校验和复用上一版未变化资源，避免重复传输动画。产物逐文件 SHA-256 校验，切换使用同文件系统原子符号链接；发布与回滚共享服务器 flock 和 GitHub concurrency。过期 main 构建在发布前跳过。健康检查验证版本、首页和文章列表；失败或可捕获中断恢复原链接。首次失败移除 current。

production 环境仅允许 main。Secrets：`DEPLOY_SSH_KEY`、`DEPLOY_KNOWN_HOSTS`。Variables：`DEPLOY_HOST=117.72.196.0`、`DEPLOY_PORT=22`、`DEPLOY_USER=shiori-deploy`、`DEPLOY_ROOT=/srv/shiori-notebook`、`SITE_URL=http://117.72.196.0`。主机指纹从已有可信 root SSH 会话读取主机公钥后固定。部署公钥在账号的 authorized_keys，使用 restrict 禁止转发等功能。私钥只存于 GitHub Secret，不能提交 Git。

## 失败和回滚

构建失败：在 Actions 打开失败步骤，修正 Markdown/代码后重新推送。部署失败：检查日志中的 SSH、manifest、健康检查错误；现有成功版本保留。当前 main 可在 Blog CI 手动 Run workflow 或重跑失败任务；旧提交运行会跳过发布。

打开 [Roll back blog](https://github.com/ouyu69/shiori-notebook/actions/workflows/rollback.yml)，选择 main，输入服务器已保留版本的完整 40 位 SHA。等待成功并检查 `/version.json`。恢复新版也运行同一流程，输入新版 SHA。回滚不会改变 Git 历史；下次 main 更新仍会正常发布。

服务器紧急操作：从可信本机把 `scripts/deploy.sh` 传到服务器，以 shiori-deploy 执行 `bash deploy.sh /srv/shiori-notebook <SHA> http://127.0.0.1 rollback`。不要直接编辑 current 内容。现阶段不自动清理旧版本；维护时先确认 current、previous 指向并保护两者，shared 资源不得随意删除。

## 凭据与备份

轮换：生成新的无口令专用 SSH key，将公钥加入部署账号 authorized_keys，更新 production 的 DEPLOY_SSH_KEY，验证成功后移除旧公钥。主机密钥变更需经可信服务器控制台核验，再更新 DEPLOY_KNOWN_HOSTS。账号无 Nginx 配置或 WordPress 写权限。

Git 保存内容和代码；GitHub Artifacts 保存构建产物（受平台保留期限限制）；服务器保留可回滚 release。应另行备份 Nginx 配置、部署目录和 WordPress 数据库/uploads，不把备份提交到公开仓库。此次迁移备份位于服务器 `/root/shiori-migration-20261114/`，包含原 Nginx、WordPress SQL 与网址迁移日志。WordPress home/siteurl 和正文资源链接已由 WP-CLI 进行序列化安全替换，GUID 保留。
