import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../stores/token';

let isRefreshing: boolean = false;
interface FailedRequest {
  resolve: (token: string) => void;
  reject: (reason?: unknown) => void;
}
let failedQueue: FailedRequest[] = [];

// processQueue函数已移除，现在直接在响应拦截器中处理队列

// --- 创建 Axios 实例 ---
const request: AxiosInstance = axios.create({
  // 在 .env 文件中配置 中的请求配置
  baseURL:
    import.meta.env.VITE_APP_ENV === 'localhost' ? '/api' : import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, // 请求超时时间
});

// --- 请求拦截器 ---
request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    console.log('Request interceptor:', {
      url: config.url,
      method: config.method,
      hasToken: !!accessToken,
      tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'none',
    });

    if (accessToken) {
      console.log('Adding Authorization header with token:', accessToken.substring(0, 20) + '...');
      // 在请求头中添加 Authorization 字段
      if (!config.headers) {
        config.headers = new axios.AxiosHeaders();
      }
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
      console.log('No access token found, request without Authorization header');
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// --- 响应拦截器 ---
request.interceptors.response.use(
  async (response: AxiosResponse<any>) => {
    console.log('✅ Response interceptor - Success:', {
      url: response.config?.url,
      status: response.status,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      responseData: response.data,
    });

    // 检查业务错误码 4010 (token过期)
    if (response.data && response.data.code === 4010) {
      console.log('🔥 Token expired detected in success response (code 4010), handling directly');
      console.log('🔥 Response data that triggered 4010:', response.data);

      const originalRequest = response.config;

      // 如果是刷新token接口本身返回4010，直接跳转登录页
      if (originalRequest.url?.includes('/token/refresh')) {
        console.log('Refresh token API returned 4010, redirecting to login');
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(new Error('Refresh token expired'));
      }

      if (!isRefreshing) {
        isRefreshing = true;

        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          console.error('No refresh token available.');
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(new Error('No refresh token'));
        }

        // 创建独立的axios实例来刷新token
        const refreshInstance = axios.create({
          baseURL:
            import.meta.env.VITE_APP_ENV === 'localhost'
              ? '/api'
              : import.meta.env.VITE_API_BASE_URL,
          timeout: 10000,
        });

        return refreshInstance
          .post('/token/refresh', {
            refresh_token: refreshToken,
          })
          .then((refreshResponse) => {
            const data = refreshResponse.data;

            if (!data || data.code !== 2000) {
              throw new Error('Refresh token expired');
            }

            const newAccessToken = data.data?.access_token || data.access_token;
            const newRefreshToken = data.data?.refresh_token || data.refresh_token;

            if (!newAccessToken || !newRefreshToken) {
              throw new Error('Invalid token response');
            }

            console.log('🔥 Token refresh successful');
            setTokens(newAccessToken, newRefreshToken);

            // 重新发送原始请求
            if (!originalRequest.headers) {
              originalRequest.headers = new axios.AxiosHeaders();
            }
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

            // 处理队列中的请求
            failedQueue.forEach(({ resolve }) => {
              resolve(newAccessToken);
            });
            failedQueue = [];

            return request(originalRequest);
          })
          .catch((error) => {
            console.error('🔥 Token refresh failed:', error);
            clearTokens();

            // 处理队列中的失败请求
            failedQueue.forEach(({ reject }) => {
              reject(error);
            });
            failedQueue = [];

            window.location.href = '/login';
            return Promise.reject(error);
          })
          .finally(() => {
            isRefreshing = false;
          });
      } else {
        // 如果正在刷新token，将请求加入队列
        console.log('🔥 Token refresh in progress, queuing request');
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (!originalRequest.headers) {
                originalRequest.headers = new axios.AxiosHeaders();
              }
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(request(originalRequest));
            },
            reject,
          });
        });
      }
    }

    return response.data;
  },
  async (error: AxiosError) => {
    console.log('🚨 RESPONSE INTERCEPTOR TRIGGERED! Error caught:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      data: error.response?.data,
      isAxiosError: error.isAxiosError,
      errorName: error.name,
    });

    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (!originalRequest) {
      console.error('Request Error: No config available');
      return Promise.reject(error);
    }
    const responseData = error.response?.data || error.response;
    console.log('🔍 Error response data:', responseData);
    console.log('🔍 Checking for code 4010. responseData.code:', responseData?.code);
    if (responseData && responseData.code === 4010) {
      console.log('🔥 Token expired detected (code 4010), starting refresh process...');
      console.log('🔥 Original request URL:', originalRequest.url);
      // 如果是刷新token接口本身返回4010，直接跳转登录页，避免递归
      if (originalRequest.url?.includes('/token/refresh')) {
        console.log('Refresh token API returned 4010, redirecting to login');
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (!isRefreshing) {
        isRefreshing = true;

        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          console.error('No refresh token available.');
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(new Error('No refresh token'));
        }

        try {
          console.log(
            'Starting token refresh with refresh token:',
            refreshToken.substring(0, 20) + '...',
          );

          const refreshInstance = axios.create({
            baseURL:
              import.meta.env.VITE_APP_ENV === 'localhost'
                ? '/api'
                : import.meta.env.VITE_API_BASE_URL,
            timeout: 10000,
          });

          const response = await refreshInstance.post('/token/refresh', {
            refresh_token: refreshToken,
          });

          console.log('Refresh token response:', response.data);

          // 如果refreshToken也失效了，就重新登录
          if (!response.data || response.data.code !== 2000) {
            console.log('Refresh token expired, redirecting to login');
            clearTokens();
            window.location.href = '/login';
            return Promise.reject(new Error('Refresh token expired'));
          }

          // 获取新的token
          let newAccessToken: string;
          let newRefreshToken: string;

          if (response.data.data) {
            newAccessToken = response.data.data.access_token;
            newRefreshToken = response.data.data.refresh_token;
          } else {
            newAccessToken = response.data.access_token;
            newRefreshToken = response.data.refresh_token;
          }

          if (!newAccessToken || !newRefreshToken) {
            throw new Error('Invalid token response: missing access_token or refresh_token');
          }

          console.log('Token refresh successful, new tokens obtained');
          console.log('New access token:', newAccessToken.substring(0, 20) + '...');
          console.log('New refresh token:', newRefreshToken.substring(0, 20) + '...');

          // 保存新的token
          setTokens(newAccessToken, newRefreshToken);

          // 重新发送原始请求
          if (!originalRequest.headers) {
            originalRequest.headers = new axios.AxiosHeaders();
          }
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

          const firstReqRes = await request(originalRequest);

          // 执行请求队列中的请求
          failedQueue.forEach(({ resolve }) => {
            resolve(newAccessToken);
          });
          failedQueue = [];

          return firstReqRes;
        } catch (refreshError: unknown) {
          console.error('Failed to refresh token:', refreshError);
          clearTokens();

          // 处理队列中的失败请求
          failedQueue.forEach(({ reject }) => {
            reject(refreshError);
          });
          failedQueue = [];

          window.location.href = '/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // 并发情况下如果正在请求新token，把请求先放到一个请求队列中
        console.log('Token refresh in progress, queuing request');
        return new Promise<any>((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (!originalRequest.headers) {
                originalRequest.headers = new axios.AxiosHeaders();
              }
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
              resolve(request(originalRequest));
            },
            reject,
          });
        });
      }
    }

    // 其他错误直接返回
    console.log('Non-token error, passing through:', {
      status: error.response?.status,
      url: error.config?.url,
      code: responseData?.code,
    });

    const errorMessage =
      responseData && responseData.message ? responseData.message : error.message;
    console.error('Request Error:', errorMessage);
    return Promise.reject(error);
  },
);

export default request;
