import { MenuItem } from '@/pages/login/model';

/**
 * 从菜单数据中递归提取所有route_path作为权限数组
 * "/usersManage"  "/merchantManage/merchantSort" 
 * @return menus - 菜单权限路由数组
 */
export const extractRoutePathsFromMenus = (menus: MenuItem[]): string[] => {
  const routePaths: string[] = [];

  const extractRecursive = (menuList: MenuItem[]) => {
    for (const menu of menuList) {
      if (menu.route_path) {
        routePaths.push(menu.route_path);
      }
    }
  };
  extractRecursive(menus);
  console.log('routePaths', routePaths);
  return routePaths;
};