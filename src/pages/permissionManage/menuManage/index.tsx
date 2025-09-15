// MenuPage.tsx
import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type Menu } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import {
  getMenuList,
  addMenu,
  updateMenu,
  deleteMenu,
  getMenuSelectList,
} from '@/servers/perms/menu';
import { refreshSidebarMenu } from '@/utils/menuRefresh';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import type { Key } from 'react';

function buildTree(flatList: Menu[]): Menu[] {
  if (!Array.isArray(flatList) || flatList.length === 0) {
    return [];
  }
  const itemMap = new Map<number, Menu & { children: Menu[] }>();
  flatList.forEach((item) => {
    itemMap.set(item.id, { ...item, children: [] });
  });
  const treeData: Menu[] = [];
  itemMap.forEach((item) => {
    const parent = itemMap.get(item.pid);
    if (parent) {
      parent.children.push(item);
    } else {
      treeData.push(item);
    }
  });
  return treeData;
}

const menuApis = {
  fetch: getMenuList,
  create: async (data: any) => {
    const result = await addMenu(data);
    // 创建成功后刷新侧边栏菜单
    if (result) {
      await refreshSidebarMenu();
    }
    return result;
  },
  update: async (data: any) => {
    const result = await updateMenu(data);
    // 更新成功后刷新侧边栏菜单
    if (result) {
      await refreshSidebarMenu();
    }
    return result;
  },
  delete: async (id: Array<number>) => {
    const result = await deleteMenu(id);
    // 删除成功后刷新侧边栏菜单
    if (result) {
      await refreshSidebarMenu();
    }
    return result;
  },
};

const initCreate = {
  type: 1,
  status: 1,
  sort: 1,
  pid: 0,
};

const MenuPage = () => {
  // 1. State 现在只用于存储普通的、扁平的下拉选项
  const [menuOptions, setMenuOptions] = useState<{ label: string; value: number }[]>([]);
  const [isMenuOptionsLoading, setMenuOptionsLoading] = useState(false);

  // 权限检查
  const { permissions } = useUserStore();
  const hasPermission = (permission: string) => checkPermission(permission, permissions);

  // 根据菜单类型获取父级菜单选项
  const fetchMenuOptionsByType = async (menuType: number) => {
    setMenuOptionsLoading(true);
    try {
      let typeParams: string[] = [];

      if (menuType === 2) {
        typeParams = ['1'];
      } else if (menuType === 3) {
        typeParams = ['2'];
      }

      // 调用API获取指定类型的菜单列表
      const response = await getMenuSelectList({ type: typeParams });
      const options = response.data.data.map((item: any) => ({
        label: item.name,
        value: item.id,
      }));

      // 目录和菜单类型都可以选择根目录，按钮类型不能选择根目录
      const finalOptions =
        menuType === 1 || menuType === 2 ? [{ label: '根目录', value: 0 }, ...options] : options;

      setMenuOptions(finalOptions);
    } catch (error) {
      console.error('加载父级菜单选项失败:', error);
    } finally {
      setMenuOptionsLoading(false);
    }
  };

  // 初始化时获取目录列表（默认为目录类型）
  useEffect(() => {
    fetchMenuOptionsByType(1);
  }, []);

  // 确保menuOptions始终包含根目录选项
  useEffect(() => {
    if (menuOptions.length === 0 || !menuOptions.find((option) => option.value === 0)) {
      setMenuOptions((prev) => {
        const hasRootOption = prev.find((option) => option.value === 0);
        if (!hasRootOption) {
          return [{ label: '根目录', value: 0 }, ...prev];
        }
        return prev;
      });
    }
  }, [menuOptions]);

  const optionRender = (
    record: Menu,
    actions: {
      handleEdit: (record: Menu) => void;
      handleDelete?: (id: Key[]) => void; // 修改为可选的Key[]类型
    },
  ) => {
    const canEdit = hasPermission('mp:menu:update');
    const canDelete = hasPermission('mp:menu:delete');

    return (
      <TableActions
        record={record}
        onEdit={actions.handleEdit}
        onDelete={() => actions.handleDelete?.([record.id])} // 传入数组
        disableEdit={!canEdit}
        disableDelete={!canDelete}
      />
    );
  };

  const handleFormValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.type) {
      fetchMenuOptionsByType(changedValues.type);
    }
  };

  return (
    <CRUDPageTemplate
      title="菜单管理"
      isDelete={true} // 添加isDelete属性
      searchConfig={searchList()}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList({ menuOptions, isMenuOptionsLoading })}
      initCreate={initCreate}
      disableCreate={!hasPermission('mp:menu:add')}
      disableBatchDelete={!hasPermission('mp:menu:delete')}
      onFormValuesChange={handleFormValuesChange} // 只保留一个onFormValuesChange
      onEditOpen={(record) => {
        const parentId = record.pid || 0;
        if (record.type) {
          fetchMenuOptionsByType(record.type);
        }
        if (parentId === 0) {
          // 根目录处理逻辑
        } else {
          // 非根目录处理逻辑
        }
      }}
      apis={{
        fetchApi: async (params: any) => {
          // 处理搜索参数，过滤掉空值和无效值
          const searchParams: any = {};

          // 菜单名称筛选
          if (params.name && typeof params.name === 'string' && params.name.trim()) {
            searchParams.name = params.name.trim();
          }

          // 状态筛选 - 只有当状态值为1或2时才添加到搜索参数
          if (params.status !== undefined && params.status !== null && params.status !== '') {
            const statusValue = Number(params.status);
            if (statusValue === 1 || statusValue === 2) {
              searchParams.status = statusValue;
            }
          }

          const response = await menuApis.fetch(searchParams);
          const flatList = response?.data as unknown as Menu[];
          console.log("response", response)
          console.log("response", response)
          // 调用树形转换函数
          const treeData = buildTree(flatList);
          return {
            data: treeData,
          };
        },
        createApi: menuApis.create,
        updateApi: (data: any) => {
          return menuApis.update(data);
        },
        deleteApi: (id: number[]) => menuApis.delete(id),
      }}
      optionRender={optionRender}
      pagination={true}
    />
  );
};

export default MenuPage;