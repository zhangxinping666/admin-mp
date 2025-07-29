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
async function getApplicationList() {
  try {
    const res = await apis.getApplicationList();
    // 正确处理返回的数据
    const items = res.data.list.map((item: any) => ({
      ...item,
      id: item.merchant_id, // 将merchant_id映射为id
    }));
    console.log('items', items);
    return {
      items: items,
      total: res.data.total,
    };
  } catch (err) {
    console.log(err);
    return {
      items: [],
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
      title="商家申请"
      searchConfig={searchList()}
      columns={tableColumns.filter((col) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      apis={{
        fetchApi: getApplicationList,
        createApi: apis.createApplication,
        updateApi: apis.updateApplication,
        deleteApi: apis.deleteApplication,
      }}
      optionRender={optionRender}
    />
  );
};

export default MerchantApplicationPage;
