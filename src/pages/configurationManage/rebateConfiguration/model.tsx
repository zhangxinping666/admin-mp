import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import {
  FORM_REQUIRED,
  FORM_GT_ZERO,
  FORM_NOT_NEGATIVE,
  FORM_LTE_1
} from '@/utils/config';
import dayjs from 'dayjs';

export interface GetRebateConfigListParams {
  category_id?: number | null;
  status?: number;
  page?: number;
  page_size?: number;
}

export interface RebateConfigForm {
  config_name: string;
  category_id: number | null;
  platform_rate: string;
  promoter_rate: string;
  buyer_points_rate: string;
  min_order_amount: string;
  max_order_amount: string | null;
  priority: number;
  status: number;
  valid_from: string;
  valid_to: string | null;
}

export interface RebateConfigItem {
  id: number;
  // 购买者 返金豆 比例
  buyer_points_rate: string;
  // 品类ID
  category_id: number | null;
  category_name: string;
  // 配置名
  config_name: string;
  created_at: string;
  // 创建者id
  creator_id: number;
  // 创建者名称
  creator_name: string;
  // 最大触发 返利 金额
  max_order_amount: null | string;
  // 最小触发 返利 金额
  min_order_amount: string;
  // 平台返利比例
  platform_rate: string;
  // 配置优先级
  priority: number;
  // 推广者返利比例
  promoter_rate: string;
  // 状态 : 1 =启用  0=禁用
  status: number;
  // 状态文案
  status_text: string;
  updated_at: string;
  valid_end_time: null | string;
  // 生效开始时间
  valid_from?: string;
  valid_start_time: string;
  // 生效结束时间
  valid_to?: null;
}

export interface RebateConfigData {
  list: RebateConfigItem[];
  page: number;
  page_size: number;
  total: number;
}

export interface RebateConfigListResponse {
  code: number;
  data: RebateConfigData;
  message: string;
}

// 状态选项
export const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
];

// 搜索配置
export const searchList: BaseSearchList[] = [
  {
    label: '配置名称',
    name: 'config_name',
    component: 'Input',
    placeholder: '请输入配置名称',
    wrapperWidth: 200,
  },
  {
    label: '状态',
    name: 'status',
    component: 'Select',
    placeholder: '请选择状态',
    componentProps: {
      options: STATUS_OPTIONS,
    },
    wrapperWidth: 150,
  },
];

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '配置名称',
    dataIndex: 'config_name',
    key: 'config_name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '分类',
    dataIndex: 'category_name',
    key: 'category_name',
    width: 120,
    render: (value: string) => value || '全部分类',
  },
  {
    title: '平台返利比例',
    dataIndex: 'platform_rate',
    key: 'platform_rate',
    width: 120,
    render: (value: string | number) => {
      const numericValue = parseFloat(value as string) || 0;
      const calculatedValue = numericValue * 100;
      const integerPercentage = Math.round(calculatedValue);
      return `${integerPercentage}%`;
    },
  },
  {
    title: '推广者返利比例',
    dataIndex: 'promoter_rate',
    key: 'promoter_rate',
    width: 140,
    render: (value: string | number) => {
      const numericValue = parseFloat(value as string) || 0;
      const calculatedValue = numericValue * 100;
      const integerPercentage = Math.round(calculatedValue);
      return `${integerPercentage}%`;
    },
  },
  {
    title: '购买者返金豆比例',
    dataIndex: 'buyer_points_rate',
    key: 'buyer_points_rate',
    width: 150,
    render: (value: string | number) => {
      const numericValue = parseFloat(value as string) || 0;
      const calculatedValue = numericValue * 100;
      const integerPercentage = Math.round(calculatedValue);
      return `${integerPercentage}%`;
    },
  },
  {
    title: '订单金额范围',
    key: 'order_amount_range',
    width: 150,
    render: (_: any, record: any) => {
      const min = record.min_order_amount || '0';
      const max = record.max_order_amount || '∞';
      return `¥${min} ~ ¥${max}`;
    },
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 80,
  },
  {
    title: '生效时间',
    key: 'valid_time',
    width: 180,
    render: (_: any, record: any) => {
      const start = record.valid_start_time || record.valid_from
        ? dayjs(record.valid_start_time || record.valid_from).format('YYYY-MM-DD')
        : '-';
      const end = record.valid_end_time || record.valid_to
        ? dayjs(record.valid_end_time || record.valid_to).format('YYYY-MM-DD')
        : '永久';
      return `${start} ~ ${end}`;
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    render: (value: number) => (
      <span style={{ color: value === 1 ? 'green' : 'red' }}>
        {value === 1 ? '启用' : '禁用'}
      </span>
    ),
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180,
    render: (value: string) => {
      return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-';
    },
  },
];

// 表单配置
export const formList: BaseFormList[] = [
  {
    label: '配置名称',
    name: 'config_name',
    component: 'Input',
    placeholder: '请输入配置名称',
    rules: FORM_REQUIRED,
  },
  {
    label: '分类',
    name: 'category_id',
    component: 'Select',
    placeholder: '留空表示全部品类',
    componentProps: {
      options: [
        { label: '全部分类', value: null },
      ],
      allowClear: true,
    },
  },
  {
    label: '平台返利比例',
    name: 'platform_rate',
    component: 'Input',
    placeholder: '请输入平台返利比例 (0-100)',
    rules: [...FORM_REQUIRED, ...FORM_NOT_NEGATIVE, ...FORM_LTE_1],
    componentProps: {
      type: 'float',
      min: 0,
      max: 1,
    },
  },

  // 推广者返利比例配置
  {
    label: '推广者返利比例',
    name: 'promoter_rate',
    component: 'Input',
    placeholder: '请输入推广者返利比例 (0-100)',
    rules: [...FORM_REQUIRED, ...FORM_NOT_NEGATIVE, ...FORM_LTE_1],
    componentProps: {
      type: 'float',
      min: 0,
      max: 1,
    },
  },
  {
    label: '购买者返利比例',
    name: 'buyer_points_rate',
    component: 'Input',
    placeholder: '请输入购买者返金豆比例 (0 到 1)',
    rules: [...FORM_REQUIRED, ...FORM_NOT_NEGATIVE, ...FORM_LTE_1],
    extra: '温馨提示：三种返利比例总和必须小于等于 100% (即 1.0)',
    componentProps: {
      type: 'float',
      min: 0,
      max: 1,
    },
  },
  {
    label: '最小订单金额',
    name: 'min_order_amount',
    component: 'Input',
    rules: [...FORM_REQUIRED, ...FORM_GT_ZERO],
    componentProps: {
      placeholder: '请输入最小订单金额',
      type: 'number',
      min: 0,
    },
  },
  {
    label: '最大订单金额',
    name: 'max_order_amount',
    component: 'Input',
    rules: [...FORM_GT_ZERO],
    componentProps: {
      placeholder: '需要大于等于最小订单金额',
      type: 'number',
      min: 0,
    },
  },
  {
    label: '优先级',
    name: 'priority',
    component: 'InputNumber',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '数字越大优先级越高',
      min: 1,
      style: { width: '100%' },
    },
  },
  {
    label: '生效开始时间',
    name: 'valid_start_time',
    component: 'DatePicker',
    rules: FORM_REQUIRED,
    componentProps: {
      style: { width: '100%' },
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
    },
  },
  {
    label: '生效结束时间',
    name: 'valid_end_time',
    component: 'DatePicker',
    componentProps: {
      placeholder: '留空表示永久有效',
      style: { width: '100%' },
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
    },
  },
  {
    label: '状态',
    name: 'status',
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
];
