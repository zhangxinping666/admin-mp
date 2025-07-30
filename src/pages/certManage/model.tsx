import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { message, Modal } from 'antd';
import { useState } from 'react';
import { ImagePreview } from '@/components/Upload';
// 身份证图片预览组件 - 使用新的ImagePreview组件
const UserPreview = ({ voucherUrl }: { voucherUrl: uploadImg[] }) => {
  return <ImagePreview imageUrl={voucherUrl} alt="身份证图片" />;
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
  card_id: number;
  front: uploadImg[];
  back: uploadImg[];
  status: number;
}

export interface CertItem {
  id: number;
  name: string;
  card_id: number;
  front: string;
  back: string;
  status: number;
}
export interface UpdateCert {
  id: number;
  status: number;
}
export interface CertDetailResult {
  code: number;
  data: CertItem;
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
    label: '用户名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入用户名称',
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
    title: '用户名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '用户身份证ID',
    dataIndex: 'card_id',
    key: 'card_id',
    width: 100,
  },
  {
    title: '身份证正面',
    dataIndex: 'front_img',
    key: 'front_img',
    width: 100,
    render: (url: uploadImg[]) => <ImagePreview imageUrl={url} alt="身份证正面" />,
  },
  {
    title: '身份证反面',
    dataIndex: 'back_img',
    key: 'back_img',
    width: 100,
    render: (url: uploadImg[]) => <ImagePreview imageUrl={url} alt="身份证反面" />,
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
