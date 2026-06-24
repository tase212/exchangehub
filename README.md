# ExchangeHub

跨国货币兑换与流转平台 — 免费开源方案。

## 功能特性

- **C2C 货币匹配** — 智能匹配买卖双方，最优汇率
- **多币种钱包** — 支持 10+ 主流货币的虚拟钱包
- **资金托管** — 交易资金冻结保护，双方确认后释放
- **线下找换店** — 合作找换店网络查询
- **实时汇率** — 接免费汇率 API，实时更新
- **多语言** — 中/英/日/韩/繁 5 种语言
- **响应式** — 移动端和桌面端自适应

## 技术栈

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma ORM + PostgreSQL
- JWT httpOnly Cookie 认证
- 免费汇率 API (ExchangeRate-API)

## 快速开始

```bash
npm install
cp .env.example .env    # 修改 DATABASE_URL 指向你的 PostgreSQL
npx prisma generate
npx prisma db push
npm run dev              # http://localhost:3000
```

## 免费云部署

[查看部署指南 →](./DEPLOY.md)

Vercel + Vercel Postgres 完全免费：
1. GitHub 推送代码
2. Vercel 导入项目
3. 创建 Vercel Postgres
4. 自动部署完成

## 项目结构

```
src/
├── app/                 # Next.js App Router
│   ├── api/             # API Routes
│   │   ├── auth/        # 注册/登录/登出/个人信息/密码重置
│   │   ├── orders/      # 订单 CRUD + 接单 + 确认完成
│   │   ├── wallets/     # 钱包查询 + 充值
│   │   ├── shops/       # 找换店查询
│   │   ├── rates/       # 实时汇率
│   │   ├── reviews/     # 评价系统
│   │   └── rate-alerts/ # 汇率提醒
│   └── [locale]/        # i18n 路由（登录/注册/交易市场/仪表盘等）
├── components/          # Navbar / LanguageSwitcher
├── i18n/               # 5 语言翻译文件
└── lib/                # Auth / AuthContext / Prisma 单例
```

## 订单流程

```
卖家发布挂单 → OPEN
  ↓
买家接单 → MATCHED（资金托管冻结）
  ↓
卖家确认收款 → COMPLETED（资金释放到双方）
```
