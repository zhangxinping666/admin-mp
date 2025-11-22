//token刷新

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { setAccessToken, clearAllTokens } from '@/stores/token'

//独立的刷新请求,避免拦截器拦截
const refreshInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_APP_ENV === 'localhost' ? '/api' : import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true, //携带Cookie
})

//请求队列
interface pendingRequest {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
  config: InternalAxiosRequestConfig;
}

let isRefreshing = false;  //刷新状态锁
const requestQueue: pendingRequest[] = []; //等待队列

//刷新token
async function refreshAccessToken(): Promise<string> {
  try {
    const response = await refreshInstance.post('/auth/refresh');
    if (response.data?.code != 2000) {
      throw new Error(response.data?.message || 'Token刷新失败')
    }
    const { access_token } = response.data.data;
    if (!access_token) {
      throw new Error('刷新响应中缺少access_token')
    }
    setAccessToken(access_token);
    return access_token
  } catch (error) {
    console.log(error)
    clearAllTokens()
    try {
      await refreshInstance.post('/backstage/logout')
    } catch (error) {
      console.error('登出失败', error)
    }
    window.location.href = '/login';
    throw error;
  }
}


// 处理token过期
export function handleTokenExpired(config: InternalAxiosRequestConfig): Promise<any> {
  return new Promise((resolve, reject) => {
    //加入等待队列
    requestQueue.push({ resolve, reject, config });
    //如果没有正在刷新,触发刷新
    if (!isRefreshing) {
      isRefreshing = true;
      refreshAccessToken().then((newToken) => {
        requestQueue.forEach(({ resolve, config }) => {
          config.headers.Authorization = `Bearer ${newToken}`;
          resolve(axios(config)) //重新发送请求
        })
        requestQueue.length = 0 //清空队列
      }).catch((error) => {
        //刷新失败, 拒绝所有请求
        requestQueue.forEach(({ reject }) => reject(error))
        requestQueue.length = 0
      }).finally(() => {
        isRefreshing = false;
      })
    }
  })
}
