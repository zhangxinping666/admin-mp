import { searchList, tableColumns, formList, type Cert } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { getCertList, updateCert, deleteCert } from '@/servers/cert';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';

// 初始化新增数据
const initCreate: Partial<Cert> = {
  id: 0,
  name: '',
  card_id: 0,
  front: [],
  back: [],
  status: 0, // 默认状态
};
const certApis = {
  fetch: getCertList,
  update: updateCert,
  delete: deleteCert,
};
const CertPage = () => {
  const { permissions } = useUserStore();

  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  const optionRender = (
    record: Cert,
    actions: {
      handleEdit: (record: Cert) => void;
      handleDelete: (id: number) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:cert:update');
    const canDelete = hasPermission('mp:cert:delete');

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
      title="实名认证"
      searchConfig={searchList()}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      optionRender={optionRender}
      isAddOpen={false}
      apis={{
        fetchApi: certApis.fetch,
        updateApi: (data: any) => {
          console.log('updateApi received data:', data);
          // 从useCRUD传来的数据格式是 { id: number, ...formValues }
          // 需要提取id和status字段
          const { id, status } = data;
          return certApis.update({ id, status });
        },
        deleteApi: (id: number[]) => certApis.delete(id),
      }}
      disableCreate={!hasPermission('mp:cert:add')}
      disableBatchDelete={!hasPermission('mp:cert:delete')}
    />
  );
};

export default CertPage;
