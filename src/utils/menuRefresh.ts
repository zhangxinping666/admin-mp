import { getPermissions } from '@/servers/login';
import { buildMenuTree } from '@/menus/utils/menuTree';
import { extractRoutePathsFromMenus } from '@/utils/menuUtils';
import { useUserStore } from '@/stores/user';
import { useMenuStore } from '@/stores/menu';

/**
 * 刷新侧边栏菜单数据
 * 用于在菜单管理页面进行增删改操作后实时更新侧边栏
 */
export const refreshSidebarMenu = async () => {
  try {
    // 获取store方法和当前用户信息
    const { setPermissions, setMenuPermissions, userInfo } = useUserStore.getState();
    const { setMenuList } = useMenuStore.getState();
    
    // 检查用户信息是否存在
    if (!userInfo || !userInfo.name) {
      console.error('用户信息不存在，无法刷新菜单');
      return false;
    }
    
    // 使用当前用户的角色名称获取权限和菜单数据
    const permissionsResponse = await getPermissions({ role: userInfo.name });
    const { menus, perms } = permissionsResponse.data;
    console.log('刷新菜单数据:', menus, perms);

    // 从菜单中提取route_path作为权限（与登录逻辑保持一致）
    const routePermissions = extractRoutePathsFromMenus(menus);
    console.log('从菜单中提取的权限路径:', routePermissions);
    console.log('后端返回的perms权限:', perms);

    // 合并路径权限和功能权限（与登录逻辑保持一致）
    const finalPermissions = [...routePermissions, ...perms];
    console.log('合并后的最终权限:', finalPermissions);

    // 更新权限数据（使用合并后的权限）
    setPermissions(finalPermissions);

    // 构建菜单树并更新菜单数据
    const menuTree = buildMenuTree(menus);
    setMenuList(menus);
    setMenuPermissions(routePermissions);

    console.log('侧边栏菜单已刷新');
    return true;
  } catch (error) {
    console.error('刷新侧边栏菜单失败:', error);
    return false;
  }
};
