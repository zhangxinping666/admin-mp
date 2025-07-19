import { create } from 'zustand';

//创建一个token的存储
const REFRESH_TOKEN_KEY = 'refresh_token';

//创建一个接口
interface TokenState {
  assess_token: string;
  refresh_token: string | null;
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setTokens: (access_token: string, refresh_token: string) => void;
  //清除token(清除token时也要清除refresh_token
  clearTokens: () => void;
}

export const useTokenStore = create<TokenState>((set, get) => ({
  assess_token: '',
  refresh_token: localStorage.getItem(REFRESH_TOKEN_KEY),
  setAccessToken: (token: string) => set({ assess_token: token }),
  setRefreshToken: (token: string) => {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
    set({ refresh_token: token });
  },
  setTokens: (assess_token: string, refresh_token: string) => {
    set({ assess_token: assess_token });
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
    set({ refresh_token: refresh_token });
  },
  clearTokens: () => {
    set({ assess_token: '', refresh_token: '' });
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    set({ refresh_token: null });
  },
}));

export const getAccessToken = () => useTokenStore.getState().assess_token;
export const getRefreshToken = () => useTokenStore.getState().refresh_token;
export const setAccessToken = (token: string) => useTokenStore.getState().setAccessToken(token);
export const setRefreshToken = (token: string) => useTokenStore.getState().setRefreshToken(token);
export const setTokens = (access_token: string, refresh_token: string) =>
  useTokenStore.getState().setTokens(access_token, refresh_token);
export const clearTokens = () => useTokenStore.getState().clearTokens;
