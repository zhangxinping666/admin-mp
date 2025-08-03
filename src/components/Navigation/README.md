# TableNavigation 表格导航组件

## 概述

`TableNavigation` 是一个为表格页面设计的导航组件，提供面包屑导航、快速跳转和自定义操作按钮功能。该组件已集成到 `CRUDPageTemplate` 中，可以在所有使用该模板的页面中启用。

## 功能特性

- 🧭 **智能面包屑**: 自动根据当前路径生成面包屑导航，支持自定义
- 🚀 **快速导航**: 提供下拉菜单快速跳转到常用页面
- 🎛️ **自定义操作**: 支持在导航栏添加自定义操作按钮
- 🔙 **返回功能**: 内置返回按钮，支持浏览器历史记录
- 📱 **响应式设计**: 适配不同屏幕尺寸

## 使用方法

### 1. 在 CRUDPageTemplate 中使用

```tsx
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { Button, Space } from 'antd';
import { ExportOutlined, ImportOutlined } from '@ant-design/icons';

const YourPage = () => {
  // 自定义导航操作按钮
  const customNavActions = (
    <Space>
      <Button icon={<ExportOutlined />} type="default">
        导出数据
      </Button>
      <Button icon={<ImportOutlined />} type="default">
        导入数据
      </Button>
    </Space>
  );

  // 自定义面包屑（可选）
  const breadcrumbItems = [
    {
      title: '首页',
      path: '/dashboard',
      icon: <HomeOutlined />,
    },
    {
      title: '用户管理',
      path: '/userManage',
    },
    {
      title: '用户列表',
    },
  ];

  return (
    <CRUDPageTemplate
      title="用户管理"
      searchConfig={searchConfig}
      columns={columns}
      formConfig={formConfig}
      initCreate={initCreate}
      apis={apis}
      // 导航配置
      showNavigation={true}        // 是否显示导航（默认: true）
      customNavActions={customNavActions}  // 自定义操作按钮
      breadcrumbItems={breadcrumbItems}    // 自定义面包屑（可选）
    />
  );
};
```

### 2. 单独使用 TableNavigation 组件

```tsx
import { TableNavigation } from '@/components/Navigation';
import { Button, Space } from 'antd';
import { ExportOutlined } from '@ant-design/icons';

const YourComponent = () => {
  const customActions = (
    <Space>
      <Button icon={<ExportOutlined />}>导出</Button>
    </Space>
  );

  return (
    <TableNavigation
      title="页面标题"
      customActions={customActions}
      breadcrumbItems={[
        { title: '首页', path: '/dashboard' },
        { title: '当前页面' }
      ]}
    />
  );
};
```

## API 参数

### TableNavigationProps

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| title | `string` | - | 页面标题 |
| customActions | `React.ReactNode` | - | 自定义操作按钮 |
| breadcrumbItems | `BreadcrumbItem[]` | - | 自定义面包屑 |

### BreadcrumbItem

| 参数 | 类型 | 说明 |
|------|------|------|
| title | `string` | 面包屑显示文本 |
| path | `string` | 跳转路径（可选） |
| icon | `React.ReactNode` | 图标（可选） |

### CRUDPageTemplate 新增导航参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| showNavigation | `boolean` | `true` | 是否显示导航组件 |
| customNavActions | `React.ReactNode` | - | 自定义导航操作按钮 |
| breadcrumbItems | `BreadcrumbItem[]` | - | 自定义面包屑 |



## 自动面包屑映射

组件会根据当前路径自动生成面包屑，内置了以下路径映射：

```
permissionManage -> 权限管理
menuManage -> 菜单管理
roleManage -> 角色管理
apiManage -> API管理
merchantManage -> 商户管理
merchantSort -> 商户分类
merchantApplication -> 商户申请
content -> 内容管理
article -> 文章管理
dictionaryManage -> 字典管理
tradeBlotterManage -> 交易流水管理
```

## 样式定制

组件使用 Tailwind CSS 类名，可以通过以下方式自定义样式：

```css
/* 导航容器 */
.table-navigation {
  @apply flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow-sm border;
}

/* 面包屑样式 */
.table-navigation .ant-breadcrumb {
  @apply text-gray-600;
}

/* 按钮样式 */
.table-navigation .ant-btn {
  @apply transition-all duration-200;
}
```

## 示例页面

查看 `src/pages/navigationDemo/index.tsx` 获取完整的使用示例。

## 注意事项

1. 确保项目中已安装并配置了 `react-router-dom`
2. 确保 `useMenuStore` 可以正常访问菜单数据
3. 自定义面包屑会覆盖自动生成的面包屑
4. 快速导航菜单可以根据项目需求进行修改