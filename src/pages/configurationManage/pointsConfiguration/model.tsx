import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import dayjs from 'dayjs';

/**
 * 1. 获取列表的 Query 参数
 */
export interface GetPointsConfigListParams {
  status?: number;
  page?: number;
  page_size?: number;
}

/**
 * 2. 新增/修改表单的 Body 数据
 */
export interface PointsConfigForm {
  rule_code: string;
  rule_name: string;
  business_type: string;
  exchange_rate: number;
  min_amount?: string | null;
  max_amount?: string | null;
  daily_limit?: number | null;
  monthly_limit?: number | null;
  user_total_limit?: number | null;
  default_expire_days?: number | null;
  expire_remind_days?: number | null;
  status: number;
  valid_start_time: string;
  valid_end_time: string | null;
}

/**
 * 3. 获取列表的响应类型
 */
export interface PointsConfigItem {
  id: number;
  // 业务类型
  business_type?: string;
  // 创建时间
  created_at?: string;
  // 创建人ID
  creator_id?: number;
  // 创建人姓名
  creator_name?: string;
  // 每日限制次数
  daily_limit?: null | number;
  // 默认过期天数
  default_expire_days?: number;
  // 兑换比例
  exchange_rate?: number;
  // 过期提醒提前天数
  expire_remind_days?: number | null;
  // 最大触发金额
  max_amount?: null | string;
  // 最小触发金额
  min_amount?: string | null;
  // 每月限制次数
  monthly_limit?: null | number;
  // 规则代码
  rule_code?: string;
  // 规则名称
  rule_name?: string;
  // 状态：1-启用，0-禁用
  status?: number;
  // 状态文案
  status_text?: string;
  // 更新时间
  updated_at?: string;
  // 用户总限制次数
  user_total_limit?: null | number;
  // 生效结束时间
  valid_end_time?: null | string;
  // 生效开始时间
  valid_start_time?: string;
}

export interface PointsConfigData {
  list: PointsConfigItem[];
  page: number;
  page_size: number;
  total: number;
}

export interface PointsConfigListResponse {
  code: number;
  data: PointsConfigData;
  message: string;
}

// 业务类型选项
export const BUSINESS_TYPE_OPTIONS = [
  { label: '消费返金豆', value: 'consumption_reward' },
  { label: '签到奖励', value: 'sign_in_reward' },
  { label: '推广奖励', value: 'referral_reward' },
  { label: '活动奖励', value: 'activity_reward' },
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
    label: '规则名称',
    name: 'rule_name',
    component: 'Input',
    placeholder: '请输入规则名称',
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
    title: '规则代码',
    dataIndex: 'rule_code',
    key: 'rule_code',
    width: 150,
    ellipsis: true,
  },
  {
    title: '规则名称',
    dataIndex: 'rule_name',
    key: 'rule_name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '业务类型',
    dataIndex: 'business_type',
    key: 'business_type',
    width: 120,
    render: (value: string) => {
      const option = BUSINESS_TYPE_OPTIONS.find(opt => opt.value === value);
      return option?.label || value;
    },
  },
  {
    title: '兑换比例',
    dataIndex: 'exchange_rate',
    key: 'exchange_rate',
    width: 100,
    render: (value: number) => `${value}:1`,
  },
  {
    title: '触发金额范围',
    key: 'amount_range',
    width: 150,
    render: (_: any, record: any) => {
      const min = record.min_amount || '无';
      const max = record.max_amount || '无';
      return `${min} ~ ${max}`;
    },
  },
  {
    title: '每日限制',
    dataIndex: 'daily_limit',
    key: 'daily_limit',
    width: 100,
    render: (value: number | null) => value || '无限制',
  },
  {
    title: '默认过期天数',
    dataIndex: 'default_expire_days',
    key: 'default_expire_days',
    width: 120,
    render: (value: number) => `${value}天`,
  },
  {
    title: '生效时间',
    key: 'valid_time',
    width: 180,
    render: (_: any, record: any) => {
      const start = record.valid_start_time
        ? dayjs(record.valid_start_time).format('YYYY-MM-DD')
        : '-';
      const end = record.valid_end_time
        ? dayjs(record.valid_end_time).format('YYYY-MM-DD')
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
    label: '规则代码',
    name: 'rule_code',
    component: 'Input',
    placeholder: '请输入规则代码(如:CONSUME_REWARD)',
    rules: FORM_REQUIRED,
  },
  {
    label: '规则名称',
    name: 'rule_name',
    component: 'Input',
    placeholder: '请输入规则名称',
    rules: FORM_REQUIRED,
  },
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
    label: '兑换比例',
    name: 'exchange_rate',
    component: 'InputNumber',
    placeholder: '请输入兑换比例(如:100表示100:1)',
    rules: FORM_REQUIRED,
    componentProps: {
      min: 1,
      style: { width: '100%' },
    },
  },
  {
    label: '最小触发金额',
    name: 'min_amount',
    component: 'Input',
    placeholder: '留空表示无限制',
    componentProps: {
      type: 'number',
    },
  },
  {
    label: '最大触发金额',
    name: 'max_amount',
    component: 'Input',
    placeholder: '留空表示无限制',
    componentProps: {
      type: 'number',
    },
  },
  {
    label: '每日限制次数',
    name: 'daily_limit',
    component: 'InputNumber',
    placeholder: '留空表示无限制',
    componentProps: {
      min: 0,
      style: { width: '100%' },
    },
  },
  {
    label: '每月限制次数',
    name: 'monthly_limit',
    component: 'InputNumber',
    placeholder: '留空表示无限制',
    componentProps: {
      min: 0,
      style: { width: '100%' },
    },
  },
  {
    label: '用户总限制次数',
    name: 'user_total_limit',
    component: 'InputNumber',
    placeholder: '留空表示无限制',
    componentProps: {
      min: 0,
      style: { width: '100%' },
    },
  },
  {
    label: '默认过期天数',
    name: 'default_expire_days',
    component: 'InputNumber',
    placeholder: '请输入默认过期天数',
    rules: FORM_REQUIRED,
    componentProps: {
      min: 1,
      style: { width: '100%' },
    },
  },
  {
    label: '过期提醒提前天数',
    name: 'expire_remind_days',
    component: 'InputNumber',
    placeholder: '留空表示不提醒',
    componentProps: {
      min: 1,
      style: { width: '100%' },
    },
  },
  {
    label: '生效开始时间',
    name: 'valid_start_time',
    component: 'DatePicker',
    placeholder: '请选择生效开始时间',
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
    placeholder: '留空表示永久有效',
    componentProps: {
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