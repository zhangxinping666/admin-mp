// 查询条件参数
export interface OperationLogQueryParams {
  admin_name?: string; // 操作人名称
  request_method?: 'GET' | 'PUT' | 'POST' | 'DELETE'; // 请求方法
  start_time?: string;
  end_time?: string;
  status?: 1 | 2; // 1: 成功, 2: 失败
}

// 分页查询参数
export interface OperationLogListParams extends OperationLogQueryParams {
  page: number; // 当前页
  page_size: number; // 每页数量
}

// 返回的单条记录
export interface OperationLogRecord {
  id: number;
  admin_id: number;
  admin_name: string;
  request_method: string;
  request_url: string;
  request_params: string;
  response_data: string;
  status: number;
  created_at: string;
}

// 接口响应结构
export interface OperationLogListResponse {
  list: OperationLogRecord[];
  page: number;
  page_size: number;
  pages: number;
  total: number;
}
