import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';

// 楼栋接口定义
export interface Building {
  id: number;
  name: string; // 楼栋名称
  floorCount: number; // 楼层数
  longitude: number; // 经度
  latitude: number; // 纬度
  createdAt?: string; // 创建时间
  action?: React.ReactNode;
}

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '楼栋名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入楼栋名称',
  },
];

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '编号',
    dataIndex: 'id',
    key: 'id',
    width: 80,
    fixed: 'left',
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '楼层数',
    dataIndex: 'floorCount',
    key: 'floorCount',
    width: 100,
  },
  {
    title: '经度',
    dataIndex: 'longitude',
    key: 'longitude',
    width: 120,
  },
  {
    title: '纬度',
    dataIndex: 'latitude',
    key: 'latitude',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 160,
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
    label: '楼栋名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入楼栋名称',
    rules: FORM_REQUIRED,
  },
  {
    label: '楼层数',
    name: 'floorCount',
    component: 'InputNumber',
    placeholder: '请输入楼层数',
    rules: FORM_REQUIRED,
    componentProps: {
      min: 1,
      style: { width: '100%' },
    },
  },
  {
    label: '经度',
    name: 'longitude',
    component: 'InputNumber',
    placeholder: '请输入经度',
    rules: FORM_REQUIRED,
    componentProps: {
      precision: 6,
      style: { width: '100%' },
    },
  },
  {
    label: '纬度',
    name: 'latitude',
    component: 'InputNumber',
    placeholder: '请输入纬度',
    rules: FORM_REQUIRED,
    componentProps: {
      precision: 6,
      style: { width: '100%' },
    },
  },
];
