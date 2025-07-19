import type { SideMenu } from '#/public';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface MenuState {
  isPhone: boolean;
  isCollapsed: boolean;
  selectedKeys: string[]; // 修正 (1): 类型必须是字符串数组
  openKeys: string[];
  menuList: SideMenu[];
  toggleCollapsed: (isCollapsed: boolean) => void;
  togglePhone: (isPhone: boolean) => void;
  setSelectedKeys: (keys: string[]) => void; // 修正 (2): action 接收的参数也应是数组
  setOpenKeys: (openKeys: string[]) => void;
  setMenuList: (menuList: SideMenu[]) => void;
}

export const useMenuStore = create<MenuState>()(
  devtools(
    (set) => ({
      isPhone: false,
      isCollapsed: false,
      selectedKeys: [], // 修正 (3): 初始值应为空数组，由 useEffect 动态设置
      openKeys: [], // 修正 (4): 初始值也建议为空数组
      menuList: [],
      toggleCollapsed: (isCollapsed: boolean) => set({ isCollapsed }),
      togglePhone: (isPhone: boolean) => set({ isPhone }),
      setSelectedKeys: (keys: string[]) => set({ selectedKeys: keys }), // 修正 (5): action 的实现
      setOpenKeys: (openKeys: string[]) => set({ openKeys }),
      setMenuList: (menuList: SideMenu[]) => set({ menuList }),
    }),
    {
      enabled: process.env.NODE_ENV === 'mock',
      name: 'menuStore',
    },
  ),
);
