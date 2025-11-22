import request from '@/utils/request';

const apis = {
  getUsers: '/backUser/get',
};

export function getUsers(params: any) {
  return request.get(apis.getUsers, { params });
}
