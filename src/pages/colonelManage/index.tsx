import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type Colonel } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
// import { getColleaguesList } from '@/servers/colleagues';

// 初始化新增数据
const initCreate: Partial<Colonel> = {
  id: 0,
  name: '',
  phone: 0,
  password: '',
  city_id: 1, // 默认城市ID
  status: 0, // 默认状态
};

const ColleaguesPage = () => {
  // const [mockData, setMockData] = useState<Colonel[]>([]);

  // useEffect(() => {
  //   const fetchColleaguesList = async () => {
  //     try {
  //       const params = { page: 1, page_size: 10 };
  //       const res = await getColleaguesList(params);
  //       console.log(res);
  //       if (res.data && res.data.list) {
  //         setMockData(res.data.list);
  //       }
  //     } catch (error) {
  //       console.error('获取团长列表失败:', error);
  //     } finally {
  //     }
  //   };
  //   fetchColleaguesList();
  // }, []);
  const mockData: Colonel[] = [
    {
      id: 1,
      name: '张伟',
      phone: 13811112222,
      password: 'password123',
      city_id: 1,
      status: 1,
    },
    {
      id: 2,
      name: '李娜',
      phone: 15022223333,
      password: 'password456',
      city_id: 2,
      status: 0,
    },
    {
      id: 3,
      name: '王强',
      phone: 18633334444,
      password: 'password789',
      city_id: 1,
      status: 1,
    },
    {
      id: 4,
      name: '刘芳',
      phone: 13944445555,
      password: 'password_abc',
      city_id: 3,
      status: 1,
    },
    {
      id: 5,
      name: '陈浩',
      phone: 15855556666,
      password: 'password_def',
      city_id: 2,
      status: 0,
    },
    {
      id: 6,
      name: '赵敏',
      phone: 13466667777,
      password: 'password_ghi',
      city_id: 1,
      status: 1,
    },
  ];

  // 操作列渲染
  const optionRender = (
    record: Colonel,
    actions: {
      handleEdit: (record: Colonel) => void;
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
