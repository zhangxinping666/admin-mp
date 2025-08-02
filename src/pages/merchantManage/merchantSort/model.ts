import type { TFunction } from 'i18next';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';

// 商家分类数据接口
export interface MerchantSort {
  id: number;
  name: string;
  icon: string;
  school_name: string;
  school_id: number;
  city_name: string;
  city_id: number;
  status: number;
  drawback: number;
}

// 商家分类列表接口
export interface MerchantSortList {
  items: MerchantSort[];
  total: number;
}

// 商家分类查询参数接口
export interface MerchantSortQuery {
  name?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    component: 'Input',
    name: 'name',
    label: '分类名称',
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
    dataIndex: 'name',
    key: 'name',
    width: 150,
    align: 'center',
    fixed: 'left',
  },
  {
    title: '分类图标',
    dataIndex: 'icon',
    key: 'icon',
    width: 120,
    align: 'center',
    fixed: 'left',
  },
  {
    title: '学校',
    dataIndex: 'school_name',
    key: 'school_name',
    width: 150,
    align: 'center',
    fixed: 'left',
  },
  {
    title: '城市',
    dataIndex: 'city_name',
    key: 'city_name',
    width: 120,
    align: 'center',
    fixed: 'left',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (value: unknown, record: object) => {
      const status = value as number;
      return status === 1 ? '启用' : '禁用';
    },
    align: 'center',
    fixed: 'left',
  },
  {
    title: '退款比例(%)',
    dataIndex: 'drawback',
    key: 'drawback',
    width: 120,
    align: 'center',
    fixed: 'left',
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 120,
    align: 'center',
    fixed: 'left',
  },
];

// 编辑表单配置项
export const formList = (): BaseFormList[] => [
  {
    label: '分类ID',
    name: 'id',
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入分类ID',
      min: 0,
      precision: 2,
      style: { width: '100%' },
      disabled: true,
    },
  },
  {
    label: '分类名称',
    name: 'name',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入分类名称',
      maxLength: 50,
    },
  },
  {
    label: '分类图标',
    name: 'icon',
    component: 'Input',
    componentProps: {
      placeholder: '请输入图标URL',
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
    label: '退款比例(%)',
    name: 'drawback',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入退款比例',
      min: 0,
      max: 100,
      precision: 2,
      style: { width: '100%' },
    },
  },
];

// 新增表单配置项
export const addFormList = (): BaseFormList[] => [
  {
    label: '分类名称',
    name: 'name',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入分类名称',
      maxLength: 50,
    },
  },
  {
    label: '分类图标',
    name: 'icon',
    component: 'Input',
    componentProps: {
      placeholder: '请输入图标URL',
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
    label: '退款比例(%)',
    name: 'drawback',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入退款比例',
      min: 0,
      max: 100,
      precision: 2,
      style: { width: '100%' },
    },
  },
];
