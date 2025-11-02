import request from '@/utils/request';
import type { DashboardStatisticsResponse } from '@/pages/dashboard/model';

const BASE_URL = '/balance/statistics';

/**
 * 获取财务仪表盘统计数据 (GET)
 *
 * @returns Promise<DashboardStatisticsResponse>
 */
export function getDashboardStatistics(): Promise<DashboardStatisticsResponse> {
  return request.get<DashboardStatisticsResponse>(BASE_URL);
}