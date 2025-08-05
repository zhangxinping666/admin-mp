import { CRUDPageTemplate, TableActions } from '@/shared/components';
import { getBalanceApplication, updateBalanceApplication } from './apis';
import { formList, tableColumns, searchList, type BalanceApplication } from './model';
import { Key } from 'react';

const BalanceApplication = () => {
  const useStore = useUserStore();
  const userInfo = useStore?.userInfo;
  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, useStore?.permissions);
  };
  // 标准化修改记录
  const normalizeEditRecord = (record: BalanceApplication) => {
    return {
      ...record,
      reviewer_id: userInfo?.id,
      reviewer: userInfo?.name,
    };
  };
  // 操作列渲染
  const optionRender = (
    record: BalanceApplication,
    actions: {
      handleEdit: (record: BalanceApplication) => void;
      handleDelete: (id: Key[]) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:merchantApl:update');
    const canDelete = hasPermission('mp:merchantApl:delete');

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
      title="余额申请"
      searchConfig={searchList()}
      columns={tableColumns.filter((col) => col.dataIndex !== 'actions')}
      isAddOpen={false}
      isDelete={false}
      onEditOpen={(record) => {
        const normalizedRecord = normalizeEditRecord(record);
        return normalizedRecord;
      }}
      initCreate={{}}
      formConfig={formList}
      optionRender={optionRender}
      apis={{
        fetchApi: getBalanceApplication,
        updateApi: updateBalanceApplication,
      }}
    />
  );
};

export default BalanceApplication;
