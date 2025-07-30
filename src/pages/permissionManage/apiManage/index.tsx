import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type API } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { getApiList, getApiDetail, addApi, updateApi, deleteApi } from '@/servers/perms/api';

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
  // API接口配置
  const apis = {
    fetchApi: getApiList,
    detailApi: getApiDetail,
    createApi: addApi,
    updateApi: updateApi,
    deleteApi: deleteApi,
  };

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
      apis={{
        fetchApi: apis.fetchApi,
        createApi: apis.createApi,
        updateApi: (id: number, data: any) => {
          // 正确的做法：将 id 和表单数据 data 合并成一个完整的对象
          // 然后再调用您的 cityApis.update 函数
          return apis.updateApi({ ...data, id });
        },
        deleteApi: (id: number) => apis.deleteApi([id]),
      }}
      optionRender={optionRender}
    />
  );
};

export default ApiPage;
