import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';

// 楼栋接口定义
export interface Colonel {
  id: number;
  name: string;
  phone: number;
  password: string;
  city_name: string;
  province: string;
  status: number;
}

export interface addColonelForm {
  name: string;
  phone: number;
  password: string;
  school_id: number;
  city_id: number;
  status: number;
}

export interface updateColonelForm {
  id: number;
  name: string;
  phone: number;
  password: string;
  school_id: number;
  city_id: number;
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

export interface ColonelListResult {
  code: number;
  message: string; // 注意：根据您的JSON数据，这里是 message (单数)
  data: {
    list: Colonel[];
    page: number;
    page_size: number;
    pages: number;
    total: number;
  };
}

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '团长名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入团长名称',
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
    title: '团长名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '团长电话',
    dataIndex: 'phone',
    key: 'phone',
    width: 100,
  },
  {
    title: '城市ID',
    dataIndex: 'city_id',
    key: 'city_id',
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
    title: '团长密码',
    dataIndex: 'password',
    key: 'password',
    width: 120,
    fixed: 'right',
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 120,
    fixed: 'right',
  },
];

// 表单配置
export const formList = (): BaseFormList[] => [
  {
    label: '团长名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入学校名称',
    rules: FORM_REQUIRED,
  },
  {
    label: '团长电话',
    name: 'phone',
    component: 'Input',
    placeholder: '请输入团长电话',
    rules: FORM_REQUIRED,
  },
  {
    label: '城市ID',
    name: 'city_id',
    component: 'InputNumber',
    placeholder: '请输入城市ID',
    rules: FORM_REQUIRED,
    componentProps: {
      min: 1,
      style: { width: '100%' },
    },
  },
  {
    label: '团长密码',
    name: 'password',
    component: 'InputNumber',
    placeholder: '请输入团长密码',
    rules: FORM_REQUIRED,
    componentProps: {
      precision: 6,
      style: { width: '100%' },
    },
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
