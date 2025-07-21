import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type City } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
// import { getCityList } from '@/servers/city';

// 初始化新增数据
const initCreate: Partial<City> = {
  id: 0,
  city_id: 0,
  name: '',
  phone: 0,
  password: '', // 默认密码
  status: 0, // 默认状态
};

const CitiesPage = () => {
  // const [mockData, setMockData] = useState<City[]>([]);

  // useEffect(() => {
  //   const fetchCityList = async () => {
  //     try {
  //       const params = { page: 1, page_size: 10 };
  //       const res = await getCityList(params);
  //       console.log(res);
  //       if (res.data && res.data.list) {
  //         setMockData(res.data.list);
  //       }
  //     } catch (error) {
  //       console.error('获取学校列表失败:', error);
  //     } finally {
  //     }
  //   };
  //   fetchCityList();
  // }, []);
  // 操作列渲染
  const mockData: City[] = [
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
      status: 1,
    },
    {
      id: 3,
      name: '王强',
      phone: 18633334444,
      password: 'password789',
      city_id: 1,
      status: 0,
    },
    {
      id: 4,
      name: 'Jessica',
      phone: 13944445555,
      password: 'password-abc',
      city_id: 3,
      status: 1,
    },
    {
      id: 5,
      name: '陈浩',
      phone: 15855556666,
      password: 'password-def',
      city_id: 2,
      status: 1,
    },
    {
      id: 6,
      name: 'Michael',
      phone: 13466667777,
      password: 'password-ghi',
      city_id: 1,
      status: 0,
    },
  ];

  const optionRender = (
    record: City,
    actions: {
      handleEdit: (record: City) => void;
      handleDelete: (id: number) => void;
    },
  ) => <TableActions record={record} onEdit={actions.handleEdit} onDelete={actions.handleDelete} />;

  return (
    <CRUDPageTemplate
      title="城市管理"
      searchConfig={searchList()}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      mockData={mockData}
      optionRender={optionRender}
    />
  );
};

export default CitiesPage;
