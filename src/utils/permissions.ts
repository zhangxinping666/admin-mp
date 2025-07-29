/**
 * 检测是否有权限
 * @param value - 检测值（可以是路径或权限码）
 * @param menu - 菜单列表
 */
export const checkPermission = (value: string, menu: string[]): boolean => {
  if (!menu || menu.length === 0) return false;
  // 直接匹配路径
  if (menu.includes(value)) {
    return true;
  }

  return false;
};

/**
 * 根据路径获取对应的权限码
 * @param path - 路径
 */
export const getPermissionCodeFromPath = (path: string): string => {
  if (!path.startsWith('/')) return path;

  const pathParts = path.split('/').filter((part) => part !== '');
  return pathParts.join(':') + ':view';
};
