import { CRUDPageTemplate } from '@/shared';
import { searchList, tableColumns, formList, type Balance } from './model';
import * as apis from './apis';
import { isNumber, isString } from 'lodash';
import { Modal, Table } from 'antd';

// 初始化新增数据
const initCreate: Partial<Balance> = {
  user_id: 1,
  category: '',
  amount: 0,
  transaction_no: '',
  order_no: '',
  transaction_type: '',
  transaction_type_name: '',
  opening_balance: 0,
  closing_balance: 0,
  created_at: '',
};

// 模拟数据
// const mockData: BalanceRecord[] = [
//   {
//     id: 1,
//     category: '商品销售',
//     amount: 129.5,
//     transactionNo: 'TX202405120001',
//     orderNo: 'ORD202405120001',
//     transactionType: 'income',
//     voucherUrl: [
//       {
//         uid: '1',
//         name: '商品销售凭证',
//         status: 'done',
//         url: 'https://ts4.tc.mm.bing.net/th/id/OIP-C.CFev6LAEXxvcqAH9BkJvMwHaNK?rs=1&pid=ImgDetMain&o=7&rm=3',
//       },
//     ],
//     status: 'success',
//     initialBalance: 5000.0,
//     finalBalance: 5129.5,
//     imageUrl: [
//       {
//         uid: '1',
//         name: '商品销售凭证',
//         status: 'done',
//         url: 'https://ts4.tc.mm.bing.net/th/id/OIP-C.CFev6LAEXxvcqAH9BkJvMwHaNK?rs=1&pid=ImgDetMain&o=7&rm=3',
//       },
//     ],
//     createdAt: '2024-05-12 10:30:00',
//   },
//   {
//     id: 2,
//     category: '退款',
//     amount: 59.9,
//     transactionNo: 'TX202405120002',
//     orderNo: 'ORD202405110045',
//     transactionType: 'expense',
//     voucherUrl: [
//       {
//         uid: '1',
//         name: '退款凭证',
//         status: 'done',
//         url: 'https://ts4.tc.mm.bing.net/th/id/OIP-C.CFev6LAEXxvcqAH9BkJvMwHaNK?rs=1&pid=ImgDetMain&o=7&rm=3',
//       },
//     ],
//     status: 'success',
//     initialBalance: 5129.5,
//     finalBalance: 5069.6,
//     imageUrl: [
//       {
//         uid: '1',
//         name: '退款凭证',
//         status: 'done',
//         url: 'https://ts4.tc.mm.bing.net/th/id/OIP-C.CFev6LAEXxvcqAH9BkJvMwHaNK?rs=1&pid=ImgDetMain&o=7&rm=3',
//       },
//     ],
//     createdAt: '2024-05-12 11:15:00',
//   },
//   {
//     id: 3,
//     category: '会员充值',
//     amount: 200.0,
//     transactionNo: 'TX202405120003',
//     orderNo: 'ORD202405120002',
//     transactionType: 'income',
//     voucherUrl: [
//       {
//         uid: '1',
//         name: '会员充值凭证',
//         status: 'done',
//         url: 'https://ts4.tc.mm.bing.net/th/id/OIP-C.CFev6LAEXxvcqAH9BkJvMwHaNK?rs=1&pid=ImgDetMain&o=7&rm=3',
//       },
//     ],
//     status: 'processing',
//     initialBalance: 5069.6,
//     finalBalance: 5269.6,
//     imageUrl: [
//       {
//         uid: '1',
//         name: '会员充值凭证',
//         status: 'done',
//         url: 'https://ts4.tc.mm.bing.net/th/id/OIP-C.CFev6LAEXxvcqAH9BkJvMwHaNK?rs=1&pid=ImgDetMain&o=7&rm=3',
//       },
//     ],
//     createdAt: '2024-05-12 14:20:00',
//   },
// ];
// 获取数据
const getBalanceInfo = async (params?: any) => {
  const res = await apis.getBalanceInfo(params);
  return res;
};

// 余额明细管理
const BalanceRecordsPage = () => {
  // const optionRender = (
  //   record: BalanceRecord,
  //   actions: {
  //     handleEdit: (record: BalanceRecord) => void;
  //     handleDelete: (id: Key[]) => void;
  //   },
  // ) => <TableActions record={record} onEdit={actions.handleEdit} onDelete={actions.handleDelete} />;
  const [visible, setVisible] = useState(false);
  const [detailData, setDetailData] = useState<any[]>([]);

  return (
    <>
      <CRUDPageTemplate
        isAddOpen={false}
        isDelete={false}
        disableBatchUpdate={true}
        disableBatchDelete={true}
        title="余额明细管理"
        searchConfig={searchList()}
        columns={tableColumns.filter((col) => col.dataIndex !== 'action')}
        formConfig={formList()}
        initCreate={initCreate}
        onRow={(record: any) => {
          return {
            onClick: (event: any) => {
              event.stopPropagation();
              apis.getBalanceDetailInfo({ user_id: record.user_id }).then((res) => {
                setDetailData(res.data || []);
                setVisible(true);
              });
            },
          };
        }}
        // mockData={mockData}
        // optionRender={optionRender}
        apis={{
          fetchApi: getBalanceInfo,
        }}
      />
      <Modal
        title="用户余额明细"
        open={visible}
        width={800}
        onCancel={() => setVisible(false)}
        footer={null}
      >
        <Table
          columns={tableColumns.filter((col) => col.dataIndex !== 'action')}
          dataSource={detailData}
          rowKey="id"
          pagination={false}
          locale={{
            emptyText: (
              <div style={{ padding: '16px 0', textAlign: 'center' }}>
                <span>暂无数据</span>
              </div>
            ),
          }}
        />
      </Modal>
    </>
  );
};

export default BalanceRecordsPage;
