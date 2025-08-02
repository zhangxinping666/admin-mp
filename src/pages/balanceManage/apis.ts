import request from '@/utils/request';

const apis = {
  getBalanceInfo: '/balance/info',
};

/**
 * 获取余额信息
 * @param params
 */

export const getBalanceInfo = (params?: any) => {
  return request.get(apis.getBalanceInfo, { params });
};
