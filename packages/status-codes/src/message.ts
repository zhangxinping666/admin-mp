// /**
//  * @file messages.ts
//  * @description 根据状态码提供对应的提示消息。
//  */

// import { StatusCode } from './index';

// /**
//  * 状态码对应的默认提示信息
//  * key 是状态码，value 是提示文字
//  */
// export const StatusMessages: Record<StatusCode, string> = {
//   [StatusCode.SUCCESS]: 'status.success',
//   [StatusCode.INVALID_PARAMS]: 'status.invalid_params',
//   [StatusCode.UNAUTHORIZED]: 'status.unauthorized',
//   [StatusCode.NOT_FOUND]: 'status.not_found',
//   [StatusCode.SERVER_ERROR]: 'status.server_error',
// };

// /**
//  * 根据状态码获取提示信息
//  * @param code - 后端返回的业务状态码
//  * @returns 对应的提示消息，如果没有匹配到则返回“未知错误”
//  */
// export function getMessageByCode(code: number): string {
//   return StatusMessages[code as StatusCode] || 'unkown_error';
// }
