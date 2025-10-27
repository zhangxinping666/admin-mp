import request from '@/utils/request';
import type {
  CommissionConfigListResponse,
  GetCommissionConfigListParams,
  CommissionConfigForm,
} from '../../pages/configurationManage/commissionConfiguration/model'; // 假设类型定义在 model 文件中

const BASE_URL = '/api/admin/commission/configs';

/**
 * 1. 获取分佣配置列表 (GET)
 */
export function getCommissionConfigList(params: GetCommissionConfigListParams) {
  return request.get<CommissionConfigListResponse>(BASE_URL, { params });
}

/**
 * 2. 新建分佣配置 (POST)
 */
export function addCommissionConfig(data: CommissionConfigForm) {
  return request.post(BASE_URL, data);
}

/**
 * 3. 更新分佣配置 (PUT)
 */
export function updateCommissionConfig(id: string | number, data: CommissionConfigForm) {
  return request.put(`${BASE_URL}/${id}`, data);
}

/**
 * 4. 删除分佣配置 (DELETE)
 */
export function deleteCommissionConfig(id: string | number) {
  return request.delete(`${BASE_URL}/${id}`);
}