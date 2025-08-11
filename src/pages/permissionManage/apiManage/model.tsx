import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { getDictionaryList } from '@/servers/dictionaryManage/index';

// 楼栋接口定义
export interface API {
  id: number;
  path: string;
  detail: string;
  group: string;
  method: string;
  status: number;
}

export interface APIUpdateForm {
  id: number;
  group_id: number;
  path: string;
  detail: string;
  method_id: number;
  status: number;
}
export interface addForm {
  group_id: number;
  path: string;
  detail: string;
  method_id: number;
  status: number;
}

export interface APIDetailResult {
  code: number;
  message: string;
  data: API;
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

export interface APIListResult {
  code: number;
  message: string; // 注意：根据您的JSON数据，这里是 message (单数)
  data: {
    list: API[];
    page: number;
    page_size: number;
    pages: number;
    total: number;
  };
}
export interface APIDetailResult {
  code: number;
  data: API;
}
// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: 'API 路径',
    name: 'path',
    component: 'Input',
    placeholder: '请输入接口路径',
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
    title: 'API路径',
    dataIndex: 'path',
    key: 'path',
    width: 150,
    ellipsis: true,
  },
  {
    title: 'API详情',
    dataIndex: 'detail',
    key: 'detail',
    width: 100,
  },
  {
    title: 'API类别',
    dataIndex: 'group',
    key: 'group',
    width: 100,
  },
  {
    title: 'API方法',
    dataIndex: 'method',
    key: 'method',
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
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 120,
    fixed: 'right',
  },
];

// API类别树形数据结构
export interface APIGroupTreeNode {
  id: number;
  title: string;
  value: number;
  children?: APIGroupTreeNode[];
}

// API方法选项数据结构
export interface APIMethodOption {
  label: string;
  value: number;
}

// 获取API类别树形数据
export const getAPIGroupTree = async (): Promise<APIGroupTreeNode[]> => {
  try {
    const response = await getDictionaryList({ dict_type_code: 'ApiGroup' });
    if (response.code === 2000) {
      return response.data.list.map((item: any) => ({
        title: item.label,
        value: item.id,
      }));
    }
    return [];
  } catch (error) {
    console.error('获取API分组失败:', error);
    return [];
  }
};

// 获取API方法选项数据
export const getAPIMethodOptions = async (): Promise<APIMethodOption[]> => {
  try {
    const response = await getDictionaryList({ dict_type_code: 'ApiMethod' });
    if (response.code === 2000) {
      return response.data.list.map((item: any) => ({
        label: item.label,
        value: item.id,
      }));
    }
    return [];
  } catch (error) {
    console.error('获取API方法失败:', error);
    return [];
  }
};
// 表单配置
export const formList = (
  apiGroupData: APIGroupTreeNode[] = [],
  apiMethodOptions: APIMethodOption[] = [],
): BaseFormList[] => [
  {
    label: 'API路径',
    name: 'path',
    component: 'Input',
    placeholder: '请输入API路径',
    rules: FORM_REQUIRED,
  },
  {
    label: 'API详情',
    name: 'detail',
    component: 'Input',
    placeholder: '请输入API详情',
    rules: FORM_REQUIRED,
  },
  {
    label: 'API类别',
    name: 'group',
    component: 'TreeSelect',
    placeholder: '请选择API类别',
    rules: FORM_REQUIRED,
    componentProps: {
      treeData: apiGroupData,
      showSearch: true,
      treeNodeFilterProp: 'title',
      allowClear: true,
      treeDefaultExpandAll: true,
      placeholder: '输入关键字进行过滤',
      style: { width: '100%' },
      fieldNames: {
        label: 'title',
        value: 'value',
        children: 'children',
      },
    },
  },
  {
    label: 'API方法',
    name: 'method',
    component: 'Select',
    placeholder: '请选择API方法',
    rules: FORM_REQUIRED,
    componentProps: {
      options: apiMethodOptions,
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
