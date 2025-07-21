import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { message, Modal } from 'antd';

const UserPreview = ({ voucherUrl }: { voucherUrl: uploadImg[] }) => {
  const [visible, setVisible] = useState(false);

  // 处理数组格式的图片地址或 base64 数据
  const displayUrl = Array.isArray(voucherUrl) ? voucherUrl[0] : voucherUrl;

  // 处理可能的 base64 数据
  const processedUrl = displayUrl?.url || displayUrl?.response?.url;
  console.log('processedUrl', processedUrl);
  console.log('displayUrl', displayUrl);

  return (
    <>
      {processedUrl ? (
        <>
          <img
            src={processedUrl}
            alt="用户图片"
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
            <img src={processedUrl} alt="用户图片预览" style={{ width: '100%', height: 'auto' }} />
          </Modal>
        </>
      ) : (
        '无图片'
      )}
    </>
  );
};
type uploadImg = {
  uid: string;
  name: string;
  status: string;
  url: string;
  response?: {
    url: string;
  };
};
// 楼栋接口定义
export interface User {
  id: number;
  image: uploadImg[];
  nickname: string;
  phone: string;
  last_time: number;
  status: number;
}

export interface UserItem {
  id: number;
  image: uploadImg[];
  nickname: string;
  phone: string;
  last_time: number;
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

export interface UserListResult {
  code: number;
  message: string; // 注意：根据您的JSON数据，这里是 message (单数)
  data: {
    list: UserItem[];
    pagination: Pagination;
  };
}

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '用户昵称',
    name: 'nickname',
    component: 'Input',
    placeholder: '请输入用户昵称',
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
    title: '用户昵称',
    dataIndex: 'nickname',
    key: 'nickname',
    width: 150,
    ellipsis: true,
  },
  {
    title: '用户手机号',
    dataIndex: 'phone',
    key: 'phone',
    width: 150,
    ellipsis: true,
  },
  {
    title: '用户图片',
    dataIndex: 'image',
    key: 'image',
    width: 100,
    render: (url: uploadImg[]) => <UserPreview voucherUrl={url} />,
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
    label: '用户昵称',
    name: 'nickname',
    component: 'Input',
    placeholder: '请输入用户昵称',
    rules: FORM_REQUIRED,
  },
  {
    label: '用户手机号',
    name: 'phone',
    component: 'Input',
    placeholder: '请输入用户手机号',
    rules: FORM_REQUIRED,
  },
  {
    label: '用户图片',
    name: 'image',
    component: 'Upload',
    componentProps: {
      accept: 'image/png, image/jpeg, image/jpg',
      listType: 'picture-card',
      beforeUpload: (file: File) => {
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
          message.error('图片大小不能超过2MB!');
          return false;
        }
        return true;
      },
      customRequest: (options: any) => {
        const { file, onSuccess, onError } = options;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          setTimeout(() => {
            onSuccess({ url: reader.result });
          }, 500);
        };
        reader.onerror = () => {
          onError(new Error('读取文件失败'));
        };
      },
      maxCount: 1,
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
        { label: '禁用', value: 0 },
      ],
    },
  },
];
