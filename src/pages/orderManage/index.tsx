import { Space, Button } from 'antd';
import { CRUDPageTemplate } from '@/shared';
import { searchList, tableColumns, useLocationOptions } from './model';
import { getOrderList } from '@/servers/order';
import type { OrderListData, OrderItem } from './model';
import type { FieldConfig } from '@/shared/components/DetailModal';

// 将后端返回的订单条目补齐为模板要求的 { id: number }
type OrderRow = OrderItem & { id: number };

// 详情弹窗字段配置（精简版）
const orderDetailConfig: FieldConfig[] = [
  { label: '订单明细编号', key: 'order_item_no' },
  { label: '订单编号', key: 'order_id' },
  { label: '商品名称', key: 'product_name' },
  { label: '规格', key: 'sku_description' },
  { label: '数量', key: 'quantity' },
  { label: '单价', key: 'price' },
  { label: '总额', key: 'total' },
  { label: '应付金额', key: 'payable_amount' },
  { label: '退款金额', key: 'refund_amount' },
  { label: '金豆抵扣', key: 'gold_bean_amount' },
  { label: '商品图片', key: 'product_image_url', isImage: true },
  { label: '明细状态', key: 'item_status_text' },
  { label: '店铺名称', key: 'store_name' },
  { label: '用户ID', key: 'user_id' },
  { label: '用户名', key: 'username' },
  { label: '手机号', key: 'phone' },
  { label: '创建时间', key: 'created_at' },
  { label: '支付时间', key: 'paid_at' },
  { label: '核销时间', key: 'verified_at' },
  { label: '完成时间', key: 'completed_at' },
  { label: '取消时间', key: 'cancelled_at' },
  { label: '过期时间', key: 'expired_at' },
];

export default function OrderManage() {
  const locationOptions = useLocationOptions();

  // 列表获取 API 封装（映射 id 字段以适配模板）
  const fetchApi = async (params: any) => {
    const res = await getOrderList(params);
    const data = res?.data as unknown as OrderListData;
    const list = (data?.list || []).map((item: OrderItem) => ({
      ...item,
      id: (item as any).item_id ?? (item as any).id ?? 0,
    })) as OrderRow[];

    return {
      data: {
        list,
        total: data?.total || 0,
        page: data?.page || params.page || 1,
        page_size: data?.page_size || params.page_size || 10,
      },
    };
  };

  // 操作列渲染：仅提供“查看详情”
  const optionRender = (record: OrderRow, actions: { handleDetail: (record: OrderRow) => void }) => (
    <Space size={12}>
      <Button type="primary" size="small" onClick={() => actions.handleDetail(record)}>
        查看详情
      </Button>
    </Space>
  );

  return (
    <CRUDPageTemplate<OrderRow>
      title="订单管理"
      isDelete={false}
      isAddOpen={false}
      disableCreate={true}
      disableBatchDelete={true}
      disableBatchUpdate={true}
      searchConfig={searchList(locationOptions)}
      columns={tableColumns}
      addFormConfig={[]}
      formConfig={[]}
      initCreate={{}}
      apis={{ fetchApi }}
      optionRender={optionRender}
      detailConfig={orderDetailConfig}
      showNavigation={true}
    />
  );
}
