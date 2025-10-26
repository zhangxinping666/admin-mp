//拦截器配置
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { getAccessToken } from '@/stores/token';
import { addPendingRequest, removePendingRequest } from './requestDeduplication';
import { handleTokenExpired } from './refreshToken';
import { handleBusinessError, handleHttpError } from './errorHandler';

//配置请求拦截器
export function setupRequestInterceptor(instance: AxiosInstance): void {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }

      //去重
      addPendingRequest(config);
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error)
    }
  )
}

//响应拦截器
export function setupResponseInterceptor(instance: AxiosInstance): void {
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // 移除pending请求
      removePendingRequest(response.config);
      const { data } = response;

      if (response.config.responseType === 'blob') {
        const contentType = (response.headers['content-type'] as string) || ''
        // 判断是否是Excel文件
        const isExcel = contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
          contentType.includes('application/vnd.ms-excel') ||
          contentType.includes('application/octet-stream');
        if (!isExcel && contentType.includes('application/json')) {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const jsonData = JSON.parse(reader.result as string);
                if (jsonData.code && jsonData.code !== 2000) {
                  handleBusinessError(jsonData.code, jsonData.message);
                  reject(new Error(jsonData.message || '导出失败'));
                } else {
                  resolve(data);
                }
              } catch {
                reject(new Error('响应格式错误'));
              }
            };
            reader.readAsText(data);
          });
        }
        // 检查 blob 大小
        if (data.size === 0) {
          return Promise.reject(new Error('导出的文件为空'));
        }
        return data; // 返回 blob 数据
      }
      // ========== 业务码检查 ==========
      if (data?.code !== 2000) {
        // Token 过期,触发刷新
        if (data.code === 4000) {
          return handleTokenExpired(response.config);
        }
        // 其他业务错误
        handleBusinessError(data.code, data.message);
        return Promise.reject(new Error(data.message || '请求失败'));
      }
      return data;
    }, (error: AxiosError) => {
      // 移除 pending 请求
      if (error.config) {
        removePendingRequest(error.config);
      }

      // HTTP 401 也尝试刷新 Token
      if (error.response?.status === 401) {
        return handleTokenExpired(error.config as InternalAxiosRequestConfig);
      }

      // 处理 HTTP 错误
      handleHttpError(error);
      return Promise.reject(error);
    }
  )
}