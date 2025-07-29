import {
  RoleListResult,
  PaginationParams,
  addRoleForm,
  updateRoleForm,
  RoleDetailResult,
  updateRolePermsForm,
  RoleSelectListResult,
} from '../../pages/permissionManage/roleManage/model';
import request from '@/utils/request';
// 获取
export function getRoleList(params: PaginationParams) {
  return request.get<RoleListResult>('/role/get', { params });
}
//详情
export function getRoleDetail(id: number) {
  return request.get<RoleDetailResult>(`/role/detail?id=${id}`);
}
//添加
export function addRole(data: addRoleForm) {
  return request.post('/role/add', { data });
}
//更新
export function updateRole(data: updateRoleForm) {
  return request.post('/role/update', { data });
}
//删除
export function deleteRole(id: Array<number>) {
  return request.delete('/role/delete', { data: { id } });
}

//获取api权限
export function getRoleApiPerms(id: string) {
 return request.get('/role/perm', { params: { id } });
}
//获取menu权限
export function getRoleMenuPerms(id: string) {
  return request.get('/role/perm_menu', { params: { id } });
}

//更新api权限
export function updateRoleApiPerms(data: updateRolePermsForm) {
  return request.post('/role/assign', { data });
}
//更新角色菜单权限
export function updateRoleMenuPerms(data: updateRolePermsForm) {
  return request.post('/role/assign_menu', { data });
}
