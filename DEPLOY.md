# 阿里云自动部署指南

本文档记录静态站点自动部署到阿里云服务器的完整流程，后续新项目可直接参考。

## 服务器信息

| 项目 | 值 |
|------|------|
| IP | 见 GitHub Secrets `DEPLOY_HOST` |
| 系统 | Alibaba Cloud Linux 3 |
| Web 服务器 | nginx 1.20.1 |
| 站点根目录 | /var/www |
| SSH 用户 | root |

## 架构

```
/var/www/
├── cc-learn/    → http://<服务器IP>/cc-learn
├── think/       → http://<服务器IP>/think
└── xxx/         → http://<服务器IP>/xxx（未来新项目）
```

nginx 统一代理 `/var/www` 目录，每个子目录即一个独立站点，通过路径直接访问。
新项目只需要在 `/var/www/` 下创建目录，无需改 nginx 配置。

## nginx 配置

配置文件：`/etc/nginx/conf.d/static-sites.conf`

```nginx
server {
    listen 80;
    server_name _;

    root /var/www;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~* \.(css|js|png|jpg|gif|ico|svg)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/html text/css application/javascript;
}
```

## 新项目部署步骤

### 1. 创建 GitHub 仓库

在 GitHub 上创建新仓库，确保有静态文件目录（如 `front/`、`dist/` 等）。

### 2. 服务器创建目录

```bash
mkdir -p /var/www/新项目名
```

### 3. 添加 deploy.yml

在仓库中创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Server

on:
  push:
    branches: [main]
    paths:
      - 'front/**'        # 改成你的静态文件目录
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy via rsync
        uses: burnett01/rsync-deployments@7.0.1
        with:
          switches: -avz --delete
          path: front/                          # 改成你的静态文件目录
          remote_path: /var/www/新项目名/        # 改成对应目录
          remote_host: ${{ secrets.DEPLOY_HOST }}
          remote_user: ${{ secrets.DEPLOY_USER }}
          remote_key: ${{ secrets.DEPLOY_SSH_KEY }}
```

### 4. 配置 GitHub Secrets

在仓库 Settings → Secrets and variables → Actions 中添加：

| Secret 名称 | 值 |
|---|---|
| `DEPLOY_HOST` | 服务器公网 IP |
| `DEPLOY_USER` | root |
| `DEPLOY_SSH_KEY` | 服务器 SSH 私钥（见下方说明） |

### 5. SSH 密钥说明

服务器上已有部署专用密钥：
- 私钥：`~/.ssh/id_ed25519_deploy`
- 公钥已加入：`~/.ssh/authorized_keys`

获取私钥内容（配置到 `DEPLOY_SSH_KEY`）：

```bash
cat ~/.ssh/id_ed25519_deploy
```

**注意：** 复制私钥时必须保留原始换行格式，不能挤成一行，否则会报 `error in libcrypto`。

所有新项目共用同一个 `DEPLOY_SSH_KEY`，`DEPLOY_HOST` 和 `DEPLOY_USER` 也一样，
只需要改 deploy.yml 里的 `path` 和 `remote_path`。

### 6. 推送触发

```bash
git add .
git commit -m "deploy: 初始部署"
git push
```

push 后 GitHub Actions 自动执行，也可以在 Actions 页面手动点 Run workflow。

## SSH 配置（本地多账号）

本地 `~/.ssh/config`：

```
Host github-cc
  HostName github.com
  User git
  IdentityFile C:/Users/Administrator/.ssh/id_ed25519_cc
```

关联仓库时使用别名：

```bash
git remote add origin git@github-cc:cyrain-cheng/仓库名.git
```

项目级 git 配置（不影响全局）：

```bash
git config user.name "chengyong"
git config user.email "chengy_1026@163.com"
```

## 常用运维命令

```bash
nginx -t                              # 检查配置
systemctl restart nginx               # 重启
systemctl status nginx                # 查看状态
tail -f /var/log/nginx/access.log     # 访问日志
tail -f /var/log/nginx/error.log      # 错误日志
```
