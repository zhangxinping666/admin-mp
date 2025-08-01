import request from '@/utils/request';

// 获取操作日志
export const getOperationLogServe = (params: OperationLogListParams) => {
  return request.get<OperationLogListResponse>('/option/getOption', { params });
};
