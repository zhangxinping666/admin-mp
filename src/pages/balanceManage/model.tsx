import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { ImagePreview } from '@/components/Upload';
import { EnhancedImageUploader } from '@/shared/components/EnhancedImageUploader';

// 获取完整图片URL的函数
const getFullImageUrl = (url: any): string => {
  if (!url) return '';
  const urlStr = String(url);
  if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
    return urlStr;
  }
  return `http://192.168.10.7:8082${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
};

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
  return <ImagePreview imageUrl={voucherUrl} alt="交易凭证" baseUrl="http://192.168.10.7:8082" />;
};

export interface Balance {
  id: number; // 编号
  user_id: number; // 用户ID
  category: string; //业务类别
  amount: number; //变动金额
  transaction_no: string; //交易流水号
  order_no: string; //订单号
  transaction_type: string; //交易收支（1-收入/2-支出）
  transaction_type_name: string; //交易收支名称
  opening_balance: number; //变动前余额
  closing_balance: number; //变动后余额
  created_at: string; //创建时间
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
  opening_balance: number;
  closing_balance: number;
  created_at: string; // 创建时间
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
    label: '账户状态',
    name: 'status',
    component: 'Select',
    placeholder: '请选择账户状态',
    componentProps: {
      options: [
        { label: '全部', value: '' },

        { label: '正常', value: 1 },
        { label: '冻结', value: 2 },
        { label: '禁用', value: 3 },
      ],
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
    title: '业务类别',
    dataIndex: 'category',
    key: 'category',
    width: 80,
  },
  {
    title: '变动金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 80,
  },
  {
    title: '变动前余额',
    dataIndex: 'opening_balance',
    key: 'opening_balance',
    width: 80,
  },
  {
    title: '变动后余额',
    dataIndex: 'closing_balance',
    key: 'closing_balance',
    width: 80,
  },
  {
    title: '交易流水号',
    dataIndex: 'transaction_no',
    key: 'transaction_no',
    width: 80,
  },
  {
    title: '订单号',
    dataIndex: 'order_no',
    key: 'order_no',
    width: 80,
  },
  {
    title: '交易类型',
    dataIndex: 'transaction_type',
    key: 'transaction_type',
    width: 80,
    render: (value) => {
      if (value === '1') {
        return <span style={{ color: 'green' }}>收入</span>;
      }
      if (value === '2') {
        return <span style={{ color: 'red' }}>支出</span>;
      }
    },
  },
  {
    title: '交易收支',
    dataIndex: 'transaction_type_name',
    key: 'transaction_type_name',
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
