/**
 * 检测是否有权限
 * @param value - 检测值（可以是路径或权限码）
 * @param permissions - 权限列表
 */
export const checkPermission = (value: string, permissions: string[]): boolean => {
  if (!permissions || permissions.length === 0) return false;

  // 直接匹配权限码
  if (permissions.includes(value)) {
    return true;
  }

  // 如果是路径格式，转换为权限码格式进行匹配
  if (value.startsWith('/')) {
    // 将路径转换为权限码格式
    // 例如: '/demo/copy' -> 'demo:copy:view'
    const pathParts = value.split('/').filter((part) => part !== '');
    if (pathParts.length > 0) {
      const permissionCode = pathParts.join(':') + ':view';
      return permissions.includes(permissionCode);
    }
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
