import dayjs from 'dayjs';

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
    label: '手机号',
    name: 'phone',
    component: 'Input',
    rules: PHONE_RULE(false, '手机号格式错误'),
    componentProps: {
      placeholder: '请输入手机号',
    },
  },
  {
    label: '时间范围',
    name: 'time_range',
    component: 'RangePicker',
    componentProps: {
      format: 'YYYY-MM-DD HH:mm:ss',
    },
  },
];

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '流水号',
    dataIndex: 'order_number',
    key: 'order_number',
  },
  {
    title: '用户名称',
    dataIndex: 'nickname',
    key: 'nickname',
  },
  {
    title: '金额',
    dataIndex: 'amount',
    key: 'amount',
  },
  {
    title: '提现方式',
    dataIndex: 'method',
    key: 'method',
    render: (value: string) => {
      return (
        <>
          <span>
            {value || '无方式'}
            <span className="ml-1 mr-1 inline-block align-middle">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5Z"
                  stroke="#1890FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  fill="#1890FF"
                />
              </svg>
            </span>
          </span>
        </>
      );
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (value: number) => {
      return value === 0 ? '审核中' : value === 1 ? '提现成功' : '提现失败';
    },
  },
  {
    title: '提现时间',
    dataIndex: 'created_at',
    key: 'created_at',
    render: (value: string) => {
      return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
    },
  },
];

export const formList: BaseFormList[] = [
  {
    label: '审核理由',
    name: 'fail_reason',
    rules: FORM_REQUIRED,
    component: 'TextArea',
    componentProps: {
      placeholder: '请输入审核理由',
      maxLength: 200,
    },
  },

  {
    label: '审核状态',
    name: 'status',
    component: 'Select',
    rules: FORM_REQUIRED,

    componentProps: {
      defaultValue: 1,
      options: [
        {
          label: '通过',
          value: 1,
        },
        {
          label: '拒绝',
          value: 2,
        },
        {
          label: '审核中',
          value: 0,
          disabled: true,
        }
      ],
    },
  },
];
