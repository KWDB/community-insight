# KWDB Community Dashboard 开发文档

## 项目结构说明
- `app/`：Next.js App Router 页面与布局（SSG 静态生成）
- `components/`：通用组件（图表渲染、时间选择器、状态边界）
- `charts/`：YAML 图表配置（一图一文件）
- `queries/`：JS/TS 查询模块（一图一模块）
- `lib/`：`supabaseClient`、时间工具、配置/manifest 解析
- `sql/`：示例 SQL（仅参考与验证，不在前端直接执行）

## 图表配置格式规范（YAML）
```yaml
id: downloads_trend            # 唯一 ID
title: Downloads Over Time     # 标题
description: 趋势说明          # 描述
queryModule: queries/downloadsTrend.ts   # 关联 JS 查询文件
viz: line                      # 图表类型：line|bar|area|table|stat
options:                       # 可选配置（坐标、键名等）
  xKey: date
  yKey: count
section: trends                # 布局分区：stats|trends|<自定义>
order: 1                       # 分区内排序（越小越靠前）
colSpan: 2                     # 栅格列跨越数（如 1/2/3）
defaultTimeRange:              # 默认时间范围（Grafana 风格）
  from: now-7d
  to: now
refreshSec: 60                 # 刷新间隔（秒），前端轮询可用
```

## 时间选择器使用指南
- 全局 `TimeRangeProvider` 提供 `range={from,to,preset}`。
- `TimeRangePicker` 组件用于选择预设范围（近24小时/近7天/近1天）。
- 查询模块中使用 `timeFilter(column, range)` 或 `__timeFilter('date')` 生成 `gte/lte` 过滤边界。

示例（关键处中文注释）：
```ts
// 在查询模块中应用时间过滤
const { gte, lte } = timeFilter('date', range)
const { data } = await supabase
  .from('downloads_view')
  .select('date,count')
  .gte('date', gte)
  .lte('date', lte)
```

## 部署流程说明
1. 配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL` 或使用现有 `PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 或使用现有 `PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
2. 构建与部署：
   - 本项目为纯前端查询，无服务端 API；可部署到 Vercel/Netlify。
3. 安全注意：
   - 仅使用可公开的 anon/publishable key；不引入服务端密钥。

## 示例配置与 JS 查询模板

## 查询工具函数（lib/queryUtils.ts）

### normalizeSeries(rows, opts)
- 作用：将任意行数据规范为 `{ date, count }[]` 并按时间升序排序
- 参数：`opts.xKey='date'`，`opts.yKeys=['download_count','count']`
- 返回：折线/柱状渲染可直接使用的序列

### extractFromRpc(data, key)
- 作用：从 RPC 返回对象或数组中提取指定键的数值（数组取首元素）
- 示例：`extractFromRpc(rpc.data, 'total')`

### sumByKeys(rows, keys)
- 作用：按给定键的优先级在每行取首个匹配值并累加
- 示例：`sumByKeys(rows, ['total','count'])` 或 `sumByKeys(rows, ['docker_downloads'])`

### 兼容旧函数（已弃用）
- `normalizeLine` → 请改用 `normalizeSeries`
- `extractTotalFromRpc` → 请改用 `extractFromRpc(data, 'total')`
- `sumTotalFromRows` → 请改用 `sumByKeys(rows, ['total','count'])`
- `sumDockerDownloads` → 请改用 `sumByKeys(rows, ['docker_downloads'])`
- 示例 YAML：见 `charts/downloads.yaml` 与 `charts/downloads_num_line.yaml`
- 查询模板：见 `queries/downloadsTrend.ts` 与 `queries/downloadsNumLine.ts`

## 测试要求与方法
- 时间范围正确性：Playwright E2E 切换 `now-24h/now-7d` 断言数据点随范围变化。
- 响应式表现：多设备视口截图对比与布局断言。
- 示例可运行性：保证示例 YAML 与查询模板在真实 Supabase 上无报错（需要 DB 存在对应视图或 RPC）。
