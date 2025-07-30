import request from '@/utils/request';
import type { ApiResponse, ExportTaskData, ExportTaskStatusData } from '#/trade-blotter';

// 获取交易流水列表
export function getTradeBlotterListServe(params: FlowListParams) {
  return request.get<FlowListResponse>('/tradeBlotter/list', { params });
}

// 创建导出任务
export function createExportTaskServe(params: FlowQueryParams) {
  return request.post<any, ApiResponse<ExportTaskData>>('/tradeBlotter/export', params);
}

// 查询导出任务状态
export function getExportTaskStatusServe(taskId: number | string) {
  return request.get<any, ApiResponse<ExportTaskStatusData>>('/tradeBlotter/export/task/status', {
    params: { task_id: taskId }
  });
}

// 下载导出文件
export function downloadExportFileServe(filePath: string) {
  console.log('file', filePath)
  return request.get<any, Blob>(`/tradeBlotter/export/task/download?file=${filePath}`, {
    // params: { file: filePath },
    responseType: 'blob'
  });
}

