import type { TFunction } from 'i18next';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';

// 商家分类数据接口
export interface MerchantSort {
  id: number;
  merchantSortName: string;
  sortIcon: string;
  school: string;
  city: string;
  status: number;
  commission: number;
  createdAt?: string;
  updatedAt?: string;
  action?: React.ReactNode;
}

// 商家分类列表接口
export interface MerchantSortList {
  items: MerchantSort[];
  total: number;
}

// 商家分类查询参数接口
export interface MerchantSortQuery {
  merchantName?: string;
  school?: string;
  city?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    component: 'Input',
    name: 'merchantName',
    label: '商家名称',
  },
  {
    component: 'Input',
    name: 'school',
    label: '学校名称',
  },
  {
    component: 'Input',
    name: 'city',
    label: '城市名字',
  },
  {
    component: 'Select',
    name: 'status',
    label: '状态',
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
    title: '分类名称',
    dataIndex: 'merchantSortName',
    key: 'merchantSortName',
    width: 150,
  },
  {
    title: '分类图标',
    dataIndex: 'sortIcon',
    key: 'sortIcon',
    width: 120,
  },
  {
    title: '学校',
    dataIndex: 'school',
    key: 'school',
    width: 150,
  },
  {
    title: '城市',
    dataIndex: 'city',
    key: 'city',
    width: 120,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
  },
  {
    title: '抽佣(%)',
    dataIndex: 'commission',
    key: 'commission',
    width: 120,
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 150,
    fixed: 'right',
  },
];

// 表单配置项
export const formList = (): BaseFormList[] => [
  {
    label: '分类名称',
    name: 'merchantSortName',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入分类名称',
      maxLength: 50,
    },
  },
  {
    label: '分类图标',
    name: 'sortIcon',
    component: 'Input',
    componentProps: {
      placeholder: '请输入图标URL',
    },
  },
  {
    label: '学校',
    name: 'school',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入学校名称',
      maxLength: 100,
    },
  },
  {
    label: '城市',
    name: 'city',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入城市名称',
      maxLength: 50,
    },
  },
  {
    label: '状态',
    name: 'status',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  },
  {
    label: '抽佣(%)',
    name: 'commission',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入抽佣比例',
      min: 0,
      max: 100,
      precision: 2,
      style: { width: '100%' },
    },
  },
];
