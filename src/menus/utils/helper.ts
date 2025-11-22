import { MenuItem } from '@/pages/login/model';

//根据路由获取展开菜单数组
export function getOpenMenuByRouter(router: string): string[] {
  const arr = splitPath(router),
    result: string[] = [];

  if (arr.length > 0) result.push(`/${arr[0]}`);

  if (arr.length > 2) {
    let str = '/' + arr[0];
    for (let i = 1; i < arr.length - 1; i++) {
      str += '/' + arr[i];
      result.push(str);
    }
  }
  return result;
}


//分割路径且去除首个字符串
export function splitPath(path: string): string[] {
  if (!path || typeof path !== 'string') return [];
  const result = path?.split('/') || [];
  if (result?.[0] === '') result.shift();
  return result;
}

//获取菜单名
export const getMenuName = (list: MenuItem[], path: string) => {
  let result = '';
  const deepData = (list: MenuItem[], path: string) => {
    if (result) return result;
    for (let i = 0; i < list?.length; i++) {
      const item = list[i];
      if (item.route_path === path) {
        result = String(item.key);
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



export function getMenuByKey(menuList: MenuItem[], targetKey: string): MenuItem | undefined {
  for (const menu of menuList) {
    if (String((menu as any).key) === targetKey) {
      return menu;
    }
    if (menu.children && menu.children.length > 0) {
      const found = getMenuByKey(menu.children, targetKey);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}

//获取第一个有效权限路由
export const getFirstMenu = (flatMenus: MenuItem[]): string | undefined => {
  const firstMenu = flatMenus.find((menu) => menu.type === 2);
  return firstMenu?.route_path;
};