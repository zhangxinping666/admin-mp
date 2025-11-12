import request from '@/utils/request';
import { OrderListReq, OrderListRes } from '@/pages/orderManage/model';

// 订单管理——获取订单列表
export const getOrderList = (params: OrderListReq) => {
  return request.get<OrderListRes>('/order/back/list', { params });
};
