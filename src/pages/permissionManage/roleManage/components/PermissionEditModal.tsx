import { useState, useEffect, useRef } from 'react';
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
  const [functionalPermissions, setFunctionalPermissions] = useState<string[]>([]);
  const [dataPermissions, setDataPermissions] = useState<string[]>([]);
  const treeSelectRef = useRef<any>(null);
  const [menuTreeData, setMenuTreeData] = useState<any[]>([]);
  const [dataPermissionTreeData, setDataPermissionTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  // 移除不再需要的状态变量

  // 统一加载所有数据
  useEffect(() => {
    if (visible && record) {
      setInitialLoading(true);
      // 并行加载权限树数据和角色权限数据
      Promise.all([
        getMenuPermissionTree(),
        getDataPermissionTree(),
        getRoleApiPerms(record.id.toString()),
        getRoleMenuPerms(record.id.toString()),
      ])
        .then(([menuData, dataPermissionData, apiResponse, menuResponse]) => {
          // 设置权限树数据
          setMenuTreeData(menuData);
          setDataPermissionTreeData(dataPermissionData);

          // 设置API权限到数据权限
          const apiData = apiResponse.data || [];
          // 处理API权限数据，提取ID并转换为带前缀的格式
          const convertedApiIds = apiData.map((item: any) => {
            // 如果是对象，提取id；如果是数字，直接使用
            const id = typeof item === 'object' ? item.id : item;
            return `api-${id}`;
          });
          setDataPermissions(convertedApiIds);

          // 设置菜单权限到功能权限
          const menuIds = menuResponse.data?.menu_ids || [];
          setFunctionalPermissions(menuIds);
        })
        .catch((error) => {
          console.error('加载权限数据失败:', error);
          message.error('加载权限数据失败');
        })
        .finally(() => {
          setInitialLoading(false);
        });
    }
  }, [visible, record]);

  // 重置状态当Modal关闭时
  useEffect(() => {
    if (!visible) {
      setFunctionalPermissions([]);
      setDataPermissions([]);
      setMenuTreeData([]);
      setDataPermissionTreeData([]);
      setInitialLoading(false);
    }
  }, [visible]);

  // 功能权限表单配置
  const functionalPermissionForm: BaseFormList[] = [
    {
      label: '页面权限',
      name: 'permissions',
      component: 'TreeSelect',
      placeholder: '输入关键字进行过滤',
      rules: FORM_REQUIRED,
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
      label: 'API权限',
      name: 'dataPermissions',
      component: 'TreeSelect',
      placeholder: '输入关键字进行过滤',
      rules: FORM_REQUIRED,
      componentProps: {
        // 处理树形数据，移除父节点（分组）的复选框
        treeData: dataPermissionTreeData?.map((node: any) => ({
          ...node,
          checkable: !node.value?.startsWith('group-'), // 分组节点不显示复选框
          children: node.children?.map((child: any) => ({
            ...child,
            checkable: !child.value?.startsWith('group-'), // 子分组节点不显示复选框
          })),
        })),
        multiple: true,
        treeCheckable: true,
        treeCheckStrictly: true, // 严格模式，父子节点选择状态不关联
        showCheckedStrategy: 'SHOW_CHILD', // 只显示子节点
        placeholder: '输入关键字进行过滤',
        style: { width: '100%' },
        treeDefaultExpandAll: true,
        allowClear: true,
        showSearch: true,
        treeNodeFilterProp: 'path',
        maxTagCount: 'responsive',
        dropdownStyle: { maxHeight: 400, overflow: 'auto' },
        dropdownMatchSelectWidth: false,
        // 基础配置
        ref: treeSelectRef,
        autoClearSearchValue: false,
        // 在选择后保持下拉框打开
        onSelect: () => {
          // 选择后重新打开下拉框
          setTimeout(() => {
            if (treeSelectRef.current) {
              treeSelectRef.current.focus();
              // 模拟点击打开下拉框
              const event = new MouseEvent('mousedown', { bubbles: true });
              treeSelectRef.current.querySelector('.ant-select-selector')?.dispatchEvent(event);
            }
          }, 50);
        },
        fieldNames: {
          label: 'title',
          value: 'value',
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
      // 处理 treeCheckStrictly 模式下的数据格式
      let processedPermissions = changedValues.dataPermissions;

      // 如果是对象数组格式，提取 value 值
      if (Array.isArray(processedPermissions) && processedPermissions.length > 0) {
        if (typeof processedPermissions[0] === 'object' && processedPermissions[0].value) {
          processedPermissions = processedPermissions.map((item: any) => item.value);
        }
      }

      setDataPermissions(processedPermissions);
    }
  };

  const handleOk = async () => {
    if (!record) {
      message.error('角色信息不存在');
      return;
    }

    // 验证权限不能为空
    if (!functionalPermissions || functionalPermissions.length === 0) {
      message.error('请至少选择一个功能权限');
      return;
    }

    if (!dataPermissions || dataPermissions.length === 0) {
      message.error('请至少选择一个数据权限');
      return;
    }

    try {
      setLoading(true);
      // 更新API权限 (功能权限对应API权限)
      // 只提交API ID，过滤掉分组ID
      const convertedDataPermissions = dataPermissions
        .filter((value: string) => {
          // 只保留以 'api-' 开头的值，过滤掉分组
          return typeof value === 'string' && value.startsWith('api-');
        })
        .map((value: string) => {
          // 将 'api-' 前缀转换为纯数字 ID
          return parseInt(value.replace('api-', ''), 10);
        })
        .filter((id: any) => !isNaN(id) && id !== null && id !== undefined);

      await updateRoleApiPerms({
        id: record.id,
        id_list: convertedDataPermissions,
      });

      // 更新菜单权限 (数据权限对应菜单权限)
      await updateRoleMenuPerms({
        id: record.id,
        id_list: functionalPermissions,
      });

      message.success('权限修改成功');

      const finalValues = {
        permissions: functionalPermissions,
        dataPermissions: convertedDataPermissions,
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
      {initialLoading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '300px',
            fontSize: '14px',
            color: '#666',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                marginBottom: '12px',
                width: '32px',
                height: '32px',
                border: '3px solid #f3f3f3',
                borderTop: '3px solid #1890ff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
              }}
            ></div>
            <div>正在加载权限数据...</div>
            <style>{`
               @keyframes spin {
                 0% { transform: rotate(0deg); }
                 100% { transform: rotate(360deg); }
               }
             `}</style>
          </div>
        </div>
      ) : (
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
              data={{
                dataPermissions: dataPermissions.map((value: string) => ({
                  value: value,
                  label: value,
                })),
              }}
              handleFinish={() => {}}
              onValuesChange={handleDataPermissionChange}
            />
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PermissionEditModal;
