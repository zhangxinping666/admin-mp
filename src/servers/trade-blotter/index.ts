import request from '@/utils/request';
import type { ApiResponse, ExportTaskData, ExportTaskStatusData } from '#/trade-blotter';

// 获取交易流水列表
export function getTradeBlotterListServe(params: FlowListParams) {
  return request.get<FlowListResponse>('/tradeBlotter/list', { params });
}

// 创建导出任务（异步模式，用于大数据量）
export function createExportTaskServe(params: FlowQueryParams) {
  // 对于无筛选条件的导出，后端可能需要特殊标记
  const exportParams = {
    ...params,
    export_mode: 'async', // 明确指定为异步模式
  };
  return request.post<any, ApiResponse<ExportTaskData>>('/tradeBlotter/export', exportParams);
}

// 直接导出文件（同步导出，用于有筛选条件的小数据量）
export function exportExcelDirectServe(params: FlowQueryParams) {
  // 对于有筛选条件的导出，明确指定为同步模式
  const exportParams = {
    ...params,
    export_mode: 'sync', // 明确指定为同步模式
  };
  return request.post('/tradeBlotter/export', exportParams, {
    responseType: 'blob',
    timeout: 60000, // 导出可能需要更长时间，设置60秒超时
    headers: {
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/octet-stream',
      'Content-Type': 'application/json',
    },
  });
}

// 查询导出任务状态
export function getExportTaskStatusServe(taskId: number | string) {
  return request.get<any, ApiResponse<ExportTaskStatusData>>('/tradeBlotter/export/task/status', {
    params: { task_id: taskId },
  });
}

// 下载导出文件
export function downloadExportFileServe(filePath: string) {
  return request.get<any, Blob>('/tradeBlotter/export/task/download', {
    params: { file: filePath },
    responseType: 'blob',
    timeout: 60000, // 下载文件可能需要更长时间
  });
}

// 备用：尝试使用GET请求导出（某些后端可能使用GET）
export function exportExcelByGetServe(params: FlowQueryParams) {
  return request.get('/tradeBlotter/export', {
    params: params,
    responseType: 'blob',
    timeout: 60000,
    headers: {
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/octet-stream',
    },
  });
}
