import { searchList, tableColumns, formList, type Role } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { RoleTableActions } from './components/RoleTableActions';
import PermissionEditModal from './components/PermissionEditModal';
import { useState } from 'react';
import { getRoleList, getRoleDetail, addRole, updateRole, deleteRole } from '@/servers/perms/role';

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

  // API接口配置
  const apis = {
    fetchApi: getRoleList,
    detailApi: getRoleDetail,
    createApi: addRole,
    updateApi: updateRole,
    deleteApi: deleteRole,
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
      handleDelete: (id: number) => void;
    },
  ) => (
    <RoleTableActions
      record={record}
      onEdit={actions.handleEdit}
      onDelete={actions.handleDelete}
      onEditPermissions={handleEditPermissions}
    />
  );
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
          deleteApi: (id: number[]) => apis.deleteApi(id),
        }}
        optionRender={optionRender}
      />
    </>
  );
};

export default RolesPage;
