import request from '@/utils/request';

// 接口
const api = {
  list: '/store_category_manage/query',
  create: '/store_category_manage/create',
  update: '/store_category_manage/update',
  delete: '/store_category_manage/delete',
};

// 商家请求接口
export interface MerchantSortListRequest {
  name?: string;
  status?: number;
}

// 商家响应接口
export interface MerchantSortListResponse {
  id: number;
  name: string;
  icon: string;
  school_name: string;
  school_id: number;
  city_name: string;
  city_id: number;
  status: number;
  drawback: number;
}
// 创建商家请求接口
export interface CreateMerchantSortRequest {
  /**
   * 退款比例
   */
  drawback: number;
  /**
   * 类别的图标URL
   */
  icon: string;
  /**
   * 类别名称
   */
  name: string;
  /**
   * 类别的状态
   */
  status: number;
}
// 创建商家响应接口
export interface CreateMerchantSortResponse {
  code: number;
  data: null;
  messages: string;
  [property: string]: any;
}
// 更新商家请求接口
export interface UpdateMerchantSortRequest {
  /**
   * 退款比例
   */
  drawback: number;
  /**
   * 类别的图标URL
   */
  icon: string;
  /**
   * 类别的ID
   */
  id: number;
  /**
   * 类别名称
   */
  name: string;
  /**
   * 类别的状态
   */
  status: number;
}
// 更新商家响应接口
export interface UpdateMerchantSortResponse {
  code: number;
  data: null;
  messages: string;
  [property: string]: any;
}
// 删除商家请求接口
export interface DeleteMerchantSortRequest {
  /**
   * 要删除的类别的ID列表
   */
  ids: number[];
}
// 删除商家响应接口
export interface DeleteMerchantSortResponse {
  code: number;
  data: null;
  messages: string;
  [property: string]: any;
}

// 请求获取商家分类
export function getMerchantSortList(params?: MerchantSortListRequest) {
  return request.get<MerchantSortListResponse[]>(api.list, { params });
}

// 请求创建商家分类
export function createMerchantSort(data: CreateMerchantSortRequest) {
  return request.post<CreateMerchantSortResponse>(api.create, data);
}

// 请求更新商家分类
export function updateMerchantSort(data: UpdateMerchantSortRequest) {
  return request.put<UpdateMerchantSortResponse>(api.update, data);
}
// 请求删除商家分类
export function deleteMerchantSort(data: DeleteMerchantSortRequest) {
  return request.delete<DeleteMerchantSortResponse>(api.delete, {
    data: {
      ids: data,
    },
  });
}
