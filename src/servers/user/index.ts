import {
  UserListResult,
  PaginationParams,
  UserDetailResult,
  updateUserForm,
} from '../../pages/usersManage/model';
import request from '@/utils/request';
// 获取用户详情列表
export function getUserList(params: PaginationParams) {
  return request.post<UserListResult>('/backUser/get', { params });
}
//获取用户详情
export function getUserDetail(id: string) {
  return request.post<UserDetailResult>(`/backUser/detail/${id}`, { id });
}
//修改用户详情
export function updateUser(data: updateUserForm) {
  return request.post('/backUser/update', data);
}

//批量删除用户
export function deleteUser(id: Array<number>) {
  return request.post('/backUser/delete', { id_list: id });
}
