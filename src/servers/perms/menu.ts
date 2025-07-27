import {
  MenuListResult,
  PaginationParams,
  MenuAddForm,
  MenuUpdateForm,
  MenuDetailResult,
} from '../../pages/permissionManage/menuManage/model';
import request from '@/utils/request';
// 获取
export function getMenuList(params: PaginationParams) {
  return request.post<MenuListResult>('/menu/get', { params });
}
//详情
export function getMenuDetail(id: number) {
  return request.get<MenuDetailResult>(`/menu/detail?id=${id}`);
}
//添加
export function addMenu(data: MenuAddForm) {
  return request.post('/menu/add', { data });
}
//更新
export function updateMenu(data: MenuUpdateForm) {
  return request.post('/menu/update', { data });
}
//删除
export function deleteMenu(id: Array<number>) {
  return request.delete('/menu/delete', { data: { id } });
}
//获取菜单下拉列表
export function getMenuSelectList() {
  return request.get(`/menu/list`);
}
