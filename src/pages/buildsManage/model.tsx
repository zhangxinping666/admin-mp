import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { Space, Modal, Button } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import LocationRenderer from '@/shared/components/LocationRenderer';

// 楼栋接口定义
export interface Building {
  id: number;
  name: string;
  school_id: number | string;
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
export const searchList = (
  role_id: number,
  schoolOptions: any[],
  schoolOptionsLoading: boolean,
): BaseSearchList[] => {
  let list: BaseSearchList[] = [];
  if (role_id != 4) {
    list = [
      {
        label: '名称',
        name: 'name',
        component: 'Input',
        placeholder: '请输入名称',
      },
      {
        label: '学校',
        name: 'school_id',
        component: 'Select',
        componentProps: {
          placeholder: '请选择学校',
          options: schoolOptions,
          loading: schoolOptionsLoading,
          showSearch: true,
          optionFilterProp: 'label',
        },
      },
      {
        component: 'Select',
        name: 'status',
        label: '状态',
        componentProps: {
          options: [
            { label: '全部', value: 0 },
            { label: '启用', value: 1 },
            { label: '禁用', value: 2 },
          ],
        },
      },
    ];
  }

  return list;
};

// 表格列配置
export const tableColumns = (role_id: number): TableColumn[] => {
  let list: TableColumn[] = [];

  if (role_id != 4) {
    list = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        ellipsis: true,
      },
      {
        title: '所属学校',
        dataIndex: 'school_name',
        key: 'school_name',
        ellipsis: true,
      },
      {
        title: '层数',
        dataIndex: 'layer_nums',
        key: 'layer_nums',
        ellipsis: true,
      },
      {
        title: '地址',
        dataIndex: 'location',
        key: 'location',
        ellipsis: true,
        render: (value: { address: string; longitude: number; latitude: number }) => {
          return <LocationRenderer value={value} />;
        },
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        render: (value: number) => (
          <span style={{ color: value === 1 ? 'green' : 'red' }}>
            {value === 1 ? '启用' : '禁用'}
          </span>
        ),
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        fixed: 'right',
      },
    ];
  }
  return list;
};
// 表单配置
export const formList = (): BaseFormList[] => [
  {
    label: '名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入楼栋名称',
    rules: FORM_REQUIRED,
  },
  {
    label: '楼层',
    name: 'layer_nums',
    component: 'InputNumber',
    placeholder: '请输入楼层',
    rules: FORM_REQUIRED,
  },
  {
    label: '详细地址',
    name: 'address',
    component: 'Input',
    placeholder: '请输入详细地址',
    rules: FORM_REQUIRED,
  },
  {
    label: '位置',
    name: 'location',
    component: 'customize',
    rules: FORM_REQUIRED,
    componentProps: (form) => {
      return {
        zoom: 15,
        onSave: (data: any) => {
          console.log('value', data);
          form.setFieldsValue({
            location: [data.location.lng, data.location.lat],
          });
        },
        initValue: () => {
          const location = form.getFieldValue('location');
          console.log('地图定位', location);
          if (location) {
            return [location.longitude, location.latitude];
          }
          return [0, 0];
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
          value: 2,
        },
      ],
    },

    rules: FORM_REQUIRED,
  },
];
// 新增配置
export const addFormList = (
  role_id: number,
  schoolOptions: any[],
  schoolOptionsLoading: boolean,
): BaseFormList[] => {
  let list: BaseFormList[] = [];
  if (role_id === 4) {
    list = [
      {
        label: '名称',
        name: 'name',
        component: 'Input',
        placeholder: '请输入楼栋名称',
        rules: FORM_REQUIRED,
      },
      {
        label: '层数',
        name: 'layer_nums',
        component: 'InputNumber',
        placeholder: '请输入层数',
        rules: FORM_REQUIRED,
      },
      {
        label: '位置',
        name: 'location',
        component: 'customize',
        rules: FORM_REQUIRED,
        componentProps: (form) => {
          return {
            zoom: 15,
            onSave: (data: any) => {
              console.log('value', data);
              form.setFieldsValue({
                location: [data.location.lng, data.location.lat],
              });
            },
            initValue: () => {
              return form.getFieldValue('location');
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
              value: 2,
            },
          ],
        },

        rules: FORM_REQUIRED,
      },
    ];
  } else {
    list = [
      {
        label: '名称',
        name: 'name',
        component: 'Input',
        placeholder: '请输入楼栋名称',
        rules: FORM_REQUIRED,
      },
      {
        label: '学校',
        name: 'school_id',
        component: 'Select',
        rules: FORM_REQUIRED,
        componentProps: {
          placeholder: '请选择学校',
          options: schoolOptions,
          loading: schoolOptionsLoading,
          showSearch: true,
          optionFilterProp: 'label',
        },
      },
      {
        label: '层数',
        name: 'layer_nums',
        component: 'InputNumber',
        placeholder: '请输入层数',
        rules: FORM_REQUIRED,
      },
      {
        label: '详细地址',
        name: 'address',
        component: 'Input',
        placeholder: '请输入地址',
        rules: FORM_REQUIRED,
      },
      {
        label: '位置',
        name: 'location',
        component: 'customize',
        rules: FORM_REQUIRED,
        componentProps: (form) => {
          return {
            zoom: 15,
            onSave: (data: any) => {
              console.log('value', data);
              form.setFieldsValue({
                location: {
                  address: data.address,

                  longitude: data.location.lng,
                  latitude: data.location.lat,
                },
              });
            },
            initValue: () => {
              return form.getFieldValue('location');
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
              value: 2,
            },
          ],
        },

        rules: FORM_REQUIRED,
      },
    ];
  }
  return list;
};
