# 收纳记 (StorageLog)

一款个人物品收纳管理系统，支持移动端优先设计和 PWA 离线使用。

## 功能特性

### 核心功能
- **快速登记** - 3秒快速添加物品，支持拍照识别
- **全局搜索** - 0.5秒快速检索物品位置
- **位置管理** - 多层级位置结构（房间 → 区域 → 容器）
- **行李箱模式** - 旅行收纳管理，支持物品打包清单

### 数据管理
- **本地存储** - IndexedDB 离线数据持久化
- **云端同步** - Supabase 后端支持（可选）
- **数据安全** - 行级安全策略保护用户数据

### 用户体验
- **响应式设计** - 适配手机、平板、桌面端
- **PWA 支持** - 可安装到桌面，离线可用
- **莫兰迪配色** - 简约优雅的视觉风格

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript |
| 构建工具 | Vite 7 |
| UI 组件库 | Material UI 7 |
| 状态管理 | React Context + useReducer |
| 后端服务 | Supabase (PostgreSQL + Auth) |
| 离线存储 | IndexedDB |
| PWA | vite-plugin-pwa |

## 项目结构

```
src/
├── components/          # 可复用组件
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
│   ├── LocationManagementPage.tsx # 位置管理
│   ├── SuitcasePage.tsx # 行李箱
│   └── LoginPage.tsx   # 登录页
├── types/              # 类型定义
├── utils/              # 工具函数
│   └── offlineStorage.ts # IndexedDB 存储
└── lib/
    └── supabase.ts     # Supabase 客户端
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

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 数据库配置

1. 在 [Supabase](https://supabase.com) 创建项目
2. 在 SQL Editor 中执行 `docs/database-schema.sql`
3. 配置环境变量

## 数据模型

### 物品 (Item)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 唯一标识 |
| name | string | 物品名称 |
| description | string | 描述 |
| category | string | 分类 |
| location_id | UUID | 存放位置 |
| suitcase_id | UUID | 所属行李箱 |
| photos | string[] | 照片列表 |
| tags | string[] | 标签 |

### 位置 (Location)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 唯一标识 |
| name | string | 位置名称 |
| room_id | UUID | 所属房间 |
| parent_id | UUID | 父级位置 |

### 行李箱 (Suitcase)
| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 唯一标识 |
| name | string | 行李箱名称 |
| description | string | 描述 |
| photos | string[] | 照片列表 |

## 部署

### Vercel 部署

项目已包含 `vercel.json` 配置，可直接部署到 Vercel：

```bash
vercel deploy
```

### 静态部署

构建后的文件位于 `dist/` 目录，可部署到任何静态服务器。

## 许可证

MIT License
