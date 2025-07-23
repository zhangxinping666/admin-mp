import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';

// 楼栋接口定义
export interface API {
  id: number;
  path: string;
  detail: string;
  group: string;
  method: string;
  status: number;
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

export interface APIListResult {
  code: number;
  message: string; // 注意：根据您的JSON数据，这里是 message (单数)
  data: {
    list: API[];
    pagination: Pagination;
  };
}

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: 'API类别',
    name: 'group',
    component: 'Input',
    placeholder: '请输入接口路径',
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
];

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: 'API路径',
    dataIndex: 'path',
    key: 'path',
    width: 150,
    ellipsis: true,
  },
  {
    title: 'API详情',
    dataIndex: 'detail',
    key: 'detail',
    width: 100,
  },
  {
    title: 'API类别',
    dataIndex: 'group',
    key: 'group',
    width: 100,
  },
  {
    title: 'API方法',
    dataIndex: 'method',
    key: 'method',
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
    { label: '商家管理', value: '商家管理' },
    { label: '角色管理', value: '角色管理' },
    { label: '菜单管理', value: '菜单管理' },
    { label: '学校管理', value: '学校管理' },
  ];
};

// API类别树形数据结构
export interface APIGroupTreeNode {
  id: number;
  title: string;
  value: string;
  children?: APIGroupTreeNode[];
}

// 获取API类别树形数据
export const getAPIGroupTree = (): APIGroupTreeNode[] => {
  return [
    {
      id: 1,
      title: '用户管理',
      value: '用户管理',
    },
    {
      id: 2,
      title: '角色管理',
      value: '角色管理',
    },
    {
      id: 3,
      title: '菜单管理',
      value: '菜单管理',
    },
    {
      id: 4,
      title: '学校管理',
      value: '学校管理',
    },
    {
      id: 5,
      title: '系统管理',
      value: '系统管理',
    },
  ];
};
// 表单配置
export const formList = (): BaseFormList[] => [
  {
    label: 'API路径',
    name: 'path',
    component: 'Input',
    placeholder: '请输入API路径',
    rules: FORM_REQUIRED,
  },
  {
    label: 'API详情',
    name: 'detail',
    component: 'Input',
    placeholder: '请输入API详情',
    rules: FORM_REQUIRED,
  },
  {
    label: 'API类别',
    name: 'group',
    component: 'TreeSelect',
    placeholder: '请选择API类别',
    rules: FORM_REQUIRED,
    componentProps: {
      treeData: getAPIGroupTree(),
      showSearch: true,
      treeNodeFilterProp: 'title',
      allowClear: true,
      treeDefaultExpandAll: true,
      placeholder: '输入关键字进行过滤',
      style: { width: '100%' },
      fieldNames: {
        label: 'title',
        value: 'value',
        children: 'children',
      },
    },
  },
  {
    label: 'API方法',
    name: 'method',
    component: 'Input',
    placeholder: '请输入API方法',
    rules: FORM_REQUIRED,
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
];
