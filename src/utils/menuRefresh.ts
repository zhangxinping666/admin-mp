import { getPermissions } from '@/servers/login';
import { buildMenuTree } from '@/menus/utils/menuTree';
import { extractRoutePathsFromMenus } from '@/utils/menuUtils';
import { useUserStore } from '@/stores/user';
import { useMenuStore } from '@/stores/menu';
import { PermissionsData } from '@/pages/login/model';

/**
 * 刷新侧边栏菜单数据
 * 用于在菜单管理页面进行增删改操作后实时更新侧边栏
 */
export const refreshSidebarMenu = async () => {
  try {
    const { setPermissions, setMenuPermissions, userInfo } = useUserStore.getState();
    const { setMenuList } = useMenuStore.getState();

    if (!userInfo || !userInfo.name) {
      console.error('用户信息不存在，无法刷新菜单');
      return false;
    }
    const permissionsResponse = await getPermissions({ role: userInfo.name });
    const Date = permissionsResponse.data as unknown as PermissionsData;
    const { menus, perms } = Date;
    const routePermissions = extractRoutePathsFromMenus(menus);
    const finalPermissions = [...routePermissions, ...perms];
    setPermissions(finalPermissions);
    setMenuList(menus);
    setMenuPermissions(routePermissions);
    return true;
  } catch (error) {
    console.error('刷新侧边栏菜单失败:', error);
    return false;
  }
};
