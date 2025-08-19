import type { TFunction } from 'i18next';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { Modal } from 'antd';
import { useState } from 'react';
import MapPicker from '@/components/MapPicker';

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
  groupedCityOptions: {
    label: string;
    value: number;
  }[],
  isLoadingOptions: boolean,
): BaseSearchList[] => [
  {
    label: '店铺名称',
    name: 'store_name',
    component: 'Input',
    placeholder: '请输入店铺名称',
  },
  {
    name: 'city_id', // 这个字段的键名，最终提交给后端
    label: '选择城市',
    component: 'Select',
    style: { width: 200 },
    required: true,
    placeholder: isLoadingOptions ? '正在加载省市数据...' : '请选择或搜索城市',
    componentProps: {
      loading: isLoadingOptions,
      showSearch: true, // 开启搜索功能
      optionFilterProp: 'label', // 按选项的显示文本（城市名）进行搜索
      options: groupedCityOptions,
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
    render: (value: number) => (
      <span style={{ color: value === 1 ? 'green' : 'red' }}>{value === 1 ? '启用' : '禁用'}</span>
    ),
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
