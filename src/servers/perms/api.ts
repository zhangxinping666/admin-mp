import {
  APIListResult,
  PaginationParams,
  addForm,
  APIUpdateForm,
  APIDetailResult,
} from '../../pages/permissionManage/apiManage/model';
import request from '@/utils/request';
// 获取
export function getApiList(params: PaginationParams) {
  return request.get<APIListResult>('/api/get', { params });
}
//详情
export function getApiDetail(id: number) {
  return request.get<APIDetailResult>(`/api/detail?id=${id}`);
}
//添加
export function addApi(data: addForm) {
  return request.post('/api/add', data);
}
//更新
export function updateApi(data: APIUpdateForm) {
  return request.put('/api/update', data);
}
//删除
export function deleteApi(id: Array<number>) {
  return request.delete('/api/delete', { data: { id_list: id } });
}
//根据分组获取api列表
export function getApiListByGroup(id: number) {
  return request.get(`/api/group?id=${id}`);
}
