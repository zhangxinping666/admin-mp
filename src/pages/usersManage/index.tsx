import { searchList, tableColumns, formList, type User } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { getUserList, updateUser, deleteUser } from '@/servers/user';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
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
  const { permissions } = useUserStore();

  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  // 编辑时的数据转换
  const handleEditOpen = (record: User) => {
    // 将 avatar 字段映射到 image 字段，因为表单期望的是 image 字段
    return {
      ...record,
      image: record.avatar,
    };
  };

  // 操作列渲染
  const optionRender = (
    record: User,
    actions: {
      handleEdit: (record: User) => void;
      handleDelete: (id: number) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:user:update');
    const canDelete = hasPermission('mp:user:delete');

    return (
      <TableActions
        record={record}
        onEdit={actions.handleEdit}
        onDelete={actions.handleDelete}
        disableEdit={!canEdit}
        disableDelete={!canDelete}
      />
    );
  };

  return (
    <CRUDPageTemplate
      title="用户管理"
      searchConfig={searchList()}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      onEditOpen={handleEditOpen}
      isAddOpen={true}
      disableCreate={true}
      disableBatchDelete={!hasPermission('mp:user:delete')}
      apis={{
        fetchApi: userApis.fetch,
        updateApi: (id: number, data: any) => {
          // 正确的做法：将 id 和表单数据 data 合并成一个完整的对象
          // 然后再调用您的 userApis.update 函数
          return userApis.update({ ...data, id });
        },
        deleteApi: (id: number[]) => userApis.delete(id),
      }}
      optionRender={optionRender}
    />
  );
};

export default ColleaguesPage;
