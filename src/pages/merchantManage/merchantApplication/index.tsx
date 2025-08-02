import { CRUDPageTemplate, TableActions } from '@/shared';
import { searchList, tableColumns, formList, type MerchantApplication } from './model';
import { Key } from 'react';
import * as apis from './apis';

// 初始化新增数据
const initCreate: Partial<MerchantApplication> = {
  id: 0,
  name: '',
  phone: '',
  merchant_type: '',
  amount: 0,
  fee_description: '',
  type: '',
  pay_channel: '',
  order_number: '',
  apply_status: 0,
  pay_status: 0,
};

// 获取数据
async function getApplicationList(params?: any) {
  try {
    const res = await apis.getApplicationList(params);
    // 正确处理返回的数据
    const items = res.data.list.map((item: any) => ({
      ...item,
      // id: item.merchant_id, // 将merchant_id映射为id
    }));
    console.log('items', items);
    return {
      data: items,
      total: res.data.total,
    };
  } catch (err) {
    console.log(err);
    return {
      data: [],
      total: 0,
    };
  }
}

const MerchantApplicationPage = () => {
  const optionRender = (
    record: MerchantApplication,
    actions: {
      handleEdit: (record: MerchantApplication) => void;
      handleDelete: (id: Key[]) => void;
    },
  ) => <TableActions record={record} onEdit={actions.handleEdit} onDelete={actions.handleDelete} />;

  return (
    <CRUDPageTemplate
      isAddOpen={false}
      isApplication={true}
      title="商家申请"
      searchConfig={searchList()}
      columns={tableColumns.filter((col) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      onEditOpen={(record) => {
        return {
          id: record.merchant_id,
          apply_status: record.apply_status,
        };
      }}
      apis={{
        fetchApi: getApplicationList,
        createApi: apis.createApplication,
        updateApi: (params: any) => {
          const idList = Array.isArray(params.id) ? params.id : [params.id];
          return apis.updateApplication({ ids: idList, apply_status: params.apply_status });
        },
        deleteApi: (params: any) => {
          const idList = Array.isArray(params) ? params : [params];
          console.log('idList', idList);
          return apis.deleteApplication({ ids: idList });
        },
      }}
      optionRender={optionRender}
    />
  );
};

export default MerchantApplicationPage;
