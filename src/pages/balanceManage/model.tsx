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
  total_amount: number; //业务类别
  available_amount: number; //变动金额
  frozen_amount: number; //交易流水号
  status: number; //订单号
  status_name: string; //交易收支（1-收入/2-支出）
  school_id: string; //交易收支名称
  school_name: number; //变动前余额
  city_id: number; //变动后余额
  city_name: string; //创建时间
  user_nickname: string; //用户名称
  user_phone: string; //用户手机号
  created_at: string; // 创建时间
  updated_at: string; // 更新时间
}

// 余额明细数据接口
export interface BalanceDetail {
  id: number; // 编号
  user_id: number; // 用户ID
  category: string; // 业务类别
  amount: number; // 变动金额
  transaction_no: string; // 交易流水号
  order_no: string; // 订单号
  transaction_type: number; // 交易收支（1-收入/2-支出）
  transaction_type_name: string; // 交易收支名称
  opening_balance: number; // 变动前余额
  closing_balance: number; // 变动后余额
  created_at: string; // 创建时间
  is_valid: boolean; // 是否有效
  status: number; // 状态
  voucher: number; // 凭证
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
    label: '用户名称',
    name: 'user_nickname',
    component: 'Input',
    placeholder: '请输入用户名称',
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

// 详情表格列配置
export const detailTableColumns: TableColumn[] = [
  {
    title: '交易ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '业务类别',
    dataIndex: 'category',
    key: 'category',
    width: 120,
    render: (value: string) => {
      const categoryMap: Record<string, { text: string; color: string }> = {
        withdraw_failed: { text: '提现失败', color: '#ff4d4f' },
        withdraw_success: { text: '提现成功', color: '#52c41a' },
        withdraw_processing: { text: '提现处理中', color: '#fa8c16' },
      };

      const category = categoryMap[value] || { text: value, color: '#666' };

      return (
        <span
          style={{
            color: category.color,
            fontWeight: 500,
          }}
        >
          {category.text}
        </span>
      );
    },
  },
  {
    title: '变动金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 100,
    render: (value: number, record: BalanceDetail) => (
      <span
        style={{
          color: record.transaction_type === 1 ? '#52c41a' : '#ff4d4f',
          fontWeight: 500,
        }}
      >
        {record.transaction_type === 1 ? '+' : '-'}
        {Math.abs(value)}
      </span>
    ),
  },
  {
    title: '交易类型',
    dataIndex: 'transaction_type_name',
    key: 'transaction_type_name',
    width: 100,
    render: (value: string, record: BalanceDetail) => (
      <span
        style={{
          color: record.transaction_type === 1 ? '#52c41a' : '#ff4d4f',
        }}
      >
        {value}
      </span>
    ),
  },
  {
    title: '变动前余额',
    dataIndex: 'opening_balance',
    key: 'opening_balance',
    width: 120,
    render: (value: number) => <span style={{ color: '#666' }}>{value}</span>,
  },
  {
    title: '变动后余额',
    dataIndex: 'closing_balance',
    key: 'closing_balance',
    width: 120,
    render: (value: number) => <span style={{ color: '#1890ff', fontWeight: 500 }}>{value}</span>,
  },
  {
    title: '交易流水号',
    dataIndex: 'transaction_no',
    key: 'transaction_no',
    width: 180,
    render: (value: string) => (
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#666',
        }}
      >
        {value}
      </span>
    ),
  },
  {
    title: '订单号',
    dataIndex: 'order_no',
    key: 'order_no',
    width: 180,
    render: (value: string) => (
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#666',
        }}
      >
        {value}
      </span>
    ),
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 160,
    render: (value: string) => <span style={{ color: '#666' }}>{value}</span>,
  },
];

// 主表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '用户名',
    dataIndex: 'user_nickname',
    key: 'user_nickname',
    width: 80,
  },
  {
    title: '学校',
    dataIndex: 'school_name',
    key: 'school_name',
    width: 80,
  },
  {
    title: '城市',
    dataIndex: 'city_name',
    key: 'city_name',
    width: 80,
  },
  {
    title: '用户手机号',
    dataIndex: 'user_phone',
    key: 'user_phone',
    width: 80,
  },
  {
    title: '总余额',
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
    render: (value: number) => (
      <span style={{ color: value === 1 ? '#1890ff' : value === 2 ? ' #faad14' : '#ff4d4f' }}>
        {value === 1 ? '正常' : value === 2 ? '冻结' : '禁用'}
      </span>
    ),
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
export const formList = (): BaseFormList[] => [];
