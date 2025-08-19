import {
  addCityForm,
  getCityResult,
  PaginationParams,
  updateCityForm,
} from '@/pages/citysManage/model';
import {} from '../../pages/balanceManage/model';
import request from '@/utils/request';
// 获取城市运营商列表
export function getCityList(params: PaginationParams) {
  return request.get<getCityResult>('/cityLeader/getCityLeader', { params });
}
//添加城市运营商
export function addCity(data: addCityForm) {
  return request.post('/cityLeader/addCityLeader', data);
}
//更新城市运营商
export function updateCity(data: updateCityForm) {
  return request.put('/cityLeader/updateCityLeader', data);
}
//删除城市运营商
export function deleteCity(id: Array<number>) {
  return request.delete('/cityLeader/deleteCityLeader', { data: { id_list: id } });
}

//获取城市列表
export function getCityName(province: string) {
  return request.get('/citySchool/getCitiesByProvince', { params: { province } });
}
//获取省份列表
export function getProvinceList() {
  return request.get('/citySchool/getAllProvinces');
}

/**
 * 获取余额明细信息
 * @param params
 */
interface BalanceDetailParams {
  user_id: string;
  params?: object;
}

export const getBalanceDetailInfo = (params?: BalanceDetailParams) => {
  return request.get(
    '/admin/balance/accounts/{user_id}/details'.replace('{user_id}', params?.user_id || ''),
    {
      params: params?.params,
    },
  );
};
