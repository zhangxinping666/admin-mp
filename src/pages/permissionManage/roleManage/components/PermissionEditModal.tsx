import { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import BaseForm from '@/components/Form/BaseForm';
import type { BaseFormList } from '#/form';
import type { Role } from '../model';
import { getMenuPermissionTree, getDataPermissionTree } from '../model';

interface PermissionEditModalProps {
  visible: boolean;
  record: Role | null;
  onCancel: () => void;
  onOk: (values: any) => void;
}

const PermissionEditModal = ({ visible, record, onCancel, onOk }: PermissionEditModalProps) => {
  const [functionalPermissions, setFunctionalPermissions] = useState<any[]>([]);
  const [dataPermissions, setDataPermissions] = useState<any[]>([]);

  useEffect(() => {
    if (record && visible) {
      setFunctionalPermissions(record.permissions || []);
      setDataPermissions(record.dataPermissions || []);
    }
  }, [record, visible]);

  // 功能权限表单配置
  const functionalPermissionForm: BaseFormList[] = [
    {
      label: '功能权限',
      name: 'permissions',
      component: 'TreeSelect',
      placeholder: '输入关键字进行过滤',
      componentProps: {
        treeData: getMenuPermissionTree(),
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
      console.log('功能权限选择变化:', {
        选中的权限: changedValues.permissions,
        变化时间: new Date().toLocaleString(),
      });
    }
  };

  const handleDataPermissionChange = (changedValues: any, allValues: any) => {
    if (changedValues.dataPermissions !== undefined) {
      setDataPermissions(changedValues.dataPermissions);
      console.log('数据权限树选择变化:', {
        选中的节点: changedValues.dataPermissions,
        变化时间: new Date().toLocaleString(),
      });
    }
  };

  const handleOk = () => {
    const finalValues = {
      permissions: functionalPermissions,
      dataPermissions: dataPermissions,
    };

    console.log('权限修改提交:', {
      角色信息: record,
      修改的权限: finalValues,
      提交时间: new Date().toLocaleString(),
    });

    message.success('权限修改成功！');
    onOk(finalValues);
  };

  return (
    <Modal
      title={`修改权限 - ${record?.name || ''}`}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      width={800}
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
