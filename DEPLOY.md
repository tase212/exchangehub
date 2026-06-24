# ExchangeHub 免费云部署指南

## 前置准备

### 1. GitHub 仓库
```bash
cd D:\ExchangeHub
git init
git add .
git commit -m "Initial commit: ExchangeHub"
```
在 GitHub 创建新仓库，然后：
```bash
git remote add origin https://github.com/YOUR_USERNAME/exchangehub.git
git push -u origin main
```

---

## 方案一：Vercel + Vercel Postgres（完全免费，推荐）

### 1. Vercel 部署
1. 访问 https://vercel.com 用 GitHub 登录
2. 点击 "Import Project" → 选择 `exchangehub` 仓库
3. 框架自动识别为 Next.js，无需修改构建设置

### 2. 创建免费 PostgreSQL
1. Vercel Dashboard → Storage → Create → Postgres
2. 选择 `exchangehub` 项目
3. 创建成功后 `DATABASE_URL` 自动注入环境变量

### 3. 环境变量
在 Vercel 项目 → Settings → Environment Variables 添加：

| 变量 | 值 | 说明 |
|------|-----|------|
| `DATABASE_URL` | 自动注入 | Vercel Postgres 连接 |
| `NEXTAUTH_SECRET` | 随机 32 位字符串 | JWT 签名密钥 |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | 生产域名 |

生成密钥：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. 数据库迁移
Vercel 构建时自动执行 `npx prisma generate && npx prisma db push`

### 5. 部署
- 每次 `git push` 到 main 分支自动触发部署
- 或手动在 Vercel Dashboard 点击 "Deploy"

---

## 方案二：Vercel + Supabase（免费 PostgreSQL）

### 1. 注册 Supabase
1. 访问 https://supabase.com → 创建免费项目
2. 在 Settings → Database → Connection string 复制 URI
3. 格式：`postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

### 2. 在 Vercel 添加环境变量
手动添加 `DATABASE_URL` 为上面复制的 Supabase 连接字符串

### 3. 本地推送 Schema（或 Vercel 自动 db push）
```bash
npx prisma db push
```

---

## 方案三：Vercel + Neon（免费 PostgreSQL）

1. 访问 https://neon.tech → 创建免费项目
2. 复制连接字符串
3. 添加到 Vercel 环境变量 `DATABASE_URL`

---

## 自动部署脚本

项目已配置 `vercel.json`，Vercel 构建时自动：
1. `npm install`
2. `npx prisma generate` — 生成 Prisma Client
3. `npx prisma db push` — 同步数据库 schema
4. `next build` — 构建 Next.js

---

## 自定义域名（可选）
1. Vercel Dashboard → Settings → Domains
2. 添加自定义域名
3. 在域名提供商处添加 DNS 记录（Vercel 会提供）

---

## 本地开发

### 1. 安装 PostgreSQL
```bash
# Docker（推荐）
docker run -d --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16

# 或本地安装 PostgreSQL 16+
```

### 2. 配置环境
```bash
cp .env.example .env
# 确保 DATABASE_URL 指向本地 PostgreSQL
```

### 3. 初始化数据库
```bash
npm install
npx prisma generate
npx prisma db push
```

### 4. 启动
```bash
npm run dev        # http://localhost:3000
npm run build      # 构建
npm run start      # 生产运行
```
