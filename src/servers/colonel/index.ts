import {
  ColonelListResult,
  PaginationParams,
  addColonelForm,
  updateColonelForm,
} from '../../pages/colonelManage/model';
import request from '@/utils/request';
// 获取团长列表
export function getColonelList(params: PaginationParams) {
  return request.get<ColonelListResult>('/schoolLeader/getSchoolLeader', { params });
}
//添加团长
export function addColonel(data: addColonelForm) {
  return request.post('/schoolLeader/addSchoolLeader', { data });
}
//更新团长
export function updateColonel(data: updateColonelForm) {
  return request.put('/schoolLeader/updateSchoolLeader', { data });
}
//删除团长
export function deleteColonel(id: Array<number>) {
  return request.delete('/schoolLeader/deleteSchoolLeader', { data: { id } });
}
//通过城市id获取学校
export function getSchoolListByCityId(city_id: string) {
  return request.get('/citySchool/getSchoolsByCity', { params: { city_id } });
}
