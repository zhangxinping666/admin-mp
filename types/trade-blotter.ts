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
  page: number;
  page_size: number;
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
  // data: FlowListData;
}
