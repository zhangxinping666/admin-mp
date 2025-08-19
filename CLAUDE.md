# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在处理此代码库时提供指导。

## 项目概述

这是一个基于 React 的后台管理系统（慢跑后台管理系统），使用 TypeScript、Vite、Ant Design 和 Zustand 构建。采用 pnpm workspaces 的 monorepo 项目结构。

## 常用命令

### 开发相关
- `pnpm install -w` - 安装所有依赖（monorepo 工作区）
- `pnpm dev` 或 `pnpm dev:localhost` - 启动开发服务器，带本地代理（端口 7000）
- `pnpm dev:mock` - 使用 mock 数据启动
- `pnpm dev:dev` - 开发模式启动

### 构建与质量检查
- `pnpm build` - 生产环境构建
- `pnpm build:dev` - 开发环境构建
- `pnpm build:test` - 测试环境构建
- `pnpm lint` - 修复 ESLint 问题
- `pnpm lint:stylelint` - 修复样式问题
- `pnpm prettier` - 格式化代码

### Git 工作流
提交代码时遵循约定式提交格式：
- `feat` - 新功能
- `fix` - 修复问题
- `refactor` - 代码重构
- `style` - 代码风格相关
- `perf` - 性能优化
- `docs` - 文档相关
- `chore` - 依赖更新/配置修改

## 架构与核心模式

### 路由系统
路由基于 `src/pages/` 中的文件结构自动生成。以下文件/文件夹不会生成路由：
- login、forget、components、utils、lib、hooks
- model.tsx、404.tsx

### 状态管理
使用 Zustand 进行状态管理，主要 store：
- `useUserStore` - 用户认证和信息
- `useMenuStore` - 菜单和权限
- `useTabsStore` - 标签页导航状态
- `usePublicStore` - 全局应用状态

### API 层
- 请求拦截器自动处理 token 刷新
- 所有 API 调用通过 `src/utils/request.ts`
- API 接口按模块组织在 `src/servers/`
- 通过环境变量配置基础 URL

### 组件架构

#### CRUD 模式
项目使用 `CRUDPageTemplate` 组件实现标准化 CRUD 操作：
- 集成搜索、表格、表单和分页
- 支持批量操作
- 统一的 API 结构处理增删改查

#### 共享组件
位于 `src/shared/`：
- `CRUDPageTemplate` - 主要的 CRUD 模板
- `useCRUD` hook - CRUD 操作逻辑
- 用于选项获取的通用 hooks

### Monorepo 包
`packages/` 中的自定义包：
- `@manpao/message` - 消息处理
- `@manpao/request` - HTTP 请求工具
- `@manpao/utils` - 通用工具
- `@manpao/status-codes` - 状态码管理
- `@manpao/stylelint` - 样式检查配置

### 环境配置
- 使用 `.env` 文件进行环境特定配置
- 模式：localhost、mock、development、test、production
- 本地开发的代理配置

### UI 框架
- Ant Design v5 配合 CSS-in-JS
- UnoCSS 用于工具类样式
- Less 用于组件样式
- 自定义主题配置

### 核心功能
- KeepAlive 组件缓存
- 大型表格虚拟滚动
- 富文本编辑器（WangEditor）
- 地图集成（高德地图）
- 国际化（i18next）
- 带图片裁剪的文件上传

## 开发注意事项

### 权限系统
1. 从 `/user/login` 或 `/user/refresh-permissions` 获取权限
2. 菜单显示由 `/menu/list` 返回的 `rule` 字段控制
3. 页面级权限根据用户权限进行检查

### 表单组件
- 使用配置数组的 `BaseForm`
- 表单配置支持动态字段和验证
- 与 Ant Design 表单组件集成

### 表格组件
- `BaseTable` 支持虚拟滚动
- 可调整列宽
- 内置过滤和排序
- 分页通过 `BasePagination` 单独处理

### API 集成
处理 API 时：
- 检查 `src/servers/` 中的现有模式
- 遵循 RESTful 约定
- 通过请求拦截器处理错误
- Token 自动刷新

### 测试策略
运行测试前先检查 README 或搜索测试脚本。项目使用 Husky 进行预提交钩子，包含 ESLint 和 commitlint 验证。