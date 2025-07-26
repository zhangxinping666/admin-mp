import type { SideMenu } from '#/public';

/**
 * 从菜单数据中递归提取所有route_path作为权限数组
 * @param menus - 菜单数组
 * @returns 路径权限数组
 */
export const extractRoutePathsFromMenus = (menus: SideMenu[]): string[] => {
  const routePaths: string[] = [];

  const extractRecursive = (menuList: SideMenu[]) => {
    for (const menu of menuList) {
      if (menu.route_path) {
        routePaths.push(menu.route_path);
      }
      if (menu.children && menu.children.length > 0) {
        extractRecursive(menu.children);
      }
    }
  };

  extractRecursive(menus);
  return routePaths;
};