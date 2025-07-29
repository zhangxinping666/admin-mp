import { CRUDPageTemplate, TableActions } from '@/shared';
import { searchList, tableColumns, formList, type Merchant } from './model';
import * as apis from './apis';
import { Key } from 'react';

// 初始化新增数据
const initCreate: Partial<Merchant> = {
  merchant_name: '',
  merchant_img: [],
  school_id: 0,
  city_id: 0,
  city_name: '',
  status: 1,
  type: '校内',
  address: '',
  longitude: 0,
  latitude: 0,
  is_dorm_store: 0,
  category_id: 0,
  store_recommend: 0,
};

const MerchantsPage = () => {
  const optionRender = (
    record: Merchant,
    actions: {
      handleEdit: (record: Merchant) => void;
      handleDelete: (id: Key[]) => void;
    },
  ) => <TableActions record={record} onEdit={actions.handleEdit} onDelete={actions.handleDelete} />;

  // 定义API调用函数
  const fetchApi = async (params?: any) => {
    const response = await apis.getMerchantsList(params);
    return {
      items: response.data.list,
      total: response.data.total,
    };
  };

  const updateApi = async (params: any) => {
    const response = await apis.modifyMerchantsList(params);
    return response.data;
  };

  const deleteApi = async (id: number | number[]) => {
    // 处理单个ID或多个ID的情况
    const ids = Array.isArray(id) ? id : [id];
    const response = await apis.deleteMerchantsList({ ids });
    return response;
  };

  return (
    <CRUDPageTemplate
      title="商家管理"
      searchConfig={searchList()}
      columns={tableColumns.filter((col) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      isAddOpen={false}
      apis={{
        fetchApi,
        updateApi,
        deleteApi,
      }}
      optionRender={optionRender}
    />
  );
};

export default MerchantsPage;
