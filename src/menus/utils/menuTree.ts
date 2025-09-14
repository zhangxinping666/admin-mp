import { MenuItem } from "@/pages/login/model";

export function buildMenuTree(flatMenus: MenuItem[]): MenuItem[] {
  if (!flatMenus || flatMenus.length === 0) {
    return [];
  }

  // 使用 Map 存储每个节点，键为节点ID
  // 值为节点对象的深拷贝，并添加了 children 属性
  const menuMap = new Map<number, MenuItem>();
  const roots: MenuItem[] = [];

  flatMenus.forEach((item) => {
    const clonedItem = { ...item, children: [] }; 
    menuMap.set(item.key, clonedItem);
  });

  menuMap.forEach((node) => {
    if (node.pid && menuMap.has(node.pid)) {
      const parent = menuMap.get(node.pid);
      parent?.children?.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortMenus = (menus: MenuItem[]): MenuItem[] => {
    menus.sort((a, b) => (a.sort || Infinity) - (b.sort || Infinity));
    
    menus.forEach((menu) => {
      if (menu.children && menu.children.length > 0) {
        sortMenus(menu.children);
      }
    });

    return menus;
  };

  return sortMenus(roots);
}
