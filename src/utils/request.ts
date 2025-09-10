import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../stores/token';

// 主请求实例
const request: AxiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_APP_ENV === 'localhost' ? '/api' : import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// 专门用于刷新令牌的独立axios实例，避免循环拦截
const refreshTokenRequest: AxiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_APP_ENV === 'localhost' ? '/api' : import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

const HOME_PAGE = 'http://localhost:7000'; // 登录页面的路径

// 封装 refreshToken 逻辑
let expiredRequestArr: any[] = []; // 存储失败的请求
let firstRequest = true; // 控制是否首次刷新 Token

// 存储当前因为 Token 失效导致发送失败的请求
const saveErrorRequest = (expiredRequest: {
  resolve: Function;
  reject: Function;
  request: () => Promise<any>;
}) => {
  expiredRequestArr.push(expiredRequest);
};

// 利用 refreshToken 更新当前使用的 Token
const updateTokenByRefreshToken = () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    console.log('没有刷新Token，跳转登录页');
    clearTokens();
    // 拒绝队列中的所有请求
    expiredRequestArr.forEach(({ reject }) => {
      reject(new Error('没有可用的刷新令牌'));
    });
    expiredRequestArr = [];
    firstRequest = true;
    // window.location.href = `${HOME_PAGE}/login`;
    return;
  }

  console.log('开始刷新令牌...');
  // 使用独立的axios实例进行令牌刷新，避免触发拦截器
  refreshTokenRequest
    .post('/token/refresh', { refresh_token: refreshToken })
    .then((res) => {
      const responseData = res.data || res;
      if (responseData.code !== 2000 || !responseData.data) {
        throw new Error(`刷新Token失败: ${responseData.message || '响应数据异常'}`);
      }
      const { access_token: newAccessToken, refresh_token: newRefreshToken } = responseData.data;

      if (!newAccessToken) {
        throw new Error('刷新令牌响应中缺少访问令牌');
      }
      console.log('令牌刷新成功，更新本地令牌');
      // 更新本地 Token
      setTokens(newAccessToken, newRefreshToken || refreshToken);
      console.log(`重新发送 ${expiredRequestArr.length} 个失败的请求`);
      // 重新发送失败的请求
      expiredRequestArr.forEach(({ resolve, reject, request }) => {
        request().then(resolve).catch(reject);
      });
      expiredRequestArr = [];
      firstRequest = true;
    })
    .catch((err) => {
      console.error('刷新 Token 失败:', err);
      // 拒绝队列中的所有请求
      expiredRequestArr.forEach(({ reject }) => {
        reject(err);
      });
      expiredRequestArr = [];
      firstRequest = true;
      // 刷新 Token 失败跳转登录页
      clearTokens();
      // window.location.href = `${HOME_PAGE}/login`;
    });
};

// refreshToken 函数，尝试刷新 Token
const refreshTokenFunc = (expiredRequest: {
  resolve: Function;
  reject: Function;
  request: () => Promise<any>;
}) => {
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

// 响应拦截器处理 Token 过期
request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    
    // 如果响应类型是 blob，需要特殊处理
    if (response.config.responseType === 'blob') {
      // 检查是否是错误响应（通过content-type判断）
      const contentType = response.headers['content-type'] || '';
      console.log('Blob响应 Content-Type:', contentType);
      console.log('Blob大小:', data.size, 'bytes');
      
      // 判断是否是Excel文件
      const isExcel = contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
                     contentType.includes('application/vnd.ms-excel') ||
                     contentType.includes('application/octet-stream');
      
      if (!isExcel && (contentType.includes('application/json') || contentType.includes('text/'))) {
        // 如果是JSON或文本格式，说明可能是错误响应或非预期的数据
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const textContent = reader.result as string;
              console.log('非Excel响应内容:', textContent);
              
              // 尝试解析为JSON
              try {
                const jsonData = JSON.parse(textContent);
                console.log('解析后的JSON数据:', jsonData);
                
                // 检查是否是错误响应
                if (jsonData.code && jsonData.code !== 2000) {
                  console.error('导出API返回错误:', jsonData);
                  const errorMessage = jsonData.message || jsonData.msg || jsonData.error || '导出失败';
                  reject(createError(response.config, jsonData.code, errorMessage));
                } else if (jsonData.code === 2000) {
                  // 如果是成功响应但返回JSON，说明后端可能返回了数据而非文件
                  console.error('后端返回了JSON数据而非Excel文件');
                  reject(new Error('服务器返回了数据而非Excel文件，请检查后端导出接口'));
                } else {
                  // 其他情况，返回原始blob（虽然可能不是我们想要的）
                  console.warn('返回了非预期的内容，可能不是有效的Excel文件');
                  resolve(data);
                }
              } catch {
                // 不是JSON，可能是其他文本内容
                console.error('响应不是JSON格式，内容:', textContent.substring(0, 200));
                reject(new Error('服务器返回了无效的响应格式'));
              }
            } catch (e) {
              console.error('读取响应内容失败:', e);
              reject(new Error('读取响应数据失败'));
            }
          };
          reader.onerror = () => {
            console.error('FileReader读取失败');
            reject(new Error('读取响应数据失败'));
          };
          reader.readAsText(data);
        });
      }
      
      // 检查blob大小
      if (data.size === 0) {
        console.error('错误：接收到的文件大小为0');
        return Promise.reject(new Error('导出的文件为空'));
      }
      
      console.log('成功接收到Excel文件，大小:', data.size, 'bytes');
      return data; // 返回blob数据
    }
    
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
