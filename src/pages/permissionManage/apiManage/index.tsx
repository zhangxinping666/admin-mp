import { useState, useEffect } from 'react';
import {
  searchList,
  tableColumns,
  formList,
  type API,
  type APIMethodOption,
} from './model';
import { CRUDPageTemplate } from
  '@/shared/components/CRUDPageTemplate';
import { TableActions } from
  '@/shared/components/TableActions';
import {
  getApiList, getApiDetail, addApi, updateApi,
  deleteApi
} from '@/servers/perms/api';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import { getMenuSelectList } from '@/servers/perms/menu';
import { MenuDetail, MenuInfoResult } from
  '../menuManage/model'
import type { Key } from 'react';

// 定义API分组选项的接口
interface ApiGroupOption {
  title: string;
  value: number;
  key: number;
}

// 初始化新增数据
const initCreate: Partial<API> = {
  id: 0,
  path: '',
  detail: '',
  group: '',
  method: '',
  status: 1,
};

const ApiPage = () => {
  const [apiGroupData, setApiGroupData] =
    useState<ApiGroupOption[]>([]);
  const [apiMethodOptions, setApiMethodOptions] =
    useState<APIMethodOption[]>([]);

  // 权限检查
  const { permissions } = useUserStore();
  const hasPermission = (permission: string) =>
    checkPermission(permission, permissions);

  const fetchApiGroups = async () => {
    try {
      const response = await getMenuSelectList({
        type: ['2']
      });
      const Data = response as unknown as MenuInfoResult

      // 处理响应数据，转换为TreeSelect需要的格式
      if (Data.code === 2000 && Data.data) {
        const processedData = Data.data.map((item:
          MenuDetail) => ({
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

  // 组件挂载时获取数据
  useEffect(() => {
    fetchApiGroups();
  }, []);

  // 监听数据变化
  useEffect(() => { }, [apiGroupData, apiMethodOptions]);

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
      handleDelete?: (id: Key[]) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:api:update');
    const canDelete = hasPermission('mp:api:delete');

    return (
      <TableActions
        record={record}
        onEdit={actions.handleEdit}
        onDelete={() => actions.handleDelete?.([record.id])}
        // 传入数组
        disableEdit={!canEdit}
        disableDelete={!canDelete}
      />
    );
  };

  return (
    <CRUDPageTemplate
      title="API管理"
      isDelete={true}  // 添加isDelete属性
      searchConfig={searchList()}
      columns={tableColumns.filter((col: any) =>
        col.dataIndex !== 'action')}
      formConfig={formList(apiGroupData as any,
        apiMethodOptions)}  // 临时类型断言
      initCreate={initCreate}
      disableCreate={!hasPermission('mp:api:add')}
      disableBatchDelete={!hasPermission('mp:api:delete')}
      apis={{
        fetchApi: apis.fetchApi,
        createApi: (data: any) => {
          // 将group和method转换为对应的ID
          const groupItem = apiGroupData.find(
            (item) => item.title === data.group || item.value
              === data.group,
          );
          const methodItem = apiMethodOptions.find(
            (item) => item.label === data.method ||
              item.value === data.method,
          );

          const transformedData = {
            ...data,
            group_id: groupItem ? groupItem.value :
              data.group,
            method_id: methodItem ? methodItem.value :
              data.method,
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
              typeof values.group === 'object' ?
                Number(values.group.value) : Number(values.group),
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