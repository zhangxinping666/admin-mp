# Shared 模块说明文档

## 概述

`shared` 是数据管理模块的共享代码库，提供了一套完整的 CRUD（增删改查）页面模板和相关工具，用于快速构建标准化的管理页面。该模块采用模块化设计，包含组件、Hooks、类型定义和工具函数。

## 目录结构

```
shared/
├── components/          # 共享组件
│   ├── CRUDPageTemplate.tsx    # CRUD页面模板组件
│   ├── TableActions.tsx        # 表格操作按钮组件
│   └── index.ts                # 组件导出文件
├── hooks/              # 自定义Hooks
│   ├── useCRUD.ts             # CRUD操作Hook
│   ├── useTableAction.ts      # 表格操作Hook（待实现）
│   └── index.ts               # Hooks导出文件
├── types/              # 类型定义
│   ├── common.ts              # 通用类型定义
│   └── index.ts               # 类型导出文件
├── utils/              # 工具函数
│   └── helpers.ts             # 辅助函数（待实现）
└── index.ts            # 模块主入口文件
```

## 核心组件

### 1. CRUDPageTemplate

**文件位置**: `components/CRUDPageTemplate.tsx`

**功能**: 提供标准化的 CRUD 页面模板，包含搜索、表格、分页、新增/编辑模态框等完整功能。

**主要特性**:
- 🔍 **搜索功能**: 支持自定义搜索配置
- 📊 **数据表格**: 集成分页、加载状态、操作列
- ➕ **新增/编辑**: 统一的模态框表单处理
- 🗑️ **删除操作**: 内置删除确认和处理
- 🔌 **API集成**: 支持真实API或Mock数据
- 🎨 **自定义操作**: 支持自定义操作按钮渲染

**Props接口**:
```typescript
interface CRUDPageTemplateProps<T> {
  title: string;                    // 页面标题
  searchConfig: BaseSearchList[];   // 搜索配置
  columns: TableColumn[];           // 表格列配置
  formConfig: BaseFormList[];       // 表单配置
  initCreate: Partial<T>;           // 新增时的初始数据
  mockData?: T[];                   // Mock数据（可选）
  apis?: {                          // API配置（可选）
    fetch?: (params: any) => Promise<any>;
    create?: (data: any) => Promise<any>;
    update?: (id: number, data: any) => Promise<any>;
    delete?: (id: number) => Promise<any>;
  };
  optionRender?: (               // 自定义操作列渲染
    record: T,
    actions: {
      handleEdit: (record: T) => void;
      handleDelete: (id: number) => void;
    }
  ) => React.ReactNode;
}
```

**使用示例**:
```typescript
<CRUDPageTemplate
  title="用户管理"
  searchConfig={searchConfig}
  columns={columns}
  formConfig={formConfig}
  initCreate={{ name: '', email: '' }}
  apis={{
    fetch: fetchUsers,
    create: createUser,
    update: updateUser,
    delete: deleteUser
  }}
  optionRender={(record, actions) => (
    <TableActions
      record={record}
      onEdit={actions.handleEdit}
      onDelete={actions.handleDelete}
    />
  )}
/>
```

### 2. TableActions

**文件位置**: `components/TableActions.tsx`

**功能**: 提供标准化的表格操作按钮组件，包含编辑和删除功能。

**主要特性**:
- ✏️ **编辑按钮**: 链接样式的编辑按钮
- 🗑️ **删除按钮**: 集成确认对话框的删除按钮
- 🎨 **自定义文本**: 支持自定义按钮文本

**Props接口**:
```typescript
interface TableActionsProps<T extends BaseEntity> {
  record: T;                        // 当前行数据
  onEdit: (record: T) => void;      // 编辑回调
  onDelete: (id: number) => void;   // 删除回调
  editText?: string;                // 编辑按钮文本
  deleteText?: string;              // 删除按钮文本
}
```

## 核心Hooks

### useCRUD

**文件位置**: `hooks/useCRUD.ts`

**功能**: 提供完整的 CRUD 操作逻辑，包含状态管理、数据处理、API调用等。

**主要特性**:
- 📊 **状态管理**: 统一管理加载、分页、表单等状态
- 🔄 **数据操作**: 封装增删改查操作逻辑
- 📄 **分页处理**: 内置分页逻辑和状态管理
- 🔍 **搜索功能**: 集成搜索参数处理
- 💾 **本地/远程**: 支持本地Mock数据和远程API
- ⚡ **性能优化**: 使用useCallback优化性能

**参数接口**:
```typescript
interface UseCRUDOptions<T> {
  initCreate: Partial<T>;           // 新增时的初始数据
  fetchApi?: (params: any) => Promise<any>;     // 获取数据API
  createApi?: (data: any) => Promise<any>;      // 创建数据API
  updateApi?: (id: number, data: any) => Promise<any>; // 更新数据API
  deleteApi?: (id: number) => Promise<any>;     // 删除数据API
}
```

**返回值**:
```typescript
{
  // 状态
  contextHolder,        // 消息提示容器
  createFormRef,        // 表单引用
  isFetch,             // 是否需要获取数据
  isLoading,           // 表格加载状态
  isCreateLoading,     // 表单提交加载状态
  isCreateOpen,        // 模态框开启状态
  createTitle,         // 模态框标题
  createData,          // 表单数据
  page,                // 当前页码
  pageSize,            // 每页条数
  total,               // 总条数
  tableData,           // 表格数据
  
  // 方法
  handlePageChange,    // 分页处理
  handleSearch,        // 搜索处理
  handleCreate,        // 新增处理
  handleEdit,          // 编辑处理
  handleDelete,        // 删除处理
  handleModalSubmit,   // 模态框提交处理
  fetchTableData,      // 获取表格数据
}
```

## 类型定义

### BaseEntity

**文件位置**: `types/common.ts`

**功能**: 定义基础实体接口，所有数据模型的基础类型。

```typescript
export interface BaseEntity {
  id: number;                    // 唯一标识
  createdAt?: string;            // 创建时间
  updatedAt?: string;            // 更新时间
  action?: React.ReactNode;      // 操作列渲染内容
}
```

### BaseListResponse

**功能**: 定义列表接口响应格式。

```typescript
export interface BaseListResponse<T> {
  items: T[];                    // 数据列表
  total: number;                 // 总条数
}
```

### BaseQuery

**功能**: 定义查询参数接口。

```typescript
export interface BaseQuery {
  page?: number;                 // 页码
  pageSize?: number;             // 每页条数
  [key: string]: any;            // 其他查询参数
}
```

### CRUDApis

**功能**: 定义 CRUD API 接口类型。

```typescript
export interface CRUDApis<T, CreateData = Partial<T>, UpdateData = Partial<T>> {
  fetch?: (params: BaseQuery) => Promise<BaseListResponse<T>>;
  create?: (data: CreateData) => Promise<T>;
  update?: (id: number, data: UpdateData) => Promise<T>;
  delete?: (id: number) => Promise<void>;
}
```

## 使用指南

### 1. 快速开始

```typescript
import { CRUDPageTemplate, TableActions } from '../shared';
import type { BaseEntity } from '../shared';

// 定义数据类型
interface User extends BaseEntity {
  name: string;
  email: string;
  phone: string;
}

// 使用模板
const UserManagement = () => {
  return (
    <CRUDPageTemplate<User>
      title="用户"
      searchConfig={searchConfig}
      columns={columns}
      formConfig={formConfig}
      initCreate={{ name: '', email: '', phone: '' }}
      optionRender={(record, actions) => (
        <TableActions
          record={record}
          onEdit={actions.handleEdit}
          onDelete={actions.handleDelete}
        />
      )}
    />
  );
};
```

### 2. 配置说明

**搜索配置示例**:
```typescript
const searchConfig: BaseSearchList[] = [
  {
    label: '用户名',
    name: 'name',
    type: 'input',
    placeholder: '请输入用户名'
  },
  {
    label: '状态',
    name: 'status',
    type: 'select',
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 }
    ]
  }
];
```

**表格列配置示例**:
```typescript
const columns: TableColumn[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80
  },
  {
    title: '用户名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  }
];
```

**表单配置示例**:
```typescript
const formConfig: BaseFormList[] = [
  {
    label: '用户名',
    name: 'name',
    type: 'input',
    rules: [{ required: true, message: '请输入用户名' }]
  },
  {
    label: '邮箱',
    name: 'email',
    type: 'input',
    rules: [
      { required: true, message: '请输入邮箱' },
      { type: 'email', message: '请输入正确的邮箱格式' }
    ]
  }
];
```

## 最佳实践

### 1. 数据类型定义
- 所有数据模型都应继承 `BaseEntity`
- 使用 TypeScript 严格类型检查
- 定义清晰的接口和类型

### 2. API 集成
- 优先使用真实 API，Mock 数据仅用于开发测试
- API 响应格式应符合 `BaseListResponse` 规范
- 错误处理统一在 Hook 层面处理

### 3. 组件复用
- 使用 `CRUDPageTemplate` 保持页面一致性
- 通过配置而非修改代码来定制功能
- 自定义操作通过 `optionRender` 实现

### 4. 性能优化
- 合理使用 `useCallback` 和 `useMemo`
- 避免不必要的重新渲染
- 分页加载大量数据
## 扩展开发

### 1. 添加新功能
- 在 `hooks/` 目录添加新的自定义 Hook
- 在 `components/` 目录添加新的共享组件
- 在 `types/` 目录添加相应的类型定义

### 2. 工具函数
- 在 `utils/helpers.ts` 中添加通用工具函数
- 保持函数的纯净性和可测试性

### 3. 类型扩展
- 在 `types/common.ts` 中扩展基础类型
- 保持向后兼容性

## 注意事项

1. **类型安全**: 严格使用 TypeScript 类型，避免 `any` 类型
2. **组件职责**: 保持组件单一职责，避免过度耦合
3. **状态管理**: 合理使用本地状态，避免状态冗余
4. **错误处理**: 统一错误处理机制，提供友好的用户提示
5. **性能考虑**: 注意大数据量的性能优化

## 待完善功能

- [ ] `useTableAction.ts` Hook 实现
- [ ] `helpers.ts` 工具函数补充
- [ ] 更多自定义组件支持
- [ ] 国际化支持
- [ ] 单元测试覆盖

---

该模块为商户管理系统提供了强大的基础设施，通过标准化的组件和 Hook，可以快速构建功能完整、用户体验一致的管理页面。
        