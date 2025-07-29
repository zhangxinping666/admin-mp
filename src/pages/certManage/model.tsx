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
// 定义
export interface Cert {
  id: number;
  name: string;
  card_id: number;
  front: uploadImg[];
  back: uploadImg[];
  status: number;
}

export interface CertItem {
  id: number;
  name: string;
  card_id: number;
  front: string;
  back: string;
  status: number;
}
export interface UpdateCert {
  id: number;
  status: number;
}
export interface CertDetailResult {
  code: number;
  data: CertItem;
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

export interface CertListResult {
  code: number;
  message: string; // 注意：根据您的JSON数据，这里是 message (单数)
  data: {
    list: CertItem[];
    page: number;
    page_size: number;
    pages: number;
    total: number;
  };
}

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '用户名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入用户名称',
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
    title: '用户名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '用户身份证ID',
    dataIndex: 'card_id',
    key: 'card_id',
    width: 100,
  },
  {
    title: '身份证正面',
    dataIndex: 'front_img',
    key: 'front_img',
    width: 100,
    render: (url: uploadImg[]) => <UserPreview voucherUrl={url} />,
  },
  {
    title: '身份证反面',
    dataIndex: 'back_img',
    key: 'back_img',
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
