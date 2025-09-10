import {
  SchoolListResult,
  PaginationParams,
  addSchoolForm,
  updateSchoolForm,
} from '../../pages/schoolsManage/model';
import request from '@/utils/request';
// 获取学校列表
export function getSchoolList(params: PaginationParams) {
  return request.get<SchoolListResult>('/school/getSchool', { params });
}
//添加学校
export function addSchool(data: addSchoolForm) {
  return request.post('/school/addSchool', data);
}
//更新学校
export function updateSchool(data: updateSchoolForm) {
  return request.put('/school/updateSchool', data);
}
//删除学校
export function deleteSchool(id: Array<number>) {
  return request.delete('/school/deleteSchool', { data: { id_list: id } });
}

// 检查学校名称是否存在
export function checkSchoolName(name: string, excludeId?: number) {
  return request.get('/school/checkName', { 
    params: { 
      name,
      exclude_id: excludeId 
    } 
  });
}
