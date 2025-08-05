// MenuPage.tsx

import { searchList, tableColumns, formList, type Menu } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import {
  getMenuList,
  addMenu,
  updateMenu,
  deleteMenu,
  getMenuSelectList,
} from '@/servers/perms/menu'; // 导入您的真实API
import { refreshSidebarMenu } from '@/utils/menuRefresh';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';

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
      const flatList = response.data || [];

      // 将扁平列表映射为 Select 需要的 { label, value } 格式
      const options = flatList.map((item: Menu) => ({
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
      handleDelete: (id: number) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:menu:update');
    const canDelete = hasPermission('mp:menu:delete');

    return (
      <TableActions
        record={record}
        onEdit={actions.handleEdit}
        onDelete={actions.handleDelete}
        disableEdit={!canEdit}
        disableDelete={!canDelete}
      />
    );
  };
  const handleFormValuesChange = (changedValues: any, allValues: any) => {
    if (changedValues.type) {
      console.log('菜单类型已切换为:', changedValues.type);
      fetchMenuOptionsByType(changedValues.type);
    }
  };

  return (
    <CRUDPageTemplate
      title="菜单管理"
      searchConfig={searchList()}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList({ menuOptions, isMenuOptionsLoading })}
      initCreate={initCreate}
      disableCreate={!hasPermission('mp:menu:add')}
      disableBatchDelete={!hasPermission('mp:menu:delete')}
      onFormValuesChange={handleFormValuesChange}
      onEditOpen={(record) => {
        const parentId = record.pid || 0;
        console.log('编辑菜单，父级菜单ID:', parentId, '菜单数据:', record);
        if (record.type) {
          fetchMenuOptionsByType(record.type);
        }
        if (parentId === 0) {
          console.log('当前菜单为顶级菜单，父级为根目录');
        } else {
          console.log('当前菜单有父级菜单，父级ID为:', parentId);
        }
      }}
      apis={{
        fetchApi: async (params: any) => {
          console.log('菜单管理 fetchApi 接收到的搜索参数:', params);
          // 处理搜索参数，过滤掉空值和无效值
          const searchParams: any = {};

          // 菜单名称筛选
          if (params.name && typeof params.name === 'string' && params.name.trim()) {
            searchParams.name = params.name.trim();
            console.log('添加菜单名称搜索:', searchParams.name);
          }

          // 状态筛选 - 只有当状态值为1或2时才添加到搜索参数
          if (params.status !== undefined && params.status !== null && params.status !== '') {
            const statusValue = Number(params.status);
            if (statusValue === 1 || statusValue === 2) {
              searchParams.status = statusValue;
              console.log('添加状态搜索:', searchParams.status);
            }
          }

          console.log('最终发送的搜索参数:', searchParams);
          const response = await menuApis.fetch(searchParams);
          console.log('API响应数据:', response);
          const flatList = response?.data || [];
          // 调用树形转换函数
          const treeData = buildTree(flatList);
          console.log('转换后的树形数据:', treeData);
          return {
            data: treeData,
          };
        },
        createApi: menuApis.create,
        // ... existing code ...
        updateApi: (data: any) => {
          console.log('菜单管理 updateApi 接收到的数据:', data);
          // useCRUD传递的格式是 { id, ...values }
          return menuApis.update(data);
        },
        // ... existing code ...
        deleteApi: (id: number[]) => menuApis.delete(id),
      }}
      optionRender={optionRender}
      onFormValuesChange={handleFormValuesChange}
      pagination={true}
    />
  );
};

export default MenuPage;
