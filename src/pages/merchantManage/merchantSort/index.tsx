import { CRUDPageTemplate, TableActions } from '@/shared';
import { searchList, tableColumns, formList, type MerchantSort } from './model';
import { Key } from 'react';
import {
  createMerchantSort,
  updateMerchantSort,
  deleteMerchantSort,
  getMerchantSortList,
} from './api';
import type { MerchantSortListRequest, MerchantSortListResponse } from './api';

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
  const optionRender = (
    record: MerchantSort,
    actions: {
      handleEdit: (record: MerchantSort) => void;
      handleDelete: (ids: Key[]) => void;
    },
  ) => <TableActions record={record} onEdit={actions.handleEdit} onDelete={actions.handleDelete} />;

  return (
    <CRUDPageTemplate
      isAddOpen={true}
      title="商家分类"
      searchConfig={searchList()}
      columns={tableColumns.filter((col) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      optionRender={optionRender}
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
