import { useState, useEffect, useCallback } from 'react';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { EnhancedImageUploader } from '@/shared/components/EnhancedImageUploader';
import AddressWithLocation from './components/AddressWithLocation';
import MapPicker from '@/components/MapPicker';
import dayjs from 'dayjs';

// 学校定义
export interface School {
  id: number;
  name: string;
  address: string;
  city_id: number;
  school_logo: number;
  logo_image_url: string;
  city_name: string;
  province: string;
  latitude: number;
  longitude: number;
  store_numbers: number;
  created_time: string;
  status: number;
}

export interface addSchoolForm {
  name: string;
  address: string;
  city_id: number;
  logo_image_url: string;
  latitude?: number;
  longitude?: number;
  status: number;
}

export interface updateSchoolForm {
  id: number;
  name: string;
  address: string;
  city_id: number;
  logo_image_url: string;
  latitude?: number;
  longitude?: number;
  status: number;
}

export interface Pagination {
  page: number;
  pages: number;
  pageSize: number;
  total: number;
}

export interface PaginationParams {
  page: number;
  page_size: number;
}

export interface SchoolListResult {
  code: number;
  message: string; // 注意：根据您的JSON数据，这里是 message (单数)
  data: {
    list: School[];
    page: number;
    page_size: number;
    pages: number;
    total: number;
  };
}
type OptionType = { label: string; value: string | number };
// 默认“全部”选项
const DEFAULT_ALL_OPTION = (label = '全部', value: string | number = '全部'): OptionType => ({
  label,
  value,
});
import { getProvinces, getCitiesByProvince } from '@/servers/trade-blotter/location';
export const useLocationOptions = () => {
  const [provinceOptions, setProvinceOptions] = useState<OptionType[]>([DEFAULT_ALL_OPTION()]);
  const [cityOptions, setCityOptions] = useState<OptionType[]>([]);

  // 加载省份
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const { data } = await getProvinces(0);
        if (Array.isArray(data) && data.length > 0) {
          setProvinceOptions([
            DEFAULT_ALL_OPTION(),
            ...data.map((p) => ({ label: p.name, value: p.city_id })),
          ]);
        }
      } catch (error) {
        console.error('加载省份失败', error);
      }
    };
    loadProvinces();
  }, []);

  // 加载城市
  const loadCities = useCallback(async (province: string) => {
    console.log(province);
    if (!province || province === '全部') {
      setCityOptions([]);
      return;
    }
    try {
      const { data } = await getCitiesByProvince(Number(province));
      setCityOptions([
        DEFAULT_ALL_OPTION('全部', 0),
        ...(Array.isArray(data) ? data.map((c) => ({ label: c.name, value: c.city_id })) : []),
      ]);
    } catch (error) {
      console.error('加载城市失败', error);
      setCityOptions([DEFAULT_ALL_OPTION('全部', 0)]);
    }
  }, []);

  return {
    provinceOptions,
    cityOptions,
    loadCities,
  };
};
// 搜索配置
export const searchList = (options: ReturnType<typeof useLocationOptions>): BaseSearchList[] => [
  {
    label: '学校名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入学校名称',
  },
  {
    label: '地区',
    name: 'pid',
    component: 'Select',
    wrapperWidth: 180, // 添加固定宽度
    componentProps: (form) => ({
      options: options.provinceOptions,
      placeholder: '请选择省份',
      allowClear: true,
      onChange: async (value: string) => {
        // 清空城市和学校选择
        form.setFieldsValue({ city: undefined, school: undefined });
        await options.loadCities(value);
        form.validateFields(['city', 'school']);
      },
    }),
  },
  {
    label: '',
    name: 'city_id',
    component: 'Select',
    wrapperWidth: 180, // 添加固定宽度
    componentProps: (form) => {
      const provinceValue = form.getFieldValue('pid');
      return {
        placeholder: '请选择城市',
        allowClear: true,
        disabled: !provinceValue,
        options: options.cityOptions,
        onChange: async (value: string) => {
          form.setFieldsValue({ school: undefined });
        },
      };
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
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    ellipsis: true,
  },
  {
    title: 'logo',
    dataIndex: 'logo_image_url',
    key: 'logo_image_url',
    width: 100,
    render: (logo_image_url: any) => {
      const getFullImageUrl = (url: any) => {
        if (!url) return '';
        // 确保url是字符串类型
        const urlStr = String(url);
        if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
          return urlStr;
        }
        return `http://192.168.10.7:8082${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
      };

      const displayUrl = getFullImageUrl(logo_image_url);

      return displayUrl ? (
        <img
          src={displayUrl}
          alt="学校logo"
          style={{
            width: '50px',
            height: '50px',
            objectFit: 'cover',
            borderRadius: '4px',
          }}
        />
      ) : (
        <span style={{ color: '#999' }}>无logo</span>
      );
    },
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: 'address',
    width: 200,
    ellipsis: true,
    render: (_: any, record: School) => <AddressWithLocation record={record} />,
  },
  {
    title: '所属省份',
    dataIndex: 'province',
    key: 'province',
    width: 100,
  },
  {
    title: '所属城市',
    dataIndex: 'city_name',
    key: 'city_name',
    width: 100,
  },
  {
    title: '商家数量',
    dataIndex: 'store_numbers',
    key: 'store_numbers',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'created_time',
    key: 'created_time',
    width: 180,
    render: (value: string) => {
      if (value) {
        return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
      }
      return '-';
    },
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
export const formList = ({
  groupedCityOptions,
  isLoadingOptions,
}: {
  // 建议使用更具体的类型，但 any[] 也能工作
  groupedCityOptions: any[];
  isLoadingOptions: boolean;
}): BaseFormList[] => [
  {
    label: '名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入学校名称',
    rules: FORM_REQUIRED,
  },
  {
    label: 'logo',
    name: 'school_logo',
    component: 'customize',
    rules: FORM_REQUIRED,
    render: (props: any) => {
      const { value, onChange } = props;
      return (
        <EnhancedImageUploader
          value={value}
          onChange={onChange}
          maxSize={2}
          baseUrl="http://192.168.10.7:8082"
        />
      );
    },
  },
  {
    label: '地址',
    name: 'address',
    component: 'Input',
    placeholder: '请输入学校地址（选择地图位置时会自动更新）',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请输入学校地址（选择地图位置时会自动更新）',
    },
  },
  {
    name: 'city_id', // 这个字段的键名，最终提交给后端
    label: '城市',
    component: 'Select',
    rules: FORM_REQUIRED,
    placeholder: isLoadingOptions ? '正在加载省市数据...' : '请选择城市',
    componentProps: {
      loading: isLoadingOptions,
      showSearch: true, // 开启搜索功能
      optionFilterProp: 'label', // 按选项的显示文本进行搜索
      options: groupedCityOptions, // 使用分组选项
      dropdownMatchSelectWidth: false, // 下拉框宽度自适应
      style: { width: '100%' },
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
      const locationValue = form.getFieldValue('location');

      // 如果是编辑模式且有经纬度数据，使用学校的实际位置作为地图中心
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
        value: locationValue, // 传递当前的location值作为受控组件的value
        center: initCenter,
        zoom: 15,
        style: {
          width: '100%',
          height: 400,
        },
        // 处理地图搜索选择（包含地址信息）
        onSave: (data: any) => {
          console.log('===== 地图搜索选择 =====');
          console.log('搜索数据:', data);
          const newValues = {
            location: [data.location.lng, data.location.lat],
            // 如果选择了具体地点，自动更新地址字段
            address: data.address || data.name || form.getFieldValue('address'),
            longitude: data.location.lng,
            latitude: data.location.lat,
          };
          console.log('即将设置的新值:', newValues);
          form.setFieldsValue(newValues);
          console.log(
            '设置后的表单值:',
            form.getFieldsValue(['location', 'longitude', 'latitude', 'address']),
          );
        },
        // 处理地图拖拽选择（只有经纬度）
        onChange: (value: number[]) => {
          console.log('新位置:', value);
          const newValues = {
            location: value,
            longitude: value[0],
            latitude: value[1],
          };
          console.log('即将设置的新值:', newValues);
          form.setFieldsValue(newValues);
          console.log(
            '设置后的表单值:',
            form.getFieldsValue(['location', 'longitude', 'latitude']),
          );
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
  // 隐藏的经纬度字段，用于存储实际的经纬度值
  {
    label: '',
    name: 'longitude',
    component: 'Input',
    componentProps: {
      type: 'hidden',
    },
    hidden: true,
    wrapperProps: {
      style: { display: 'none' },
    },
  },
  {
    label: '',
    name: 'latitude',
    component: 'Input',
    componentProps: {
      type: 'hidden',
    },
    hidden: true,
    wrapperProps: {
      style: { display: 'none' },
    },
  },
  {
    label: '状态',
    name: 'status',
    component: 'Select',
    placeholder: '请选择状态',
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 2 },
      ],
    },
  },
];
