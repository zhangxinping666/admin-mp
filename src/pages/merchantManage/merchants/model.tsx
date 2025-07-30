import type { TFunction } from 'i18next';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { message, Modal } from 'antd';
import { useState } from 'react';

// 添加图片预览组件

type uploadImg = {
  uid: string;
  name: string;
  status: string;
  url: string;
  response?: {
    url: string;
  };
};

const ImagePreview = ({ imgUrl }: { imgUrl: uploadImg[] }) => {
  const [visible, setVisible] = useState(false);

  // 处理数组格式的图片地址或 base64 数据
  const displayUrl = Array.isArray(imgUrl) ? imgUrl[0] : imgUrl;

  // 处理可能的 base64 数据
  const processedUrl = displayUrl?.url || displayUrl?.response?.url;
  console.log('processedUrl', processedUrl);
  console.log('displayUrl', displayUrl);

  return (
    <>
      {processedUrl ? (
        <>
          <img
            src={processedUrl}
            alt="商家图片"
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
            <img src={processedUrl} alt="商家图片预览" style={{ width: '100%', height: 'auto' }} />
          </Modal>
        </>
      ) : (
        '无图片'
      )}
    </>
  );
};
// 商家数据接口
export interface Merchant {
  category?: number;
  city_id?: number;
  closed_hour?: string;
  id: number;
  is_dormitory_store?: boolean;
  latitude?: number;
  longitude?: number;
  merchant?: string;
  merchant_id?: number;
  merchant_name?: string;
  open_hour?: string;
  phone?: string;
  recommend?: number;
  school_id?: number;
  site?: string;
  status?: number;
  store_name?: string;
  type?: string;
  [property: string]: any;
}

// 商家列表接口
export interface MerchantsList {
  items: Merchant[];
  total: number;
}

// 商家查询参数接口
export interface MerchantsQuery {
  city_id: number;
  merchant_name: string;
  page: number;
  page_size: number;
}

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '商家名称',
    name: 'merchant_name',
    component: 'Input',
    placeholder: '请输入商家名称',
  },
  {
    label: '城市',
    name: 'city_id',
    component: 'Select',
    placeholder: '请选择城市',
  },
];

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 100,
  },
  {
    title: '店铺名称',
    dataIndex: 'store_name',
    key: 'store_name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '商家名称',
    dataIndex: 'merchant_name',
    key: 'merchant_name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '商家图片',
    dataIndex: 'merchant_img',
    key: 'merchant_img',
    width: 100,
    render: (imgUrl: string[]) => {
      // 转换数据格式以适配现有组件
      const imgData = Array.isArray(imgUrl)
        ? imgUrl.map((url, index) => ({
            uid: `${index}`,
            name: `image-${index}`,
            status: 'done',
            url: url,
          }))
        : [];
      return <ImagePreview imgUrl={imgData} />;
    },
  },
  {
    title: '学校ID',
    dataIndex: 'school_id',
    key: 'school_id',
    width: 100,
  },
  {
    title: '城市ID',
    dataIndex: 'city_id',
    key: 'city_id',
    width: 100,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    render: (value: number) => {
      return value === 1 ? '启用' : '禁用';
    },
  },
  {
    title: '商家类型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
  },
  {
    title: '地址',
    dataIndex: 'site',
    key: 'site',
    width: 200,
    ellipsis: true,
  },
  {
    title: '经度',
    dataIndex: 'longitude',
    key: 'longitude',
    width: 100,
  },
  {
    title: '纬度',
    dataIndex: 'latitude',
    key: 'latitude',
    width: 100,
  },
  {
    title: '宿舍商家',
    dataIndex: 'is_dormitory_store',
    key: 'is_dormitory_store',
    width: 100,
    render: (value: boolean) => {
      return value ? '是' : '否';
    },
  },
  {
    title: '商家分类',
    dataIndex: 'category',
    key: 'category',
    width: 100,
  },
  {
    title: '推荐状态',
    dataIndex: 'recommend',
    key: 'recommend',
    width: 100,
    render: (value: number) => {
      return value === 1 ? '推荐' : '不推荐';
    },
  },
  {
    title: '联系电话',
    dataIndex: 'phone',
    key: 'phone',
    width: 150,
  },
  {
    title: '营业开始时间',
    dataIndex: 'open_hour',
    key: 'open_hour',
    width: 150,
  },
  {
    title: '营业结束时间',
    dataIndex: 'closed_hour',
    key: 'closed_hour',
    width: 150,
  },
];

// 表单配置项
export const formList = (): BaseFormList[] => [
  {
    label: 'ID',
    name: 'id',
    component: 'InputNumber',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请输入ID',
      style: { width: '100%' },
      disabled: true,
    },
  },
  {
    label: '店铺名称',
    name: 'store_name',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入店铺名称',
      maxLength: 50,
    },
  },
  {
    label: '商家名称',
    name: 'merchant_name',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入商家名称',
      maxLength: 50,
    },
  },
  {
    label: '商家图片',
    name: 'merchant_img',
    component: 'Upload',
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
    label: '学校ID',
    name: 'school_id',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入学校ID',
      style: { width: '100%' },
    },
  },
  {
    label: '城市ID',
    name: 'city_id',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入城市ID',
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
    label: '商家类型',
    name: 'type',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: {
      placeholder: '请选择商家类型',
      options: [
        { label: '校内', value: '校内' },
        { label: '校外', value: '校外' },
      ],
    },
  },
  {
    label: '地址',
    name: 'site',
    rules: FORM_REQUIRED,
    component: 'TextArea',
    componentProps: {
      placeholder: '请输入详细地址',
      maxLength: 200,
    },
  },
  {
    label: '经度',
    name: 'longitude',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入经度',
      min: -180,
      max: 180,
      step: 0.000001,
      precision: 6,
      style: { width: '100%' },
    },
  },
  {
    label: '纬度',
    name: 'latitude',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入纬度',
      min: -90,
      max: 90,
      step: 0.000001,
      precision: 6,
      style: { width: '100%' },
    },
  },
  {
    label: '是否为宿舍商家',
    name: 'is_dormitory_store',
    component: 'Switch',
    componentProps: {
      checked: false,
    },
  },
  {
    label: '商家分类',
    name: 'category',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入商家分类ID',
      style: { width: '100%' },
    },
  },
  {
    label: '推荐状态',
    name: 'recommend',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: {
      placeholder: '请选择推荐状态',
      options: [
        { label: '推荐', value: 1 },
        { label: '不推荐', value: 0 },
      ],
    },
  },
  {
    label: '联系电话',
    name: 'phone',
    component: 'Input',
    componentProps: {
      placeholder: '请输入联系电话',
      maxLength: 20,
    },
  },
  {
    label: '营业开始时间',
    name: 'open_hour',
    component: 'TimePicker',
    componentProps: {
      placeholder: '请选择营业开始时间',
      format: 'HH:mm',
    },
  },
  {
    label: '营业结束时间',
    name: 'closed_hour',
    component: 'TimePicker',
    componentProps: {
      placeholder: '请选择营业结束时间',
      format: 'HH:mm',
    },
  },
];
