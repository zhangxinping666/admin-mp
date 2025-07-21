import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';

// 楼栋接口定义
export interface User {
  id: number;
  image: string;
  nickname: string;
  phone: string;
  last_time: number;
  status: number;
}

export interface UserItem {
  id: number;
  image: string;
  nickname: string;
  phone: string;
  last_time: number;
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

export interface UserListResult {
  code: number;
  message: string; // 注意：根据您的JSON数据，这里是 message (单数)
  data: {
    list: UserItem[];
    pagination: Pagination;
  };
}

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '用户昵称',
    name: 'nickname',
    component: 'Input',
    placeholder: '请输入用户昵称',
  },
];

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '用户昵称',
    dataIndex: 'nickname',
    key: 'nickname',
    width: 150,
    ellipsis: true,
  },
  {
    title: '用户手机号',
    dataIndex: 'phone',
    key: 'phone',
    width: 150,
    ellipsis: true,
  },
  {
    title: '用户图片',
    dataIndex: 'image',
    key: 'image',
    width: 100,
  },
  {
    title: '用户状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
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
    label: '用户昵称',
    name: 'nickname',
    component: 'Input',
    placeholder: '请输入用户昵称',
    rules: FORM_REQUIRED,
  },
  {
    label: '用户手机号',
    name: 'phone',
    component: 'Input',
    placeholder: '请输入用户手机号',
    rules: FORM_REQUIRED,
  },
  {
    label: '用户图片',
    name: 'image',
    component: 'InputNumber',
    placeholder: '请输入用户图片',
    rules: FORM_REQUIRED,
    componentProps: {
      min: 1,
      style: { width: '100%' },
    },
  },
  {
    label: '状态',
    name: 'status',
    component: 'InputNumber',
    placeholder: '请输入状态',
    rules: FORM_REQUIRED,
    componentProps: {
      min: 1,
      style: { width: '100%' },
    },
  },
];
