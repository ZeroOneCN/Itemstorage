# 收纳记 (StorageLog)

一款个人物品收纳管理系统，支持云端同步、多设备访问，拍照即记、位置精准到抽屉级别。

## 功能特性

### 核心功能
- **快速登记** - 支持拍照识别，添加物品信息
- **全局搜索** - 快速检索物品位置
- **位置管理** - 多层级位置结构（房间 → 区域 → 容器）
- **收纳箱模式** - 支持按收纳箱分类管理物品

### 数据管理
- **云端存储** - 数据存储在 Supabase，多设备同步
- **数据备份** - 支持导出 JSON 备份文件
- **数据恢复** - 支持从备份文件恢复数据
- **数据安全** - 行级安全策略保护用户数据

### 账户安全
- **邮箱注册登录** - 支持邮箱密码注册和登录
- **忘记密码** - 支持邮件重置密码
- **修改密码** - 登录后可修改密码

### 用户体验
- **响应式设计** - 适配手机、平板、桌面端
- **PWA 支持** - 可安装到桌面，离线可用
- **自定义弹窗** - 优雅的确认和提示弹窗
- **莫兰迪配色** - 简约优雅的视觉风格

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 7 |
| UI 组件库 | Material UI 7 |
| 状态管理 | React Context + useReducer |
| 路由 | React Router DOM |
| 后端服务 | Supabase (PostgreSQL + Auth) |
| PWA | vite-plugin-pwa |

## 项目结构

```
src/
├── components/          # 可复用组件
│   ├── AlertDialog/    # 提示弹窗
│   ├── ConfirmDialog/  # 确认弹窗
│   ├── ItemCard/       # 物品卡片
│   ├── Layout/         # 页面布局
│   ├── LocationTree/   # 位置树形结构
│   ├── Navigation/     # 导航组件
│   └── PhotoUploader/  # 图片上传
├── context/            # 状态管理
│   ├── AppContext.tsx  # 应用状态
│   └── AuthContext.tsx # 认证状态
├── pages/              # 页面组件
│   ├── HomePage.tsx    # 首页
│   ├── SearchPage.tsx  # 搜索页
│   ├── AddItemPage.tsx # 添加物品
│   ├── ItemDetailPage.tsx # 物品详情
│   ├── LocationManagementPage.tsx # 设置页
│   ├── SuitcasePage.tsx # 收纳箱
│   ├── LoginPage.tsx   # 登录页
│   └── ResetPasswordPage.tsx # 重置密码页
├── types/              # 类型定义
├── lib/
│   └── supabase.ts     # Supabase 客户端
└── docs/
    └── database-schema.sql # 数据库结构
```

## 快速开始

### 环境要求
- Node.js 18+
- npm 或 pnpm

### 安装依赖

```bash
npm install
```

### 配置环境变量

复制 `.env.example` 为 `.env` 并填写配置：

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:9006

### 构建生产版本

```bash
npm run build
```

## Supabase 配置

### 1. 创建项目

1. 访问 [Supabase](https://supabase.com) 并登录
2. 点击 **New Project** 创建新项目
3. 记录 **Project URL** 和 **anon public key**

### 2. 创建数据库表

在 SQL Editor 中执行 `docs/database-schema.sql`

### 3. 配置认证

1. 进入 **Authentication** → **Providers**
2. 关闭 **Confirm email**（开发阶段可选）
3. 进入 **URL Configuration**
4. 设置 **Site URL** 为你的域名
5. 添加 **Redirect URLs**

## 部署到 Vercel

### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "Initial commit"
git push
```

### 2. 在 Vercel 导入项目

1. 登录 [Vercel](https://vercel.com)
2. 点击 **Add New** → **Project**
3. 选择 GitHub 仓库
4. 点击 **Import**

### 3. 配置环境变量

在 **Environment Variables** 中添加：

| 名称 | 值 |
|------|-----|
| `VITE_SUPABASE_URL` | 你的 Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | 你的 Supabase anon key |

### 4. 部署

点击 **Deploy** 完成部署

## 使用说明

### 导航结构

底部 4 个标签页：
- **首页** - 最近添加的物品，快速添加入口
- **搜索** - 全局搜索物品
- **收纳箱** - 按收纳箱分类管理物品
- **设置** - 用户信息、统计、房间和位置管理

### 添加物品

1. 点击首页右下角 **+** 按钮
2. 填写物品信息（名称、描述、类别、标签）
3. 选择存放位置或所属收纳箱
4. 拍照或从相册选择照片
5. 点击保存

### 数据备份

1. 进入 **设置** 页面
2. 点击 **备份数据**
3. 下载 JSON 备份文件

### 数据恢复

1. 进入 **设置** 页面
2. 点击 **恢复数据**
3. 选择备份 JSON 文件
4. 确认恢复