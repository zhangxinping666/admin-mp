import type { TFunction } from 'i18next';
import { EyeOutlined } from '@ant-design/icons';
import type { TableColumn } from '#/public';
import type { OperationLogRecord } from '#/operation-log';
import { BaseBtn } from '@/components/Buttons';
import type { BaseSearchList } from '#/form';

/**
 * 请求方法选项
 */
export const REQUEST_METHOD_OPTIONS = [
  { label: '全部', value: '' },
  { label: 'GET', value: 'GET' },
  { label: 'POST', value: 'POST' },
  { label: 'PUT', value: 'PUT' },
  { label: 'DELETE', value: 'DELETE' },
];

/**
 * 状态选项
 */
export const STATUS_OPTIONS = [
  { label: '全部', value: 0 },
  { label: '成功', value: 1 },
  { label: '失败', value: 2 },
];

/**
 * 搜索配置
 */
export const searchList = (t: TFunction): BaseSearchList[] => [
  {
    label: t('operationLog.adminName'),
    name: 'admin_name',
    component: 'Input',
    componentProps: {
      placeholder: t('operationLog.adminNamePlaceholder'),
    },
    wrapperWidth: 180,
  },
  {
    label: t('operationLog.requestMethod'),
    name: 'request_method',
    component: 'Select',
    componentProps: {
      placeholder: t('operationLog.requestMethodPlaceholder'),
      options: REQUEST_METHOD_OPTIONS,
    },
    wrapperWidth: 180,
  },
  {
    label: t('operationLog.status'),
    name: 'status',
    component: 'Select',
    componentProps: {
      options: STATUS_OPTIONS,
    },
    wrapperWidth: 120,
  },
  {
    label: t('operationLog.createTime'),
    name: 'time_range',
    component: 'RangePicker',
    componentProps: {
      placeholder: [t('operationLog.startTime'), t('operationLog.endTime')],
      allowClear: true,
    },
    wrapperWidth: 220,
  },
];

/**
 * 表格列配置
 */
export const tableColumns = (t: TFunction, handleViewDetail?: (record: OperationLogRecord) => void): TableColumn[] => [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
    fixed: 'left',
  },
  {
    title: t('operationLog.adminName'),
    dataIndex: 'admin_name',
    width: 120,
  },
  {
    title: t('operationLog.requestMethod'),
    dataIndex: 'request_method',
    width: 100,
    render: (value: string) => {
      const colorMap: Record<string, string> = {
        GET: '#52c41a',
        POST: '#1890ff',
        PUT: '#faad14',
        DELETE: '#ff4d4f',
      };
      return <span style={{ color: colorMap[value] || '#666' }}>{value}</span>;
    },
  },
  {
    title: t('operationLog.requestUrl'),
    dataIndex: 'request_url',
    width: 250,
    ellipsis: true,
  },
  {
    title: t('operationLog.status'),
    dataIndex: 'status',
    width: 80,
    render: (value: number) => {
      const statusMap = {
        1: { text: t('operationLog.success'), color: '#52c41a' },
        2: { text: t('operationLog.failed'), color: '#ff4d4f' },
      };
      const status = statusMap[value as keyof typeof statusMap];
      return status ? (
        <span style={{ color: status.color }}>{status.text}</span>
      ) : (
        <span>{value}</span>
      );
    },
  },
  {
    title: t('operationLog.createTime'),
    dataIndex: 'created_at',
    width: 180,
  },
  {
    title: t('operationLog.detail'),
    key: 'action',
    width: 100,
    render: (_, record) => (
      <BaseBtn
        size="small"
        icon={<EyeOutlined />}
        onClick={() => handleViewDetail?.(record as OperationLogRecord)}
      >
        {t('operationLog.viewDetail')}
      </BaseBtn>
    ),
  },
];