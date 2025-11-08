
import {
  ApiResponse,
  PointsHistoryData
} from '../../pages/usersManage/model';
import request from '@/utils/request';
// 获取学校列表
export function getPointDetailList(
  userId: string | number,
  params: any
) {
  const url = `/api/admin/points/users/${userId}/details`;
  return request.get<ApiResponse<PointsHistoryData>>(url, {
    params,
  });
}

// 响应数据
// {
//     "code": 2000,
//     "message": "success",
//     "data": {
//         "list": [
//             {
//                 "id": 50001,
//                 "detail_no": "PTS-EARN-20251021-000001",
//                 "business_type": "purchase_rebate",类型: purchase_rebate/activity
//                 "operation": "earn", earn/spend
//                 "points_change": 997,变动金豆数（正数=获得，负数=消费）
//                 "points_before": 1000,变动前金豆数
//                 "points_after": 1997,变动后金豆数
//                 "related_order_id": "ORD-20251021-123456", 关联订单号
//                 "expire_date": "2026-10-21T00:00:00Z",过期时间（可能为空）
//                 "status": 2,
//                 "status_text": "已到账",状态：1=待处理，2=处理中，3=已到账，4=异常
//                 "remark": "购买返利",
//                 "created_at": "2025-10-21T10:30:00Z"
//             },
//             {
//                 "id": 50002,
//                 "detail_no": "PTS-SPEND-20251021-000001",
//                 "business_type": "order_deduction",
//                 "operation": "spend",
//                 "points_change": -200,
//                 "points_before": 1997,
//                 "points_after": 1797,
//                 "related_order_id": "ORD-20251021-999999",
//                 "expire_date": null,
//                 "status": 2,
//                 "status_text": "已到账",
//                 "remark": "订单抵扣",
//                 "created_at": "2025-10-21T14:20:00Z"
//             }
//         ],
//         "total": 50,
//         "page": 1,
//         "page_size": 20
//     }
// }