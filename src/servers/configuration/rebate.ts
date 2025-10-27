import request from '@/utils/request';
import type {
  RebateConfigListResponse,
  GetRebateConfigListParams,
  RebateConfigForm,
} from '../../pages/configurationManage/rebateConfiguration/model' // 假设您将类型定义放在 model 文件中

const BASE_URL = '/api/admin/rebate/configs';

/**
 * 1. 获取返利配置列表 (GET)
 */
export function getRebateConfigList(params: GetRebateConfigListParams) {
  return request.get<RebateConfigListResponse>(BASE_URL, { params });
}

/**
 * 2. 新增返利配置 (POST)
 */
export function addRebateConfig(data: RebateConfigForm) {
  // 假设成功后返回一个标准的成功响应，您可以根据需要添加泛型
  return request.post(BASE_URL, data);
}

/**
 * 3. 更新返利配置 (PUT)
 */
export function updateRebateConfig(id: string | number, data: RebateConfigForm) {
  // 仿照 updateCity 的模式，这里我们使用 PUT
  // 并将 id 放入 URL 路径中
  return request.put(`${BASE_URL}/${id}`, data);
}

/**
 * 4. 删除返利配置 (DELETE)
 */
export function deleteRebateConfig(id: string | number) {
  return request.delete(`${BASE_URL}/${id}`);
}