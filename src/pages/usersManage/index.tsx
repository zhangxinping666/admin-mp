import { searchList, tableColumns, formList, type User } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';

// 初始化新增数据
const initCreate: Partial<User> = {
  id: 0,
  avatar: '',
  nickname: '',
  phone: '',
  school: '',
  wechat: '',
  alipay: '',
  last_time: '',
  status: 0, // 默认状态
};

const ColleaguesPage = () => {
  const mockData: User[] = [
    {
      id: 8,
      avatar: '',
      nickname: '用户80240017622',
      phone: '15139079891',
      school: '',
      wechat: '123456',
      alipay: '56789',
      last_time: '2025-07-11T21:58:04.648+08:00',
      status: 1,
    },
    {
      id: 9,
      avatar: '',
      nickname: '用户80240017622',
      phone: '15139079891',
      school: '',
      wechat: '',
      alipay: '',
      last_time: '2025-07-11T21:58:04.648+08:00',
      status: 1,
    },
    {
      id: 10,
      avatar: '',
      nickname: '用户98520010711',
      phone: '15139079871',
      school: '河南科技学院',
      wechat: '',
      alipay: '',
      last_time: '2025-07-12T08:36:27.523+08:00',
      status: 1,
    },
    {
      id: 11,
      avatar: '',
      nickname: '用户46050076903',
      phone: '15139079870',
      school: '河南科技学院',
      wechat: '',
      alipay: '',
      last_time: '2025-07-12T08:38:14.741+08:00',
      status: 1,
    },
    {
      id: 12,
      avatar: '',
      nickname: '用户52000048128',
      phone: '15139079810',
      school: '河南科技学院',
      wechat: '',
      alipay: '',
      last_time: '2025-07-12T11:27:46.164+08:00',
      status: 1,
    },
    {
      id: 13,
      avatar: '',
      nickname: '用户46870014036',
      phone: '15139079816',
      school: '河南科技学院',
      wechat: '',
      alipay: '',
      last_time: '2025-07-12T14:18:31.996+08:00',
      status: 1,
    },
    {
      id: 14,
      avatar: '',
      nickname: '用户380060093',
      phone: '15139079817',
      school: '河南科技学院',
      wechat: '',
      alipay: '',
      last_time: '2025-07-12T14:24:47.547+08:00',
      status: 1,
    },
    {
      id: 22,
      avatar: '',
      nickname: '用户47900014034',
      phone: '13223737513',
      school: '河南科技学院',
      wechat: '',
      alipay: '',
      last_time: '2025-07-21T22:13:16.444+08:00',
      status: 1,
    },
  ];

  // 操作列渲染
  const optionRender = (
    record: User,
    actions: {
      handleEdit: (record: User) => void;
      handleDelete: (id: number) => void;
    },
  ) => <TableActions record={record} onEdit={actions.handleEdit} onDelete={actions.handleDelete} />;

  return (
    <CRUDPageTemplate
      title="团长管理"
      searchConfig={searchList()}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      mockData={mockData}
      optionRender={optionRender}
    />
  );
};

export default ColleaguesPage;
