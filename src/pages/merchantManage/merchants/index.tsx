import { CRUDPageTemplate, TableActions } from '@/shared';
import { searchList, tableColumns, formList, type Merchant } from './model';

// 初始化新增数据
const initCreate: Partial<Merchant> = {
  merchantName: '',
  merchantImg: [], // 初始化为空数组
  schoolId: 0,
  city: '',
  status: 1,
  type: '校内',
  address: '',
  longitude: 0,
  latitude: 0,
  isDormStore: false, // 保持布尔类型
  categoryId: 0,
  storeRecommend: 0,
};

// 模拟数据
const mockData: Merchant[] = [
  {
    id: 1,
    merchantName: '麦当劳(清华店)',
    merchantImg: [
      'https://ts4.tc.mm.bing.net/th/id/OIP-C.CFev6LAEXxvcqAH9BkJvMwHaNK?rs=1&pid=ImgDetMain&o=7&rm=3',
    ],
    schoolId: 1001,
    city: '北京',
    status: 1,
    type: '校内',
    address: '北京市海淀区清华大学紫荆公寓1层',
    longitude: 116.326204,
    latitude: 40.003304,
    isDormStore: true,
    categoryId: 1,
    storeRecommend: 1,
    createdAt: '2024-01-15 10:30:00',
    updatedAt: '2024-01-20 14:20:00',
  },
  {
    id: 2,
    merchantName: '星巴克(北大店)',
    merchantImg: [
      'https://ts4.tc.mm.bing.net/th/id/OIP-C.CFev6LAEXxvcqAH9BkJvMwHaNK?rs=1&pid=ImgDetMain&o=7&rm=3',
    ],
    schoolId: 1002,
    city: '北京',
    status: 1,
    type: '校内',
    address: '北京市海淀区北京大学学生活动中心',
    longitude: 116.310003,
    latitude: 39.992806,
    isDormStore: false,
    categoryId: 1,
    storeRecommend: 1,
    createdAt: '2024-01-10 09:15:00',
    updatedAt: '2024-01-18 16:45:00',
  },
  {
    id: 3,
    merchantName: '便民超市',
    merchantImg: [
      'https://ts4.tc.mm.bing.net/th/id/OIP-C.CFev6LAEXxvcqAH9BkJvMwHaNK?rs=1&pid=ImgDetMain&o=7&rm=3',
    ],
    schoolId: 1001,
    city: '北京',
    status: 0,
    type: '校外',
    address: '北京市海淀区五道口华清嘉园15号楼底商',
    longitude: 116.338567,
    latitude: 40.006789,
    isDormStore: false,
    categoryId: 2,
    storeRecommend: 0,
    createdAt: '2024-01-05 14:20:00',
    updatedAt: '2024-01-22 11:30:00',
  },
];

const MerchantsPage = () => {

  const optionRender = (
    record: Merchant,
    actions: {
      handleEdit: (record: Merchant) => void;
      handleDelete: (id: number) => void;
    },
  ) => <TableActions record={record} onEdit={actions.handleEdit} onDelete={actions.handleDelete} />;

  return (
    <CRUDPageTemplate
      title="商家管理"
      searchConfig={searchList()}
      columns={tableColumns.filter((col) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      mockData={mockData}
      optionRender={optionRender}
    />
  );
};

export default MerchantsPage;
