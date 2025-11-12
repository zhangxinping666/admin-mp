import { Space, Button } from 'antd';
import { CRUDPageTemplate } from '@/shared';
import { searchList, tableColumns, useLocationOptions, mockOrderList } from './model';
import { getOrderList } from '@/servers/order';
import type { OrderListData, OrderItem } from './model';
import {orderDetailConfig} from './model';

type OrderRow = OrderItem & { id: number };

export default function OrderManage() {
  const locationOptions = useLocationOptions();

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

  const optionRender = (
    record: OrderRow,
    actions: any
  ) => (
    <Space size={12}>
      <Button type="primary" size="small" onClick={() => actions?.handleDetail?.(record)}>
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
    />
  );
}
