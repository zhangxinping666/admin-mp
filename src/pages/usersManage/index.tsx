import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type User } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { getUserList } from '@/servers/user';

// 初始化新增数据
const initCreate: Partial<User> = {
  id: 0,
  image: '',
  nickname: '',
  phone: '',
  last_time: 0,
  status: 0, // 默认状态
};

const UsersPage = () => {
  const [mockData, setMockData] = useState<User[]>([]);

  useEffect(() => {
    const fetchUserList = async () => {
      try {
        const params = { page: 1, page_size: 10 };
        const res = await getUserList(params);
        console.log(res);
        if (res.data && res.data.list) {
          setMockData(res.data.list);
        }
      } catch (error) {
        console.error('获取学校列表失败:', error);
      } finally {
      }
    };
    fetchUserList();
  }, []);

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
      title="学校管理"
      searchConfig={searchList()}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      mockData={mockData}
      optionRender={optionRender}
    />
  );
};

export default UsersPage;
