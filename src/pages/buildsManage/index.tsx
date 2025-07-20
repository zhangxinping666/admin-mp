import { searchList, tableColumns, formList, type Building } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';

// 初始化新增数据
const initCreate: Partial<Building> = {
  name: '',
  floorCount: 1, // 默认1层
  longitude: 0, // 默认经度
  latitude: 0, // 默认纬度
};

// 模拟数据
const mockData: Building[] = [
  {
    id: 1,
    name: '1号宿舍楼',
    floorCount: 12,
    longitude: 116.326204,
    latitude: 40.003304,
    createdAt: '2024-01-15 09:30:00',
  },
  {
    id: 2,
    name: '2号教学楼',
    floorCount: 5,
    longitude: 116.310003,
    latitude: 39.992806,
    createdAt: '2024-01-20 14:20:00',
  },
  {
    id: 3,
    name: '行政办公楼',
    floorCount: 8,
    longitude: 116.338567,
    latitude: 40.006789,
    createdAt: '2024-02-05 10:15:00',
  },
];

const BuildingsPage = () => {
  // 操作列渲染
  const optionRender = (
    record: Building,
    actions: {
      handleEdit: (record: Building) => void;
      handleDelete: (id: number) => void;
    },
  ) => <TableActions record={record} onEdit={actions.handleEdit} onDelete={actions.handleDelete} />;

  return (
    <CRUDPageTemplate
      title="楼栋楼层管理"
      searchConfig={searchList()}
      columns={tableColumns.filter((col:any) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      mockData={mockData}
      optionRender={optionRender}
    />
  );
};

export default BuildingsPage;
