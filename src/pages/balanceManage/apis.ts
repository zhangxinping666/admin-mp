import request from '@/utils/request';

const apis = {
  getBalanceInfo: '/admin/balance/accounts',
  getBalanceDetailInfo: '/admin/balance/accounts/{user_id}/details',
};

/**
 * 获取余额信息
 * @param params
 */

export const getBalanceInfo = (params?: any) => {
  return request.get(apis.getBalanceInfo, { params });
};

/**
 * 获取余额明细信息
 * @param params
 */
interface BalanceDetailParams {
  user_id: string;
}

export const getBalanceDetailInfo = (params?: BalanceDetailParams) => {
  return request.get(apis.getBalanceDetailInfo.replace('{user_id}', params?.user_id || ''));
};
