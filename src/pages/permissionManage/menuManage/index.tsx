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
  create: addMenu,
  update: updateMenu,
  delete: deleteMenu,
};

const initCreate = {
  type: 2,
  status: 1,
  sort: 1,
  pid: 0,
};

const MenuPage = () => {
  // 1. State 现在只用于存储普通的、扁平的下拉选项
  const [menuOptions, setMenuOptions] = useState<{ label: string; value: number }[]>([]);
  const [isMenuOptionsLoading, setMenuOptionsLoading] = useState(false);

  // 根据菜单类型获取父级菜单选项
  const fetchMenuOptionsByType = async (menuType: number) => {
    setMenuOptionsLoading(true);
    try {
      let typeParams: number[] = [];

      if (menuType === 2) {
        typeParams = [1];
      } else if (menuType === 3) {
        typeParams = [2];
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
    fetchMenuOptionsByType(2);
  }, []);

  const optionRender = (
    record: Menu,
    actions: {
      handleEdit: (record: Menu) => void;
      handleDelete: (id: number) => void;
    },
  ) => {
    return (
      <TableActions record={record} onEdit={actions.handleEdit} onDelete={actions.handleDelete} />
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
      onFormValuesChange={handleFormValuesChange}
      onEditOpen={(record) => {
        // 当编辑时，设置父级菜单的值
        // 如果有父级菜单(pid不为0)，显示父级菜单；否则显示根目录(pid为0)
        const parentId = record.pid || 0;
        console.log('编辑菜单，父级菜单ID:', parentId, '菜单数据:', record);

        // 根据当前编辑菜单的类型，动态获取对应的父级菜单选项
        if (record.type) {
          fetchMenuOptionsByType(record.type);
        }

        // 确保表单能正确显示父级菜单
        // 由于我们已经在menuOptions中包含了"根目录"选项(value: 0)
        // 所以无论pid是什么值，都能在下拉选项中找到对应的显示
        if (parentId === 0) {
          console.log('当前菜单为顶级菜单，父级为根目录');
        } else {
          console.log('当前菜单有父级菜单，父级ID为:', parentId);
        }
      }}
      apis={{
        fetch: async (params: any) => {
          const response = await menuApis.fetch(params);
          console.log('API 原始响应:', response);
          const flatList = response?.data || [];
          console.log('提取出的扁平列表:', flatList);
          // 3. 调用您自己的函数进行转换
          const treeData = buildTree(flatList);
          console.log('转换后的树形数据:', treeData);
          return {
            data: treeData,
          };
        },
        create: menuApis.create,
        update: (id: number, data: any) => {
          return menuApis.update({ ...data, id });
        },
        delete: (id: number) => menuApis.delete([id]),
      }}
      optionRender={optionRender}
      onFormValuesChange={handleFormValuesChange}
      pagination={false}
    />
  );
};

export default MenuPage;
