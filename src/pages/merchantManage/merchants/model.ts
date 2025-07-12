import type { TFunction } from 'i18next';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import type { ColumnsType } from 'antd/es/table';

// 商家分类数据接口
export interface Merchant {
  id: number;
  merchantName: string;
  merchantImg: File | string;
  schoolId: number;
  city: string;
  status: number;
  createdAt?: string;
  updatedAt?: string;
  action?: React.ReactNode;
  type: string; // 商家类型（校内/校外）
  address: string; // 地址
  longitude: number; // 经度
  latitude: number; // 纬度
  isDormStore: boolean; // 是否为宿舍商家
  categoryId: number; // 商家分类
  storeRecommend: number; // 1：推荐，0：不推荐
}

// 商家分类列表接口
export interface MerchantsList {
  items: Merchant[];
  total: number;
}

// 商家分类查询参数接口
export interface MerchantsQuery {
  merchantName: string;
  schoolId: number;
  city: string;
  status: number;
  type: string; // 商家类型（校内/校外）
  categoryId: number; // 商家分类
  storeRecommend: number; // 1：推荐，0：不推荐
}

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '商家名称',
    name: 'merchantName',
    component: 'Input',
    placeholder: '请输入商家名称',
  },
  {
    label: '学校',
    name: 'schoolId',
    component: 'Select',
    placeholder: '请选择学校',
  },
  {
    label: '城市',
    name: 'city',
    component: 'Input',
    placeholder: '请输入城市',
  },
  {
    label: '状态',
    name: 'status',
    component: 'Select',
    placeholder: '请选择状态',
  },
  {
    label: '商家类型',
    name: 'type',
    component: 'Select',
    placeholder: '请选择商家类型',
  },
  {
    label: '商家分类',
    name: 'categoryId',
    component: 'Select',
    placeholder: '请选择商家分类',
  },
  {
    label: '推荐状态',
    name: 'storeRecommend',
    component: 'Select',
    placeholder: '请选择推荐状态',
  },
];

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '商家名称',
    dataIndex: 'merchantName',
    key: 'merchantName',
    width: 150,
    ellipsis: true,
    fixed: 'left',
  },
  {
    title: '商家图片',
    dataIndex: 'merchantImg',
    key: 'merchantImg',
    width: 100,
  },
  {
    title: '学校ID',
    dataIndex: 'schoolId',
    key: 'schoolId',
    width: 100,
  },
  {
    title: '城市',
    dataIndex: 'city',
    key: 'city',
    width: 100,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
  },
  {
    title: '商家类型',
    dataIndex: 'type',
    key: 'type',
    width: 100,
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: 'address',
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
    dataIndex: 'isDormStore',
    key: 'isDormStore',
    width: 100,
  },
  {
    title: '商家分类',
    dataIndex: 'categoryId',
    key: 'categoryId',
    width: 100,
  },
  {
    title: '推荐状态',
    dataIndex: 'storeRecommend',
    key: 'storeRecommend',
    width: 100,
  },
];

// 表单配置项
export const formList = (): BaseFormList[] => [
  {
    label: '商家名称',
    name: 'merchantName',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入商家名称',
      maxLength: 50,
    },
  },
  {
    label: '商家图片',
    name: 'merchantImg',
    rules: FORM_REQUIRED,
    component: 'Upload',
    componentProps: {
      listType: 'picture-card',
      maxCount: 1,
      accept: 'image/*',
    },
  },
  {
    label: '学校',
    name: 'schoolId',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: {
      placeholder: '请选择学校',
      options: [
        // 需要根据实际数据填充学校选项
        // { label: '学校名称', value: 1 }
      ],
    },
  },
  {
    label: '城市',
    name: 'city',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入城市名称',
      maxLength: 20,
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
    name: 'address',
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
    name: 'isDormStore',
    component: 'Switch',
    componentProps: {
      options: [
        { label: '是', value: 1 },
        { label: '否', value: 0 },
      ],
    },
  },
  {
    label: '商家分类',
    name: 'categoryId',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: {
      placeholder: '请选择商家分类',
      options: [
        // 需要根据实际数据填充分类选项
        // { label: '分类名称', value: 1 }
      ],
    },
  },
  {
    label: '推荐状态',
    name: 'storeRecommend',
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
];
