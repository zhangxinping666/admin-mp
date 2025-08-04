import { CRUDPageTemplate, TableActions } from '@/shared';
import { searchList, tableColumns, formList, addFormList, type MerchantApplication } from './model';
import { Key } from 'react';
import * as apis from './apis';
import useCategoryOptions from '@/shared/hooks/useCategoryOptions';
import useUsersOptions from '@/shared/hooks/useUsersOptions';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';

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
  // 获取用户信息
  const userStorage = useUserStore();
  const schoolId = userStorage?.userInfo?.school_id;
  const userId = userStorage?.userInfo?.id;
  const schoolName = userStorage?.userInfo?.school_name;
  const { permissions } = useUserStore();
  const [categoryOptions] = useCategoryOptions(schoolId);
  const [usersOptions] = useUsersOptions(schoolName);
  console.log('categoryOptions', categoryOptions);
  console.log('schoolId', schoolId);
  console.log('usrStore', userStorage);

  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  // 初始化新增数据
  const initCreate: Partial<MerchantApplication> = {
    name: '',
    phone: '',
    merchant_type: '校内',
    amount: 0,
    fee_description: '',
    type: '',
    pay_channel: '支付宝',
    order_number: '',
    apply_status: 1,
    pay_status: 0,
    pay_type: '真实支付',
    story_apply_status: 1,
    status: 1,
    is_dorm_store: 1,
  };
  // 封装新增表单配置

  // 操作列渲染
  const optionRender = (
    record: MerchantApplication,
    actions: {
      handleEdit: (record: MerchantApplication) => void;
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
      disableBatchUpdate={false}
      isAddOpen={true}
      isDelete={true}
      addFormConfig={addFormList({
        categoryOptions,
        usersOptions,
      })}
      isApplication={true}
      title="商家申请"
      searchConfig={searchList()}
      columns={tableColumns.filter((col) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      disableCreate={!hasPermission('mp:merchantApl:add')}
      disableBatchDelete={!hasPermission('mp:merchantApl:delete')}
      onEditOpen={(record) => {
        return {
          id: record.id,
          apply_status: record.apply_status,
        };
      }}
      apis={{
        fetchApi: getApplicationList,
        createApi: async (data) => {
          data.is_dorm_store = data.is_dorm_store === 0 ? false : true;
          const res = await apis.createApplication(data);
          return res;
        },
        updateApi: (params: any) => {
          console.log('updata', params);
          const idList = Array.isArray(params.id) ? params.id : [params.id];
          console.log('params', params);
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
