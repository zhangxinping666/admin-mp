import { CRUDPageTemplate, TableActions } from '@/shared';
import { searchList, tableColumns, formList, type MerchantSort } from './model';

// 初始化新增数据
const initCreate: Partial<MerchantSort> = {
  merchantSortName: '',
  sortIcon: '',
  school: '',
  city: '',
  status: 1,
  commission: 0,
};

// 模拟数据
const mockData: MerchantSort[] = [
  {
    id: 1,
    merchantSortName: '餐饮美食',
    sortIcon: 'https://example.com/icon1.png',
    school: '清华大学',
    city: '北京',
    status: 1,
    commission: 5.5,
  },
  {
    id: 2,
    merchantSortName: '生活服务',
    sortIcon: 'https://example.com/icon2.png',
    school: '北京大学',
    city: '北京',
    status: 0,
    commission: 3.2,
  },
];

const MerchantSortPage = () => {
  const optionRender = (
    record: MerchantSort,
    actions: {
      handleEdit: (record: MerchantSort) => void;
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
