import {
  addCityForm,
  getCityResult,
  PaginationParams,
  updateCityForm,
} from '@/pages/citysManage/model';
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


// 获取余额明细列表
export const getBalanceDetailList = (params: { page: string, page_size: string }) => {
  return request.get('/admin/balance/accounts/details', { params: params });
};

//返回响应
// {
//   "code": 2000,
//   "data": {
//       "list": [
//           {
//               "id": 83,
//               "user_id": 43,
//               "category": "withdraw_processing", 提现申请中  "withdrawal"提现 "rebate"返佣 "merchant_entrance"商户入驻
//               "amount": 30,
//               "transaction_no": "TXN20250820103306633666R8A7S5", 交易流水号
//               "order_no": "WD20250820023E20003", 订单号
//               "transaction_type": 3, 交易类型 1收入 2支出
//               "transaction_type_name": "冻结",
//               "voucher": 0, 凭证
//               "status": 0, 状态 0正常 1禁用
//               "opening_balance": 961, 期初余额
//               "closing_balance": 931, 期末余额
//               "created_at": "2025-08-20T10:33:06.634+08:00", 创建时间
//               "is_valid": false, 是否有效
//               "username": "海燕", 用户名
//               "remark": "提现方式: 支付宝", 备注
//               "operated_at": "2025-08-20T10:33:06.634+08:00" 操作时间
//           },
//           {
//               "id": 81,
//               "user_id": 43,
//               "category": "withdraw_processing",
//               "amount": 14,
//               "transaction_no": "TXN2025082010325144528234NFPL",
//               "order_no": "WD20250820023D30001",
//               "transaction_type": 3,
//               "transaction_type_name": "冻结",
//               "voucher": 0,
//               "status": 0,
//               "opening_balance": 988,
//               "closing_balance": 974,
//               "created_at": "2025-08-20T10:32:51.445+08:00",
//               "is_valid": false,
//               "username": "海燕",
//               "remark": "提现方式: 支付宝",
//               "operated_at": "2025-08-20T10:32:51.445+08:00"
//           },
//           {
//               "id": 80,
//               "user_id": 43,
//               "category": "withdraw_processing",
//               "amount": 12,
//               "transaction_no": "TXN20250820103243307860B0R9YY",
//               "order_no": "WD20250820023CB0000",
//               "transaction_type": 3,
//               "transaction_type_name": "冻结",
//               "voucher": 0,
//               "status": 0,
//               "opening_balance": 1000,
//               "closing_balance": 988,
//               "created_at": "2025-08-20T10:32:43.308+08:00",
//               "is_valid": false,
//               "username": "海燕",
//               "remark": "提现方式: 微信",
//               "operated_at": "2025-08-20T10:32:43.308+08:00"
//           }
//       ],
//       "page": 1,
//       "page_size": 10,
//       "pages": 1,
//       "total": 4
//   }
// }