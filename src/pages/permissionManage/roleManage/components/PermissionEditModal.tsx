import { useState, useEffect } from 'react';
import { Modal, message, Tree } from 'antd';
import type { Role } from '../model';
import { getMenuPermissionTree, getDataPermissionTree } from '../model';
import {
  getRoleApiPerms,
  getRoleMenuPerms,
  updateRoleApiPerms,
  updateRoleMenuPerms,
} from '@/servers/perms/role';
import { refreshSidebarMenu } from '@/utils/menuRefresh';

interface PermissionEditModalProps {
  visible: boolean;
  record: Role | null;
  onCancel: () => void;
  onOk: (values: any) => void;
}

const PermissionEditModal = ({ visible, record, onCancel, onOk }: PermissionEditModalProps) => {
  const [functionalPermissions, setFunctionalPermissions] = useState<string[]>([]);
  const [dataPermissions, setDataPermissions] = useState<string[]>([]);
  const [menuTreeData, setMenuTreeData] = useState<any[]>([]);
  const [dataPermissionTreeData, setDataPermissionTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

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
          console.log('=== 初始化权限数据 ===');
          console.log('后端返回的menuIds:', menuIds);
          console.log('menuResponse完整数据:', menuResponse);

          // 直接设置后端返回的权限ID，Tree组件会自动处理父子关联显示
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

  // 处理功能权限树形数据
  const processFunctionalTreeData = (nodes: any[]): any[] => {
    return (
      nodes?.map((node: any) => ({
        ...node,
        key: node.id,
        checkable: true, // 所有节点都可以选中，包括菜单和权限操作，以支持完整权限传递
        children: node.children ? processFunctionalTreeData(node.children) : undefined,
      })) || []
    );
  };

  // 处理数据权限树形数据
  const processDataTreeData = (nodes: any[]): any[] => {
    return (
      nodes?.map((node: any) => ({
        ...node,
        key: node.value,
        checkable: true, // 所有节点都可以选中，包括分组节点，以支持父子联动
        children: node.children ? processDataTreeData(node.children) : undefined,
      })) || []
    );
  };

  // 收集子级ID
  const collectChildrenIds = (treeData: any[], selectedIds: any[]): any[] => {
    const childrenIds: any[] = [];

    const getNodeKey = (node: any) => {
      return node.key || node.id || node.value;
    };

    const findChildren = (nodes: any[]) => {
      nodes.forEach((node) => {
        const nodeKey = getNodeKey(node);

        // 检查当前节点是否被选中
        if (selectedIds.includes(nodeKey)) {
          // 收集所有子级ID
          const collectAllChildren = (children: any[]) => {
            children.forEach((child) => {
              const childKey = getNodeKey(child);
              childrenIds.push(childKey);
              if (child.children && child.children.length > 0) {
                collectAllChildren(child.children);
              }
            });
          };

          if (node.children && node.children.length > 0) {
            collectAllChildren(node.children);
          }
        }

        // 递归检查子节点
        if (node.children && node.children.length > 0) {
          findChildren(node.children);
        }
      });
    };

    findChildren(treeData);
    return [...new Set(childrenIds)]; // 去重
  };

  // 收集所有相关的父级ID
  const collectParentIds = (treeData: any[], selectedIds: any[]): any[] => {
    const parentIds: any[] = [];

    const getNodeKey = (node: any) => {
      return node.key || node.id || node.value;
    };

    const findParents = (nodes: any[], targetIds: any[], parentPath: any[] = []) => {
      nodes.forEach((node) => {
        const nodeKey = getNodeKey(node);
        const currentPath = [...parentPath, nodeKey];

        // 检查当前节点是否被选中
        if (targetIds.includes(nodeKey)) {
          // 将所有父级ID添加到结果中
          parentIds.push(...parentPath);
        }

        // 递归检查子节点
        if (node.children && node.children.length > 0) {
          findParents(node.children, targetIds, currentPath);
        }
      });
    };

    findParents(treeData, selectedIds);
    return [...new Set(parentIds)]; // 去重
  };

  // 收集所有相关的ID（包括父级、选中节点和子级）
  const collectAllRelatedIds = (treeData: any[], selectedIds: any[]): any[] => {
    // 收集父级ID
    const parentIds = collectParentIds(treeData, selectedIds);
    // 收集子级ID
    const childrenIds = collectChildrenIds(treeData, selectedIds);

    // 合并所有ID并去重
    const allIds = [...new Set([...parentIds, ...selectedIds, ...childrenIds])];

    return allIds;
  };

  // 功能权限Tree选中事件处理
  const handleFunctionalTreeCheck = (checkedKeys: any, info: any) => {
    // 当checkStrictly=false时，checkedKeys自动包含所有选中的节点（父级+子级）
    const keys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked || [];

    console.log('=== 功能权限Tree选中事件 ===');
    console.log('原始checkedKeys:', checkedKeys);
    console.log('处理后的keys:', keys);
    console.log('选中信息info:', info);

    // Tree组件已经自动处理父子关联，直接使用checkedKeys
    setFunctionalPermissions(keys);
    console.log('设置新的functionalPermissions:', keys);
  };

  // 数据权限Tree选中事件处理
  const handleDataTreeCheck = (checkedKeys: any, info: any) => {
    // 当checkStrictly=false时，checkedKeys自动包含所有选中的节点（父级+子级）
    const keys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked || [];

    console.log('=== 数据权限Tree选中事件 ===');
    console.log('原始checkedKeys:', checkedKeys);
    console.log('处理后的keys:', keys);
    console.log('选中信息info:', info);

    // Tree组件已经自动处理父子关联，直接使用checkedKeys
    setDataPermissions(keys);
    console.log('设置新的dataPermissions:', keys);
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

      const allFunctionalIds = functionalPermissions;

      const allDataIds = dataPermissions;

      const convertedDataPermissions = allDataIds
        .filter((value: string) => {
          // 保留所有权限相关的值，包括分组(group-)和API(api-)
          return (
            typeof value === 'string' && (value.startsWith('api-') || value.startsWith('group-'))
          );
        })
        .map((value: string) => {
          // 将前缀转换为纯数字 ID
          if (value.startsWith('api-')) {
            return parseInt(value.replace('api-', ''), 10);
          } else if (value.startsWith('group-')) {
            return parseInt(value.replace('group-', ''), 10);
          }
          return null;
        })
        .filter((id: any) => !isNaN(id) && id !== null && id !== undefined);

      await updateRoleApiPerms({
        id: record.id,
        id_list: convertedDataPermissions,
      });

      const convertedFunctionalPermissions = allFunctionalIds
        .map((value: any) => {
          const id = typeof value === 'string' ? parseInt(value, 10) : value;
          const result = typeof id === 'number' && !isNaN(id) ? id : null;
          console.log('转换结果:', value, '->', result);
          return result;
        })
        .filter((id: any) => {
          const isValid = id !== null && id !== undefined && !isNaN(id);
          console.log('ID过滤结果:', id, '是否有效:', isValid);
          return isValid;
        });

      await updateRoleMenuPerms({
        id: record.id,
        id_list: convertedFunctionalPermissions,
      });

      message.success('权限修改成功');

      // 刷新侧边栏菜单以使权限变更立即生效
      refreshSidebarMenu();

      const finalValues = {
        permissions: convertedFunctionalPermissions,
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
      title={
        <div
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          ⚙️ 修改权限 - {record?.name || ''}
        </div>
      }
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      width={1200}
      confirmLoading={loading}
      styles={{
        body: { padding: '24px' },
        header: {
          borderBottom: '1px solid #f0f0f0',
          paddingBottom: '16px',
          marginBottom: '0',
        },
      }}
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
        <div style={{ display: 'flex', gap: '24px', height: '450px' }}>
          {/* 功能权限 - 左侧 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                color: 'black',
                padding: '16px 20px',
                borderRadius: '8px 8px 0 0',
                fontSize: '16px',
                fontWeight: 600,
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              🔐 功能权限
            </div>
            <div
              style={{
                flex: 1,
                border: '1px solid #e8e8e8',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                padding: '16px',
                overflowY: 'auto',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <Tree
                checkable
                checkStrictly={true}
                defaultExpandAll
                checkedKeys={functionalPermissions}
                treeData={processFunctionalTreeData(menuTreeData)}
                onCheck={handleFunctionalTreeCheck}
                fieldNames={{
                  title: 'title',
                  key: 'key',
                  children: 'children',
                }}
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>

          {/* 数据权限 - 右侧 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                color: 'black',
                padding: '16px 20px',
                borderRadius: '8px 8px 0 0',
                fontSize: '16px',
                fontWeight: 600,
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >
              🛡️ 数据权限
            </div>
            <div
              style={{
                flex: 1,
                border: '1px solid #e8e8e8',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                padding: '16px',
                overflowY: 'auto',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <Tree
                checkable
                checkStrictly={true}
                defaultExpandAll
                checkedKeys={dataPermissions}
                treeData={processDataTreeData(dataPermissionTreeData)}
                onCheck={handleDataTreeCheck}
                fieldNames={{
                  title: 'title',
                  key: 'key',
                  children: 'children',
                }}
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PermissionEditModal;
