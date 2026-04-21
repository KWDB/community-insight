# KWDB Community Insight - Code Wiki

本文档提供了 `kwdb-insight` 项目的结构化技术全貌，旨在帮助开发者快速理解项目架构、核心模块、关键实现及运行方式。

## 1. 项目整体架构

`kwdb-insight` 是一个用于展示 KWDB 社区各项指标和发展趋势的可视化仪表盘项目。项目采用了**配置驱动**和**前后端分离（BaaS）**的架构设计。

### 1.1 技术栈
- **核心框架**：Next.js 14 (App Router) + React 18 + TypeScript
- **后端服务/数据库**：Supabase (基于 PostgreSQL，提供 REST API 和认证)
- **数据可视化**：Apache ECharts (`echarts`, `echarts-for-react`)
- **时间与数据处理**：Day.js (`dayjs`), YAML 解析 (`yaml`)
- **测试框架**：Playwright (`@playwright/test`)
- **包管理器**：pnpm

### 1.2 核心设计理念
- **静态导出 (SSG)**：项目配置为完全静态化输出 (`output: 'export'`)，页面在构建时生成，数据在客户端请求。非常适合托管在 GitHub Pages 等静态服务器。
- **配置驱动图表**：所有的图表定义（标题、类型、布局、数据源绑定）都通过 `charts/` 目录下的 `.yaml` 文件声明，无需修改前端路由即可增加新图表。
- **轻量级鉴权**：采用前端硬编码密码验证结合 `localStorage` 缓存的极简鉴权模式（主要用于防误访）。

---

## 2. 主要模块职责

项目目录结构清晰，按功能划分为以下主要模块：

| 目录/文件 | 职责说明 |
| :--- | :--- |
| **`app/`** | Next.js App Router 的路由和页面入口。包括全局布局 (`layout.tsx`)、全局样式 (`globals.css`) 以及首页 Dashboard 页面结构 (`page.tsx`)。 |
| **`charts/`** | **图表元数据中心**。包含多个 `.yaml` 配置文件，每个文件定义了一个图表的基础信息（ID、标题、图表类型 `viz`、绑定的查询模块 `queryModule` 以及布局占比 `colSpan`）。 |
| **`components/`** | **UI 组件库**。包含鉴权拦截 (`Auth.tsx`)、图表渲染引擎 (`ChartRenderer.tsx`)、仪表盘容器 (`DashboardClient.tsx`) 以及顶部导航、日期选择器等纯 UI 组件。 |
| **`queries/`** | **数据查询逻辑层**。存放与 Supabase 交互的 TypeScript 脚本，每个文件负责一个图表的数据获取与格式化处理。通过 `index.ts` 统一暴露，避免 Webpack 全量扫描。 |
| **`lib/`** | **核心工具库**。包含 Supabase 客户端初始化 (`supabaseClient.ts`)、YAML 解析加载器 (`serverManifest.ts`)、前端缓存 (`dataCache.ts`) 和时间处理工具 (`time.tsx`)。 |
| **`tests/`** | Playwright E2E 端到端自动化测试用例。 |

---

## 3. 关键类与函数说明

### 3.1 配置与清单加载
- **`loadManifest()`** *(位置: `lib/serverManifest.ts`)*
  - **功能**：在服务端（或构建时）读取 `charts/` 目录下的所有 YAML 文件，将其解析并组装为一个完整的 `Manifest` 对象，包含所有的 `dashboards` 和对应的 `charts` 配置。

### 3.2 图表渲染引擎
- **`<ChartRenderer />`** *(位置: `components/ChartRenderer.tsx`)*
  - **功能**：图表的核心渲染组件。
  - **工作流**：接收一个 `ChartConfig` 对象，根据其 `queryModule` 属性动态调用 `QUERIES` 映射表中的对应异步查询函数获取数据；通过 `getCache` / `setCache` 进行数据本地缓存处理；根据 `viz` 属性决定渲染 ECharts 图形（`line`, `bar`）、统计卡片（`Stat`）还是表格（`Table`）。

### 3.3 数据查询契约
- **`query(params: { range: { from: Date, to: Date } })`** *(位置: `queries/*.ts`)*
  - **功能**：每个查询模块必须导出的标准异步函数。
  - **实现**：接收时间范围参数，构建 Supabase 查询，过滤时间边界 (`gte`, `lte`)，返回结构化数据（如 `{ stat: { value, label, date } }` 或 `{ series: [...] }`）供 `ChartRenderer` 消费。

### 3.4 全局状态与鉴权
- **`<AuthProvider>` & `<ProtectedRoute>`** *(位置: `components/Auth.tsx`)*
  - **功能**：全局访问控制。
  - **机制**：通过比对用户输入与环境变量 `NEXT_PUBLIC_ACCESS_PASSWORD`，验证通过后写入 `localStorage`。`<ProtectedRoute>` 会拦截未授权的页面访问并展示登陆卡片。

### 3.5 仪表盘容器
- **`<DashboardClient>`** *(位置: `components/DashboardClient.tsx`)*
  - **功能**：仪表盘页面的客户端根组件。
  - **机制**：提供 `TimeRangeProvider` 上下文供所有子图表使用；读取图表的 `section` 属性（如 `stats` 或 `trends`），对图表进行分组渲染，并处理全局刷新逻辑（`refreshSignal`）。

---

## 4. 依赖关系

本项目的核心依赖如下（定义于 `package.json`）：

### 4.1 核心运行时依赖 (Dependencies)
- `next (^14.2.10)`: React 框架，提供路由、SSR/SSG 支持。
- `react`, `react-dom (^18.3.1)`: UI 渲染基础。
- `@supabase/supabase-js (^2.84.0)`: Supabase 官方客户端，用于查询数据源。
- `echarts (^5.5.0)`, `echarts-for-react (^3.0.2)`: 强大的数据可视化图表库及其 React 封装。
- `yaml (^2.4.5)`: 用于在构建阶段解析图表配置文件。
- `dayjs (^1.11.11)`: 轻量级的时间和日期格式化库。
- `lucide-react (^0.555.0)`: SVG 矢量图标库。
- `qrcode.react (^4.2.0)`: 用于生成二维码（如有相关分享需求）。

### 4.2 开发依赖 (DevDependencies)
- `typescript (^5.6.2)`: 提供静态类型检查。
- `@playwright/test (^1.47.0)`: 浏览器端到端(E2E)测试框架。
- `@types/node`, `@types/react`: TypeScript 类型声明。

---

## 5. 项目运行方式

### 5.1 环境准备
在项目根目录创建 `.env.local` 文件，配置以下必要的环境变量：

```env
# Supabase 连接信息
NEXT_PUBLIC_SUPABASE_URL=你的_Supabase_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_Supabase_Anon_Key

# 访问保护密码（可选，默认为 kwdb2025）
NEXT_PUBLIC_ACCESS_PASSWORD=你的访问密码
```

### 5.2 安装依赖
推荐使用 `pnpm` 作为包管理器：
```bash
pnpm install
```

### 5.3 本地开发
启动本地开发服务器，支持热更新：
```bash
pnpm dev
```
启动后在浏览器访问 `http://localhost:3000`。

### 5.4 生产构建 (静态导出)
构建静态文件，产物将输出至 `out/` 目录：
```bash
pnpm build
```
输出的 `out/` 目录可以直接部署到 GitHub Pages、Vercel 或 Nginx 等任意静态服务器。

### 5.5 运行测试
执行 Playwright E2E 测试：
```bash
pnpm test:e2e
```