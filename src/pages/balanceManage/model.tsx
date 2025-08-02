import type { TFunction } from 'i18next';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { ImagePreview } from '@/components/Upload';

type uploadImg = {
  uid: string;
  name: string;
  status: string;
  url: string;
  response?: {
    url: string;
  };
};
// 交易凭证预览组件

// 交易凭证预览组件 - 使用新的ImagePreview组件
const VoucherPreview = ({ voucherUrl }: { voucherUrl: uploadImg[] }) => {
  return <ImagePreview imageUrl={voucherUrl} alt="交易凭证" />;
};

export interface Balance {
  id: number; // 编号
  user_id: number; // 类别
  total_amount: number; // 金额
  available_amount: number;
  frozen_amount: number;
  status: number;
  status_name: string;
  created_at: string;
  updated_at: string;
}

// 余额明细数据接口
export interface BalanceDetail {
  id: number; // 编号
  user_id: number;
  category: string; // 类别
  amount: number; // 金额
  transaction_no: string; // 交易流水号
  order_no: string; // 订单号
  transaction_type: 'income' | 'expense'; // 交易收支（收入/支出）
  transaction_type_name: string; // 交易收支名称
  voucher: number; // 交易凭证
  status: number; // 状态
  opening_balance: number;
  closing_balance: number;
  created_at: string; // 创建时间
  is_valid: string;
  action?: React.ReactNode;
}

export interface BalanceDetailResult {
  code: number;
  message: string;
  data: {
    list: BalanceDetail[];
    page: number;
    page_size: number;
    pages: number;
    total: number;
  };
}

export interface BalanceResult {
  code: number;
  message: string;
  data: {
    list: Balance[];
    page: number;
    page_size: number;
    pages: number;
    total: number;
  };
}
// 余额明细数据接口

export const searchList = (): BaseSearchList[] => [
  {
    label: '用户ID',
    name: 'user_id',
    component: 'InputNumber',
    placeholder: '请输入用户ID',
  },
  {
    label: '余额变动类别',
    name: 'category',
    component: 'Select',
    placeholder: '请选择余额变动类别',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '收入', value: 'income' },
        { label: '支出', value: 'expense' },
      ],
    },
  },
  {
    label: '开始时间',
    name: 'start_time',
    component: 'DatePicker',
    placeholder: '请选择开始时间',
    componentProps: {
      format: 'YYYY-MM-DD',
    },
  },
  {
    label: '结束时间',
    name: 'end_time',
    component: 'DatePicker',
    placeholder: '请选择结束时间',
    componentProps: {
      format: 'YYYY-MM-DD',
    },
  },
];

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '编号',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '用户ID',
    dataIndex: 'user_id',
    key: 'user_id',
    width: 80,
  },
  {
    title: '余额总额',
    dataIndex: 'total_amount',
    key: 'total_amount',
    width: 80,
  },
  {
    title: '可用余额',
    dataIndex: 'available_amount',
    key: 'available_amount',
    width: 80,
  },
  {
    title: '冻结余额',
    dataIndex: 'frozen_amount',
    key: 'frozen_amount',
    width: 80,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    render: (value) => {
      let color = '';
      switch (value) {
        case 1:
          color = 'green';
          return <span style={{ color }}>正常</span>;
        case 2:
          color = 'black';
          return <span style={{ color }}>冻结</span>;
        case 3:
          color = 'red';
          return <span style={{ color }}>已提现</span>;
      }
    },
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 80,
  },
  {
    title: '更新时间',
    dataIndex: 'updated_at',
    key: 'updated_at',
    width: 80,
  },
];

// 表单配置项
export const formList = (): BaseFormList[] => [
  {
    label: '类别',
    name: 'category',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入类别',
      maxLength: 50,
    },
  },
  {
    label: '金额',
    name: 'amount',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入金额',
      min: 0,
      step: 0.01,
      precision: 2,
      style: { width: '100%' },
    },
  },
  {
    label: '交易流水号',
    name: 'transactionNo',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入交易流水号',
      maxLength: 50,
    },
  },
  {
    label: '订单号',
    name: 'orderNo',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入订单号',
      maxLength: 50,
    },
  },
  {
    label: '交易收支',
    name: 'transactionType',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: {
      placeholder: '请选择交易类型',
      options: [
        { label: '收入', value: 'income' },
        { label: '支出', value: 'expense' },
      ],
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
        { label: '成功', value: 'success' },
        { label: '失败', value: 'failed' },
        { label: '处理中', value: 'processing' },
      ],
    },
  },
  {
    label: '期初余额',
    name: 'initialBalance',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入期初余额',
      min: 0,
      step: 0.01,
      precision: 2,
      style: { width: '100%' },
    },
  },
  {
    label: '期末余额',
    name: 'finalBalance',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入期末余额',
      min: 0,
      step: 0.01,
      precision: 2,
      style: { width: '100%' },
    },
  },
];
