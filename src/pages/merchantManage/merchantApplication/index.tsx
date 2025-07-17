import { CRUDPageTemplate, TableActions } from '@/shared';
import { searchList, tableColumns, formList, type MerchantApplication } from './model';

// 初始化新增数据
const initCreate: Partial<MerchantApplication> = {
  merchantName: '',
  phone: undefined,
  payWay: '',
  money: 0,
  payDesc: '',
  type: '',
  remark: '',
  orderNo: '',
};

// 模拟数据
const mockData: MerchantApplication[] = [
  {
    id: 1,
    merchantName: '商家1',
    phone: '13800000000',
    payWay: '支付宝',
    money: 100,
    payDesc: '支付描述1',
    type: '真是支付',
    remark: '备注1',
    orderNo: '202301010001',
    status: '待处理',
    createdAt: '2023-01-01 00:00:00',
    updatedAt: '2023-01-01 00:00:00',
  },
  {
    id: 2,
    merchantName: '商家2',
    phone: '13800000001',
    payWay: '微信',
    money: 200,
    payDesc: '支付描述2',
    type: '手动录入',
    remark: '备注2',
    orderNo: '202301010002',
    status: '已处理',
    createdAt: '2023-01-02 00:00:00',
    updatedAt: '2023-01-02 00:00:00',
  },
  {
    id: 3,
    merchantName: '商家3',
    phone: '13800000002',
    payWay: '支付宝',
    money: 300,
    payDesc: '支付描述3',
    type: '真实支付',
    remark: '备注3',
    orderNo: '202301010003',
    status: '已拒绝',
    createdAt: '2023-01-03 00:00:00',
    updatedAt: '2023-01-03 00:00:00',
  },
];

const MerchantSortPage = () => {
  const optionRender = (
    record: MerchantApplication,
    actions: {
      handleEdit: (record: MerchantApplication) => void;
      handleDelete: (id: number) => void;
    },
  ) => <TableActions record={record} onEdit={actions.handleEdit} onDelete={actions.handleDelete} />;

  return (
    <CRUDPageTemplate
      title="商家分类"
      searchConfig={searchList()}
      columns={tableColumns.filter((col) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      mockData={mockData}
      optionRender={optionRender}
    />
  );
};

export default MerchantSortPage;
