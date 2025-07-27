import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { Button } from 'antd';
// 接口定义
export interface Menu {
  id: number;
  pid: number;
  name: string;
  code: string;
  icon: string | null;
  type: number;
  route_name: string | null;
  route_path: string | null;
  component_path: string | null;
  route_params: string | null;
  status: number;
  sort: number;
  desc: string;
  children?: Menu[];
}

export interface MenuAddForm {
  pid: number;
  name: string;
  code: string;
  icon: string | null;
  type: number;
  route_name: string | null;
  route_path: string | null;
  component_path: string | null;
  route_params: string | null;
  status: number;
  sort: number;
  desc: string;
}

export interface MenuUpdateForm {
  id: number;
  pid: number;
  name: string;
  code: string;
  icon: string | null;
  type: number;
  route_name: string | null;
  route_path: string | null;
  component_path: string | null;
  route_params: string | null;
  status: number;
  sort: number;
  desc: string;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}
export interface MenuListResult {
  code: number;
  message: string; // 注意：根据您的JSON数据，这里是 message (单数)
  data: {
    list: Menu[];
    page: number;
    page_size: number;
    pages: number;
    total: number;
  };
}
export interface MenuDetailResult {
  code: number;
  data: Menu;
}

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '菜单名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入菜单名称',
  },
  {
    label: '状态',
    name: 'status',
    component: 'Select',
    placeholder: '请选择状态',
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  },
  {
    label: '菜单类型',
    name: 'type',
    component: 'Select',
    placeholder: '请选择菜单类型',
    rules: FORM_REQUIRED,
    componentProps: {
      options: [
        { label: '目录', value: 1 },
        { label: '菜单', value: 2 },
        { label: '按钮', value: 3 },
      ],
    },
  },
];

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 150,
    ellipsis: true,
  },
  {
    title: '菜单名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '菜单代码',
    dataIndex: 'code',
    key: 'code',
    width: 100,
  },
  {
    title: '类型操作', // 您可以自定义列标题
    key: 'action', // 为这一列设置一个唯一的 key
    width: 120,
    // render 函数会接收到当前行的数据 `record`
    render: (record) => {
      const { type } = record; // 从行数据中解构出 type 字段

      let buttonStyle = {};
      let buttonText = '';

      switch (type) {
        case 1: // 目录
          buttonStyle = {
            backgroundColor: 'transparent',
            borderColor: '#52c41a',
            color: '#52c41a', // 绿色
          };
          buttonText = '目录';
          break;
        case 2: // 菜单
          buttonStyle = {
            backgroundColor: 'transparent',
            borderColor: '#1890ff',
            color: '#1890ff', // 蓝色
          };
          buttonText = '菜单';
          break;
        case 3: // 权限
          buttonStyle = {
            backgroundColor: 'transparent',
            borderColor: '#f5222d',
            color: '#f5222d', // 红色 (using a standard AntD error color for better visual consistency with "删除")
          };
          buttonText = '权限';
          break;
        default:
          // 为未知类型设置一个默认样式
          buttonStyle = {};
          buttonText = '未知';
      }

      // 返回一个带自定义样式的 Button 组件
      return <Button style={buttonStyle}>{buttonText}</Button>;
    },
  },
  {
    title: '路由名称',
    dataIndex: 'route_name',
    key: 'route_name',
    width: 100,
  },
  {
    title: '路由路径',
    dataIndex: 'route_path',
    key: 'route_path',
    width: 100,
  },
  {
    title: '组件路径',
    dataIndex: 'component_path',
    key: 'component_path',
    width: 100,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    render: (value: number) => (
      <span style={{ color: value === 1 ? 'green' : 'red' }}>{value === 1 ? '启用' : '禁用'}</span>
    ),
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
    width: 80,
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 120,
    fixed: 'right',
  },
];

// 获取根级目录选项的函数
const getDirectoryOptions = () => {
  // 只返回根级目录选项
  return [
    { label: '根目录', value: 0 },
    { label: '商家管理', value: 2 },
    { label: '组件', value: 3 },
    { label: '权限', value: 4 },
  ];
};

export const formList = (): BaseFormList[] => [
  {
    name: 'id',
    label: 'ID',
    component: 'Input',
    placeholder: '请输入ID',
    componentProps: {
      disabled: true,
    },
    showWhen: {
      name: 'id',
      value: (value: any) => value && value > 0, // 仅在编辑模式下显示（id有值且大于0）
    },
  },
  {
    name: 'pid',
    label: '父级菜单',
    component: 'Select',
    placeholder: '请选择父级菜单',
    componentProps: {
      options: getDirectoryOptions(),
    },
    showWhen: {
      name: 'type',
      value: [2, 3], // 菜单和按钮
    },
  },
  {
    name: 'name',
    label: '菜单名称',
    component: 'Input',
    placeholder: '请输入菜单名称',
    rules: FORM_REQUIRED,
  },
  {
    name: 'type',
    label: '菜单类型',
    component: 'RadioGroup',
    placeholder: '请选择菜单类型',
    rules: FORM_REQUIRED,
    componentProps: {
      options: [
        { label: '目录', value: 1 },
        { label: '菜单', value: 2 },
        { label: '按钮', value: 3 },
      ],
    },
  },
  // 目录和菜单显示的字段
  {
    name: 'route_name',
    label: '路由名称',
    component: 'Input',
    placeholder: '请输入路由名称',
    rules: FORM_REQUIRED,
    showWhen: {
      name: 'type',
      value: [1, 2], // 目录和菜单
    },
  },
  {
    name: 'route_path',
    label: '路由路径',
    component: 'Input',
    placeholder: '请输入路由路径',
    rules: FORM_REQUIRED,
    showWhen: {
      name: 'type',
      value: [1, 2], // 目录和菜单
    },
  },
  {
    name: 'icon',
    label: '图标',
    component: 'Input',
    placeholder: '请输入图标名称',
    showWhen: {
      name: 'type',
      value: [1, 2], // 目录和菜单
    },
  },
  // 仅菜单显示的字段
  {
    name: 'component_path',
    label: '组件路径',
    component: 'Input',
    placeholder: '请输入组件路径',
    rules: FORM_REQUIRED,
    showWhen: {
      name: 'type',
      value: 2, // 仅菜单
    },
  },
  // 仅按钮显示的字段
  {
    name: 'code',
    label: '权限标识',
    component: 'Input',
    placeholder: '请输入权限标识',
    rules: FORM_REQUIRED,
    showWhen: {
      name: 'type',
      value: 3, // 仅按钮
    },
  },
  // 通用状态和配置字段
  {
    name: 'status',
    label: '状态',
    component: 'Select',
    placeholder: '请选择状态',
    rules: FORM_REQUIRED,
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  },
  {
    name: 'sort',
    label: '排序',
    component: 'InputNumber',
    placeholder: '请输入排序值',
    componentProps: {
      min: 0,
      max: 9999,
      style: { width: '100%' },
    },
  },
  {
    name: 'desc',
    label: '描述',
    component: 'TextArea',
    placeholder: '请输入描述',
    componentProps: {
      rows: 3,
      style: { width: '100%' },
    },
  },
];
