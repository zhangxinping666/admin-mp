import type { SideMenu } from '#/public';
import { MenuItem } from '@/pages/login/model';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface MenuState {
  routePages: string[];
  isPhone: boolean;
  isCollapsed: boolean;
  selectedKeys: string[];
  openKeys: string[];
  menuList: MenuItem[];
  toggleCollapsed: (isCollapsed: boolean) => void;
  togglePhone: (isPhone: boolean) => void;
  setSelectedKeys: (keys: string[] | ((prev: string[]) => string[])) => void;
  setOpenKeys: (openKeys: string[] | ((prev: string[]) => string[])) => void;
  setMenuList: (menuList: MenuItem[]) => void;
  setRoutePages: (routePages: string[]) => void;
}

export const useMenuStore = create<MenuState>()(
  devtools(
    persist(
      (set) => ({
        isPhone: false,
        isCollapsed: false,
        selectedKeys: [],
        openKeys: [],
        menuList: [],
        routePages: [],
        setRoutePages: (routePages: string[]) => set({ routePages }),
        toggleCollapsed: (isCollapsed: boolean) => set({ isCollapsed }),
        togglePhone: (isPhone: boolean) => set({ isPhone }),
        setSelectedKeys: (keys: string[] | ((prev: string[]) => string[])) =>
          set((state) => ({
            selectedKeys: typeof keys === 'function' ? keys(state.selectedKeys) : keys,
          })),
        setOpenKeys: (openKeys: string[] | ((prev: string[]) => string[])) =>
          set((state) => ({
            openKeys: typeof openKeys === 'function' ? openKeys(state.openKeys) : openKeys,
          })),
        setMenuList: (menuList: MenuItem[]) => set({ menuList }),
      }),
      {
        name: 'menu-storage',
        partialize: (state) => ({
          menuList: state.menuList,
          routePages: state.routePages,
        }),
      },
    ),
    {
      enabled: process.env.NODE_ENV === 'mock',
      name: 'menuStore',
    },
  ),
);
