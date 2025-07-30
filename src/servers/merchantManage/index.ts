import request from '@/utils/request';

/**
 * 商户管理
 * @param data - 请求数据
 * @returns - 响应数据
 */

export function getMerchantList(data: object) {
  return request.get('/api/merchant', { params: data });
}
