import type { TFunction } from 'i18next';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';

// 商家分类数据接口
export interface MerchantApplication {
  id: number;
  phone: string | undefined;
  merchantName: string | undefined;
  payWay: string; // 支付宝，微信，银行等
  money: number; // 支付金额
  payDesc: string; // 费用说明
  type: string; // 0：真实支付；1：手动录入
  remark: File | string; // 备注（支付截图）
  orderNo: string; // 订单号
  status: string; // 0：待处理；1：已处理；2：已拒绝
  createdAt?: string;
  updatedAt?: string;
  action?: React.ReactNode;
}

// 商家分类列表接口
export interface MerchantApplicationList {
  items: MerchantApplication[];
  total: number;
}

// 商家分类查询参数接口
export interface MerchantApplicationQuery {
  merchantName: string;
  phone: number;
}

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '商家名称',
    name: 'merchantName',
    component: 'Input',
    placeholder: '请输入商家名称',
  },
  {
    label: '手机号',
    name: 'phone',
    component: 'InputNumber',
    placeholder: '请输入手机号',
  },
];

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '商家名称',
    dataIndex: 'merchantName',
    key: 'merchantName',
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
    title: '支付方式',
    dataIndex: 'payWay',
    key: 'payWay',
    width: 120,
    ellipsis: true,
  },
  {
    title: '支付金额',
    dataIndex: 'money',
    key: 'money',
    width: 120,
    ellipsis: true,
  },
  {
    title: '费用说明',
    dataIndex: 'payDesc',
    key: 'payDesc',
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
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    width: 120,
    ellipsis: true,
  },
  {
    title: '订单号',
    dataIndex: 'orderNo',
    key: 'orderNo',
    width: 120,
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
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
    label: '商家名称',
    name: 'merchantName',
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
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入手机号',
      maxLength: 11,
    },
  },
  {
    label: '支付方式',
    name: 'payWay',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入支付方式',
      maxLength: 20,
    },
  },
  {
    label: '支付金额',
    name: 'money',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入支付金额',
      maxLength: 11,
    },
  },
  {
    label: '费用说明',
    name: 'payDesc',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入费用说明',
      maxLength: 200,
    },
  },
  {
    label: '备注',
    name: 'remark',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入备注',
      maxLength: 200,
    },
  },
  {
    label: '订单号',
    name: 'orderNo',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入订单号',
      maxLength: 200,
    },
  },
];
