import type { TFunction } from 'i18next';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';

// 商家入驻申请数据接口
export interface MerchantApplication {
  address?: string;
  amount?: number;
  apply_status?: number;
  category_id?: number;
  close_hour?: string;
  fee_description?: string;
  image_path?: string[];
  id: number;
  merchant_type?: string;
  name?: string;
  open_hour?: string;
  order_number?: string;
  pay_channel?: string;
  pay_status?: number;
  phone?: string;
  remark_image_path?: string;
  type?: string;
  [property: string]: any;
}

// 商家入驻申请列表接口
export interface MerchantApplicationList {
  items: MerchantApplication[];
  total: number;
}

// 商家入驻申请查询参数接口
export interface MerchantApplicationQuery {
  name?: string;
  phone?: string;
}

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '商家名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入商家名称',
  },
  {
    label: '手机号',
    name: 'phone',
    component: 'Input',
    placeholder: '请输入手机号',
  },
];

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '商家名称',
    dataIndex: 'name',
    key: 'name',
    width: 120,
    ellipsis: true,
    fixed: 'left',
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
    width: 120,
    ellipsis: true,
  },
  {
    title: '商家类型',
    dataIndex: 'merchant_type',
    key: 'merchant_type',
    width: 120,
    ellipsis: true,
  },
  {
    title: '支付金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 120,
    ellipsis: true,
  },
  {
    title: '费用说明',
    dataIndex: 'fee_description',
    key: 'fee_description',
    width: 120,
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    ellipsis: true,
  },
  {
    title: '支付渠道',
    dataIndex: 'pay_channel',
    key: 'pay_channel',
    width: 120,
    ellipsis: true,
  },
  {
    title: '订单号',
    dataIndex: 'order_number',
    key: 'order_number',
    width: 120,
    ellipsis: true,
  },
  {
    title: '申请状态',
    dataIndex: 'apply_status',
    key: 'apply_status',
    width: 120,
    ellipsis: true,
  },
  {
    title: '支付状态',
    dataIndex: 'pay_status',
    key: 'pay_status',
    width: 120,
    ellipsis: true,
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: 'address',
    width: 120,
    ellipsis: true,
  },
  {
    title: '店铺类别ID',
    dataIndex: 'category_id',
    key: 'category_id',
    width: 120,
    ellipsis: true,
  },
  {
    title: '关闭时间',
    dataIndex: 'close_hour',
    key: 'close_hour',
    width: 120,
    ellipsis: true,
  },
  {
    title: '开业时间',
    dataIndex: 'open_hour',
    key: 'open_hour',
    width: 120,
    ellipsis: true,
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 120,
    ellipsis: true,
  },
];

// 表单配置项
export const formList = (): BaseFormList[] => [
  {
    label: '商家ID',
    name: 'merchant_id',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入商家ID',
      maxLength: 11,
      disabled: true,
    },
  },
  {
    label: '商家名称',
    name: 'name',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入商家名称',
      maxLength: 50,
    },
  },
  {
    label: '手机号',
    name: 'phone',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入手机号',
      maxLength: 11,
    },
  },
  {
    label: '商家类型',
    name: 'merchant_type',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入商家类型',
      maxLength: 20,
    },
  },
  {
    label: '支付金额',
    name: 'amount',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入支付金额',
      maxLength: 11,
    },
  },
  {
    label: '费用说明',
    name: 'fee_description',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入费用说明',
      maxLength: 200,
    },
  },
  {
    label: '类型',
    name: 'type',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入类型',
      maxLength: 200,
    },
  },
  {
    label: '支付渠道',
    name: 'pay_channel',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入支付渠道',
      maxLength: 200,
    },
  },
  {
    label: '订单号',
    name: 'order_number',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入订单号',
      maxLength: 200,
    },
  },
  {
    label: '申请状态',
    name: 'apply_status',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: {
      placeholder: '请选择申请状态',
      options: [
        { label: '待审核', value: 0 },
        { label: '审核通过', value: 1 },
        { label: '审核拒绝', value: 2 },
      ],
    },
  },
  {
    label: '支付状态',
    name: 'pay_status',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: {
      placeholder: '请选择支付状态',
      options: [
        { label: '未支付', value: 0 },
        { label: '已支付', value: 1 },
      ],
    },
  },
  {
    label: '地址',
    name: 'address',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入地址',
      maxLength: 200,
    },
  },
  {
    label: '店铺类别ID',
    name: 'category_id',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入店铺类别ID',
      maxLength: 11,
    },
  },
  {
    label: '关闭时间',
    name: 'close_hour',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入关闭时间',
      maxLength: 20,
    },
  },
  {
    label: '开业时间',
    name: 'open_hour',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入开业时间',
      maxLength: 20,
    },
  },
];
