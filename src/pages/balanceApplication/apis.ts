import request from '@/utils/request';

const apis = {
  getBalanceApplication: '/withdrawService/list',
  updateBalanceApplication: '/reviewService/reviewResultBack',
};

export const getBalanceApplication = (params?: any) => {
  return request.get(apis.getBalanceApplication, { params: params });
};

export const updateBalanceApplication = (data?: any) => {
  return request.post(apis.updateBalanceApplication, data);
};
