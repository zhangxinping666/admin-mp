import type { TFunction } from 'i18next';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { EnhancedImageUploader } from '@/shared/components/EnhancedImageUploader';

// 商家分类数据接口
export interface MerchantSort {
  id: number;
  name: string;
  icon: string;
  school_name: string;
  school_id: number;
  city_name: string;
  city_id: number;
  status: number;
  drawback: number;
}

// 商家分类列表接口
export interface MerchantSortList {
  items: MerchantSort[];
  total: number;
}

// 商家分类查询参数接口
export interface MerchantSortQuery {
  name?: string;
  status?: number;
  page?: number;
  pageSize?: number;
}

// 搜索配置
export const searchList = (options: any): BaseSearchList[] => [
  {
    component: 'Input',
    name: 'name',
    label: '类别',
  },
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
        onChange: async (value: string) => {
          // 清空学校选择
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
    placeholder: '请输入学校名称',
    componentProps: (form) => {
      const cityValue = form.getFieldValue('city');
      console.log('获取城市', cityValue);

      return {
        placeholder: '请选择学校',
        allowClear: true,
        disabled: !cityValue,
        options: options.schoolOptions,
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
    title: '分类名称',
    dataIndex: 'name',
    key: 'name',
    align: 'center',
    fixed: 'left',
  },
  {
    title: '分类图标',
    dataIndex: 'icon',
    key: 'icon',
    render: (icon: any) => {
      const getFullImageUrl = (url: any) => {
        if (!url) return '';
        // 确保url是字符串类型
        const urlStr = String(url);
        if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
          return urlStr;
        }
        return `http://192.168.10.7:8082${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
      };

      const displayUrl = getFullImageUrl(icon);

      return displayUrl ? (
        <img
          src={displayUrl}
          alt="分类图标"
          style={{
            width: '50px',
            height: '50px',
            objectFit: 'cover',
            borderRadius: '4px',
          }}
        />
      ) : (
        <span style={{ color: '#999' }}>无图片</span>
      );
    },
  },
  {
    title: '省份',
    dataIndex: 'province',
    key: 'province',
    align: 'center',
    fixed: 'left',
  },
  {
    title: '城市',
    dataIndex: 'city_name',
    key: 'city_name',
    align: 'center',
    fixed: 'left',
  },
  {
    title: '学校',
    dataIndex: 'school_name',
    key: 'school_name',
    align: 'center',
    fixed: 'left',
  },
  {
    title: '返佣比例(%)',
    dataIndex: 'drawback',
    key: 'drawback',
    align: 'center',
    fixed: 'left',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (value: number) => (
      <span style={{ color: value === 1 ? 'green' : 'red' }}>{value === 1 ? '启用' : '禁用'}</span>
    ),
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    align: 'center',
    fixed: 'left',
  },
];

// 编辑表单配置项
export const formList = (): BaseFormList[] => [
  {
    label: '分类ID',
    name: 'id',
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入分类ID',
      min: 0,
      precision: 2,
      style: { width: '100%' },
      disabled: true,
    },
  },
  {
    label: '分类名称',
    name: 'name',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入分类名称',
      maxLength: 50,
    },
  },
  {
    label: '分类图标',
    name: 'icon',
    component: 'customize',
    rules: FORM_REQUIRED,
    render: (props: any) => {
      const { value, onChange } = props;
      return (
        <EnhancedImageUploader
          value={value}
          onChange={onChange}
          maxSize={2}
          maxCount={1}
          baseUrl="http://192.168.10.7:8082"
        />
      );
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
        { label: '禁用', value: 2 },
      ],
    },
  },
  {
    label: '返佣比例(%)',
    name: 'drawback',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入返佣比例',
      min: 0,
      max: 100,
      precision: 2,
      style: { width: '100%' },
    },
  },
];

// 新增表单配置项
export const addFormList = (): BaseFormList[] => [
  {
    label: '分类名称',
    name: 'name',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入分类名称',
      maxLength: 50,
    },
  },
  {
    label: '分类图标',
    name: 'icon',
    component: 'customize',
    rules: FORM_REQUIRED,
    render: (props: any) => {
      const { value, onChange } = props;
      return (
        <EnhancedImageUploader
          value={value}
          onChange={onChange}
          maxSize={2}
          maxCount={1}
          baseUrl="http://192.168.10.7:8082"
        />
      );
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
        { label: '禁用', value: 2 },
      ],
    },
  },
  {
    label: '返佣比例(%)',
    name: 'drawback',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入返佣比例',
      min: 0,
      max: 100,
      precision: 2,
      style: { width: '100%' },
    },
  },
];
