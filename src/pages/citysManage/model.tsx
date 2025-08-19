import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { useState, useEffect, useCallback } from 'react';
import { getProvinces, getCitiesByProvince } from '@/servers/trade-blotter/location';

// 楼栋接口定义
export interface City {
  id: number;
  name: string;
  phone: string;
  password?: string;
  city_name: string;
  city_id: number;
  province: string;
  status: number;
  account_id: string;
  created_at: string;
}

export interface getCityResult {
  code: number;
  message: string; // 注意：根据您的JSON数据，这里是 message (单数)
  data: {
    list: City[];
    pagination: Pagination;
  };
}

export interface addCityForm {
  name: string;
  phone: number;
  password: string;
  city_name: string;
  status: number;
}

export interface updateCityForm {
  id: number;
  name: string;
  phone: number;
  password: string;
  city_name: string;
  status: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface CityListResult {
  code: number;
  message: string; // 注意：根据您的JSON数据，这里是 message (单数)
  data: {
    list: City[];
    page: number;
    page_size: number;
    pages: number;
    total: number;
  };
}

type OptionType = { label: string; value: string | number };

// 默认"全部"选项
const DEFAULT_ALL_OPTION = (label = '全部', value: string | number = '全部'): OptionType => ({
  label,
  value,
});

// 省市选项Hook
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
    label: '地区',
    name: 'province',
    component: 'Select',
    wrapperWidth: 180,
    componentProps: (form) => ({
      options: options.provinceOptions,
      placeholder: '请选择省份',
      allowClear: true,
      onChange: async (value: string) => {
        // 清空城市选择
        form.setFieldsValue({ city: undefined });
        await options.loadCities(value);
        form.validateFields(['city']);
      },
    }),
  },
  {
    label: '',
    name: 'city',
    component: 'Select',
    wrapperWidth: 180,
    componentProps: (form) => {
      const provinceValue = form.getFieldValue('province');
      return {
        placeholder: '请选择城市',
        allowClear: true,
        disabled: !provinceValue,
        options: options.cityOptions,
      };
    },
  },
  {
    label: '电话',
    name: 'phone',
    component: 'Input',
    placeholder: '请输入电话',
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
    title: '账号',
    dataIndex: 'account_id',
    key: 'account_id',
    width: 80,
  },

  {
    title: '电话',
    dataIndex: 'phone',
    key: 'phone',
    width: 100,
  },
  {
    title: '省份',
    dataIndex: 'province',
    key: 'province',
    width: 100,
  },
  {
    title: '城市',
    dataIndex: 'city_name',
    key: 'city_name',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180,
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
  userOptions,
  isLoadingUsers,
}: {
  // 建议使用更具体的类型，但 any[] 也能工作
  groupedCityOptions: any[];
  userOptions: any[];
  isLoadingOptions: boolean;
  isLoadingUsers: boolean;
}): BaseFormList[] => [
  {
    label: '运营商名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入运营商名称',
    rules: FORM_REQUIRED,
  },
  {
    label: '运营商电话',
    name: 'phone',
    component: 'Input',
    placeholder: '请输入运营商电话',
    rules: [
      { required: true, message: '请输入用户电话' },
      { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号' },
    ],
  },
  {
    name: 'user_id',
    label: '用户',
    component: 'Select',
    required: true,
    placeholder: '请选择用户',
    componentProps: {
      loading: isLoadingUsers,
      showSearch: true, // 开启搜索功能
      optionFilterProp: 'label', // 按选项的显示文本（城市名）进行搜索
      options: userOptions,
    },
  },

  {
    name: 'city_id', // 这个字段的键名，最终提交给后端
    label: '城市',
    component: 'Select',
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
    label: '运营商密码',
    name: 'password',
    component: 'Input',
    placeholder: '不展示密码',
    componentProps: {
      style: { width: '100%' },
    },
  },
  {
    label: '状态',
    name: 'status',
    component: 'Select',
    placeholder: '请选择状态',
    rules: FORM_REQUIRED,
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 2 },
      ],
    },
  },
];
