import type { TFunction } from 'i18next';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { Modal } from 'antd';
import { useState } from 'react';
import MapPicker from '@/components/MapPicker';
import LocationRenderer from '@/shared/components/LocationRenderer';
import dayjs from 'dayjs';
import { FieldConfig } from '@/shared/components/DetailModal';

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

const ImagePreview = ({
  imgUrl,
  baseUrl = 'http://192.168.10.7:8082',
}: {
  imgUrl: uploadImg[];
  baseUrl?: string;
}) => {
  const [visible, setVisible] = useState(false);

  // 获取完整图片URL的函数
  const getFullImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // 处理数组格式的图片地址或 base64 数据
  const displayUrl = Array.isArray(imgUrl) ? imgUrl[0] : imgUrl;

  // 处理可能的 base64 数据
  const rawUrl = displayUrl?.url || displayUrl?.response?.url || '';
  const processedUrl = getFullImageUrl(rawUrl);
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
  is_dormitory_store?: number | boolean;
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
export const searchList = (
  options: any,
  categoryOptions: any,
  userInfo?: { role_id: number; city_id: number }
): BaseSearchList[] => {
  // 获取用户角色ID
  const roleId = userInfo?.role_id;

  // 基础搜索字段（所有角色都有）
  const baseSearchFields: BaseSearchList[] = [
    {
      label: '店铺名称',
      name: 'store_name',
      component: 'Input',
      placeholder: '请输入店铺名称',
    },
  ];

  // 地区搜索字段（根据角色显示）
  const locationSearchFields: BaseSearchList[] = [];

  if (roleId === 2) {
    // 超级管理员：显示完整的省市学校选择
    locationSearchFields.push(
      {
        label: '地区',
        name: 'province',
        component: 'Select',
        wrapperWidth: 180,
        componentProps: (form) => ({
          options: options.provinceOptions,
          placeholder: '请选择省份',
          allowClear: true,
          onChange: async (value: string) => {
            form.setFieldsValue({ city_id: undefined, school_id: undefined });
            await options.loadCities(value);
            form.validateFields(['city_id', 'school_id']);
          },
        }),
      },
      {
        label: '',
        name: 'city_id',
        component: 'Select',
        wrapperWidth: 180,
        componentProps: (form) => {
          const provinceValue = form.getFieldValue('province');
          return {
            placeholder: '请选择城市',
            allowClear: true,
            disabled: !provinceValue,
            options: options.cityOptions,
            onChange: async (value: string) => {
              form.setFieldsValue({ school_id: undefined });
              await options.loadSchools(value);
              form.validateFields(['school_id']);
            },
          };
        },
      },
      {
        label: '',
        name: 'school_id',
        component: 'Select',
        placeholder: '请选择学校',
        componentProps: (form) => {
          const cityValue = form.getFieldValue('city_id');
          return {
            placeholder: '请选择学校',
            allowClear: true,
            disabled: !cityValue,
            options: options.schoolOptions,
          };
        },
      }
    );
  } else if (roleId === 5) {
    // 城市运营商：只显示学校选择（会自动加载所属城市的学校）
    locationSearchFields.push({
      label: '学校',
      name: 'school_id',
      component: 'Select',
      wrapperWidth: 180,
      componentProps: {
        placeholder: '请选择学校',
        allowClear: true,
        options: options.schoolOptions,
      },
    });
  }
  // role_id=4（团长）不显示任何地区字段

  // 其他搜索字段（所有角色都有）
  const otherSearchFields: BaseSearchList[] = [
    {
      label: '类别',
      name: 'category',
      component: 'Select',
      componentProps: {
        placeholder: '请选择类别',
        allowClear: true,
        options: categoryOptions,
      },
    },
    {
      label: '状态',
      component: 'Select',
      name: 'status',
      componentProps: {
        placeholder: '请选择状态',
        allowClear: true,
        options: [
          { label: '全部', value: 0 },
          { label: '启用', value: 1 },
          { label: '禁用', value: 2 },
        ],
      },
    },
  ];

  return [...baseSearchFields, ...locationSearchFields, ...otherSearchFields];
};

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '店铺名称',
    dataIndex: 'store_name',
    key: 'store_name',
    ellipsis: true,
  },
  {
    title: '商家名称',
    dataIndex: 'merchant_name',
    key: 'merchant_name',
    ellipsis: true,
  },

  {
    title: '学校名称',
    dataIndex: 'school_name',
    key: 'school_name',
  },
  {
    title: '城市名称',
    dataIndex: 'city_name',
    key: 'city_name',
  },
  {
    title: '省份',
    dataIndex: 'province',
    key: 'province',
  },
  {
    title: '校内/校外',
    dataIndex: 'type',
    key: 'type',
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
    title: '是否是宿舍小店',
    dataIndex: 'is_dormitory_store',
    key: 'is_dormitory_store',
    render: (value: boolean) => {
      return value ? '是' : '否';
    },
  },
  {
    title: '店铺类别',
    dataIndex: 'category',
    key: 'category',
  },
  {
    title: '推荐状态',
    dataIndex: 'recommend',
    key: 'recommend',
    render: (value: number) => {
      return value === 1 ? '推荐' : '不推荐';
    },
  },
  {
    title: '联系电话',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: '营业时间',
    dataIndex: 'timer_range',
    key: 'timer_range',
    render: (value: string[]) => {
      console.log('营业时间', value);
      return value[0] + ' ~ ' + value[1];
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (value: number) => {
      return value === 1 ? '启用' : '禁用';
    },
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    render: (value: string) => {
      return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
    },
  },
];

// 表单配置项
export const formList = ({
  categoryOptions,
}: {
  groupedCityOptions?: any;
  isLoadingOptions?: boolean;
  categoryOptions: any;
  timer_range?: string[];
}): BaseFormList[] => [
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
      label: '位置',
      name: 'location',
      rules: FORM_REQUIRED,
      component: 'customize',
      componentProps: (form) => {
        // 获取当前表单的所有值
        const formValues = form.getFieldsValue();
        // 如果是编辑模式且有经纬度数据，使用商家的实际位置作为地图中心
        // 否则使用默认的北京坐标
        let initCenter: [number, number] = [116.397428, 39.90923]; // 默认北京坐标
        if (
          formValues.longitude &&
          formValues.latitude &&
          typeof formValues.longitude === 'number' &&
          typeof formValues.latitude === 'number'
        ) {
          initCenter = [formValues.longitude, formValues.latitude];
        }

        return {
          zoom: 15,
          style: {
            width: '100%',
            height: 400,
          },
          onSave: (data: any) => {
            console.log('value', data);
            form.setFieldsValue({
              location: data,
            });
          },
          initValue: () => {
            return form.getFieldValue('location') || initCenter;
          },
        };
      },
      render: (props: any) => {
        return <MapPicker {...props} />;
      },
    },
    {
      label: '是否为宿舍商家',
      name: 'is_dormitory_store',
      rules: FORM_REQUIRED,
      component: 'Select',
      componentProps: {
        placeholder: '请选择是否为宿舍商家',
        options: [
          { label: '是', value: 1 },
          { label: '否', value: 0 },
        ],
      },
    },
    {
      label: '商家分类',
      name: 'category',
      rules: FORM_REQUIRED,
      component: 'Select',
      componentProps: {
        placeholder: '请选择商家分类',
        style: { width: '100%' },
        options: categoryOptions,
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
      rules: PHONE_RULE(true, '请输入正确的联系电话'),
      component: 'Input',
      componentProps: {
        placeholder: '请输入联系电话',
        maxLength: 20,
        disabled: true,
      },
    },
    {
      label: '营业时间',
      name: 'time_range',
      rules: FORM_REQUIRED,
      component: 'TimeRangePicker',
      componentProps: {
        placeholder: '请选择营业时间',
        format: 'HH:mm',
      },
    },
  ];

export const merchantDetailConfig: FieldConfig[] = [
  // 图片（根据 is_dorm_store 过滤在配置里做）
  {
    key: 'merchantDetail.storefront_image',
    label: '门店照片',
    group: '商户信息',
    isImage: true,
  },
  {
    key: 'merchantDetail.business_license_image',
    label: '营业执照',
    group: '商户信息',
    isImage: true,
  },
  {
    key: 'merchantDetail.food_license_image',
    label: '食品经营许可证',
    group: '商户信息',
    isImage: true,
  },
  {
    key: 'merchantDetail.medical_certificate_image',
    label: '健康证',
    group: '商户信息',
    isImage: true,
  },
  {
    key: 'merchantDetail.student_id_card_image',
    label: '学生证',
    group: '商户信息',
    isImage: true,
  },
  {
    key: 'merchantDetail.identity_card_image',
    label: '身份证',
    group: '商户信息',
    isImage: true,
  },
];
