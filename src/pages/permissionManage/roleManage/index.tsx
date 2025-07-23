import { searchList, tableColumns, formList, type Role } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { RoleTableActions } from './components/RoleTableActions';
import PermissionEditModal from './components/PermissionEditModal';
import { useState } from 'react';

// 初始化新增数据
const initCreate: Partial<Role> = {
  id: 0,
  name: '',
  code: '',
  desc: '',
  status: 1, // 默认状态为启用
  permissions: [],
  dataPermissions: [],
};

const RolesPage = () => {
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const mockData: Role[] = [
    {
      id: 1,
      name: '超级管理员',
      code: 'superAdmin',
      desc: '系统超级管理员，拥有所有权限',
      status: 1,
      permissions: [],
      dataPermissions: [],
    },
    {
      id: 2,
      name: '城市运营商',
      code: 'cityOperator',
      desc: '城市运营商角色，负责城市级别的运营管理',
      status: 1,
      permissions: [],
      dataPermissions: [],
    },
    {
      id: 3,
      name: '团长',
      code: 'leader',
      desc: '团长角色，负责团队管理',
      status: 1,
      permissions: [1, 2],
      dataPermissions: [],
    },
  ];
  // 处理权限编辑
  const handleEditPermissions = (record: Role) => {
    console.log('打开权限编辑模态框:', {
      角色信息: record,
      操作时间: new Date().toLocaleString(),
    });
    setSelectedRole(record);
    setPermissionModalVisible(true);
  };

  // 处理权限保存
  const handlePermissionSave = (values: any) => {
    console.log('保存权限修改:', {
      角色: selectedRole,
      新权限: values,
      保存时间: new Date().toLocaleString(),
    });
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

  // 表单值变化处理函数
  const handleFormValuesChange = (changedValues: any, allValues: any) => {
    // 如果数据权限字段发生变化，打印选择的节点信息
    if (changedValues.dataPermissions) {
      console.log('数据权限树选择变化:', {
        选中的节点: changedValues.dataPermissions,
        变化时间: new Date().toLocaleString(),
        完整表单数据: allValues,
      });
    }

    // 如果功能权限字段发生变化
    if (changedValues.permissions) {
      console.log('功能权限选择变化:', {
        选中的权限: changedValues.permissions,
        变化时间: new Date().toLocaleString(),
        完整表单数据: allValues,
      });
    }

    // 打印所有表单变化
    console.log('角色表单数据变化:', {
      变化的字段: changedValues,
      所有字段值: allValues,
      变化时间: new Date().toLocaleString(),
    });
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
        searchConfig={searchList()}
        columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
        formConfig={formList()}
        initCreate={initCreate}
        mockData={mockData}
        optionRender={optionRender}
        onFormValuesChange={handleFormValuesChange}
      />
    </>
  );
};

export default RolesPage;
