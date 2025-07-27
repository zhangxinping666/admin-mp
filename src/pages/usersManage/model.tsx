import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';

// 楼栋接口定义
export interface User {
  id: number;
  avatar: string;
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
  avatar: string;
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

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '用户昵称',
    name: 'nickname',
    component: 'Input',
    placeholder: '请输入团长昵称',
  },
  {
    label: '状态',
    name: 'status',
    component: 'Select',
    placeholder: '请选择状态',
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  },
];

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '用户头像',
    dataIndex: 'avatar',
    key: 'avatar',
    width: 100,
    render: (avatar: string) => <img src={avatar} alt="用户头像" style={{ width: '100%' }} />,
  },
  {
    title: '用户昵称',
    dataIndex: 'nickname',
    key: 'nickname',
    width: 150,
    ellipsis: true,
  },
  {
    title: '用户电话',
    dataIndex: 'phone',
    key: 'phone',
    width: 100,
  },
  {
    title: '用户学校',
    dataIndex: 'school',
    key: 'school',
    width: 100,
  },
  {
    title: '用户微信',
    dataIndex: 'wechat',
    key: 'wechat',
    width: 100,
  },
  {
    title: '用户支付宝',
    dataIndex: 'alipay',
    key: 'alipay',
    width: 100,
  },
  {
    title: '用户最后登录时间',
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

// 表单配置
export const formList = (): BaseFormList[] => [
  {
    label: '团长名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入学校名称',
    rules: FORM_REQUIRED,
  },
  {
    label: '团长电话',
    name: 'phone',
    component: 'Input',
    placeholder: '请输入团长电话',
    rules: FORM_REQUIRED,
  },
  {
    label: '城市ID',
    name: 'city_id',
    component: 'InputNumber',
    placeholder: '请输入城市ID',
    rules: FORM_REQUIRED,
    componentProps: {
      min: 1,
      style: { width: '100%' },
    },
  },
  {
    label: '团长密码',
    name: 'password',
    component: 'InputNumber',
    placeholder: '请输入团长密码',
    rules: FORM_REQUIRED,
    componentProps: {
      precision: 6,
      style: { width: '100%' },
    },
  },
  {
    label: '状态',
    name: 'status',
    component: 'Select',
    placeholder: '请选择状态',
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  },
];
