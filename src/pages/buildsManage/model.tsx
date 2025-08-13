import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import SelectSchoolOptions from './useSelectSchoolOptions';

// 楼栋接口定义
export interface Building {
  id: number;
  name: string;
  school_id: number;
  address: string;
  longitude: number;
  latitude: number;
  status: number;
}

// 楼层接口
export interface Floor {
  id: number;
  layer: number;
  school_building_id: number;
  status: number;
}

// 学校接口
export interface School {
  id: number;
  name: string;
  address: string;
  city_name: string;
  province: string;
  city_manager_id: number;
  school_logo: number;
  logo_image_url: string;
  status: number;
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
    title: '楼栋名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '楼栋地址',
    dataIndex: 'address',
    key: 'address',
    width: 150,
    ellipsis: true,
  },
  {
    title: '经度',
    dataIndex: 'longitude',
    key: 'longitude',
    width: 120,
    ellipsis: true,
  },
  {
    title: '纬度',
    dataIndex: 'latitude',
    key: 'latitude',
    width: 120,
    ellipsis: true,
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
    label: '学校ID',
    name: 'school_id',
    component: 'Select',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请选择学校',
    },
  },
  {
    label: '楼栋名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入楼栋名称',
    rules: FORM_REQUIRED,
  },
  {
    label: '楼栋地址',
    name: 'address',
    component: 'Input',
    placeholder: '请输入楼栋地址',
    rules: FORM_REQUIRED,
  },
  {
    label: '位置',
    name: 'location',
    component: 'customize',
    componentProps: (form) => {
      return {
        initCenter: [116.397428, 39.90923],
        zoom: 15,
        onChange: (value: number[]) => {
          console.log('value', value);
          form.setFieldsValue({
            location: value,
          });
        },
      };
    },
    render: (props: any) => {
      return <MapPicker {...props} />;
    },
  },
  {
    label: '状态',
    name: 'status',
    component: 'Select',
    placeholder: '请选择状态',
    componentProps: {
      options: [
        {
          label: '启用',
          value: 1,
        },
        {
          label: '禁用',
          value: 0,
        },
      ],
    },

    rules: FORM_REQUIRED,
  },
];
