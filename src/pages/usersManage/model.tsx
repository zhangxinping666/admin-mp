import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { EnhancedImageUploader } from '@/shared/components/EnhancedImageUploader';
import { Space, Tooltip } from 'antd';
import { render } from 'nprogress';

// 楼栋接口定义
export interface User {
  id: number;
  avatar: string;
  image_id?: number;
  nickname: string;
  phone: string;
  school: string;
  wechat: string;
  alipay: string;
  last_time: string;
  status: number;
}
export interface updateUserForm {
  id: number;
  image: string;
  image_id?: number;
  nickname: string;
  phone: string;
  school: string;
  wechat: string;
  alipay: string;
  status: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface UserListResult {
  code: number;
  message: string; // 注意：根据您的JSON数据，这里是 message (单数)
  data: {
    list: User[];
    page: number;
    page_size: number;
    pages: number;
    total: number;
  };
}

export interface UserDetailResult {
  code: number;
  data: User;
}

// 余额明细搜索配置
export const searchDetailList = (): BaseSearchList[] => [
  {
    label: '时间范围',
    name: 'time_range',
    component: 'RangePicker',
  },
  {
    label: '流水号',
    name: 'transaction_no',
    component: 'Input',
  },
  {
    label: '关联流水号',
    name: 'order_no',
    component: 'Input',
  },
  {
    label: '类别',
    name: 'category',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: '' },
        { label: '商户入驻', value: 'merchant_entrance' },
        { label: '提现', value: 'withdrawal' },
        { label: '返佣', value: 'rebate' },
      ],
    },
  },
  {
    label: '交易类型',
    name: 'transaction_type',
    component: 'Select',
    componentProps: {
      options: [
        { label: '全部', value: 0 },
        { label: '收入', value: 1 },
        { label: '支出', value: 2 },
      ],
    },
  },
];

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '用户昵称',
    name: 'nickname',
    component: 'Input',
    placeholder: '请输入团长昵称',
  },
  {
    component: 'Select',
    name: 'status',
    label: '状态',
    componentProps: {
      options: [
        { label: '全部', value: 0 },
        { label: '启用', value: 1 },
        { label: '禁用', value: 2 },
      ],
    },
  },
];

// 表格列配置
export const tableColumns: (
  handleViewDetails: (record: any, event?: React.MouseEvent) => void,
) => TableColumn[] = (handleViewDetails) => [
  {
    title: '头像',
    dataIndex: 'avatar',
    key: 'avatar',
    width: 100,
    render: (avatar: string) => {
      const getFullImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `http://192.168.10.7:8082${cleanUrl}`;
      };

      const displayUrl = getFullImageUrl(avatar);
      return displayUrl ? (
        <img
          src={displayUrl}
          alt="头像"
          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
        />
      ) : (
        <div
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#999',
          }}
        >
          暂无头像
        </div>
      );
    },
  },
  {
    title: '昵称',
    dataIndex: 'nickname',
    key: 'nickname',
    width: 150,
    ellipsis: true,
  },
  {
    title: '电话',
    dataIndex: 'phone',
    key: 'phone',
    width: 100,
  },
  {
    title: '学校',
    dataIndex: 'school',
    key: 'school',
    width: 100,
  },
  {
    title: '微信',
    dataIndex: 'wechat',
    key: 'wechat',
    width: 100,
  },
  {
    title: '支付宝',
    dataIndex: 'alipay',
    key: 'alipay',
    width: 100,
  },
  {
    title: '余额',
    dataIndex: 'balance',
    key: 'balance',
    width: 100,
    render: (value: number, record: any) => {
      return (
        <Tooltip title="查看余额明细">
          <Space
            size={8}
            className="blinking-eye"
            style={{ cursor: 'pointer' }}
            onClick={(e: React.MouseEvent) => handleViewDetails(record, e)}
          >
            {/* 金额：千位分隔 + 两位小数 */}
            <span>
              {value != null
                ? value.toLocaleString('zh-CN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                : '0.00'}
            </span>

            {/* 眨眼眼睛 */}

            <span
              className="blinking-eye"
              style={{
                cursor: 'pointer',
                display: 'inline-block',
                color: 'var(--brand-color, #1677ff)',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4C7 4 2 7 2 12C2 17 7 20 12 20C17 20 22 17 22 12C22 7 17 4 12 4Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="12" cy="12" r="4" fill="currentColor" />
              </svg>
            </span>
          </Space>
        </Tooltip>
      );
    },
  },
  {
    title: '最后登录时间',
    dataIndex: 'last_time',
    key: 'last_time',
    width: 100,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    render: (value: number) => (
      <span style={{ color: value === 1 ? 'green' : 'red' }}>{value === 1 ? '启用' : '禁用'}</span>
    ),
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 120,
    fixed: 'right',
  },
];

// 详情表格列配置
export const detailTableColumns: TableColumn[] = [
  {
    title: '流水号',
    dataIndex: 'transaction_id',
    key: 'transaction_id',
    width: 80,
  },
  {
    title: '交易金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 100,
    render: (value: number, record: any) => (
      <span
        style={{
          color: record.transaction_type === 1 ? '#52c41a' : '#ff4d4f',
          fontWeight: 500,
        }}
      >
        {record.transaction_type === 1 ? '+' : '-'}
        {Math.abs(value)?.toFixed(2)}
      </span>
    ),
  },
  {
    title: '关联流水号',
    dataIndex: 'order_no',
    key: 'order_no',
    width: 100,
  },
  {
    title: '交易类型(收入/支出)',
    dataIndex: 'transaction_type_name',
    key: 'transaction_type_name',
    width: 100,
    render: (value: string, record: any) => (
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
    title: '期初余额',
    dataIndex: 'opening_balance',
    key: 'opening_balance',
    width: 120,
    render: (value: number) => <span style={{ color: '#666' }}>{value?.toFixed(2) || '0.00'}</span>,
  },
  {
    title: '期末余额',
    dataIndex: 'closing_balance',
    key: 'closing_balance',
    width: 120,
    render: (value: number) => (
      <span style={{ color: '#1890ff', fontWeight: 500 }}>{value?.toFixed(2) || '0.00'}</span>
    ),
  },
  {
    title: '备注信息',
    dataIndex: 'remark',
    key: 'remark',
    width: 100,
    render: (value: string) => (
      <span style={{ color: '#666' }}>{value ? value : '无备注信息'}</span>
    ),
  },
  {
    title: '操作时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 160,
    render: (value: string) => <span style={{ color: '#666' }}>{value}</span>,
  },
];

// 表单配置
export const formList = (): BaseFormList[] => [
  {
    label: '昵称',
    name: 'nickname',
    component: 'Input',
    placeholder: '请输入学校名称',
    rules: FORM_REQUIRED,
  },
  {
    label: '电话',
    name: 'phone',
    component: 'Input',
    placeholder: '请输入用户电话',
    rules: [
      { required: true, message: '请输入用户电话' },
      { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号' },
    ],
    componentProps: {
      maxLength: 11,
    },
  },
  {
    label: '密码',
    name: 'password',
    component: 'Input',
    placeholder: '请输入用户密码',
    componentProps: {
      precision: 6,
      style: { width: '100%' },
    },
  },
  {
    label: '头像',
    name: 'image',
    component: 'customize',
    rules: FORM_REQUIRED,
    render: (props: any) => {
      const { value, onChange } = props;
      return (
        <EnhancedImageUploader
          value={value}
          onChange={onChange}
          maxSize={2}
          baseUrl="http://192.168.10.7:8082"
        />
      );
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
        { label: '禁用', value: 2 },
      ],
    },
  },
];
