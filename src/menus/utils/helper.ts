import type { SideMenu } from '#/public';
import { cloneDeep } from 'lodash';

/**
 * 根据路由获取展开菜单数组
 * @param router - 路由
 */
export function getOpenMenuByRouter(router: string): string[] {
  const arr = splitPath(router),
    result: string[] = [];

  // 取第一个单词大写为新展开菜单key
  if (arr.length > 0) result.push(`/${arr[0]}`);

  // 当路由处于多级目录时
  if (arr.length > 2) {
    let str = '/' + arr[0];
    for (let i = 1; i < arr.length - 1; i++) {
      str += '/' + arr[i];
      result.push(str);
    }
  }
  return result;
}

/**
 * 分割路径且去除首个字符串
 * @param path - 路径
 */
export function splitPath(path: string): string[] {
  // 路径为空或非字符串格式则返回空数组
  if (!path || typeof path !== 'string') return [];
  // 分割路径
  const result = path?.split('/') || [];
  // 去除第一个空字符串
  if (result?.[0] === '') result.shift();
  return result;
}

/**
 * 获取菜单名
 * @param list - 菜单列表
 * @param path - 路径
 */
export const getMenuName = (list: SideMenu[], path: string) => {
  let result = '';

  const deepData = (list: SideMenu[], path: string) => {
    if (result) return result;

    for (let i = 0; i < list?.length; i++) {
      const item = list[i];

      if (item.route_path === path) {
        result = String(item.id);
        return result;
      }

      if (item.children?.length) {
        const childResult = deepData(item.children, path);
        if (childResult) {
          result = childResult;
          return result;
        }
      }
    }

    return result;
  };
  deepData(list, path);

  return result;
};

/**
 * 过滤权限菜单
 * @param menus - 菜单
 * @param permissions - 权限列表（现在基于菜单存在性判断，只要有菜单就有权限）
 */
export const filterMenusByPermissions = (menuList: SideMenu[], permissions: string[]) => {
  const allMenus = cloneDeep(menuList);

  const filterRecursive = (menus: SideMenu[]) => {
    const accessibleMenus = [];

    for (const menu of menus) {
      if (menu.children && menu.children.length > 0) {
        const accessibleChildren = filterRecursive(menu.children);
        if (accessibleChildren.length > 0) {
          menu.children = accessibleChildren;
        } else {
          menu.children = undefined;
        }
      }
      // 新逻辑：只要菜单存在就有权限，不再检查permissions数组
      // 只要菜单项存在（无论是否有route_path），都认为有权限
      accessibleMenus.push(menu);
    }

    return accessibleMenus;
  };

  // 从顶层菜单开始执行过滤
  return filterRecursive(allMenus);
};

export function getMenuByKey(menuList: SideMenu[], targetKey: string): SideMenu | undefined {
  for (const menu of menuList) {
    // antd 的 key 是字符串，我们的数据 key 可能是数字，统一转为字符串比较更安全
    if (String(menu.id) === targetKey) {
      return menu;
    }

    // 如果当前节点没匹配上，就深入其子节点继续查找
    if (menu.children && menu.children.length > 0) {
      const found = getMenuByKey(menu.children, targetKey);
      // 如果在子节点中找到了，就立即将结果向上返回
      if (found) {
        return found;
      }
    }
  }

  // 遍历完所有节点及其子孙节点后，仍未找到，则返回 undefined
  return undefined;
}
/**
 * 获取第一个有效权限路由
 * @param menus - 菜单
 * @param permissions - 权限
 */
export function getFirstMenu(menus: SideMenu[], permissions: string[], result = ''): string {
  // 有结构时直接返回
  if (result) return result;

  for (let i = 0; i < menus.length; i++) {
    // 处理子数组
    if (hasChildren(menus[i]) && !result) {
      const childResult = getFirstMenu(menus[i].children as SideMenu[], permissions, result);

      // 有结果则赋值
      if (childResult) {
        result = childResult;
        return result;
      }
    }

    // 有权限且没有有子数据
    if (hasPermission(menus[i], permissions) && !hasChildren(menus[i]) && !result)
      result = menus[i].route_path;
  }

  return result;
}

/**
 * 检查菜单项是否有权限
 * @param menu - 菜单项
 * @param permissions - 权限列表（现在基于菜单存在性判断，只要有菜单就有权限）
 */
function hasPermission(menu: SideMenu, permissions: string[]): boolean {
  // 新逻辑：只要菜单存在且有路由路径，就认为有权限
  // 不再检查permissions数组，因为现在的逻辑是有菜单就有权限
  if (menu.route_path) {
    return true;
  }

  // 如果没有路由路径，可能是纯容器菜单，也允许访问
  return true;
}

/**
 * 是否有子路由
 * @param route - 路由
 */
function hasChildren(route: SideMenu): boolean {
  return Boolean(route.children?.length);
}
