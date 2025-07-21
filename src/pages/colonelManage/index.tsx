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
  password: 0,
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
      name: '张三',
      phone: 13812345678,
      password: 123456,
      city_id: 1,
      status: 0,
    },
    {
      id: 2,
      name: '张三',
      phone: 13812345678,
      password: 123456,
      city_id: 1,
      status: 0,
    },
    {
      id: 3,
      name: '张三',
      phone: 13812345678,
      password: 123456,
      city_id: 1,
      status: 0,
    },
    {
      id: 4,
      name: '张三',
      phone: 13812345678,
      password: 123456,
      city_id: 1,
      status: 0,
    },
    {
      id: 5,
      name: '张三',
      phone: 13812345678,
      password: 123456,
      city_id: 1,
      status: 0,
    },
    {
      id: 6,
      name: '张三',
      phone: 13812345678,
      password: 123456,
      city_id: 1,
      status: 0,
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
