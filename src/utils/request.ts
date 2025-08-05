import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../stores/token'; // Assuming these are your token utility functions

const request: AxiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_APP_ENV === 'localhost' ? '/api' : import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

const HOME_PAGE = "/"; // 登录页面的路径

// 封装 refreshToken 逻辑
let expiredRequestArr: any[] = []; // 存储失败的请求
let firstRequest = true; // 控制是否首次刷新 Token

// 存储当前因为 Token 失效导致发送失败的请求
const saveErrorRequest = (expiredRequest: { resolve: Function; reject: Function; request: () => Promise<any> }) => {
  expiredRequestArr.push(expiredRequest);
};

// 利用 refreshToken 更新当前使用的 Token
const updateTokenByRefreshToken = () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.log('没有刷新Token，跳转登录页');
    window.location.href = `${HOME_PAGE}/login`;
    return;
  }
  request
    .post('/token/refresh', { refresh_token: refreshToken })
    .then((res) => {
      const responseData = res.data || res;
      if (responseData.code !== 2000 || !responseData.data) {
        throw new Error('刷新Token失败');
      }
      const { access_token: newAccessToken, refresh_token: newRefreshToken } = responseData.data;
      // 更新本地 Token
      setTokens(newAccessToken, newRefreshToken);
      // 重新发送失败的请求
      expiredRequestArr.forEach(({ resolve, reject, request }) => {
        request().then(resolve).catch(reject);
      });
      expiredRequestArr = [];
      firstRequest = true;
    })
    .catch((err) => {
      console.log('刷新 Token 失败', err);
      // 拒绝队列中的所有请求
      expiredRequestArr.forEach(({ reject }) => {
        reject(err);
      });
      expiredRequestArr = [];
      firstRequest = true;
      // 刷新 Token 失败跳转登录页
      clearTokens();
      window.location.href = `${HOME_PAGE}/login`;
    });
};

// refreshToken 函数，尝试刷新 Token
const refreshTokenFunc = (expiredRequest: { resolve: Function; reject: Function; request: () => Promise<any> }) => {
  saveErrorRequest(expiredRequest);
  if (firstRequest) {
    updateTokenByRefreshToken(); // 刷新 Token
    firstRequest = false;
  }
};

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// 响应拦截器处理 Token 过期
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    if (data && data.code === 4010) {
      // 在响应拦截器中处理token过期，保存失败的请求并尝试刷新Token
      return new Promise((resolve, reject) => {
        const retryRequest = () => {
          return request(response.config); // 刷新Token后重新发送请求
        };
        
        refreshTokenFunc({ resolve, reject, request: retryRequest });
      });
    }
    // 检查业务状态码，如果不是成功状态码（通常是2000），则抛出异常
    if (data && data.code && data.code !== 2000) {
      const errorMessage = data.error || data.message || `请求失败，错误码：${data.code}`;
      return Promise.reject(createError(response.config, data.code, errorMessage));
    }
    return data;
  },
  (error: AxiosError) => {
    if (!error.isAxiosError || !error.response) {
      console.error('An unexpected error occurred:', error);
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const errorCode = (data as any)?.code;

    if (status === 401 || errorCode === 4010) {
      // 保存失败的请求并尝试刷新Token
      return new Promise((resolve, reject) => {
        const retryRequest = () => {
          return request(error.config!); // 刷新Token后重新发送请求
        };
        
        refreshTokenFunc({ resolve, reject, request: retryRequest });
      });
    } else {
      return Promise.reject(error);
    }
  },
);

function createError(
  config: InternalAxiosRequestConfig,
  code: number | undefined,
  message: string,
): AxiosError {
  const error = new Error(message) as AxiosError;
  error.config = config;
  error.isAxiosError = true;
  error.response = {
    data: { code, message },
    status: code === 4010 ? 401 : 500,
    statusText: message,
    headers: {},
    config: config,
  };
  return error;
}

export default request;
