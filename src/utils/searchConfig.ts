/**
 * 统一搜索框配置工具
 * 用于确保所有搜索框样式和布局的一致性
 */

import type { BaseSearchList } from '#/form';

export const SEARCH_INPUT_WIDTH = 180;
export const SEARCH_SELECT_WIDTH = 150;  // 减小选择框宽度
export const SEARCH_SELECT_COMPACT_WIDTH = 120;  // 紧凑模式宽度

// 扩展BaseSearchList接口，添加分组标记
export interface GroupedSearchList extends BaseSearchList {
  groupId?: string;  // 分组ID，相同ID的项会被组合在一起
  groupStyle?: React.CSSProperties;  // 分组容器的样式
}

/**
 * 创建标准输入框搜索配置
 */
export const createInputSearch = (config: {
  label: string;
  name: string;
  placeholder?: string;
  width?: number;
}): BaseSearchList => ({
  label: config.label,
  name: config.name,
  component: 'Input',
  placeholder: config.placeholder || `请输入${config.label}`,
  wrapperWidth: config.width || SEARCH_INPUT_WIDTH,
});

/**
 * 创建标准选择框搜索配置
 */
export const createSelectSearch = (config: {
  label: string;
  name: string;
  options: any[];
  placeholder?: string;
  width?: number;
  allowClear?: boolean;
  onChange?: (value: any, form: any) => void;
}): BaseSearchList => ({
  label: config.label,
  name: config.name,
  component: 'Select',
  wrapperWidth: config.width || SEARCH_SELECT_WIDTH,
  componentProps: config.onChange
    ? (form) => ({
        options: config.options,
        placeholder: config.placeholder || `请选择${config.label}`,
        allowClear: config.allowClear !== false,
        onChange: (value: any) => config.onChange?.(value, form),
      })
    : {
        options: config.options,
        placeholder: config.placeholder || `请选择${config.label}`,
        allowClear: config.allowClear !== false,
      },
});

/**
 * 创建省市联动搜索配置（带分组）
 */
export const createProvinceCitySearch = (config: {
  provinceOptions: any[];
  cityOptions: any[];
  loadCities: (provinceId: string) => Promise<void>;
  showLabel?: boolean;
  compact?: boolean;  // 紧凑模式
}): GroupedSearchList[] => {
  const width = config.compact ? SEARCH_SELECT_COMPACT_WIDTH : SEARCH_SELECT_WIDTH;
  
  return [
    {
      label: config.showLabel !== false ? '地区' : '',
      name: 'pid',
      component: 'Select',
      wrapperWidth: width,
      groupId: 'location',  // 设置分组ID
      componentProps: (form) => ({
        options: config.provinceOptions,
        placeholder: config.compact ? '省份' : '请选择省份',
        allowClear: true,
        onChange: async (value: string) => {
          form.setFieldsValue({ city_id: undefined });
          await config.loadCities(value);
          form.validateFields(['city_id']);
        },
      }),
    },
    {
      label: '',
      name: 'city_id',
      component: 'Select',
      wrapperWidth: width,
      groupId: 'location',  // 相同的分组ID
      componentProps: (form) => {
        const provinceValue = form.getFieldValue('pid');
        return {
          placeholder: config.compact ? '城市' : '请选择城市',
          allowClear: true,
          disabled: !provinceValue,
          options: config.cityOptions,
        };
      },
    },
  ];
};

/**
 * 创建身份选择搜索配置
 */
export const createRoleSearch = (config?: {
  width?: number;
}): BaseSearchList => ({
  component: 'Select',
  name: 'role_id',
  label: '身份',
  wrapperWidth: config?.width || SEARCH_SELECT_WIDTH,
  componentProps: {
    options: [
      { label: '全部', value: 0 },
      { label: '学生', value: 1 },
      { label: '团长', value: 4 },
      { label: '城市运营商', value: 5 },
    ],
    placeholder: '请选择身份',
    allowClear: true,
  },
});

/**
 * 创建省市学校三级联动搜索配置（带分组）
 */
export const createProvinceCitySchoolSearch = (config: {
  provinceOptions: any[];
  cityOptions: any[];
  schoolOptions: any[];
  loadCities: (provinceId: string) => Promise<void>;
  loadSchools: (cityId: string) => Promise<void>;
}): GroupedSearchList[] => [
  {
    label: '地区',
    name: 'province_id',
    component: 'Select',
    wrapperWidth: SEARCH_SELECT_COMPACT_WIDTH,
    groupId: 'location',  // 设置分组ID
    componentProps: (form) => ({
      options: config.provinceOptions,
      placeholder: '省份',
      allowClear: true,
      onChange: async (value: string) => {
        // 清空城市和学校选择
        form.setFieldsValue({ city_id: undefined, school_id: undefined });
        // 加载对应省份的城市列表
        if (value && value !== '') {
          await config.loadCities(value);
        }
      },
    }),
  },
  {
    label: '',
    name: 'city_id',
    component: 'Select',
    wrapperWidth: SEARCH_SELECT_COMPACT_WIDTH,
    groupId: 'location',  // 相同的分组ID
    componentProps: (form) => ({
      options: config.cityOptions,
      placeholder: '城市',
      allowClear: true,
      disabled: !form.getFieldValue('province_id'),
      onChange: async (value: string) => {
        // 清空学校选择
        form.setFieldsValue({ school_id: undefined });
        // 加载对应城市的学校列表
        if (value && value !== '') {
          await config.loadSchools(value);
        }
      },
    }),
  },
  {
    label: '',
    name: 'school_id',
    component: 'Select',
    wrapperWidth: SEARCH_SELECT_COMPACT_WIDTH,
    groupId: 'location',  // 相同的分组ID
    componentProps: (form) => ({
      options: config.schoolOptions,
      placeholder: '学校',
      allowClear: true,
      disabled: !form.getFieldValue('city_id'),
    }),
  },
];

/**
 * 创建状态选择搜索配置
 */
export const createStatusSearch = (config?: {
  width?: number;
  includeAll?: boolean;
}): BaseSearchList => ({
  component: 'Select',
  name: 'status',
  label: '状态',
  wrapperWidth: config?.width || SEARCH_SELECT_WIDTH,
  componentProps: {
    options: config?.includeAll !== false
      ? [
          { label: '全部', value: 0 },
          { label: '启用', value: 1 },
          { label: '禁用', value: 2 },
        ]
      : [
          { label: '启用', value: 1 },
          { label: '禁用', value: 2 },
        ],
    placeholder: '请选择状态',
    allowClear: true,
  },
});