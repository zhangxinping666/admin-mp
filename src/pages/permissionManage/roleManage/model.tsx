import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';

// 角色接口定义
export interface Role {
  id: number;
  name: string;
  code: string;
  status: number;
}

export interface RoleItem {
  id: number;
  name: string;
  status: number;
}

export interface updateRoleForm {
  id: number;
  name: string;
  code: string;
  status: number;
}
export interface addRoleForm {
  name: string;
  code: string;
  status: number;
}
export interface RoleDetailResult {
  code: number;
  data: Role;
}

export interface RoleSelectListResult {
  code: number;
  data: RoleItem[];
}
export interface updateRolePermsForm {
  id: number;
  id_list: number[];
}
// 菜单权限树节点接口
export interface MenuTreeNode {
  id: number;
  path: string;
  children?: MenuTreeNode[];
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface RoleListResult {
  code: number;
  message: string;
  data: {
    list: Role[];
    page: number;
    page_size: number;
    pages: number;
    total: number;
  };
}

// 搜索配置
export const searchList = (): BaseSearchList[] => [
  {
    label: '角色名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入角色名称',
  },
  {
    label: '状态',
    name: 'status',
    component: 'Select',
    placeholder: '请选择状态',
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 },
      ],
    },
  },
];

// 菜单数据接口（从菜单管理页面引入）
interface MenuData {
  id: number;
  pid: number;
  name: string;
  code: string;
  icon: string | null;
  type: number;
  route_name: string | null;
  route_path: string | null;
  component_path: string | null;
  status: number;
  sort: number;
  desc: string;
  api_id: number | null;
  children?: MenuData[];
}

// 构建菜单树的函数（从菜单管理页面复制）
function buildMenuTree(flatList: MenuData[]): MenuData[] {
  const itemMap = new Map<number, MenuData>();
  flatList.forEach((item) => {
    itemMap.set(item.id, {
      ...item,
      children: [],
    });
  });

  const treeData: MenuData[] = [];
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

// 将菜单数据转换为权限树节点
function convertMenuToTreeNode(menuList: MenuData[]): MenuTreeNode[] {
  return menuList.map((menu) => ({
    key: menu.id,
    title: menu.name,
    id: menu.id,
    path: menu.name,
    children:
      menu.children && menu.children.length > 0 ? convertMenuToTreeNode(menu.children) : undefined,
  }));
}

export const getMenuPermissionTree = (): MenuTreeNode[] => {
  const mockMenuData: MenuData[] = [
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
      id: 206,
      pid: 201,
      name: '层级1',
      code: 'demo:level1',
      icon: null,
      type: 1,
      route_name: 'Level1',
      route_path: '/demo/level1',
      component_path: 'Layout',
      status: 1,
      sort: 5,
      desc: '层级1模块',
      api_id: null,
    },
    {
      id: 207,
      pid: 206,
      name: '层级2',
      code: 'demo:level1:level2',
      icon: null,
      type: 1,
      route_name: 'Level2',
      route_path: '/demo/level1/level2',
      component_path: 'Layout',
      status: 1,
      sort: 1,
      desc: '层级2模块',
      api_id: null,
    },
    {
      id: 208,
      pid: 207,
      name: '层级3',
      code: 'demo:level1:level2:level3',
      icon: null,
      type: 2,
      route_name: 'Level3',
      route_path: '/demo/level1/level2/level3',
      component_path: '/demo/level1/level2/level3/index',
      status: 1,
      sort: 1,
      desc: '层级3模块',
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
    {
      id: 1046,
      pid: 215,
      name: '编辑字典',
      code: 'dictionaryManage:edit',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 3,
      desc: '编辑字典操作权限',
      api_id: 203,
    },
    {
      id: 1047,
      pid: 215,
      name: '删除字典',
      code: 'dictionaryManage:delete',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 4,
      desc: '删除字典操作权限',
      api_id: 204,
    },
    {
      id: 1006,
      pid: 216,
      name: '查询学校',
      code: 'schoolsManage:search',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 1,
      desc: '查询学校操作权限',
      api_id: 301,
    },
    {
      id: 1007,
      pid: 216,
      name: '添加学校',
      code: 'schoolsManage:add',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 2,
      desc: '添加学校操作权限',
      api_id: 302,
    },
    {
      id: 1008,
      pid: 216,
      name: '编辑学校',
      code: 'schoolsManage:edit',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 3,
      desc: '编辑学校操作权限',
      api_id: 303,
    },
    {
      id: 1009,
      pid: 216,
      name: '删除学校',
      code: 'schoolsManage:delete',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 4,
      desc: '删除学校操作权限',
      api_id: 304,
    },
    {
      id: 1010,
      pid: 229,
      name: '查询城市',
      code: 'citysManage:search',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 1,
      desc: '查询城市操作权限',
      api_id: 401,
    },
    {
      id: 1011,
      pid: 229,
      name: '添加城市',
      code: 'citysManage:add',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 2,
      desc: '添加城市操作权限',
      api_id: 402,
    },
    {
      id: 1012,
      pid: 229,
      name: '编辑城市',
      code: 'citysManage:edit',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 3,
      desc: '编辑城市操作权限',
      api_id: 403,
    },
    {
      id: 1013,
      pid: 229,
      name: '删除城市',
      code: 'citysManage:delete',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 4,
      desc: '删除城市操作权限',
      api_id: 404,
    },
    {
      id: 1014,
      pid: 239,
      name: '查询团长',
      code: 'colonelManage:search',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 1,
      desc: '查询团长操作权限',
      api_id: 501,
    },
    {
      id: 1015,
      pid: 239,
      name: '添加团长',
      code: 'colonelManage:add',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 2,
      desc: '添加团长操作权限',
      api_id: 502,
    },
    {
      id: 1016,
      pid: 239,
      name: '编辑团长',
      code: 'colonelManage:edit',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 3,
      desc: '编辑团长操作权限',
      api_id: 503,
    },
    {
      id: 1017,
      pid: 239,
      name: '删除团长',
      code: 'colonelManage:delete',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 4,
      desc: '删除团长操作权限',
      api_id: 504,
    },
    {
      id: 1018,
      pid: 249,
      name: '查询实名认证',
      code: 'certManage:search',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 1,
      desc: '查询实名认证操作权限',
      api_id: 601,
    },
    {
      id: 1019,
      pid: 249,
      name: '审核实名认证',
      code: 'certManage:audit',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 2,
      desc: '审核实名认证操作权限',
      api_id: 602,
    },
    {
      id: 1020,
      pid: 251,
      name: '查询菜单',
      code: 'permissionManage:menuManage:search',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 1,
      desc: '查询菜单操作权限',
      api_id: 701,
    },
    {
      id: 1021,
      pid: 251,
      name: '添加菜单',
      code: 'permissionManage:menuManage:add',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 2,
      desc: '添加菜单操作权限',
      api_id: 702,
    },
    {
      id: 1022,
      pid: 251,
      name: '编辑菜单',
      code: 'permissionManage:menuManage:edit',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 3,
      desc: '编辑菜单操作权限',
      api_id: 703,
    },
    {
      id: 1023,
      pid: 251,
      name: '删除菜单',
      code: 'permissionManage:menuManage:delete',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 4,
      desc: '删除菜单操作权限',
      api_id: 704,
    },
    {
      id: 1024,
      pid: 252,
      name: '查询角色',
      code: 'permissionManage:roleManage:search',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 1,
      desc: '查询角色操作权限',
      api_id: 801,
    },
    {
      id: 1025,
      pid: 252,
      name: '添加角色',
      code: 'permissionManage:roleManage:add',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 2,
      desc: '添加角色操作权限',
      api_id: 802,
    },
    {
      id: 1026,
      pid: 252,
      name: '编辑角色',
      code: 'permissionManage:roleManage:edit',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 3,
      desc: '编辑角色操作权限',
      api_id: 803,
    },
    {
      id: 1027,
      pid: 252,
      name: '删除角色',
      code: 'permissionManage:roleManage:delete',
      icon: null,
      type: 3,
      route_name: null,
      route_path: null,
      component_path: null,
      status: 1,
      sort: 4,
      desc: '删除角色操作权限',
      api_id: 804,
    },
  ];
  const menuTree = buildMenuTree(mockMenuData);
  return convertMenuToTreeNode(menuTree);
};
console.log(getMenuPermissionTree());
export const getDataPermissionTree = (): MenuTreeNode[] => {
  return [
    {
      id: 1,
      path: '用户管理',
      children: [
        {
          id: 23,
          path: '/user/get',
        },
        {
          id: 27,
          path: '/user/list',
        },
        {
          id: 28,
          path: '/user/edit',
        },
        {
          id: 29,
          path: '/user/delete',
        },
        {
          id: 30,
          path: '/user/add',
        },
        {
          id: 31,
          path: '/user/reset',
          children: [],
        },
      ],
    },
    {
      id: 2,
      path: '角色管理',
      children: [
        {
          id: 32,
          path: '/roleManage/list',
        },
        {
          id: 33,
          path: '/roleManage/edit',
        },
        {
          id: 34,
          path: '/roleManage/delete',
        },
        {
          id: 35,
          path: '/roleManage/add',
        },
      ],
    },
    {
      id: 3,
      path: '菜单管理',
      children: [],
    },
    {
      id: 4,
      path: 'api管理',
      children: [],
    },
    {
      id: 5,
      path: '字典管理',
      children: [],
    },
  ];
};
console.log(getDataPermissionTree());
// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '角色名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '角色标识',
    dataIndex: 'code',
    key: 'code',
    width: 150,
    ellipsis: true,
  },
  {
    title: '描述',
    dataIndex: 'desc',
    key: 'desc',
    width: 200,
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    render: (value: number) => (
      <span style={{ color: value === 1 ? 'green' : 'red' }}>{value === 1 ? '启用' : '禁用'}</span>
    ),
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 120,
    fixed: 'right',
  },
];

// 表单配置
export const formList = (): BaseFormList[] => [
  {
    label: '名称',
    name: 'name',
    component: 'Input',
    placeholder: '请输入',
    rules: FORM_REQUIRED,
  },
  {
    label: '备注',
    name: 'desc',
    component: 'TextArea',
    placeholder: '请输入',
    componentProps: {
      rows: 4,
    },
  },
];
