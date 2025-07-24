import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type API } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
// import { getCityList } from '@/servers/city';

// 初始化新增数据
const initCreate: Partial<API> = {
  id: 0,
  path: '',
  detail: '',
  group: '',
  method: '',
  status: 0, // 默认状态
};

const ApiPage = () => {
  const mockData: API[] = [
    {
      id: 1,
      path: '/role/delete',
      detail: '删除角色',
      group: '角色管理',
      method: 'DELETE',
      status: 1,
    },
    {
      id: 2,
      path: '/role/update',
      detail: '更新角色',
      group: '角色管理',
      method: 'PUT',
      status: 1,
    },
    {
      id: 3,
      path: '/role/list',
      detail: '查询角色',
      group: '角色管理',
      method: 'GET',
      status: 1,
    },
    {
      id: 4,
      path: '/role/create',
      detail: '创建角色',
      group: '用户管理',
      method: 'POST',
      status: 1,
    },
    {
      id: 5,
      path: '/role/detail',
      detail: '查询角色详情',
      group: '角色管理',
      method: 'GET',
      status: 1,
    },
    {
      id: 6,
      path: '/role/detail',
      detail: '查询角色详情',
      group: '角色管理',
      method: 'GET',
      status: 1,
    },
  ];

  const optionRender = (
    record: API,
    actions: {
      handleEdit: (record: API) => void;
      handleDelete: (id: number) => void;
    },
  ) => <TableActions record={record} onEdit={actions.handleEdit} onDelete={actions.handleDelete} />;

  return (
    <CRUDPageTemplate
      title="API管理"
      searchConfig={searchList()}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      mockData={mockData}
      optionRender={optionRender}
    />
  );
};

export default ApiPage;
