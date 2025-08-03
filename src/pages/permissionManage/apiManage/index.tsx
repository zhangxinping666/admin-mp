import { useState, useEffect } from 'react';
import {
  searchList,
  tableColumns,
  formList,
  type API,
  getAPIGroupTree,
  type APIGroupTreeNode,
  getAPIMethodOptions,
  type APIMethodOption,
} from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { getApiList, getApiDetail, addApi, updateApi, deleteApi } from '@/servers/perms/api';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';

// 初始化新增数据
const initCreate: Partial<API> = {
  id: 0,
  path: '',
  detail: '',
  group: '',
  method: '',
  status: 1, // 默认状态
};

const ApiPage = () => {
  const [apiGroupData, setApiGroupData] = useState<APIGroupTreeNode[]>([]);
  const [apiMethodOptions, setApiMethodOptions] = useState<APIMethodOption[]>([]);
  
  // 权限检查
  const { permissions } = useUserStore();
  const hasPermission = (permission: string) => checkPermission(permission, permissions);

  // 获取API分组数据
  const fetchApiGroups = async () => {
    try {
      const groupData = await getAPIGroupTree();
      setApiGroupData(groupData);
    } catch (error) {
      console.error('获取API分组失败:', error);
    }
  };

  // 获取API方法数据
  const fetchApiMethods = async () => {
    try {
      const methodData = await getAPIMethodOptions();
      setApiMethodOptions(methodData);
    } catch (error) {
      console.error('获取API方法失败:', error);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchApiGroups();
    fetchApiMethods();
  }, []);

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
  ) => {
    const canEdit = hasPermission('mp:api:update');
    const canDelete = hasPermission('mp:api:delete');

    return (
      <TableActions 
        record={record} 
        onEdit={actions.handleEdit} 
        onDelete={actions.handleDelete}
        disableEdit={!canEdit}
        disableDelete={!canDelete}
      />
    );
  };

  return (
    <CRUDPageTemplate
      title="API管理"
      searchConfig={searchList()}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList(apiGroupData, apiMethodOptions)}
      initCreate={initCreate}
      disableCreate={!hasPermission('mp:api:add')}
      apis={{
        fetchApi: apis.fetchApi,
        createApi: (data: any) => {
          // 将group和method转换为对应的ID
          const groupItem = apiGroupData.find(
            (item) => item.title === data.group || item.value === data.group,
          );
          const methodItem = apiMethodOptions.find(
            (item) => item.label === data.method || item.value === data.method,
          );

          const transformedData = {
            ...data,
            group_id: groupItem ? groupItem.value : data.group,
            method_id: methodItem ? methodItem.value : data.method,
          };

          return apis.createApi(transformedData);
        },
        updateApi: (id: number, data: any) => {
          // 将group和method转换为对应的ID
          const groupItem = apiGroupData.find(
            (item) => item.title === data.group || item.value === data.group,
          );
          const methodItem = apiMethodOptions.find(
            (item) => item.label === data.method || item.value === data.method,
          );

          const transformedData = {
            ...data,
            id,
            group_id: groupItem ? groupItem.value : data.group,
            method_id: methodItem ? methodItem.value : data.method,
          };

          return apis.updateApi(transformedData);
        },
        deleteApi: (id: number[]) => apis.deleteApi(id),
      }}
      optionRender={optionRender}
    />
  );
};

export default ApiPage;
