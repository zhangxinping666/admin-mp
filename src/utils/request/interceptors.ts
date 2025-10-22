//拦截器配置
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';
import axios from 'axios';
import { getAccessToken } from '@/stores/token';
import { addPendingRequest, removePendingRequest } from './requestDeduplication';
import { handleTokenExpired } from './refreshToken';
import { handleBusinessError, handleHttpError } from './errorHandler';

// Mock 环境的 baseURL
const MOCK_BASE_URL = 'https://m1.apifoxmock.com/m1/6582482-6287977-default';

// 标记是否已经切换到 mock 模式
let hasSwitchedToMock = false;

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
    }, async (error: AxiosError) => {
      // 移除 pending 请求
      if (error.config) {
        removePendingRequest(error.config);
      }

      // HTTP 401 也尝试刷新 Token
      if (error.response?.status === 401) {
        return handleTokenExpired(error.config as InternalAxiosRequestConfig);
      }

      // ========== 开发环境 Fallback 到 Mock ==========
      // 只在本地环境下启用，且只尝试一次
      const isDevelopment = import.meta.env.VITE_APP_ENV === 'localhost';

      // 判断是否应该 fallback 到 mock
      // 1. 网络错误（无响应）
      // 2. 404 错误（接口不存在）
      // 3. 500+ 服务器错误
      // 4. 连接超时/网络错误
      const shouldFallback =
        !error.response || // 无响应（网络错误）
        error.response?.status === 404 || // 接口不存在
        error.response?.status >= 500 || // 服务器错误
        error.code === 'ECONNABORTED' || // 超时
        error.code === 'ERR_NETWORK' || // 网络错误
        error.code === 'ERR_BAD_REQUEST'; // 错误请求

      // 调试日志：打印所有条件
      console.log('🔍 Fallback 条件检查:', {
        isDevelopment,
        currentEnv: import.meta.env.VITE_APP_ENV,
        shouldFallback,
        errorStatus: error.response?.status,
        errorCode: error.code,
        errorMessage: error.message,
        hasSwitchedToMock,
        hasConfig: !!error.config,
      });

      if (isDevelopment && shouldFallback && !hasSwitchedToMock && error.config) {
        console.warn('🔄 开发环境检测到网络错误，尝试切换到 Mock 环境...');
        console.warn(`原始请求: ${error.config.baseURL}${error.config.url}`);

        try {
          // 创建一个新的请求配置，使用 mock baseURL
          const mockConfig = {
            ...error.config,
            baseURL: MOCK_BASE_URL,
          };

          // 标记已切换，避免无限重试
          hasSwitchedToMock = true;

          console.warn(`Fallback 请求: ${MOCK_BASE_URL}${error.config.url}`);

          // 使用新配置重新发起请求
          const response = await axios.request(mockConfig);

          console.log('✅ Mock 环境请求成功');

          // 返回 mock 数据
          return response.data;
        } catch (mockError) {
          console.error('❌ Mock 环境请求也失败了:', mockError);
          // Mock 也失败了，重置标记，继续抛出原始错误
          hasSwitchedToMock = false;
          handleHttpError(error);
          return Promise.reject(error);
        }
      }

      // 其他 HTTP 错误
      handleHttpError(error);
      return Promise.reject(error);
    }
  )
}