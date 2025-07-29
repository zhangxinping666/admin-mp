import { SchoolListResult, PaginationParams } from '../../pages/schoolsManage/model';
import request from '@/utils/request';
// 获取学校列表
export function getSchoolList(params: PaginationParams) {
  return request.get<SchoolListResult>('/school/getSchool', { params });
}
//添加学校
export function addSchool(data: SchoolDetailResult) {
  return request.post('/school/addSchool', { data });
}
//更新学校
export function updateSchool(id: number, data: SchoolDetailResult) {
  return request.put('/school/updateSchool', { id, data });
}
//删除学校
export function deleteSchool(id: number) {
  return request.delete('/school/deleteSchool', { id });
}
