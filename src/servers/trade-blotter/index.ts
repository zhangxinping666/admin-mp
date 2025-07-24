import request from '@/utils/request';

// 获取交易流水列表
export function getTradeBlotterListServe(params: FlowListParams) {
  return request.get<FlowListResponse>('/tradeBlotter/list', { params });
}

// 获取excel下载链接
export function getTradeBlotterExcelServe(params: FlowQueryParams) {
  return request.get<Blob>('/tradeBlotter/exportExcel', {
    params,
    responseType: 'blob',
  });
}
