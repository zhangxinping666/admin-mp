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
        result = item.label;
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
 * @param permissions - 权限列表
 */
export function filterMenus(menus: SideMenu[], permissions: string[]): SideMenu[] {
  const result: SideMenu[] = [];
  const newMenus = cloneDeep(menus);

  for (let i = 0; i < newMenus.length; i++) {
    const item = newMenus[i];

    // 处理子数组
    if (hasChildren(item)) {
      const filteredChildren = filterMenus(item.children as SideMenu[], permissions);

      // 有子权限数据则保留，否则设置为undefined
      if (filteredChildren && filteredChildren.length > 0) {
        item.children = filteredChildren;
      } else {
        item.children = undefined;
      }
    }

    const hasItemPermission = hasPermission(item, permissions);
    const hasValidChildren = item.children && item.children.length > 0;

    // 有权限或有子数据累加
    if (hasItemPermission || hasValidChildren) {
      result.push(item);
    }
  }

  return result;
}
/**
 * 在一个【树形结构】的菜单数组中，根据 key 递归查找并返回对应的菜单对象。
 * @param menuTree - 经过处理后的树形菜单数组。
 * @param targetKey - 需要查找的菜单项的 key (通常是 antd Menu 返回的字符串 key)。
 * @returns 找到的菜单对象，如果未找到则返回 undefined。
 */
export function getMenuByKey(menuList: SideMenu[], targetKey: string): SideMenu | undefined {
  for (const menu of menuList) {
    // antd 的 key 是字符串，我们的数据 key 可能是数字，统一转为字符串比较更安全
    if (String(menu.key) === targetKey) {
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
 * @param permissions - 权限列表
 */
function hasPermission(menu: SideMenu, permissions: string[]): boolean {
  // 如果菜单项有明确的权限字段，检查该权限
  if (menu.permission) {
    return permissions.includes(menu.permission);
  }

  // 如果没有明确的权限字段，但有路由路径，检查路由权限
  if (menu.route_path) {
    return permissions.includes(menu.route_path);
  }

  // 如果既没有权限字段也没有路由路径，可能是纯容器菜单，允许访问
  return true;
}

/**
 * 是否有子路由
 * @param route - 路由
 */
function hasChildren(route: SideMenu): boolean {
  return Boolean(route.children?.length);
}
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
        result = item.label;
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
 * @param permissions - 权限列表
 */
export function filterMenus(menus: SideMenu[], permissions: string[]): SideMenu[] {
  const result: SideMenu[] = [];
  const newMenus = cloneDeep(menus);

  for (let i = 0; i < newMenus.length; i++) {
    const item = newMenus[i];

    // 处理子数组
    if (hasChildren(item)) {
      const filteredChildren = filterMenus(item.children as SideMenu[], permissions);

      // 有子权限数据则保留，否则设置为undefined
      if (filteredChildren && filteredChildren.length > 0) {
        item.children = filteredChildren;
      } else {
        item.children = undefined;
      }
    }

    const hasItemPermission = hasPermission(item, permissions);
    const hasValidChildren = item.children && item.children.length > 0;

    // 有权限或有子数据累加
    if (hasItemPermission || hasValidChildren) {
      result.push(item);
    }
  }

  return result;
}
/**
 * 在一个【树形结构】的菜单数组中，根据 key 递归查找并返回对应的菜单对象。
 * @param menuTree - 经过处理后的树形菜单数组。
 * @param targetKey - 需要查找的菜单项的 key (通常是 antd Menu 返回的字符串 key)。
 * @returns 找到的菜单对象，如果未找到则返回 undefined。
 */
export function getMenuByKey(menuList: SideMenu[], targetKey: string): SideMenu | undefined {
  for (const menu of menuList) {
    // antd 的 key 是字符串，我们的数据 key 可能是数字，统一转为字符串比较更安全
    if (String(menu.key) === targetKey) {
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
 * @param permissions - 权限列表
 */
function hasPermission(menu: SideMenu, permissions: string[]): boolean {
  // 如果菜单项有明确的权限字段，检查该权限
  if (menu.permission) {
    return permissions.includes(menu.permission);
  }

  // 如果没有明确的权限字段，但有路由路径，检查路由权限
  if (menu.route_path) {
    return permissions.includes(menu.route_path);
  }

  // 如果既没有权限字段也没有路由路径，可能是纯容器菜单，允许访问
  return true;
}

/**
 * 是否有子路由
 * @param route - 路由
 */
function hasChildren(route: SideMenu): boolean {
  return Boolean(route.children?.length);
}
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
        result = item.label;
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
 * @param permissions - 权限列表
 */
export function filterMenus(menus: SideMenu[], permissions: string[]): SideMenu[] {
  const result: SideMenu[] = [];
  const newMenus = cloneDeep(menus);

  for (let i = 0; i < newMenus.length; i++) {
    const item = newMenus[i];

    // 处理子数组
    if (hasChildren(item)) {
      const filteredChildren = filterMenus(item.children as SideMenu[], permissions);

      // 有子权限数据则保留，否则设置为undefined
      if (filteredChildren && filteredChildren.length > 0) {
        item.children = filteredChildren;
      } else {
        item.children = undefined;
      }
    }

    const hasItemPermission = hasPermission(item, permissions);
    const hasValidChildren = item.children && item.children.length > 0;

    // 有权限或有子数据累加
    if (hasItemPermission || hasValidChildren) {
      result.push(item);
    }
  }

  return result;
}
/**
 * 在一个【树形结构】的菜单数组中，根据 key 递归查找并返回对应的菜单对象。
 * @param menuTree - 经过处理后的树形菜单数组。
 * @param targetKey - 需要查找的菜单项的 key (通常是 antd Menu 返回的字符串 key)。
 * @returns 找到的菜单对象，如果未找到则返回 undefined。
 */
export function getMenuByKey(menuList: SideMenu[], targetKey: string): SideMenu | undefined {
  for (const menu of menuList) {
    // antd 的 key 是字符串，我们的数据 key 可能是数字，统一转为字符串比较更安全
    if (String(menu.key) === targetKey) {
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
 * @param permissions - 权限列表
 */
function hasPermission(menu: SideMenu, permissions: string[]): boolean {
  // 如果菜单项有明确的权限字段，检查该权限
  if (menu.permission) {
    return permissions.includes(menu.permission);
  }

  // 如果没有明确的权限字段，但有路由路径，检查路由权限
  if (menu.route_path) {
    return permissions.includes(menu.route_path);
  }

  // 如果既没有权限字段也没有路由路径，可能是纯容器菜单，允许访问
  return true;
}

/**
 * 是否有子路由
 * @param route - 路由
 */
function hasChildren(route: SideMenu): boolean {
  return Boolean(route.children?.length);
}
