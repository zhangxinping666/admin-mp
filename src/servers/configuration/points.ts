import request from '@/utils/request';
import type {
  PointsConfigListResponse,
  GetPointsConfigListParams,
  PointsConfigForm,
} from '../../pages/configurationManage/pointsConfiguration/model'; // 假设类型定义在 model 文件中

const BASE_URL = '/api/admin/points/configs';

/**
 * 1. 获取金豆配置列表 (GET)
 */
export function getPointsConfigList(params: GetPointsConfigListParams) {
  return request.get<PointsConfigListResponse>(BASE_URL, { params });
}

/**
 * 2. 创建金豆配置 (POST)
 */
export function addPointsConfig(data: PointsConfigForm) {
  // 假设成功后返回一个标准的成功响应
  return request.post(BASE_URL, data);
}

/**
 * 3. 更新金豆配置 (PUT)
 */
export function updatePointsConfig(id: string | number, data: PointsConfigForm) {
  return request.put(`${BASE_URL}/${id}`, data);
}

/**
 * 4. 删除金豆配置 (DELETE)
 */
export function deletePointsConfig(id: string | number) {
  return request.delete(`${BASE_URL}/${id}`);
}