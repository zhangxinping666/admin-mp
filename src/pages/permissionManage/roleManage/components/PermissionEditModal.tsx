import { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import BaseForm from '@/components/Form/BaseForm';
import type { BaseFormList } from '#/form';
import type { Role } from '../model';
import { getMenuPermissionTree, getDataPermissionTree } from '../model';
import {
  getRoleApiPerms,
  getRoleMenuPerms,
  updateRoleApiPerms,
  updateRoleMenuPerms,
} from '@/servers/perms/role';

interface PermissionEditModalProps {
  visible: boolean;
  record: Role | null;
  onCancel: () => void;
  onOk: (values: any) => void;
}

const PermissionEditModal = ({ visible, record, onCancel, onOk }: PermissionEditModalProps) => {
  const [functionalPermissions, setFunctionalPermissions] = useState<any[]>([]);
  const [dataPermissions, setDataPermissions] = useState<any[]>([]);
  const [menuTreeData, setMenuTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && record && menuTreeData.length > 0) {
      setLoading(true);
      Promise.all([
        getRoleApiPerms({ id: record.id }),
        getRoleMenuPerms({ id: record.id }),
      ])
        .then(([apiResponse, menuResponse]) => {
          // 设置API权限到数据权限
          setDataPermissions(apiResponse.data?.api_ids || []);
          // 设置菜单权限到功能权限
          const menuIds = menuResponse.data?.menu_ids || [];
          console.log('获取到的菜单权限ID:', menuIds);
          console.log('当前菜单树数据:', menuTreeData);
          setFunctionalPermissions(menuIds);
        })
        .catch((error) => {
          message.error('获取权限数据失败');
          console.error('获取权限数据失败:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [visible, record, menuTreeData]);

  // 异步加载菜单权限数据
  useEffect(() => {
    if (visible) {
      setLoading(true);
      getMenuPermissionTree()
        .then((data) => {
          setMenuTreeData(data);
        })
        .catch((error) => {
          console.error('加载菜单权限数据失败:', error);
          message.error('加载菜单权限数据失败');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [visible]);

  // 功能权限表单配置
  const functionalPermissionForm: BaseFormList[] = [
    {
      label: '功能权限',
      name: 'permissions',
      component: 'TreeSelect',
      placeholder: '输入关键字进行过滤',
      componentProps: {
        treeData: menuTreeData,
        multiple: true,
        treeCheckable: true,
        showCheckedStrategy: 'SHOW_PARENT',
        placeholder: '输入关键字进行过滤',
        style: { width: '100%' },
        treeDefaultExpandAll: true,
        allowClear: true,
        showSearch: true,
        treeNodeFilterProp: 'title',
        maxTagCount: 'responsive',
        dropdownStyle: { maxHeight: 400, overflow: 'auto' },
        onSelect: () => false, // 阻止选择后自动关闭
        loading: loading,
        fieldNames: {
          label: 'title',
          value: 'id',
          children: 'children',
        },
      },
    },
  ];

  // 数据权限表单配置
  const dataPermissionForm: BaseFormList[] = [
    {
      label: '数据权限',
      name: 'dataPermissions',
      component: 'TreeSelect',
      placeholder: '输入关键字进行过滤',
      componentProps: {
        treeData: getDataPermissionTree(),
        multiple: true,
        treeCheckable: true,
        showCheckedStrategy: 'SHOW_PARENT',
        placeholder: '输入关键字进行过滤',
        style: { width: '100%' },
        treeDefaultExpandAll: true,
        allowClear: true,
        showSearch: true,
        treeNodeFilterProp: 'path',
        maxTagCount: 'responsive',
        dropdownStyle: { maxHeight: 400, overflow: 'auto' },
        onSelect: () => false, // 阻止选择后自动关闭
        fieldNames: {
          label: 'path',
          value: 'id',
          children: 'children',
        },
      },
    },
  ];

  const handleFunctionalPermissionChange = (changedValues: any, allValues: any) => {
    if (changedValues.permissions !== undefined) {
      setFunctionalPermissions(changedValues.permissions);
    }
  };

  const handleDataPermissionChange = (changedValues: any, allValues: any) => {
    if (changedValues.dataPermissions !== undefined) {
      setDataPermissions(changedValues.dataPermissions);
    }
  };

  const handleOk = async () => {
    if (!record) {
      message.error('角色信息不存在');
      return;
    }
    try {
      setLoading(true);
      // 更新API权限 (功能权限对应API权限)

      await updateRoleApiPerms({
        id: record.id,
        id_list: dataPermissions,
      });

      // 更新菜单权限 (数据权限对应菜单权限)
      await updateRoleMenuPerms({
        id: record.id,
        id_list: functionalPermissions,
      });

      message.success('权限修改成功');

      const finalValues = {
        permissions: functionalPermissions,
        dataPermissions: dataPermissions,
      };

      onOk(finalValues);
    } catch (error) {
      console.error('权限修改失败:', error);
      message.error('权限修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`修改权限 - ${record?.name || ''}`}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      width={800}
      confirmLoading={loading}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>功能权限</h3>
          <BaseForm
            list={functionalPermissionForm}
            data={{ permissions: functionalPermissions }}
            handleFinish={() => {}}
            onValuesChange={handleFunctionalPermissionChange}
          />
        </div>
        <div>
          <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: 600 }}>数据权限</h3>
          <BaseForm
            list={dataPermissionForm}
            data={{ dataPermissions: dataPermissions }}
            handleFinish={() => {}}
            onValuesChange={handleDataPermissionChange}
          />
        </div>
      </div>
    </Modal>
  );
};

export default PermissionEditModal;
