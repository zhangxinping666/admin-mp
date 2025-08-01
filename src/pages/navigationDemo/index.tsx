import React from 'react';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { Button, Space, Tag } from 'antd';
import { PlusOutlined, ExportOutlined, ImportOutlined } from '@ant-design/icons';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';

// 模拟数据类型
interface DemoData {
  id: number;
  name: string;
  status: number;
  createTime: string;
}

// 搜索配置
const searchConfig: BaseSearchList[] = [
  {
    label: '名称',
    name: 'name',
    component: 'Input',
    componentProps: {
      placeholder: '请输入名称',
    },
  },
  {
    label: '状态',
    name: 'status',
    component: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  },
];

// 表格列配置
const columns: TableColumn[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: number) => (
      <Tag color={status === 1 ? 'green' : 'red'}>
        {status === 1 ? '启用' : '禁用'}
      </Tag>
    ),
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
];

// 表单配置
const formConfig: BaseFormList[] = [
  {
    label: '名称',
    name: 'name',
    component: 'Input',
    componentProps: {
      placeholder: '请输入名称',
    },
    rules: [{ required: true, message: '请输入名称' }],
  },
  {
    label: '状态',
    name: 'status',
    component: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
    rules: [{ required: true, message: '请选择状态' }],
  },
];

// 模拟API
const mockApi = {
  fetchApi: async (params: any) => {
    console.log('获取数据:', params);
    // 模拟数据
    const mockData: DemoData[] = [
      {
        id: 1,
        name: '示例数据1',
        status: 1,
        createTime: '2024-01-01 10:00:00',
      },
      {
        id: 2,
        name: '示例数据2',
        status: 0,
        createTime: '2024-01-02 11:00:00',
      },
      {
        id: 3,
        name: '示例数据3',
        status: 1,
        createTime: '2024-01-03 12:00:00',
      },
    ];
    
    return {
      items: mockData,
      total: mockData.length,
    };
  },
  createApi: async (data: any) => {
    console.log('创建数据:', data);
    return { success: true };
  },
  updateApi: async (data: any) => {
    console.log('更新数据:', data);
    return { success: true };
  },
  deleteApi: async (id: number) => {
    console.log('删除数据:', id);
    return { success: true };
  },
};

const NavigationDemoPage: React.FC = () => {
  // 自定义导航操作按钮
  const customNavActions = (
    <Space>
      <Button icon={<ExportOutlined />} type="default">
        导出数据
      </Button>
      <Button icon={<ImportOutlined />} type="default">
        导入数据
      </Button>
      <Button icon={<PlusOutlined />} type="primary">
        批量操作
      </Button>
    </Space>
  );

  // 自定义面包屑
  const breadcrumbItems = [
    {
      title: '首页',
      path: '/dashboard',
      icon: <PlusOutlined />,
    },
    {
      title: '演示模块',
      path: '/navigationDemo',
    },
    {
      title: '导航演示',
    },
  ];

  return (
    <CRUDPageTemplate<DemoData>
      title="导航演示"
      searchConfig={searchConfig}
      columns={columns}
      formConfig={formConfig}
      initCreate={{
        id: 0,
        name: '',
        status: 1,
        createTime: '',
      }}
      apis={mockApi}
      // 导航配置
      showNavigation={true}
      showQuickNav={true}
      customNavActions={customNavActions}
      breadcrumbItems={breadcrumbItems}
    />
  );
};

export default NavigationDemoPage;