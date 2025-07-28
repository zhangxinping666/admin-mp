import { searchList, tableColumns, formList, type User } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { getUserList, updateUser, deleteUser } from '@/servers/user';
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
const userApis = {
  fetch: getUserList,
  update: updateUser,
  delete: deleteUser,
};

const ColleaguesPage = () => {
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
      title="用户管理"
      searchConfig={searchList()}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      hideCreate={true}
      apis={{
        fetch: userApis.fetch,
        update: (data: any) => userApis.update(data),
        delete: (id: number) => userApis.delete([id]),
      }}
      optionRender={optionRender}
    />
  );
};

export default ColleaguesPage;
