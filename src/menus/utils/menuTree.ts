/**
 * 【最终修正版】将扁平化菜单数据转换为树形结构的 SideMenu 数组
 * 这个版本能正确构建树，并清理叶子节点上多余的 children 属性。
 * @param flatMenus - 扁平化的菜单数组
 * @returns 排序后的树形结构的菜单数组
 */
export function buildMenuTree(flatMenus: SideMenu[]): SideMenu[] {
  if (!flatMenus || flatMenus.length === 0) {
    return [];
  }

  // 使用 any 类型临时存储节点，因为它在构建过程中会动态添加 children
  const menuMap = new Map<number, any>();
  const roots: SideMenu[] = [];

  // 1. 第一次遍历：将所有节点放入 Map 中，方便快速查找
  //    注意：这一次我们【不】添加 children 属性
  flatMenus.forEach((item) => {
    menuMap.set(item.key, { ...item });
  });

  // 2. 第二次遍历：构建树形关系
  flatMenus.forEach((item) => {
    const node = menuMap.get(item.key);

    // 找到父节点
    if (item.pid && item.pid !== 0 && menuMap.has(item.pid)) {
      const parent = menuMap.get(item.pid);

      // 如果父节点还没有 children 数组，就创建一个
      if (!parent.children) {
        parent.children = [];
      }
      // 将当前节点添加到父节点的 children 中
      parent.children.push(node);
    } else {
      // 如果没有父节点（或pid为0），则是根节点
      roots.push(node);
    }
  });

  // 3. (可选但推荐) 递归排序函数
  const sortMenus = (menus: SideMenu[]): SideMenu[] => {
    menus.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    menus.forEach((menu) => {
      if (menu.children && menu.children.length > 0) {
        // 对子菜单也进行排序
        sortMenus(menu.children);
      }
    });
    return menus;
  };

  return sortMenus(roots);
}
