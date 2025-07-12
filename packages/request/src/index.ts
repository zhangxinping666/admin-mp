import AxiosRequest from './request';
import type { RequestInterceptors, ServerResult } from './types';

/**
 * 创建一个 axios 请求实例
 * @param baseURL - 请求基础地址
 * @param interceptors - 自定义拦截器
 * @param timeout - 超时时间（单位 ms）
 * @returns 返回一个封装后的 AxiosRequest 实例
 */
function createRequest(
  baseURL: string,
  interceptors?: RequestInterceptors,
  timeout = 10000, // 默认 10 秒
) {
  return new AxiosRequest({
    baseURL,
    timeout,
    interceptors,
  });
}

export { createRequest };
export type { ServerResult }; // 如果主项目需要类型
