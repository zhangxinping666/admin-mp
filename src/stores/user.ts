import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UserInfo } from '@/pages/login/model';

interface UserState {
  permissions: string[];
  menuPermissions: string[];
  userInfo: UserInfo | null;
  setPermissions: (permissions: string[]) => void;
  setMenuPermissions: (menuPermissions: string[]) => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
  clearInfo: () => void;
  // 获取角色ID
  getRoleId: () => string;
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        permissions: [],
        menuPermissions: [],
        userInfo: null,
        setPermissions: (permissions) => set({ permissions }),
        setMenuPermissions: (menuPermissions) => set({ menuPermissions }),
        setUserInfo: (userInfo) => set({ userInfo }),
        clearInfo: () => {
          set({
            userInfo: null,
            permissions: [],
            menuPermissions: [],
          });
          localStorage.removeItem('menu-storage');
        },
        getRoleId: () => {
          try {
            const state = get();
            return state.userInfo?.role_id?.toString() || '';
          } catch (error) {
            console.error('获取角色id失败:', error);
            return '';
          }
        },
      }),
      {
        name: 'user-storage',
        partialize: (state) => ({
          permissions: state.permissions,
          menuPermissions: state.menuPermissions,
          userInfo: state.userInfo,
        }),
      },
    ),
    {
      enabled: process.env.NODE_ENV === 'mock',
      name: 'userStore',
    },
  ),
);
