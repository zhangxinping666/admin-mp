import { CRUDPageTemplate, TableActions } from '@/shared';
import { searchList, tableColumns, formList, type MerchantSort, addFormList } from './model';
import { Key } from 'react';
import {
  createMerchantSort,
  updateMerchantSort,
  deleteMerchantSort,
  getMerchantSortList,
} from './api';
import type { MerchantSortListRequest, MerchantSortListResponse } from './api';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import useGroupCitySchoolOptions from '@/shared/hooks/useGroupedCityOptions';

// 初始化新增数据
const initCreate: Partial<MerchantSort> = {
  name: '',
  icon: '',
  school_name: '',
  school_id: 0,
  city_name: '',
  city_id: 0,
  status: 1,
  drawback: 0,
};

// 获取分类列表
const fetchList = async (params?: MerchantSortListRequest) => {
  const res = await getMerchantSortList(params);
  console.log('获取分类列表:', res);
  return {
    data: res.data as MerchantSortListResponse[],
    total: res.data.length,
  };
};

const MerchantSortPage = () => {
  const { userInfo } = useUserStore();

  const { permissions } = useUserStore();

  const locationOptions = useGroupCitySchoolOptions();

  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  // 操作列渲染
  const optionRender = (
    record: MerchantSort,
    actions: {
      handleEdit: (record: MerchantSort) => void;
      handleDelete: (ids: Key[]) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:merchantSort:update');
    const canDelete = hasPermission('mp:merchantSort:delete');

    return (
      <TableActions
        record={record}
        onEdit={actions.handleEdit}
        onDelete={userInfo?.role_id === 2 ? actions.handleDelete : undefined}
        editText="编辑"
        deleteText="删除"
        disableEdit={!canEdit}
        disableDelete={!canDelete}
      />
    );
  };

  return (
    <CRUDPageTemplate
      isDelete={true}
      isAddOpen={userInfo?.role_id === 4}
      disableBatchUpdate={true}
      title="商家分类"
      searchConfig={searchList(locationOptions)}
      columns={tableColumns.filter((col) => col.dataIndex !== 'action')}
      formConfig={formList()}
      addFormConfig={addFormList()}
      initCreate={initCreate}
      disableCreate={!hasPermission('mp:merchantSort:add')}
      disableBatchDelete={!hasPermission('mp:merchantSort:delete')}
      optionRender={optionRender as any}
      apis={{
        createApi: createMerchantSort,
        updateApi: updateMerchantSort,
        deleteApi: deleteMerchantSort,
        fetchApi: fetchList,
      }}
    />
  );
};

export default MerchantSortPage;
