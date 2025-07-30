import request from '@/utils/request';

const apis = {
  list: '/merchant_manage/list',
  delete: '/merchant_manage/delete',
  put: '/merchant_manage/modify',
};

// 商家列表
export interface MerchantsListRequest {
  /**
   * 城市ID
   */
  city_id?: string;
  /**
   * 0-不是 1-是
   */
  is_dormitory_store?: string;
  /**
   * 商家名称
   */
  merchant_name?: string;
  /**
   * 页码
   */
  page?: string;
  /**
   * 每页数量
   */
  page_size?: string;
  /**
   * 学校ID
   */
  school_id?: string;
  /**
   * 店铺的状态
   */
  status?: string;
  /**
   * 商家分类
   */
  store_category?: string;
  /**
   * 店铺名称
   */
  store_name?: string;
  /**
   * 0-校内  1-校外
   */
  store_type?: string;
  [property: string]: any;
}
// 商家列表响应
export interface MerchantsListResponse {
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
  category?: number;
  city_id?: number;
  closed_hour?: string;
  id?: number;
  is_dormitory_store?: boolean;
  latitude?: number;
  longitude?: number;
  merchant?: string;
  merchant_id?: number;
  merchant_name?: string;
  open_hour?: string;
  phone?: string;
  recommend?: number;
  school_id?: number;
  site?: string;
  status?: number;
  store_name?: string;
  type?: string;
  [property: string]: any;
}

// 删除商家列表请求接口
/**
 * DeleteMerchantReq
 */
export interface DeleteMerchantReq {
  /**
   * 要删除的商户ID列表
   */
  ids: number[];
  [property: string]: any;
}

// 删除商家列表响应接口
export interface DeleteMerchantResponse {
  code: number;
  data: null;
  messages: string;
  [property: string]: any;
}

// 更新商家列表请求接口
/**
 * ModifyMerchantReq
 */
export interface ModifyMerchantReq {
  /**
   * 分类ID
   */
  category: number;
  /**
   * 营业结束时间
   */
  closed_hour: string;
  /**
   * 商户ID
   */
  id: number;
  /**
   * 是否为宿舍商铺（0-不是，1-是）
   */
  is_dormitory_store: number;
  /**
   * 纬度
   */
  latitude: number;
  /**
   * 经度
   */
  longitude: number;
  /**
   * 营业开始时间
   */
  open_hour: string;
  /**
   * 联系电话
   */
  phone: string;
  /**
   * 是否推荐（0-不推荐，1-推荐）
   */
  recommend: number;
  /**
   * 地址
   */
  site: string;
  /**
   * 状态
   */
  status: number;
  /**
   * 店铺名
   */
  store_name: string;
  /**
   * 校内/校外
   */
  type: string;
  [property: string]: any;
}
// 更新商家列表响应接口
export interface ModifyMerchantResponse {
  code: number;
  data: null;
  messages: string;
  [property: string]: any;
}

// 获取商家列表
export function getMerchantsList(params: MerchantsListRequest) {
  return request.get<MerchantsListResponse>(apis.list, { params });
}

// 删除商家列表
export function deleteMerchantsList(params: DeleteMerchantReq) {
  return request.delete<DeleteMerchantResponse>(apis.delete, { params });
}

// 更新商家列表
export function modifyMerchantsList(params: ModifyMerchantReq) {
  return request.put<ModifyMerchantResponse>(apis.put, params);
}
