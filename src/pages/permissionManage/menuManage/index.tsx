import { searchList, tableColumns, formList, type Menu } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';

// 初始化新增数据
const initCreate = {
  type: 2, // 默认选择菜单类型
  status: 1, // 默认状态
  sort: 1,
  pid: 0, // 默认父级菜单为根目录
};

const MenuPage = () => {
  // 操作列渲染
  function buildTree(flatList: Menu[]): Menu[] {
    const itemMap = new Map<number, Menu>();
    flatList.forEach((item) => {
      itemMap.set(item.id, {
        ...item,
        children: [],
      });
    });
    const treeData: Menu[] = [];
    flatList.forEach((item) => {
      const parent = itemMap.get(item.pid);

      if (parent) {
        parent.children?.push(itemMap.get(item.id)!);
      } else {
        treeData.push(itemMap.get(item.id)!);
      }
    });

    return treeData;
  }

  const mockData: Menu[] = [
    {
      id: 1,
      pid: 0,
      name: '仪表盘',
      code: 'dashboard',
      icon: 'la:tachometer-alt',
      type: 2,
      route_name: 'Dashboard',
      route_path: '/dashboard',
      component_path: '/dashboard',
      status: 1,
      sort: 1,
      desc: '仪表盘模块',
      api_id: null,
    },
    {
      id: 201,
      pid: 0,
      name: '组件',
      code: 'demo',
      icon: 'fluent:box-20-regular',
      type: 1,
      route_name: 'Demo',
      route_path: '/demo',
      component_path: 'Layout',
      status: 1,
      sort: 2,
      desc: '组件模块',
      api_id: null,
    },
    {
      id: 202,
      pid: 201,
      name: '剪切板',
      code: 'demo:copy',
      icon: null,
      type: 2,
      route_name: 'Copy',
      route_path: '/demo/copy',
      component_path: '/demo/copy/index',
      status: 1,
      sort: 1,
      desc: '剪切板模块',
      api_id: null,
    },
    {
      id: 203,
      pid: 201,
      name: '水印',
      code: 'demo:watermark',
      icon: null,
      type: 2,
      route_name: 'Watermark',
      route_path: '/demo/watermark',
      component_path: '/demo/watermark/index',
      status: 1,
      sort: 2,
      desc: '水印模块',
      api_id: null,
    },
    {
      id: 204,
      pid: 201,
      name: '虚拟滚动',
      code: 'demo:virtualScroll',
      icon: null,
      type: 2,
      route_name: 'VirtualScroll',
      route_path: '/demo/virtualScroll',
      component_path: '/demo/virtualScroll/index',
      status: 1,
      sort: 3,
      desc: '虚拟滚动模块',
      api_id: null,
    },
    {
      id: 205,
      pid: 201,
      name: '富文本',
      code: 'demo:editor',
      icon: null,
      type: 2,
      route_name: 'Editor',
      route_path: '/demo/editor',
      component_path: '/demo/editor/index',
      status: 1,
      sort: 4,
      desc: '富文本模块',
      api_id: null,
    },

    {
      id: 209,
      pid: 0,
      name: '商家管理',
      code: 'merchantManage',
      icon: 'la:tachometer-alt',
      type: 1,
      route_name: 'MerchantManage',
      route_path: '/merchantManage',
      component_path: 'layout',
      status: 1,
      sort: 3,
      desc: '商家管理模块',
      api_id: null,
    },
    {
      id: 210,
      pid: 209,
      name: '商家分类',
      code: 'merchantManage:merchantSort',
      icon: null,
      type: 2,
      route_name: 'MerchantSort',
      route_path: '/merchantManage/merchantSort',
      component_path: '/merchantManage/merchantSort/index',
      status: 1,
      sort: 1,
      desc: '商家分类模块',
      api_id: null,
    },
    {
      id: 2100,
      pid: 210,
      name: '添加商家',
      code: 'merchantManage:merchantSort:add',
      icon: null,
      type: 3,
      route_name: '',
      route_path: '',
      component_path: '',
      status: 1,
      sort: 1,
      desc: '商家分类模块',
      api_id: null,
    },
    {
      id: 211,
      pid: 209,
      name: '商家详情列表',
      code: 'merchantManage:merchants',
      icon: null,
      type: 2,
      route_name: 'Merchants',
      route_path: '/merchantManage/merchants',
      component_path: '/merchantManage/merchants/index',
      status: 1,
      sort: 2,
      desc: '商家详情列表模块',
      api_id: null,
    },
    {
      id: 212,
      pid: 209,
      name: '商家申请列表',
      code: 'merchantManage:merchantApplication',
      icon: null,
      type: 2,
      route_name: 'MerchantApplication',
      route_path: '/merchantManage/merchantApplication',
      component_path: '/merchantManage/merchantApplication/index',
      status: 1,
      sort: 3,
      desc: '商家申请列表模块',
      api_id: null,
    },
    {
      id: 213,
      pid: 0,
      name: '楼栋楼层管理',
      code: 'buildsManage',
      icon: 'fluent:box-20-regular',
      type: 2,
      route_name: 'BuildsManage',
      route_path: '/buildsManage',
      component_path: '/buildsManage',
      status: 1,
      sort: 6,
      desc: '楼栋楼层管理模块',
      api_id: null,
    },
    {
      id: 214,
      pid: 0,
      name: '余额明细管理',
      code: 'balanceManage',
      icon: 'fluent:box-20-regular',
      type: 2,
      route_name: 'BalanceManage',
      route_path: '/balanceManage',
      component_path: '/balanceManage',
      status: 1,
      sort: 7,
      desc: '余额明细管理模块',
      api_id: null,
    },
    {
      id: 226,
      pid: 0,
      name: '用户管理',
      code: 'usersManage',
      icon: 'la:tachometer-alt',
      type: 2,
      route_name: 'UsersManage',
      route_path: '/usersManage',
      component_path: '/usersManage',
      status: 1,
      sort: 5,
      desc: '用户管理模块',
      api_id: null,
    },
    {
      id: 1001,
      pid: 226,
      name: '查询用户',
      code: 'usersManage:search',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 1,
      desc: '查询用户操作权限',
      api_id: 101,
    },
    {
      id: 1002,
      pid: 226,
      name: '添加用户',
      code: 'usersManage:add',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 2,
      desc: '添加用户操作权限',
      api_id: 102,
    },
    {
      id: 1003,
      pid: 226,
      name: '编辑用户',
      code: 'usersManage:edit',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 3,
      desc: '编辑用户操作权限',
      api_id: 103,
    },
    {
      id: 1004,
      pid: 226,
      name: '删除用户',
      code: 'usersManage:delete',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 4,
      desc: '删除用户操作权限',
      api_id: 104,
    },
    {
      id: 215,
      pid: 0,
      name: '字典管理',
      code: 'dictionaryManage',
      icon: 'la:tachometer-alt',
      type: 2,
      route_name: 'DictionaryManage',
      route_path: '/dictionaryManage',
      component_path: '/dictionaryManage',
      status: 1,
      sort: 8,
      desc: '字典管理模块',
      api_id: null,
    },
    {
      id: 216,
      pid: 0,
      name: '学校管理',
      code: 'schoolsManage',
      icon: 'la:tachometer-alt',
      type: 2,
      route_name: 'SchoolsManage',
      route_path: '/schoolsManage',
      component_path: '/schoolsManage',
      status: 1,
      sort: 9,
      desc: '学校管理模块',
      api_id: null,
    },
    {
      id: 229,
      pid: 0,
      name: '城市管理',
      code: 'citysManage',
      icon: 'la:tachometer-alt',
      type: 2,
      route_name: 'CitysManage',
      route_path: '/citysManage',
      component_path: '/citysManage',
      status: 1,
      sort: 10,
      desc: '城市管理模块',
      api_id: null,
    },
    {
      id: 239,
      pid: 0,
      name: '团长管理',
      code: 'colonelManage',
      icon: 'la:tachometer-alt',
      type: 2,
      route_name: 'ColonelManage',
      route_path: '/colonelManage',
      component_path: '/colonelManage',
      status: 1,
      sort: 11,
      desc: '团长管理模块',
      api_id: null,
    },
    {
      id: 249,
      pid: 0,
      name: '实名认证',
      code: 'certManage',
      icon: 'la:tachometer-alt',
      type: 2,
      route_name: 'CertManage',
      route_path: '/certManage',
      component_path: '/certManage',
      status: 1,
      sort: 12,
      desc: '实名认证模块',
      api_id: null,
    },
    {
      id: 250,
      pid: 0,
      name: '权限管理',
      code: 'permissionManage',
      icon: 'la:tachometer-alt',
      type: 1,
      route_name: 'PermissionManage',
      route_path: '/permissionManage',
      component_path: '/permissionManage',
      status: 1,
      sort: 13,
      desc: '权限管理模块',
      api_id: null,
    },
    {
      id: 251,
      pid: 250,
      name: '菜单管理',
      code: 'permissionManage:menuManage',
      icon: 'la:tachometer-alt',
      type: 2,
      route_name: 'MenuManage',
      route_path: '/permissionManage/menuManage',
      component_path: '/permissionManage/menuManage/index',
      status: 1,
      sort: 1,
      desc: '菜单管理模块',
      api_id: null,
    },
    {
      id: 252,
      pid: 250,
      name: '角色管理',
      code: 'permissionManage:roleManage',
      icon: 'la:tachometer-alt',
      type: 2,
      route_name: 'RoleManage',
      route_path: '/permissionManage/roleManage',
      component_path: '/permissionManage/roleManage/index',
      status: 1,
      sort: 2,
      desc: '角色管理模块',
      api_id: null,
    },
    {
      id: 1005,
      pid: 215,
      name: '查询字典',
      code: 'dictionaryManage:search',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 1,
      desc: '查询字典操作权限',
      api_id: 201,
    },
    {
      id: 1045,
      pid: 215,
      name: '添加字典',
      code: 'dictionaryManage:add',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 2,
      desc: '添加字典操作权限',
      api_id: 202,
    },
  ];

  const menuTree = buildTree(mockData);
  console.log(menuTree);
  // 操作列渲染
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

  // 表单值变化处理函数
  const handleFormValuesChange = (changedValues: any, allValues: any) => {
    // 如果type字段发生变化，进行相应的处理
    if (changedValues.type) {
      console.log('菜单类型已切换为:', changedValues.type);
    }
  };

  return (
    <CRUDPageTemplate
      title="菜单管理"
      searchConfig={searchList()}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      mockData={menuTree}
      optionRender={optionRender}
      onFormValuesChange={handleFormValuesChange}
    />
  );
};

export default MenuPage;
