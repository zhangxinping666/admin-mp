import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { getMenuSelectList } from '@/servers/perms/menu';
import { getDictionaryList } from '@/servers/dictionaryManage/index';
import { getApiListByGroup } from '@/servers/perms/api';
import type { API } from '../apiManage/model';

// 角色接口定义
export interface Role {
  id: number;
  name: string;
  code: string;
  status: number;
  permissions?: number[];
  dataPermissions?: number[];
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
} // 菜单权限树节点接口

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
    component: 'Select',
    name: 'status',
    label: '状态',
    componentProps: {
      options: [
        { label: '全部', value: 0 },
        { label: '启用', value: 1 },
        { label: '禁用', value: 2 },
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
  console.log(menuList);
  return menuList.map((menu) => ({
    key: menu.id,
    title: menu.name,
    id: menu.id,
    path: menu.name,
    checkable: menu.type !== 1, // type 为 1 的菜单项不显示复选框
    children:
      menu.children && menu.children.length > 0 ? convertMenuToTreeNode(menu.children) : undefined,
  }));
}

export const getMenuPermissionTree = async (): Promise<MenuTreeNode[]> => {
  try {
    // 调用真实API获取菜单权限数据
    const response = await getMenuSelectList({ type: [] });
    if (response.code === 2000 && response.data) {
      // 将API返回的数据转换为MenuData格式

      const menuData: MenuData[] = response.data.map((item: any) => ({
        id: item.id,
        pid: item.pid,
        name: item.name,
        code: item.name.toLowerCase().replace(/\s+/g, '_'),
        icon: null,
        type: item.type, // 使用API返回的type字段，默认为2
        route_name: item.name,
        route_path: `/${item.name.toLowerCase()}`,
        component_path: `/${item.name.toLowerCase()}`,
        status: 1,
        sort: 1,
        desc: item.name,
        api_id: null,
        children: [],
      }));
      const menuTree = buildMenuTree(menuData);
      return convertMenuToTreeNode(menuTree);
    }
  } catch (error) {
    console.error('获取菜单权限数据失败:', error);
  }
  // 如果API调用失败，返回空数组
  return [];
};

export interface MenuTreeNode {
  key?: string;
  id?: number;
  path?: string;
  title?: string;
  label?: string;
  value?: number;
  checkable?: boolean;
  children?: MenuTreeNode[];
}

export const getDataPermissionTree = async (): Promise<MenuTreeNode[]> => {
  try {
    // 1. 首先获取所有的API分组菜单 - 使用type: ['2']获取API分组类型的菜单
    const groupResponse = await getMenuSelectList({ type: ['2'] });
    if (groupResponse.code !== 2000 || !groupResponse.data) {
      console.error('获取API分组菜单失败', groupResponse);
      return []; // 如果分组都获取不到，直接返回空数组
    }

    const groups = groupResponse.data;
    if (groups.length === 0) {
      return []; // 如果没有分组，也直接返回
    }

    // 2. 为每个分组菜单获取对应的API列表
    const apiPromises = groups.map((group) => getApiListByGroup(group.id));

    // 3. 使用 Promise.allSettled 并行执行所有API请求
    const apiResults = await Promise.allSettled(apiPromises);
    const dataPermissionTree: MenuTreeNode[] = groups.map((group, index) => {
      const result = apiResults[index];
      const groupTitle = group.name || `分组-${group.id}`;
      let children: MenuTreeNode[] = []; // 默认为空

      // 检查对应请求的结果
      if (result.status === 'fulfilled' && result.value.code === 2000 && result.value.data) {
        // 请求成功且数据有效 - 处理返回的API列表数据
        const apiData = result.value.data;
        const apiList = Array.isArray(apiData) ? apiData : apiData.list || [];
        children = apiList.map((api: API) => {
          const displayPath = api.path || api.detail || `API-${api.id}`;
          return {
            key: `api-${api.id}`,
            id: api.id,
            path: displayPath,
            title: displayPath,
            value: `api-${api.id}`,
            children: [],
          };
        });
      } else if (result.status === 'rejected') {
        // 请求失败，打印错误日志
        console.error(`获取分组 ${groupTitle} (ID: ${group.id}) 的API列表失败:`, result.reason);
      } else if (result.status === 'fulfilled') {
        // 请求成功但数据格式不符合预期
        console.warn(`分组 ${groupTitle} (ID: ${group.id}) 的API数据格式异常:`, result.value);
      }
      return {
        key: `group-${group.id}`,
        id: group.id,
        path: groupTitle,
        title: groupTitle,
        value: `group-${group.id}`,
        children,
      };
    });

    return dataPermissionTree;
  } catch (error) {
    console.error('获取数据权限树时发生根级别错误:', error);
    return []; // 在最外层捕获根级别的错误
  }
};

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
    label: '角色标识',
    name: 'code',
    component: 'Input',
    placeholder: '请输入',
    rules: FORM_REQUIRED,
  },
  {
    label: '状态',
    name: 'status',
    component: 'Select',
    placeholder: '请选择状态',
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 2 },
      ],
    },
  },
];
