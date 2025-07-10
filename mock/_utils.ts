/**
 * 统一接口返回结构定义
 */
export interface Result<T = any> {
  code: number; // 状态码
  message: string; // 提示信息
  data: T | null; // 数据内容
}

/**
 * 成功返回结构
 * @param data 返回数据
 * @param message 返回信息，默认 'success'
 * @param code 状态码，默认 200
 * @returns
 */
export function resultSuccess<T = any>(data: T, message = 'success', code = 200): Result<T> {
  return { code, message, data };
}

/**
 * 返回失败结构
 * @param message 提示信息
 * @param code 状态码 500
 * @returns
 */
export function resultError(message = 'error', code = 500): Result<null> {
  return { code, message, data: null };
}

export function resultPageSuccess<T = any>(
  list: T[],
  total: number,
  page = 1,
  pageSize = 10,
): Result<{ list: T[]; pagination: { total: number; page: number; pageSize: number } }> {
  return resultSuccess({
    list,
    pagination: { total, page, pageSize },
  });
}
