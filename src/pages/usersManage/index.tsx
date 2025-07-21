import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type User } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { getUserList } from '@/servers/user';

// 初始化新增数据
const initCreate: Partial<User> = {
  id: 0,
  image: [],
  nickname: '',
  phone: '',
  last_time: 0,
  status: 0, // 默认状态
};

const UsersPage = () => {
  // const [mockData, setMockData] = useState<User[]>([]);

  // useEffect(() => {
  //   const fetchUserList = async () => {
  //     try {
  //       const params = { page: 1, page_size: 10 };
  //       const res = await getUserList(params);
  //       console.log(res);
  //       if (res.data && res.data.list) {
  //         setMockData(res.data.list);
  //       }
  //     } catch (error) {
  //       console.error('获取学校列表失败:', error);
  //     } finally {
  //     }
  //   };
  //   fetchUserList();
  // }, []);
  const mockData: User[] = [
    {
      id: 1,
      image: [
        {
          uid: '1',
          name: 'image.jpg',
          status: 'done',
          url: 'https://iforum-cn2.c.hihonor.com/cn/cn_data/images/13001/2024/10/22/5d8febde-ccd4-4139-9c6a-d0c3e1ceb3fe.jpg?imageId=224293',
        },
      ],
      nickname: '小猪',
      phone: '12345678901',
      last_time: 1620000000,
      status: 1,
    },
    {
      id: 2,
      image: [
        {
          uid: '2',
          name: 'image2.jpg',
          status: 'done',
          url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVH_JOsIhaZ4OfgvlGa5XfxjYZOoQn2R8L_mg7N8r3jOWdJn-s8qNq4reDFmay6LQXyfc&usqp=CAU',
        },
      ],
      nickname: '蜡笔小新',
      phone: '98765432109',
      last_time: 1610000000,
      status: 0,
    },
    {
      id: 3,
      image: [
        {
          uid: '3',
          name: 'image3.jpg',
          status: 'done',
          url: 'https://img.k2r2.com/uploads/frombd/0/253/1914224175/2162742093.jpg',
        },
      ],
      nickname: '恐龙',
      phone: '11122233344',
      last_time: 1600000000,
      status: 1,
    },
    {
      id: 4,
      image: [
        {
          uid: '4',
          name: 'image4.jpg',
          status: 'done',
          url: 'https://p8.itc.cn/q_70/images03/20211128/94fd8ac2abfe4e8d861b3b9addc9f05b.jpeg',
        },
      ],
      nickname: '略略略',
      phone: '55566677788',
      last_time: 1590000000,
      status: 0,
    },
    {
      id: 5,
      image: [
        {
          uid: '5',
          name: 'image5.jpg',
          status: 'done',
          url: 'https://gw.alicdn.com/imgextra/i1/710600684/O1CN01OwjnvQ1GvJkcNOcpb_!!710600684.jpg_Q75.jpg_.webp',
        },
      ],
      nickname: '糖果',
      phone: '12345678901',
      last_time: 1580000000,
      status: 1,
    },
    {
      id: 6,
      image: [
        {
          uid: '6',
          name: 'image6.jpg',
          status: 'done',
          url: 'https://img.k2r2.com/uploads/frombd/2/253/1039936113/421874040.jpg',
        },
      ],
      nickname: '兔子',
      phone: '12345678901',
      last_time: 1580000000,
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
