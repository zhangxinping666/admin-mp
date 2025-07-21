import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';

// 楼栋接口定义
export interface School {
  id: number;
  school_id: number;
  name: string;
  address: string;
  city_id: number;
  school_logo: number;
  status: number;
}

export interface SchoolItem {
  id: number;
  school_id: number;
  name: string;
  address: string;
  city_id: number;
  school_logo: number;
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

export interface SchoolListResult {
  code: number;
  message: string; // 注意：根据您的JSON数据，这里是 message (单数)
  data: {
    list: SchoolItem[];
    pagination: Pagination;
  };
}

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '学校名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入学校名称',
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
    title: '学校名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '学校地址',
    dataIndex: 'address',
    key: 'address',
    width: 150,
    ellipsis: true,
  },
  {
    title: '城市ID',
    dataIndex: 'city_id',
    key: 'city_id',
    width: 100,
  },
  {
    title: '学校logo',
    dataIndex: 'school_logo',
    key: 'school_logo',
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

// 表单配置
export const formList = (): BaseFormList[] => [
  {
    label: '学校名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入学校名称',
    rules: FORM_REQUIRED,
  },
  {
    label: '学校地址',
    name: 'address',
    component: 'Input',
    placeholder: '请输入学校地址',
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
    label: '学校logo',
    name: 'school_logo',
    component: 'InputNumber',
    placeholder: '请输入学校logo',
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
