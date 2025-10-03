import type { TFunction } from 'i18next';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import dayjs from 'dayjs';

// 字典项接口
export interface DictionaryItem {
  id: number;
  dict_type_code: string;
  label: string;
  value: string | number;
  sort: number;
  status: number;
  description: string;
  extend_value: string;
}

// 字典接口
export interface Dictionary {
  id: number;
  name: string;
  code: string;
  status: number;
  description: string;
  items: DictionaryItem[];
}

// // 图片预览组件
// const ImagePreview = ({ imgUrl }: { imgUrl: UploadImg[] }) => {
//   const [visible, setVisible] = useState(false);

//   // 处理数组格式的图片地址或 base64 数据
//   const displayUrl = Array.isArray(imgUrl) ? imgUrl[0] : imgUrl;

//   // 处理可能的 base64 数据
//   const processedUrl = displayUrl?.url || displayUrl?.response?.url;

//   return (
//     <>
//       {processedUrl ? (
//         <>
//           <img
//             src={processedUrl}
//             alt="字典项图片"
//             style={{
//               width: '60px',
//               height: '60px',
//               objectFit: 'cover',
//               borderRadius: '4px',
//               cursor: 'pointer',
//             }}
//             onClick={() => setVisible(true)}
//           />
//           <Modal open={visible} footer={null} onCancel={() => setVisible(false)} width="20%">
//             <img
//               src={processedUrl}
//               alt="字典项图片预览"
//               style={{ width: '100%', height: 'auto' }}
//             />
//           </Modal>
//         </>
//       ) : (
//         '无图片'
//       )}
//     </>
//   );
// };

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '字典名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入字典名称',
  },
  {
    label: '字典编码',
    name: 'code',
    component: 'Input',
    placeholder: '请输入字典编码',
  },
  {
    label: '状态',
    name: 'status',
    component: 'Select',
    placeholder: '请选择状态',
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  },
];

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '字典名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    ellipsis: true,
    fixed: 'left',
  },
  {
    title: '字典编码',
    dataIndex: 'code',
    key: 'code',
    width: 150,
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: 200,
    ellipsis: true,
  },
  {
    title: '字典项数量',
    dataIndex: 'items',
    key: 'itemCount',
    width: 120,
    render: (items: DictionaryItem[]) => (Array.isArray(items) && items.length) || 0,
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
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 180,
    render: (value: string) => {
      if (value) {
        return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
      }
      return '-';
    },
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 180,
    render: (value: string) => {
      if (value) {
        return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
      }
      return '-';
    },
  },
];

// 字典项表格列配置
export const itemTableColumns: TableColumn[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 150,
  },
  {
    title: '字典项名称',
    dataIndex: 'label',
    key: 'label',
    width: 150,
  },
  {
    title: '字典项值',
    dataIndex: 'value',
    key: 'value',
    width: 150,
  },
  {
    title: '字典类型编码',
    dataIndex: 'dict_type_code',
    key: 'dict_type_code',
    width: 150,
    render: (value: string) => {
      return value || '-';
    },
    fixed: 'left',
  },
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
    width: 80,
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
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: 100,
    ellipsis: true,
  },
  {
    title: '扩展值',
    dataIndex: 'extend_value',
    key: 'extend_value',
    width: 100,
    ellipsis: true,
  },
];

// 字典表单配置
export const formList = (): BaseFormList[] => [
  {
    label: 'ID',
    name: 'id',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入ID',
      maxLength: 50,
      disabled: true,
    },
  },
  {
    label: '字典名称',
    name: 'name',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入字典名称',
      maxLength: 50,
    },
  },
  {
    label: '字典编码',
    name: 'code',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入字典编码',
      maxLength: 50,
      disabled: false,
    },
  },
  {
    label: '描述',
    name: 'description',
    component: 'TextArea',
    componentProps: {
      placeholder: '请输入字典描述',
      showCount: true, // 可选，显示字符计数
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
];

// 字典项编辑表单配置
export const itemEditFormList = (): BaseFormList[] => [
  {
    label: 'ID',
    name: 'id',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入ID',
      maxLength: 50,
      disabled: true,
    },
  },
  {
    label: '字典项名称',
    name: 'label',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入字典项名称',
      maxLength: 50,
    },
  },
  {
    label: '字典项值',
    name: 'value',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入字典项值',
      maxLength: 50,
    },
  },
  {
    label: '字典类型编码',
    name: 'dict_type_code',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入字典类型编码',
      maxLength: 50,
    },
  },
  {
    label: '排序',
    name: 'sort',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入排序号',
      min: 0,
      style: { width: '100%' },
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
    label: '描述',
    name: 'description',
    rules: FORM_REQUIRED,
    component: 'TextArea',
    componentProps: {
      placeholder: '请输入描述',
      showCount: true, // 可选，显示字符计数
    },
  },
  {
    label: '扩展值',
    name: 'extend_value',
    component: 'TextArea',
    componentProps: {
      placeholder: '请输入扩展值',
      showCount: true, // 可选，显示字符计数
    },

  },
];

// 字典项新增表单配置
export const itemAddFormList = (): BaseFormList[] => [
  {
    label: '字典项名称',
    name: 'label',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入字典项名称',
      maxLength: 50,
    },
  },
  {
    label: '字典项值',
    name: 'value',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入字典项值',
      maxLength: 50,
    },
  },
  {
    label: '字典类型编码',
    name: 'dict_type_code',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入字典类型编码',
      maxLength: 50,
      disabled: true,
    },
    render: (value: any) => value?.dict_type_code || '',
  },
  {
    label: '排序',
    name: 'sort',
    rules: FORM_REQUIRED,
    component: 'InputNumber',
    componentProps: {
      placeholder: '请输入排序号',
      min: 0,
      style: { width: '100%' },
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
    label: '描述',
    name: 'description',
    rules: FORM_REQUIRED,
    component: 'TextArea',
    componentProps: {
      placeholder: '请输入描述',
      showCount: true, // 可选，显示字符计数

    },
  },
  {
    label: '扩展值',
    name: 'extend_value',
    component: 'TextArea',
    componentProps: {
      placeholder: '请输入扩展值',
      showCount: true, // 可选，显示字符计数
    },
  },
];
