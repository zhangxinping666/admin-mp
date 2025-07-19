import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { UserInfo } from '@/pages/login/model';

// 本地存储常量
const USER_ACCOUNT = 'login-account';
const USER_PASSWORD = 'login-password';

interface UserState {
  permissions: string[];
  userInfo: UserInfo | null;
  setPermissions: (permissions: string[]) => void;
  setUserInfo: (userInfo: UserInfo) => void;
  clearInfo: () => void;
  // 账号密码本地存储方法
  saveLoginInfo: (account: string, password: string) => void;
  getLoginInfo: () => { account: string; password: string };
  clearLoginInfo: () => void;
}

export const useUserStore = create<UserState>()(
  devtools(
    (set) => ({
      permissions: [],
      userInfo: {
        id: 0,
        account_id: '',
        name: '',
        phone: '',
        school_id: 0,
        school_name: '',
        city_id: 0,
        role_id: 0,
        role_name: '',
        status: 0,
      },
      /** 设置权限 */
      setPermissions: (permissions) => set({ permissions }),
      /** 设置用户信息 */
      setUserInfo: (userInfo) => set({ userInfo }),
      /** 清除用户信息 */
      clearInfo: () =>
        set({
          userInfo: null,
          permissions: [],
        }),
      /** 保存登录信息到本地存储 */
      saveLoginInfo: (account: string, password: string) => {
        try {
          localStorage.setItem(USER_ACCOUNT, account);
          localStorage.setItem(USER_PASSWORD, password);
        } catch (error) {
          console.error('保存登录信息失败:', error);
        }
      },
      /** 获取本地存储的登录信息 */
      getLoginInfo: () => {
        try {
          const account = localStorage.getItem(USER_ACCOUNT) || '';
          const password = localStorage.getItem(USER_PASSWORD) || '';
          return { account, password };
        } catch (error) {
          console.error('获取登录信息失败:', error);
          return { account: '', password: '' };
        }
      },
      /** 清除本地存储的登录信息 */
      clearLoginInfo: () => {
        try {
          localStorage.removeItem(USER_ACCOUNT);
          localStorage.removeItem(USER_PASSWORD);
        } catch (error) {
          console.error('清除登录信息失败:', error);
        }
      },
    }),
    {
      enabled: process.env.NODE_ENV === 'mock',
      name: 'userStore',
    },
  ),
);
