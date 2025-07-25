import type { TFunction } from 'i18next';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { message, Modal } from 'antd';
import { useState } from 'react';

// 图片类型定义
interface UploadImg {
  uid: string;
  name: string;
  status: string;
  url: string;
  response?: {
    url: string;
  };
}

// 字典项接口
export interface DictionaryItem {
  id: number;
  label: string;
  value: string | number;
  sort: number;
  status: number;
  imageUrl: UploadImg[];
  remark: string;
}

// 字典接口
export interface Dictionary {
  id: number;
  name: string;
  code: string;
  description: string;
  items: DictionaryItem[];
  status: number;
  createdAt: string;
  updatedAt: string;
  action?: React.ReactNode;
}

// 图片预览组件
const ImagePreview = ({ imgUrl }: { imgUrl: UploadImg[] }) => {
  const [visible, setVisible] = useState(false);

  // 处理数组格式的图片地址或 base64 数据
  const displayUrl = Array.isArray(imgUrl) ? imgUrl[0] : imgUrl;

  // 处理可能的 base64 数据
  const processedUrl = displayUrl?.url || displayUrl?.response?.url;

  return (
    <>
      {processedUrl ? (
        <>
          <img
            src={processedUrl}
            alt="字典项图片"
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'cover',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
            onClick={() => setVisible(true)}
          />
          <Modal open={visible} footer={null} onCancel={() => setVisible(false)} width="20%">
            <img
              src={processedUrl}
              alt="字典项图片预览"
              style={{ width: '100%', height: 'auto' }}
            />
          </Modal>
        </>
      ) : (
        '无图片'
      )}
    </>
  );
};

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '字典名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入字典名称',
  },
  {
    label: '字典编码',
    name: 'code',
    component: 'Input',
    placeholder: '请输入字典编码',
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
    title: '字典名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    ellipsis: true,
    fixed: 'left',
  },
  {
    title: '字典编码',
    dataIndex: 'code',
    key: 'code',
    width: 150,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: 200,
    ellipsis: true,
  },
  {
    title: '字典项数量',
    dataIndex: 'items',
    key: 'itemCount',
    width: 120,
    render: (items: DictionaryItem[]) => (Array.isArray(items) && items.length) || 0,
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
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 180,
  },
];

// 字典项表格列配置
export const itemTableColumns: TableColumn[] = [
  {
    title: '字典项名称',
    dataIndex: 'label',
    key: 'label',
    width: 150,
  },
  {
    title: '字典项值',
    dataIndex: 'value',
    key: 'value',
    width: 150,
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
    width: 80,
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
    title: '图片',
    dataIndex: 'imageUrl',
    key: 'imageUrl',
    width: 100,
    render: (url: UploadImg[]) => <ImagePreview imgUrl={url} />,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    width: 200,
    ellipsis: true,
  },
];

// 字典表单配置
export const formList = (): BaseFormList[] => [
  {
    label: '字典名称',
    name: 'name',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入字典名称',
      maxLength: 50,
    },
  },
  {
    label: '字典编码',
    name: 'code',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入字典编码',
      maxLength: 50,
      disabled: false,
    },
  },
  {
    label: '描述',
    name: 'description',
    component: 'TextArea',
    componentProps: {
      placeholder: '请输入字典描述',
      maxLength: 200,
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
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  },
];

// 字典项表单配置
export const itemFormList = (): BaseFormList[] => [
  {
    label: '字典项名称',
    name: 'label',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入字典项名称',
      maxLength: 50,
    },
  },
  {
    label: '字典项值',
    name: 'value',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入字典项值',
      maxLength: 50,
    },
  },
  {
    label: '排序',
    name: 'sort',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入排序号',
      min: 0,
      style: { width: '100%' },
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
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  },
  {
    label: '描述',
    name: 'remark',
    component: 'TextArea',
    componentProps: {
      placeholder: '请输入备注',
      maxLength: 200,
    },
  },
];
