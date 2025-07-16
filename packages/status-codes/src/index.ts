/**
 * @file index.ts
 * @description 定义后端业务逻辑状态码的枚举。
 *
 * 通常由后端返回的 `code` 字段与这些值保持一致，用于前端根据状态码做不同的业务处理。
 */
export enum StatusCode {
  /**
   * 成功：操作成功，无错误
   */
  SUCCESS = 2000,

  /**
   * 客户端传参错误：缺少参数、格式不正确等
   */
  INVALID_PARAMS = 4000,

  /**
   * 未授权或授权过期：需要重新登录
   */
  UNAUTHORIZED = 4010,

  /**
   * 请求的资源不存在
   */
  NOT_FOUND = 4040,

  /**
   * 服务端内部错误
   */
  SERVER_ERROR = 5000,
}

// import { StatusMessages, getMessageByCode } from './message';
// export { StatusMessages, getMessageByCode };
