import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { message, Modal } from 'antd';
import { useState } from 'react';
import { ImagePreview } from '@/components/Upload';
// 身份证图片预览组件 - 使用新的ImagePreview组件
const UserPreview = ({ voucherUrl }: { voucherUrl: uploadImg[] }) => {
  return <ImagePreview imageUrl={voucherUrl} alt="身份证图片" baseUrl="http://192.168.10.7:8082" />;
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

// 定义
export interface Cert {
  id: number;
  name: string;
  user_name: string;
  card_id: number;
  user_phone: string;
  front: uploadImg[];
  back: uploadImg[];
  status: number;
  created_time: string;
  updated_time: string;
}

export interface CertItem {
  id: number;
  name: string;
  card_id: number;
  front: string;
  back: string;
  status: number;
  user_phone: string;
  create_time: string;
  update_time: string;
  reject_reason?: string; // 拒绝原因
  audit_user?: string; // 审核人
  audit_time?: string; // 审核时间
}
export interface UpdateCert {
  id: number;
  status: number;
  reason?: string; // 拒绝原因
}
export interface CertDetailResult {
  code: number;
  data: CertItem;
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
}

export interface PaginationParams {
  page: number;
  page_size: number;
}

export interface CertListResult {
  code: number;
  message: string; // 注意：根据您的JSON数据，这里是 message (单数)
  data: {
    list: CertItem[];
    page: number;
    page_size: number;
    pages: number;
    total: number;
  };
}

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '用户电话',
    name: 'user_phone',
    component: 'Input',
    placeholder: '请输入用户电话',
  },
  {
    label: '状态',
    name: 'status',
    component: 'Select',
    placeholder: '请选择状态',
    componentProps: {
      options: [
        { label: '全部', value: 0 },
        { label: '审核中', value: 1 },
        { label: '审核成功', value: 2 },
        { label: '审核失败', value: 3 },
      ],
    },
  },
];

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '用户名称',
    dataIndex: 'user_name',
    key: 'user_name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '用户电话',
    dataIndex: 'user_phone',
    key: 'user_phone',
    width: 150,
    ellipsis: true,
  },
  {
    title: '申请审批时间',
    dataIndex: 'created_time',
    key: 'created_time',
    width: 150,
    ellipsis: true,
  },
  {
    title: '最后审批时间',
    dataIndex: 'updated_time',
    key: 'updated_time',
    width: 150,
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    render: (value: number) => (
      <span style={{ color: value === 1 ? '#faad14' : value === 2 ? '#1890ff' : '#ff4d4f' }}>
        {value === 1 ? '审核中' : value === 2 ? '审核成功' : '审核失败'}
      </span>
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
    label: '状态',
    name: 'status',
    component: 'Select',
    placeholder: '请选择状态',
    componentProps: {
      options: [
        { label: '审核成功', value: 2 },
        { label: '审核失败', value: 3 },
        { label: '审核中', value: 1 },
      ],
    },
  },
];
