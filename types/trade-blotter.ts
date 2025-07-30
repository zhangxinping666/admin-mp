// 查询条件公共参数（全部可选）
export interface FlowQueryParams {
  flow_no?: string;
  order_no?: string;
  user_id?: number;
  city?: string;
  school?: string;
  pay_type?: number;
  status?: number;
  category?: number;
  min_amount?: number;
  max_amount?: number;
  start_time?: string;
  end_time?: string;
}

// 分页查询参数（page, page_size 必填）
export interface FlowListParams extends FlowQueryParams {
  page?: number;
  page_size: number;
  cursor_id?: number;
  cursor_created_at?: string;
  direction?: 'next' | 'prev';
}

// 返回的单条记录（字段对应后端返回 JSON）
export interface FlowRecord {
  id: number;
  flow_no: string;
  third_flow_no: string;
  order_no: string;
  user_name?: string; // 如果后端有返回
  city: string;
  school: string;
  pay_type: number;
  status: number;
  category: number;
  amount: number;
  detail: string;
  create_time: string;
}
// 接口响应结构
export interface FlowListResponse {
  total: number;
  list: FlowRecord[];
  next_cursor?: number | null;
  next_created_at?: string | null;
  prev_cursor?: number | null;
  prev_created_at?: string | null;
  has_next?: boolean;
  has_prev?: boolean;
  // data: FlowListData;
}

// 通用API响应结构
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 导出任务响应数据
export interface ExportTaskData {
  task_id: number;
}

// 导出任务状态
export type ExportTaskStatus = 'pending' | 'processing' | 'success' | 'failed';

// 导出任务状态数据
export interface ExportTaskStatusData {
  status: ExportTaskStatus;
  file?: string;
  progress: number;
}
