import request from '@/utils/request';

const apis = {
  list: '/approval/getApproval',
  delete: '/approval/batchDelete',
  update: '/approval/batchUpdate',
  create: '/approval/addApproval',
};

// 获取列表请求查询参数接口
export interface GetListQueryParams {
  /**
   * 店铺名称
   */
  name?: string;
  page?: number;
  page_size?: number;
  /**
   * 手机号
   */
  phone?: string;
  /**
   * 状态:0待审批 ，1 通过，2未通过
   */
  status?: string;
  [property: string]: any;
}

// 获取列表请求接口
export interface GetListRequest {
  /**
   * 店铺名称
   */
  name?: string;
  page?: number;
  page_size?: number;
  /**
   * 手机号
   */
  phone?: string;
  /**
   * 状态:0待审批 ，1 通过，2未通过
   */
  status?: number;
  [property: string]: any;
}

// 获取列表的响应接口
export interface GetListResponse {
  code: number;
  data: Data;
  [property: string]: any;
}

export interface Data {
  list: List[];
  page: number;
  page_size: number;
  pages: number;
  total: number;
  [property: string]: any;
}

export interface List {
  address?: string;
  amount?: number;
  apply_status?: number;
  category_id?: number;
  close_hour?: string;
  fee_description?: string;
  image_path?: string[];
  merchant_id?: number;
  merchant_type?: string;
  name?: string;
  open_hour?: string;
  order_number?: string;
  pay_channel?: string;
  pay_status?: number;
  phone?: string;
  remark_image_path?: string;
  type?: string;
  [property: string]: any;
}
// 删除商家请求接口
export interface DeleteRequest {
  /**
   * 删除商家id
   */
  ids: number[];
  [property: string]: any;
}
// 删除商家响应接口
export interface DeleteResponse {
  code: number;
  data: null;
  messages: string;
  [property: string]: any;
}
// 更新商家请求接口
export interface UpdateRequest {
  /**
   * 状态:0待审批 ，1 通过，2未通过
   */
  apply_status: number;
  /**
   * 更新商家id
   */
  ids: number[];
  [property: string]: any;
}
// 更新商家响应接口
export interface UpdateResponse {
  code: number;
  data: null;
  messages: string;
  [property: string]: any;
}
// 创建商家请求接口
export interface CreateRequest {
  /**
   * 地址
   */
  address: string;
  /**
   * 金额
   */
  amount: number;
  /**
   * 店铺类别
   */
  category: string;
  /**
   * 关闭时间
   */
  close_hour: string;
  /**
   * 费用说明
   */
  fee_description: string;
  /**
   * 是否宿舍店
   */
  is_dorm_store: boolean;
  /**
   * 纬度
   */
  latitude: number;
  /**
   * 经度
   */
  longitude: number;
  /**
   * 店铺图片
   */
  merchant_image: string[];
  /**
   * 商家类型（校内/校外）
   */
  merchant_type: string;
  /**
   * 店铺名称
   */
  name: string;
  /**
   * 开业时间
   */
  open_hour: string;
  /**
   * 订单号
   */
  order_number: string;
  /**
   * 支付渠道
   */
  pay_channel: string;
  /**
   * 支付状态
   */
  pay_status: number;
  /**
   * 支付类型
   */
  pay_type: string;
  /**
   * 手机号
   */
  phone: string;
  /**
   * 支付图像
   */
  remark_image: string;
  /**
   * 营业状态
   */
  status: number;
  /**
   * 审批状态
   */
  story_apply_status: number;
  /**
   * userID
   */
  user_id: number;
  [property: string]: any;
}
// 创建商家响应接口
export interface CreateResponse {
  code: number;
  data: null;
  messages: string;
  [property: string]: any;
}

// 获取审批列表
export function getApplicationList(params?: GetListQueryParams) {
  return request.get<GetListResponse>(apis.list, { params });
}

// 删除审批
export function deleteApplication(params: DeleteRequest) {
  return request.post<DeleteResponse>(apis.delete, params);
}

// 更新审批
export function updateApplication(params: UpdateRequest) {
  return request.post<UpdateResponse>(apis.update, params);
}
// 创建审批
export function createApplication(params: CreateRequest) {
  return request.post<CreateResponse>(apis.create, params);
}
