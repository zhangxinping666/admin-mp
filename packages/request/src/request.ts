import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
  AxiosRequestConfig,
} from 'axios';
import type {
  RequestInterceptors,
  CreateRequestConfig,
  ServerResult,
} from './types';

/**
 * AxiosRequest 封装类
 * 用于创建带有自定义拦截器、重复请求控制的 axios 实例
 */
class AxiosRequest {
  // axios 实例
  instance: AxiosInstance;
  // 用户自定义的拦截器对象
  interceptorsObj?: RequestInterceptors<AxiosResponse>;
  // 用于管理取消重复请求的 Map
  abortControllerMap: Map<string, AbortController>;

  constructor(config: CreateRequestConfig) {
    this.instance = axios.create(config);
    this.abortControllerMap = new Map();
    this.interceptorsObj = config.interceptors;

    // ========= 全局请求拦截器（优先执行）=========
    this.instance.interceptors.request.use(
      (reqConfig: InternalAxiosRequestConfig) => {
        const controller = new AbortController();
        let urlKey = reqConfig.method || '';
        if (reqConfig.url) urlKey += `^${reqConfig.url}`;

        // 拼接 params
        if (reqConfig.params) {
          for (const key in reqConfig.params) {
            urlKey += `&${key}=${reqConfig.params[key]}`;
          }
        }
        // 拼接 body（仅简单处理 json 字符串）
        if (
          typeof reqConfig.data === 'string' &&
          reqConfig.data.startsWith('{') &&
          reqConfig.data.endsWith('}')
        ) {
          try {
            const dataObj = JSON.parse(reqConfig.data);
            for (const key in dataObj) {
              urlKey += `#${key}=${dataObj[key]}`;
            }
          } catch (e) {
            console.warn('请求体解析失败', e);
          }
        }

        // 如果已存在相同请求，则取消之前的
        if (this.abortControllerMap.has(urlKey)) {
          console.warn('取消重复请求:', urlKey);
          this.cancelRequest(urlKey);
        } else {
          this.abortControllerMap.set(urlKey, controller);
        }

        reqConfig.signal = controller.signal;
        return reqConfig;
      },
      (error) => Promise.reject(error),
    );

    // ========= 实例级请求拦截器（可选，由外部传入）=========
    if (this.interceptorsObj?.requestInterceptors) {
      this.instance.interceptors.request.use(
        this.interceptorsObj.requestInterceptors,
        this.interceptorsObj.requestInterceptorsCatch,
      );
    }

    // ========= 实例级响应拦截器（可选，由外部传入）=========
    if (this.interceptorsObj?.responseInterceptors) {
      this.instance.interceptors.response.use(
        this.interceptorsObj.responseInterceptors,
        this.interceptorsObj.responseInterceptorsCatch,
      );
    }

    // ========= 全局响应拦截器（最后执行，保证删除去重 key，并返回数据部分）=========
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 删除该请求的 controller
        const url = response.config.url || '';
        this.abortControllerMap.delete(url);
        // 返回真正需要的数据部分
        return response;
      },
      (error) => Promise.reject(error),
    );
  }

  /**
   * 取消所有请求
   */
  cancelAllRequest() {
    this.abortControllerMap.forEach((controller) => controller.abort());
    this.abortControllerMap.clear();
  }

  /**
   * 取消指定请求
   * @param url - 单个 urlKey 或 urlKey 数组
   */
  cancelRequest(url: string | string[]) {
    const urlList = Array.isArray(url) ? url : [url];
    urlList.forEach((_url) => {
      this.abortControllerMap.get(_url)?.abort();
      this.abortControllerMap.delete(_url);
    });
  }

  /**
   * GET 请求
   * @param url - 请求地址
   * @param config - axios 配置
   */
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ServerResult<T>> {
    return this.instance.get(url, config).then((res) => res.data as ServerResult<T>);
  }

  /**
   * POST 请求
   * @param url - 请求地址
   * @param data - 请求体
   * @param config - axios 配置
   */
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ServerResult<T>> {
    return this.instance.post(url, data, config).then((res) => res.data as ServerResult<T>);
  }

  /**
   * PUT 请求
   * @param url - 请求地址
   * @param data - 请求体
   * @param config - axios 配置
   */
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<ServerResult<T>> {
    return this.instance.put(url, data, config).then((res) => res.data as ServerResult<T>);
  }

  /**
   * DELETE 请求
   * @param url - 请求地址
   * @param config - axios 配置
   */
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ServerResult<T>> {
    return this.instance.delete(url, config).then((res) => res.data as ServerResult<T>);
  }
}

export default AxiosRequest;
