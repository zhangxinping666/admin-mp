import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { EnhancedImageUploader } from '@/shared/components/EnhancedImageUploader';

// 楼栋接口定义
export interface School {
  id: number;
  name: string;
  address: string;
  city_id: number;
  school_logo: number;
  logo_image_url: string;
  city_name: string;
  province: string;
  status: number;
}

export interface addSchoolForm {
  name: string;
  address: string;
  city_id: number;
  logo_image_url: string;
  status: number;
}

export interface updateSchoolForm {
  id: number;
  name: string;
  address: string;
  city_id: number;
  logo_image_url: string;
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

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '学校名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入学校名称',
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
        { label: '全部', value: 0 },
      ],
    },
  },
];

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '学校名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '学校地址',
    dataIndex: 'address',
    key: 'address',
    width: 150,
    ellipsis: true,
  },
  {
    title: '城市ID',
    dataIndex: 'city_id',
    key: 'city_id',
    width: 100,
  },
  {
    title: '学校logo',
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
    label: '学校名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入学校名称',
    rules: FORM_REQUIRED,
  },
  {
    label: '学校地址',
    name: 'address',
    component: 'Input',
    placeholder: '请输入学校地址',
    rules: FORM_REQUIRED,
  },
  {
    label: '城市ID',
    name: 'city_id',
    component: 'InputNumber',
    placeholder: '请输入城市ID',
    rules: FORM_REQUIRED,
    componentProps: {
      min: 1,
      style: { width: '100%' },
    },
  },
  {
    label: '学校logo',
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
