import { MenuItem } from '@/pages/login/model';

/**
 * 对菜单数组按 sort 字段进行排序 (递归处理子菜单)
 * @param menus - 菜单数组
 * @returns 排序后的菜单数组
 */
const sortMenusBySort = (menus: MenuItem[]): MenuItem[] => {
  // 先对当前层级排序
  const sorted = [...menus].sort((a, b) => {
    // sort 值小的排在前面
    return (a.sort || 0) - (b.sort || 0);
  });

  // 递归处理子菜单
  return sorted.map(menu => {
    if (menu.children && menu.children.length > 0) {
      return {
        ...menu,
        children: sortMenusBySort(menu.children)
      };
    }
    return menu;
  });
};

/**
 * 从菜单数据中递归提取所有route_path作为权限数组
 * 先按 sort 排序,再提取路由
 * "/usersManage"  "/merchantManage/merchantSort"
 * @param menus - 菜单权限路由数组
 * @returns 排序后的路由路径数组
 */
export const extractRoutePathsFromMenus = (menus: MenuItem[]): string[] => {
  // 1. 先排序
  const sortedMenus = sortMenusBySort(menus);

  // 2. 再提取路由
  const routePaths: string[] = [];

  const extractRecursive = (menuList: MenuItem[]) => {
    for (const menu of menuList) {
      // 提取当前菜单的路由
      if (menu.route_path) {
        routePaths.push(menu.route_path);
      }
      // 递归处理子菜单
      if (menu.children && menu.children.length > 0) {
        extractRecursive(menu.children);
      }
    }
  };

  extractRecursive(sortedMenus);
  console.log('routePaths (sorted)', routePaths);
  return routePaths;
};

