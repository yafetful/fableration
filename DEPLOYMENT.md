# Fableration 部署指南

本文档提供了如何使用Docker和Nginx在Ubuntu服务器上部署Fableration项目的详细步骤。

## 前提条件

- Ubuntu服务器（推荐20.04或以上版本）
- 已配置的域名（例如0ai.ai）指向服务器IP
- SSH访问权限

## 1. 安装必要软件

```bash
# 更新软件包列表
sudo apt update

# 安装必要工具
sudo apt install -y curl git

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 将当前用户添加到docker组（无需sudo运行docker）
sudo usermod -aG docker $USER
# 需要注销并重新登录以使更改生效
```

## 2. 部署项目

### 克隆项目

```bash
git clone [你的Git仓库URL]
cd fableration
```

### 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env
cp server/.env.example server/.env

# 编辑环境变量
nano .env
# 设置DOMAIN为你的域名，例如：DOMAIN=0ai.ai

nano server/.env
# 修改JWT_SECRET和ADMIN_PASSWORD为安全的值
```

### 构建和启动Docker容器

```bash
# 构建和启动容器
docker-compose up -d

# 查看容器状态
docker-compose ps
```

## 3. 配置Nginx (如果需要在服务器上使用Nginx)

如果你希望使用服务器上的Nginx作为反向代理，而不是容器中的Nginx，请按照以下步骤操作：

### 安装Nginx

```bash
sudo apt install -y nginx
```

### 创建Nginx配置文件

```bash
sudo nano /etc/nginx/sites-available/fableration
```

添加以下内容（替换yourdomain.com为你的实际域名）：

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 启用站点并重启Nginx

```bash
sudo ln -s /etc/nginx/sites-available/fableration /etc/nginx/sites-enabled/
sudo nginx -t  # 检查配置是否有误
sudo systemctl restart nginx
```

## 4. 配置HTTPS (推荐)

使用Let's Encrypt获取免费SSL证书：

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

按照提示完成SSL证书配置。

## 5. 管理与维护

### 查看容器日志

```bash
# 查看所有容器的日志
docker-compose logs

# 查看特定服务的日志
docker-compose logs frontend
docker-compose logs backend
```

### 重启服务

```bash
docker-compose restart
```

### 更新项目

```bash
# 拉取最新代码
git pull

# 重新构建并启动容器
docker-compose up -d --build
```

## 6. 常见问题排查

1. 如果无法访问网站，检查:
   - Docker容器是否正常运行: `docker-compose ps`
   - 域名是否正确解析到服务器IP
   - 防火墙设置是否允许80/443端口: `sudo ufw status`

2. 如果上传文件不工作:
   - 检查uploads目录权限
   - 检查Docker卷挂载是否正确

3. 数据库问题:
   - SQLite数据库文件被正确挂载: `docker-compose exec backend ls -la`

## 7. 将项目交付给他人使用

当你需要将此项目交付给他人使用时，确保他们有以下资源:

1. 本部署文档
2. 项目源代码
3. `.env.example`和`server/.env.example`文件
4. 提醒他们根据自己的域名/环境修改相关配置 