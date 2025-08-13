export interface BalanceApplication {
  id: number;
  user_id: number;
  amount: number;
  order_number: string;
  status: number;
}

export interface BalanceApplicationForm {
  fail_reason: string;
}

// 余额明细数据接口

export const searchList = (): BaseSearchList[] => [
  {
    label: '提现用户',
    name: 'user_id',
    component: 'InputNumber',
    placeholder: '请输入用户ID',
  },
  {
    label: '提现金额',
    name: 'amount',
    component: 'InputNumber',
    placeholder: '请输入提现金额',
  },
];

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '提现记录ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '提现金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 80,
  },
  {
    title: '订单号',
    dataIndex: 'order_number',
    key: 'order_number',
    width: 80,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    render: (value: number) => (
      <span style={{ color: value === 0 ? '#faad14' : value === 1 ? '#1890ff' : '#ff4d4f' }}>
        {value === 0 ? '审核中' : value === 1 ? '审核成功' : '审核失败'}
      </span>
    ),
  },
];

export const formList: BaseFormList[] = [
  {
    label: '审核理由',
    name: 'fail_reason',
    rules: FORM_REQUIRED,
    component: 'TextArea',
    componentProps: {
      placeholder: '请输入类别',
      maxLength: 200,
    },
  },

  {
    label: '审核状态',
    name: 'status',
    component: 'Select',
    componentProps: {
      options: [
        {
          label: '审核中',
          value: 0,
        },
        {
          label: '审核成功',
          value: 1,
        },
        {
          label: '审核失败',
          value: 2,
        },
      ],
    },
  },
];
