import { UserListResult, PaginationParams } from '../../pages/permissionManage/roleManage/model';
import request from '@/utils/request';
// 获取用户详情列表
export function getUserList(params: PaginationParams) {
  return request.post<UserListResult>('/backUser/get', { params });
}
//获取用户详情
export function getUserDetail(id: number) {
  return request.post<UserDetailResult>('/backUser/detail', { id });
}

//修改用户状态
export function updateUser(id: number, data: UserDetailResult) {
  return request.post('/backUser/update', { id, data });
}
//批量删除用户
export function deleteUser(id: Array<number>) {
  return request.post('/backUser/delete', { id });
}
//获取实名审核列表
export function getRealNameAuditList(params: PaginationParams) {
  return request.post<RealNameAuditListResult>('/auth/get', { params });
}
