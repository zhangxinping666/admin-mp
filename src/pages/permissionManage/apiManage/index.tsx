import { useState, useEffect } from 'react';
import {
  searchList,
  tableColumns,
  formList,
  type API,
  type APIGroupTreeNode,
  getAPIMethodOptions,
  type APIMethodOption,
} from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { getApiList, getApiDetail, addApi, updateApi, deleteApi } from '@/servers/perms/api';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import { getMenuSelectList } from '@/servers/perms/menu'; // 导入您的真实API

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
      const response = await getMenuSelectList({ type: ['2'] });

      // 处理响应数据，转换为TreeSelect需要的格式
      if (response.code === 2000 && response.data) {
        const processedData = response.data.map((item: any) => ({
          title: item.name,
          value: item.id,
          key: item.id,
        }));
        setApiGroupData(processedData);
      } else {
        console.warn('API分组数据格式异常:', response);
        setApiGroupData([]);
      }
    } catch (error) {
      console.error('获取API分组失败:', error);
      setApiGroupData([]);
    }
  };

  // 获取API方法数据
  const fetchApiMethods = async () => {
    try {
      const methodData = await getAPIMethodOptions();

      // getAPIMethodOptions已经在model.tsx中处理了数据格式
      // 确保数据格式正确
      if (Array.isArray(methodData)) {
        setApiMethodOptions(methodData);
      } else {
        console.warn('API方法数据格式异常:', methodData);
        setApiMethodOptions([]);
      }
    } catch (error) {
      console.error('获取API方法失败:', error);
      setApiMethodOptions([]);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchApiGroups();
    fetchApiMethods();
  }, []);

  // 监听数据变化
  useEffect(() => {}, [apiGroupData, apiMethodOptions]);

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
      disableBatchDelete={!hasPermission('mp:api:delete')}
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
        updateApi: (data: any) => {
          // 确保id是number类型，而不是数组
          const { id, ...values } = data;
          const apiId = Array.isArray(id) ? id[0] : id;

          // 需要转换group和method字段
          const transformedData = {
            id: apiId,
            ...values,
            group_id:
              typeof values.group === 'object' ? Number(values.group.value) : Number(values.group),
            method_id:
              typeof values.method === 'object'
                ? Number(values.method.value)
                : Number(values.method),
          };
          // 移除原始的group和method字段
          delete transformedData.group;
          delete transformedData.method;
          return apis.updateApi(transformedData);
        },
        deleteApi: (id: number[]) => apis.deleteApi(id),
      }}
      optionRender={optionRender}
    />
  );
};

export default ApiPage;
