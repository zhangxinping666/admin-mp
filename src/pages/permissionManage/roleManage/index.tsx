import { searchList, tableColumns, formList, type Role } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { RoleTableActions } from './components/RoleTableActions';
import PermissionEditModal from './components/PermissionEditModal';
import { useState } from 'react';
import { getRoleList, getRoleDetail, addRole, updateRole, deleteRole } from '@/servers/perms/role';
import { refreshSidebarMenu } from '@/utils/menuRefresh';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import type { Key } from 'react';

// 初始化新增数据
const initCreate: Partial<Role> = {
  id: 0,
  name: '',
  code: '',
  status: 1, // 默认状态为启用
  permissions: [],
  dataPermissions: [],
};

const RolesPage = () => {
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // 权限检查
  const { permissions } = useUserStore();
  const hasPermission = (permission: string) => checkPermission(permission, permissions);

  // API接口配置 - 包装原始API以添加权限刷新功能
  const apis = {
    fetchApi: getRoleList,
    detailApi: getRoleDetail,
    createApi: async (data: any) => {
      const result = await addRole(data);
      // 角色创建成功后刷新权限
      refreshSidebarMenu();
      return result;
    },
    updateApi: async (data: any) => {
      const result = await updateRole(data);
      // 角色更新成功后刷新权限
      refreshSidebarMenu();
      return result;
    },
    deleteApi: async (ids: number[]) => {
      const result = await deleteRole(ids);
      // 角色删除成功后刷新权限
      refreshSidebarMenu();
      return result;
    },
  };
  // 处理权限编辑
  const handleEditPermissions = (record: Role) => {
    setSelectedRole(record);
    setPermissionModalVisible(true);
  };

  // 处理权限保存
  const handlePermissionSave = (values: any) => {
    setPermissionModalVisible(false);
    setSelectedRole(null);
  };

  // 操作列渲染
  const optionRender = (
    record: Role,
    actions: {
      handleEdit: (record: Role) => void;
      handleDelete?: (id: Key[]) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:role:update');
    const canDelete = hasPermission('mp:role:delete');
    const canPermissionEdit = hasPermission('mp:role:permissionUpdate');

    return (
      <RoleTableActions
        record={record}
        onEdit={actions.handleEdit}
        onDelete={() => actions.handleDelete?.([record.id])}
        onEditPermissions={handleEditPermissions}
        disableEdit={!canEdit}
        disableDelete={!canDelete}
        disablePermissionEdit={!canPermissionEdit}
      />
    );
  };
  return (
    <>
      <PermissionEditModal
        visible={permissionModalVisible}
        record={selectedRole}
        onCancel={() => {
          setPermissionModalVisible(false);
          setSelectedRole(null);
        }}
        onOk={handlePermissionSave}
      />
      <CRUDPageTemplate
        title="角色管理"
        isDelete={true}
        searchConfig={searchList()}
        columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
        formConfig={formList()}
        initCreate={initCreate}
        disableCreate={!hasPermission('mp:role:add')}
        disableBatchDelete={!hasPermission('mp:role:delete')}
        apis={{
          fetchApi: apis.fetchApi,
          createApi: apis.createApi,
          updateApi: (data: any) => {
            return apis.updateApi(data);
          },

          deleteApi: (id: number[]) => apis.deleteApi(id),
        }}
        optionRender={optionRender}
      />
    </>
  );
};

export default RolesPage;
