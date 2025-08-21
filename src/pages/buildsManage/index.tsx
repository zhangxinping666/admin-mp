import {
  searchList,
  tableColumns,
  formList,
  type Building,
  School,
  Floor,
  addFormList,
} from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { Key } from 'react';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import * as apis from './apis';
import { Space } from 'antd';
import useSelectSchoolOptions from '@/shared/hooks/useSchoolOptions';
import { status } from 'nprogress';

// 初始化新增数据

const BuildingsPage = () => {
  const userStore = useUserStore();
  const userInfo = userStore.userInfo;
  const initCreate: Partial<Building> = {
    school_id: userInfo?.school_name,
    name: '',
    address: '',
    longitude: 0,
    latitude: 0,
    status: 1,
  };

  const { schoolOptions, loading: schoolOptionsLoading } = useSelectSchoolOptions();
  const { permissions } = useUserStore();

  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  // 操作列渲染
  const optionRender = (
    record: Building,
    actions: {
      handleEdit: (record: Building) => void;
      handleDelete?: (id: Key[]) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:build:update');
    const canDelete = hasPermission('mp:build:delete');
    const canViewFloor =
      hasPermission('mp:floor:add') ||
      hasPermission('mp:floor:update') ||
      hasPermission('mp:floor:delete');

    return (
      <Space size="middle" direction="vertical">
        <TableActions
          record={record}
          onEdit={actions.handleEdit}
          disableEdit={!canEdit}
          disableDelete={!canDelete}
        />
      </Space>
    );
  };

  // 封装表单配置项
  const newFormList = formList().map((item: any) => {
    if (item.name === 'school_id') {
      return {
        ...item,
        componentProps: {
          options: schoolOptions,
          placeholder: '请选择学校',
          loading: schoolOptionsLoading,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option?.label?.toLowerCase().includes(input.toLowerCase()) || false;
          },
          notFoundContent: schoolOptionsLoading ? '加载中...' : '暂无数据',
        },
      };
    }
    return item;
  });

  return (
    <>
      <CRUDPageTemplate
        isAddOpen={true}
        isDelete={true}
        disableBatchUpdate={true}
        addFormConfig={addFormList(userInfo!.role_id, schoolOptions, schoolOptionsLoading)}
        title="楼栋楼层管理"
        searchConfig={searchList(userInfo!.role_id, schoolOptions, schoolOptionsLoading)}
        columns={tableColumns(userInfo!.role_id).filter((col: any) => col.dataIndex !== 'action')}
        formConfig={newFormList}
        initCreate={initCreate}
        disableCreate={!hasPermission('mp:build:add')}
        disableBatchDelete={!hasPermission('mp:build:delete')}
        optionRender={optionRender}
        apis={{
          createApi: (params) => {
            params.longitude = params.location[0];
            params.latitude = params.location[1];
            params.address = params.address || params.location.address;
            delete params.location;
            return apis.addBuilding(params);
          },
          fetchApi: async (params) => {
            try {
              const res = await apis.queryBuilding(params);
              // 检查响应和数据是否存在
              if (!res || !res.data || !Array.isArray(res.data.list)) {
                console.error('API 返回格式不符合预期:', res);
                return { data: { list: [], total: 0 } };
              }

              // 处理数据
              res.data.list.forEach((item: any) => {
                item.location = {
                  address: item.address,
                  longitude: item.longitude,
                  latitude: item.latitude,
                };
              });

              return res;
            } catch (error) {
              console.error('获取数据失败:', error);
              // 返回默认空数据，避免组件崩溃
              return { data: { list: [], total: 0 } };
            }
          },
          updateApi: (params) => {
            // 安全检查location数组
            if (params.location && Array.isArray(params.location) && params.location.length >= 2) {
              params.longitude = params.location[0];
              params.latitude = params.location[1];
            }
            delete params.location;
            return apis.updateBuilding(params);
          },
          deleteApi: apis.deleteBuilding,
        }}
      />
    </>
  );
};

export default BuildingsPage;
