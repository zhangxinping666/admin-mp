# 仪表盘模块

## 📊 架构概览

仪表盘模块采用现代化的 React + TypeScript + Zustand 架构，提供美观的数据可视化界面。

## 🏗️ 文件结构

```
dashboard/
├── index.tsx              # 主页面组件
├── model.tsx              # 数据模型和状态管理
├── README.md              # 文档
└── components/            # 组件目录
    ├── index.ts           # 组件导出
    ├── StatisticCard.tsx  # 统计卡片组件
    └── BeansChart.tsx     # 金豆图表组件
```

## 🔧 技术栈

- **React 19**: UI 框架
- **TypeScript**: 类型安全
- **Zustand**: 轻量级状态管理
- **Ant Design 5**: UI 组件库
- **ECharts 5**: 数据可视化
- **Axios**: HTTP 请求

## 📦 核心功能

### 1. 状态管理 (`model.tsx`)

使用 Zustand 管理仪表盘状态：

```typescript
interface DashboardStore {
  data: DashboardData;      // 仪表盘数据
  loading: boolean;          // 加载状态
  error: string | null;      // 错误信息
  fetchData: () => Promise<void>;  // 获取数据方法
}
```

**降级策略**：
- 接口请求成功 → 显示真实数据
- 接口请求失败 → 显示 mock 数据（全为 0）
- 错误提示 → 显示警告提示框

### 2. 数据模型

#### 资金统计 (Funds)
- 平台总余额
- 今日待处理提现（笔数 + 金额）
- 累计成功提现（笔数 + 金额）

#### 金豆统计 (Beans)
- 平台金豆总存量
- 今日产出量
- 今日消耗量
- 今日净增量

### 3. 组件设计

#### StatisticCard
通用统计卡片组件，支持：
- 主标题 + 主数值
- 图标 + 颜色自定义
- 子项统计（最多 2 个）
- 响应式布局

#### CountCard
专门用于计数 + 金额的卡片：
- 笔数统计
- 总金额统计
- 图标 + 颜色自定义

#### BeansCard
金豆变动专用卡片：
- 净增量（正数/负数显示不同颜色）
- 产出量（绿色）
- 消耗量（红色）

#### BeansChart
ECharts 柱状图：
- 产出/消耗/净增可视化
- 渐变色效果
- 响应式自适应

## 🎨 设计特点

### 1. 美观的视觉效果
- 现代化卡片布局
- 渐变色图标背景
- 彩色统计数值
- 平滑的加载动画

### 2. 响应式设计
```typescript
<Col xs={24} sm={24} md={12} lg={8} xl={8}>
  // 组件内容
</Col>
```

不同屏幕尺寸自动适配：
- xs (手机): 单列
- sm (平板): 单列
- md (小桌面): 双列
- lg/xl (大桌面): 三列

### 3. 用户友好
- 加载状态提示
- 错误信息提示
- 数据降级显示
- 颜色语义化（绿色=正向，红色=负向）

## 🔌 API 接口

### 获取仪表盘数据

```typescript
// GET /balance/statistics
getDashboardStatistics(): Promise<DashboardStatisticsResponse>
```

**响应结构**：

```json
{
  "code": 2000,
  "message": "success",
  "data": {
    "funds": {
      "platformTotalBalance": 100000.00,
      "todayPendingWithdrawal": {
        "count": 5,
        "totalAmount": 1500.00
      },
      "cumulativeWithdrawal": {
        "count": 1200,
        "totalAmount": 500000.00
      }
    },
    "beans": {
      "platformTotalStock": 5000000.00,
      "today": {
        "production": 12000.00,
        "consumption": 8000.00,
        "netIncrease": 4000.00
      }
    }
  }
}
```

## 🚀 使用方法

### 启动开发服务器

```bash
# 本地开发（端口 7000）
pnpm dev

# 使用 mock 数据
pnpm dev:mock

# 开发环境
pnpm dev:dev
```

### 访问仪表盘

启动后访问：`http://localhost:7000/dashboard`

## 🛠️ 维护指南

### 添加新的统计指标

1. **更新数据模型** (`model.tsx`)
```typescript
export interface DashboardData {
  funds: FundsStats;
  beans: BeansStats;
  newMetric: NewMetricStats;  // 添加新指标
}
```

2. **更新 Mock 数据**
```typescript
export const mockDashboardData: DashboardData = {
  // ...existing
  newMetric: { /* default values */ }
};
```

3. **创建新组件** (可选)
```typescript
// components/NewMetricCard.tsx
export const NewMetricCard: React.FC<Props> = ({ data }) => {
  // 实现组件
};
```

4. **更新主页面** (`index.tsx`)
```tsx
<Col span={8}>
  <NewMetricCard data={data.newMetric} />
</Col>
```

### 自定义图表

编辑 `components/BeansChart.tsx`，修改 ECharts 配置：

```typescript
const option: echarts.EChartsOption = {
  // 自定义配置
  tooltip: { /* ... */ },
  xAxis: { /* ... */ },
  yAxis: { /* ... */ },
  series: [ /* ... */ ]
};
```

## 📝 注意事项

1. **类型安全**: 所有数据都有完整的 TypeScript 类型定义
2. **错误处理**: 接口失败自动降级到 mock 数据
3. **性能优化**: ECharts 实例复用，避免内存泄漏
4. **代码规范**: 遵循项目 ESLint 和 Prettier 规则

## 🔗 相关文件

- `/src/servers/dashboard/index.ts` - API 接口定义
- `/src/utils/request.ts` - HTTP 请求封装
- `/src/stores/` - 其他状态管理示例

## 📄 License

遵循项目整体 License
