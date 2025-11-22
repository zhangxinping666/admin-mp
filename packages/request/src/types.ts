import type { AxiosResponse, InternalAxiosRequestConfig, CreateAxiosDefaults, Cancel } from 'axios';

/**
 * 自定义请求取消类型
 * 用于拦截器里处理取消请求时的错误对象
 */
export interface RequestCancel extends Cancel {
  /** 可附加自定义数据 */
  data: object;
  /** 响应对象 */
  response: {
    status: number;
    data: {
      code?: number;
      message?: string;
    };
  };
}

/**
 * 请求和响应拦截器配置
 * 泛型 T 默认是 AxiosResponse，也可以替换成后端约定的响应结构
 */
export interface RequestInterceptors<T = AxiosResponse> {
  /**
   * 请求发送前的拦截处理
   * 可用来添加 token、修改 header、参数签名等
   */
  requestInterceptors?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;

  /**
   * 请求拦截发生错误时的处理
   * 如超时、网络问题等
   */
  requestInterceptorsCatch?: (err: RequestCancel) => void;

  /**
   * 收到响应后的拦截处理
   * 可用来统一处理 code、提取 data、做日志等
   */
  responseInterceptors?: (response: T) => T;

  /**
   * 响应拦截发生错误时的处理
   * 如 500、404、取消请求等
   */
  responseInterceptorsCatch?: (err: RequestCancel) => void;
}

/**
 * 创建请求实例时的配置
 * 泛型 T 为响应类型
 */
export interface CreateRequestConfig<T = AxiosResponse> extends CreateAxiosDefaults {
  /**
   * 请求与响应拦截器
   */
  interceptors?: RequestInterceptors<T>;
}

/**
 * 通用后端接口返回结构
 * code 状态码，message 提示信息，data 具体数据
 */
export interface ServerResult<T = unknown> {
  code: number;
  message?: string;
  data: T;
}
