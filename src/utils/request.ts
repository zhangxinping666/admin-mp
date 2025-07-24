import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../stores/token';

// --- 状态变量 ---
// 标记是否正在刷新 token，防止重复刷新
let isRefreshing: boolean = false;
// 存储因 token 过期而失败的请求队列
// 定义队列中每个元素的类型
interface FailedRequest {
  resolve: (value?: string | PromiseLike<string>) => void;
  reject: (reason?: unknown) => void;
}
let failedQueue: FailedRequest[] = [];

/**
 * @description 处理队列中的请求
 * @param {Error | null} error - 刷新 token 过程中的错误
 * @param {string | null} token - 新的 access_token
 */

const processQueue = (error: Error | null, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string); // 确保在没有错误时 token 不为 null
    }
  });
  failedQueue = [];
};

// --- 创建 Axios 实例 ---
const request: AxiosInstance = axios.create({
  // 在 .env 文件中配置 中的请求配置
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, // 请求超时时间
});

// --- 请求拦截器 ---
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      // 在请求头中添加 Authorization 字段
      if (!config.headers) {
        config.headers = new axios.AxiosHeaders();
      }
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// --- 响应拦截器 ---
request.interceptors.response.use(
  // 响应成功 (HTTP 状态码为 2xx)
  (response: AxiosResponse<any>) => {
    // 通常后端会把数据包裹在 data 中，这里直接返回 data，简化业务代码
    return response.data;
  }, // 响应失败 (HTTP 状态码非 2xx)

  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // 如果没有config，直接返回错误
    if (!originalRequest) {
      console.error('Request Error: No config available');
      return Promise.reject(error);
    } // 检查是否是 401 Unauthorized 错误，并且不是刷新 token 的请求本身
    if (error.response?.status === 401 && !originalRequest._retry) {
      // 如果正在刷新 token，则将当前失败的请求加入队列
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({
            resolve: (value?: string | PromiseLike<string>) => resolve(value as string),
            reject,
          });
        })
          .then((token) => {
            if (!originalRequest.headers) {
              originalRequest.headers = new axios.AxiosHeaders();
            }
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return request(originalRequest); // 使用新 token 重新发送请求
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }
      originalRequest._retry = true; // 标记此请求已尝试过重试
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // 如果没有 refresh_token，直接跳转到登录页
        console.error('No refresh token available.');
        clearTokens(); // window.location.href = '/login'; // 或使用 router.push('/login')
        return Promise.reject(new Error('No refresh token, redirect to login.'));
      }

      try {
        // --- 调用刷新 Token 的 API ---
        // 注意：这里需要使用一个不带拦截器的 axios 实例来发请求，避免循环调
        const response = await axios.post<{
          data: {
            access_token: string;
            refresh_token: string;
          };
        }>('/backstage/login', {
          refresh_token: refreshToken,
        });

        const { access_token: newAccessToken, refresh_token: newRefreshToken } = response.data.data; // 1. 更新本地存储的 token

        setTokens(newAccessToken, newRefreshToken); // 2. 处理并重发等待队列中的请求

        processQueue(null, newAccessToken); // 3. 重发本次失败的请求

        if (!originalRequest.headers) {
          originalRequest.headers = new axios.AxiosHeaders();
        }
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return request(originalRequest);
      } catch (refreshError: unknown) {
        // 刷新 token 失败，清除所有 token 并重定向到登录页
        console.error('Failed to refresh token:', refreshError);
        clearTokens();
        processQueue(refreshError as Error, null); // window.location.href = '/login'; // 或使用 router.push('/login')
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    } // 对于其他错误，直接抛出

    // 处理错误信息，确保类型安全
    const errorMessage =
      error.response?.data &&
      typeof error.response.data === 'object' &&
      'message' in error.response.data
        ? (error.response.data as { message: string }).message
        : error.message;
    console.error('Request Error:', errorMessage);
    return Promise.reject(error);
  },
);

export default request;
