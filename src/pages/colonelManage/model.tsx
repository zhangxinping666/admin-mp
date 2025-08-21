import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { useState, useEffect, useCallback } from 'react';
import { getProvinces, getCitiesByProvince } from '@/servers/trade-blotter/location';
import dayjs from 'dayjs';

// 楼栋接口定义
export interface Colonel {
  id: number;
  name: string;
  phone: string;
  password: string;
  city_name: string;
  city_id: number;
  school_name: string;
  school_id: number;
  province: string;
  status: number;
  user_id?: number;
  account_id: string;
  created_at: string;
}

export interface addColonelForm {
  name: string;
  phone: number;
  password: string;
  school_id: number;
  city_id: number;
  status: number;
  user_id?: number;
}

export interface updateColonelForm {
  id: number;
  name: string;
  phone: number;
  password: string;
  school_id: number;
  city_id: number;
  status: number;
  user_id?: number;
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

export interface ColonelListResult {
  code: number;
  message: string; // 注意：根据您的JSON数据，这里是 message (单数)
  data: {
    list: Colonel[];
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
export const searchList = (
  options: ReturnType<typeof useLocationOptions>,
  userInfo?: { role_id: number; city_id: number },
): BaseSearchList[] => {
  // 获取用户角色ID
  const roleId = userInfo?.role_id;

  // 基础搜索字段（所有角色都有）
  const baseSearchFields: BaseSearchList[] = [
    {
      label: '学校名称',
      name: 'school_name',
      component: 'Input',
      placeholder: '请输入学校名称',
    },
    {
      label: '电话',
      name: 'phone',
      component: 'Input',
      placeholder: '请输入团长电话',
    },
  ];

  // 地区搜索字段（只有非城市运营商才显示）
  const locationSearchFields: BaseSearchList[] = [];
  
  // 只有非城市运营商（role_id !== 5）才显示省市选择
  if (roleId !== 5) {
    locationSearchFields.push(
      {
        label: '地区',
        name: 'pid',
        component: 'Select',
        wrapperWidth: 180,
        componentProps: (form) => ({
          options: options.provinceOptions,
          placeholder: '请选择省份',
          allowClear: true,
          onChange: async (value: string) => {
            // 清空城市选择
            form.setFieldsValue({ city_id: undefined });
            await options.loadCities(value);
            form.validateFields(['city_id']);
          },
        }),
      },
      {
        label: '',
        name: 'city_id',
        component: 'Select',
        wrapperWidth: 180,
        componentProps: (form) => {
          const provinceValue = form.getFieldValue('pid');
          return {
            placeholder: '请选择城市',
            allowClear: true,
            disabled: !provinceValue,
            options: options.cityOptions,
          };
        },
      },
    );
  }
  // 城市运营商（role_id === 5）不显示省市选择，会在fetchApi中自动过滤

  // 状态字段（所有角色都有）
  const statusField: BaseSearchList = {
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
  };

  return [...baseSearchFields, ...locationSearchFields, statusField];
};

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 80,
    ellipsis: true,
  },
  {
    title: '账号',
    dataIndex: 'account_id',
    key: 'account_id',
    width: 120,
  },
  {
    title: '电话',
    dataIndex: 'phone',
    key: 'phone',
    width: 120,
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
    title: '学校',
    dataIndex: 'school_name',
    key: 'school_name',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 100,
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
  schoolOptions,
  isSchoolLoading,
  userOptions,
  isLoadingUsers,
}: {
  // 建议使用更具体的类型，但 any[] 也能工作
  groupedCityOptions: any[];
  isLoadingOptions: boolean;
  schoolOptions: any[];
  isSchoolLoading: boolean;
  userOptions: any[];
  isLoadingUsers: boolean;
}): BaseFormList[] => [
  {
    label: '团长名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入学校名称',
    rules: FORM_REQUIRED,
  },
  {
    label: '团长电话',
    name: 'phone',
    component: 'Input',
    placeholder: '请输入团长电话',
    rules: [
      { required: true, message: '请输入用户电话' },
      { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号' },
    ],
  },
  {
    name: 'city_id', // 这个字段的键名，最终提交给后端
    label: '选择城市',
    component: 'Select',
    required: true,
    rules: FORM_REQUIRED,
    placeholder: isLoadingOptions ? '正在加载省市数据...' : '请选择或搜索城市',
    componentProps: {
      loading: isLoadingOptions,
      showSearch: true, // 开启搜索功能
      optionFilterProp: 'label', // 按选项的显示文本（城市名）进行搜索
      options: groupedCityOptions,
    },
  },
  {
    name: 'school_id', // 这个字段的键名，最终提交给后端
    label: '选择学校',
    component: 'Select',
    required: true,
    rules: FORM_REQUIRED,
    placeholder: isSchoolLoading ? '正在加载学校数据...' : '请选择或搜索学校',
    componentProps: {
      loading: isSchoolLoading,
      showSearch: true, // 开启搜索功能
      optionFilterProp: 'label', // 按选项的显示文本（城市名）进行搜索
      options: schoolOptions,
      disabled: isSchoolLoading,
    },
  },
  {
    name: 'user_id',
    label: '用户',
    component: 'Select',
    placeholder: isLoadingUsers ? '正在加载用户数据...' : '请选择或搜索用户',
    required: true,
    rules: FORM_REQUIRED,
    componentProps: {
      loading: isLoadingUsers,
      showSearch: true,
      optionFilterProp: 'label',
      options: userOptions,
      disabled: isLoadingUsers,
    },
  },
  {
    label: '团长密码',
    name: 'password',
    component: 'Input',
    placeholder: '请输入团长密码',
    componentProps: {
      precision: 6,
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
