import type { TFunction } from 'i18next';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { message, Modal } from 'antd';
import { useState } from 'react';
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

// 余额明细数据接口
export interface BalanceRecord {
  id: number; // 编号
  category: string; // 类别
  amount: number; // 金额
  transactionNo: string; // 交易流水号
  orderNo: string; // 订单号
  transactionType: 'income' | 'expense'; // 交易收支（收入/支出）
  voucherUrl: uploadImg[]; // 交易凭证
  status: string; // 状态
  initialBalance: number; // 期初余额
  finalBalance: number; // 期末余额
  imageUrl: uploadImg[]; // 图片
  createdAt: string; // 创建时间
  action?: React.ReactNode;
}

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '交易流水号',
    name: 'transactionNo',
    component: 'Input',
    placeholder: '请输入交易流水号',
  },
  {
    label: '订单号',
    name: 'orderNo',
    component: 'Input',
    placeholder: '请输入订单号',
  },
  {
    label: '交易类型',
    name: 'transactionType',
    component: 'Select',
    placeholder: '请选择交易类型',
    componentProps: {
      options: [
        { label: '收入', value: 'income' },
        { label: '支出', value: 'expense' },
      ],
    },
  },
  {
    label: '状态',
    name: 'status',
    component: 'Select',
    placeholder: '请选择状态',
    componentProps: {
      options: [
        { label: '成功', value: 'success' },
        { label: '失败', value: 'failed' },
        { label: '处理中', value: 'processing' },
      ],
    },
  },
  {
    label: '交易时间',
    name: 'createdAt',
    component: 'RangePicker',
    placeholder: '请选择交易时间范围',
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
    title: '类别',
    dataIndex: 'category',
    key: 'category',
    width: 100,
  },
  {
    title: '金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 100,
    render: (value: number) => `¥${value.toFixed(2)}`,
  },
  {
    title: '交易流水号',
    dataIndex: 'transactionNo',
    key: 'transactionNo',
    width: 180,
    ellipsis: true,
  },
  {
    title: '订单号',
    dataIndex: 'orderNo',
    key: 'orderNo',
    width: 180,
    ellipsis: true,
  },
  {
    title: '交易收支',
    dataIndex: 'transactionType',
    key: 'transactionType',
    width: 100,
    render: (value: 'income' | 'expense') => (
      <span style={{ color: value === 'income' ? 'green' : 'red' }}>
        {value === 'income' ? '收入' : '支出'}
      </span>
    ),
  },
  {
    title: '交易凭证',
    dataIndex: 'voucherUrl',
    key: 'voucherUrl',
    width: 100,
    render: (url: uploadImg[]) => <ImagePreview imageUrl={url} alt="交易凭证" />,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (value: string) => {
      let color = '';
      switch (value) {
        case 'success':
          color = 'green';
          break;
        case 'failed':
          color = 'red';
          break;
        case 'processing':
          color = 'orange';
          break;
        default:
          color = 'black';
      }
      return (
        <span style={{ color }}>
          {value === 'success' ? '成功' : value === 'failed' ? '失败' : '处理中'}
        </span>
      );
    },
  },
  {
    title: '期初余额',
    dataIndex: 'initialBalance',
    key: 'initialBalance',
    width: 120,
    render: (value: number) => `¥${value.toFixed(2)}`,
  },
  {
    title: '期末余额',
    dataIndex: 'finalBalance',
    key: 'finalBalance',
    width: 120,
    render: (value: number) => `¥${value.toFixed(2)}`,
  },
  {
    title: '图片',
    dataIndex: 'imageUrl',
    key: 'imageUrl',
    width: 100,
    render: (url: uploadImg[]) => <ImagePreview imageUrl={url} alt="图片" />,
  },
  {
    title: '交易时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
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
    label: '交易凭证',
    name: 'voucherUrl',
    component: 'ImageUpload',
    componentProps: {
      accept: 'image/png, image/jpeg, image/jpg',
      listType: 'picture-card',
      beforeUpload: (file: File) => {
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          message.error('图片大小不能超过2MB!');
          return false;
        }
        return true;
      },
      customRequest: (options: any) => {
        const { file, onSuccess, onError } = options;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setTimeout(() => {
            onSuccess({ url: reader.result });
          }, 500);
        };
        reader.onerror = () => {
          onError(new Error('读取文件失败'));
        };
      },
      maxCount: 1,
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
  {
    label: '图片',
    name: 'imageUrl',
    component: 'ImageUpload',
    componentProps: {
      accept: 'image/png, image/jpeg, image/jpg',
      listType: 'picture-card',
      beforeUpload: (file: File) => {
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          message.error('图片大小不能超过2MB!');
          return false;
        }
        return true;
      },
      customRequest: (options: any) => {
        const { file, onSuccess, onError } = options;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setTimeout(() => {
            onSuccess({ url: reader.result });
          }, 500);
        };
        reader.onerror = () => {
          onError(new Error('读取文件失败'));
        };
      },
      maxCount: 1,
    },
  },
];
