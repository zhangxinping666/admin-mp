import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type School } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { getSchoolList } from '@/servers/school';

// 初始化新增数据
const initCreate: Partial<School> = {
  id: 0,
  school_id: 0,
  name: '',
  address: '',
  city_id: 1, // 默认城市ID
  school_logo: 0, // 默认logo
  status: 0, // 默认状态
};

const SchoolsPage = () => {
  // const [mockData, setMockData] = useState<School[]>([]);

  // useEffect(() => {
  //   const fetchSchoolList = async () => {
  //     try {
  //       const params = { page: 1, page_size: 10 };
  //       const res = await getSchoolList(params);
  //       console.log(res);
  //       if (res.data && res.data.list) {
  //         setMockData(res.data.list);
  //       }
  //     } catch (error) {
  //       console.error('获取学校列表失败:', error);
  //     } finally {
  //     }
  //   };
  //   fetchSchoolList();
  // }, []);

  const mockData: School[] = [
    {
      id: 1,
      school_id: 1,
      name: '北京大学',
      address: '北京市海淀区颐和园路5号',
      city_id: 101,
      school_logo: 1,
      status: 1,
    },
    {
      id: 2,
      school_id: 2,
      name: '复旦大学',
      address: '上海市杨浦区邯郸路220号',
      city_id: 102,
      school_logo: 2,
      status: 1,
    },
    {
      id: 3,
      school_id: 3,
      name: '清华大学',
      address: '上海市浦东新区浦东南路1000号',
      city_id: 103,
      school_logo: 3,
      status: 1,
    },
  ];
  // 操作列渲染
  const optionRender = (
    record: School,
    actions: {
      handleEdit: (record: School) => void;
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

export default SchoolsPage;
