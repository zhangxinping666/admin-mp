import {
  getCityResult,
  PaginationParams,
  addCityForm,
  updateCityForm,
} from '../../pages/citysManage/model';
import request from '@/utils/request';
// 获取城市列表
export function getCityList(params: PaginationParams) {
  return request.get<getCityResult>('/cityLeader/getCityLeader', { params });
}
//添加城市
export function addCity(data: addCityForm) {
  return request.post('/cityLeader/addCityLeader', { data });
}
//更新城市
export function updateCity(data: updateCityForm) {
  return request.put('/cityLeader/updateCityLeader', { data });
}
//删除城市
export function deleteCity(id: Array<number>) {
  return request.delete('/cityLeader/deleteCityLeader', { data: { id } });
}

//获取城市列表
export function getCityName() {
  return request.get('/citySchool/getCitiesByProvince');
}
//获取省份列表
export function getProvinceList() {
  return request.get('/citySchool/getAllProvinces');
}
