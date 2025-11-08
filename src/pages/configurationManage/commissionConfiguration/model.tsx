import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import dayjs from 'dayjs';

/**
 * 1. 获取列表的 Query 参数
 */
export interface GetCommissionConfigListParams {
  status?: number;
  page?: number;
  page_size?: number;
}

/**
 * 2. 新增/修改表单的 Body 数据
 */
export interface CommissionConfigForm {
  business_type: string;
  platform_rate: string;
  promoter_rate: string;
  leader_rate: string;
  operator_rate: string;
  amount: string;
  status: number;
}

/**
 * 3. 获取列表的响应类型
 */
export interface CommissionConfigItem {
  id: number;
  // 固定金额
  amount?: string;
  // 业务类型
  business_type?: string;
  // 创建时间
  created_at?: string;
  // 团长分佣比例
  leader_rate?: string;
  // 运营商分佣比例
  operator_rate?: string;
  // 平台分佣比例
  platform_rate?: string;
  // 推广者分佣比例
  promoter_rate?: string;
  // 状态：1-启用，0-禁用
  status?: number;
  // 状态文案
  status_text?: string;
  // 更新时间
  updated_at?: string;
}

export interface CommissionConfigData {
  list: CommissionConfigItem[];
  page: number;
  page_size: number;
  total: number;
}

export interface CommissionConfigListResponse {
  code: number;
  data: CommissionConfigData;
  message: string;
}

// 业务类型选项
export const BUSINESS_TYPE_OPTIONS = [
  { label: '商品订单分佣', value: 'product_order' },
  { label: '会员充值分佣', value: 'member_recharge' },
  { label: '服务订单分佣', value: 'service_order' },
  { label: '广告分佣', value: 'advertisement' },
];

// 状态选项
export const STATUS_OPTIONS = [
  { label: '全部', value: '' },
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
];

// 搜索配置
export const searchList: BaseSearchList[] = [
  {
    label: '业务类型',
    name: 'business_type',
    component: 'Select',
    placeholder: '请选择业务类型',
    componentProps: {
      options: [{ label: '全部', value: '' }, ...BUSINESS_TYPE_OPTIONS],
    },
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
    title: '业务类型',
    dataIndex: 'business_type',
    key: 'business_type',
    width: 150,
    render: (value: string) => {
      const option = BUSINESS_TYPE_OPTIONS.find(opt => opt.value === value);
      return option?.label || value;
    },
  },
  {
    title: '平台分佣比例',
    dataIndex: 'platform_rate',
    key: 'platform_rate',
    width: 130,
    render: (value: string) => `${value}%`,
  },
  {
    title: '推广者分佣比例',
    dataIndex: 'promoter_rate',
    key: 'promoter_rate',
    width: 140,
    render: (value: string) => `${value}%`,
  },
  {
    title: '团长分佣比例',
    dataIndex: 'leader_rate',
    key: 'leader_rate',
    width: 130,
    render: (value: string) => `${value}%`,
  },
  {
    title: '运营商分佣比例',
    dataIndex: 'operator_rate',
    key: 'operator_rate',
    width: 140,
    render: (value: string) => `${value}%`,
  },
  {
    title: '固定金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 120,
    render: (value: string) => (value ? `¥${value}` : '-'),
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
    label: '业务类型',
    name: 'business_type',
    component: 'Select',
    placeholder: '请选择业务类型',
    rules: FORM_REQUIRED,
    componentProps: {
      options: BUSINESS_TYPE_OPTIONS,
    },
  },
  {
    label: '平台分佣比例(%)',
    name: 'platform_rate',
    component: 'Input',
    placeholder: '请输入平台分佣比例',
    rules: FORM_REQUIRED,
    componentProps: {
      type: 'number',
      min: 0,
      max: 100,
    },
  },
  {
    label: '推广者分佣比例(%)',
    name: 'promoter_rate',
    component: 'Input',
    placeholder: '请输入推广者分佣比例',
    rules: FORM_REQUIRED,
    componentProps: {
      type: 'number',
      min: 0,
      max: 100,
    },
  },
  {
    label: '团长分佣比例(%)',
    name: 'leader_rate',
    component: 'Input',
    placeholder: '请输入团长分佣比例',
    rules: FORM_REQUIRED,
    componentProps: {
      type: 'number',
      min: 0,
      max: 100,
    },
  },
  {
    label: '运营商分佣比例(%)',
    name: 'operator_rate',
    component: 'Input',
    placeholder: '请输入运营商分佣比例',
    rules: FORM_REQUIRED,
    componentProps: {
      type: 'number',
      min: 0,
      max: 100,
    },
  },
  {
    label: '固定金额',
    name: 'amount',
    component: 'Input',
    placeholder: '请输入固定金额(可选)',
    componentProps: {
      type: 'number',
      min: 0,
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
