import { CRUDPageTemplate, TableActions } from '@/shared';
import { searchList, tableColumns, formList, type Merchant } from './model';
import * as apis from './apis';
import { Key } from 'react';
import useCategoryOptions from '@/shared/hooks/useCategoryOptions';
import useGroupedCityOptions from '@/shared/hooks/useGroupedCityOptions';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';

// 初始化新增数据
const initCreate: Partial<Merchant> = {
  merchant_name: '',
  merchant_img: [],
  school_id: 0,
  city_name: '',
  status: 1,
  type: '校内',
  address: '',
  longitude: 0,
  latitude: 0,
  is_dormitory_store: 0,
  category_id: 0,
  store_recommend: 0,
};

const MerchantsPage = () => {
  const userStorage = useUserStore();
  const schoolId = userStorage?.userInfo?.school_id;
  const { permissions } = useUserStore();
  // 替换原来的状态定义和useEffect
  const { groupedCityOptions, isLoadingOptions } = useGroupedCityOptions();
  const [categoryOptions] = useCategoryOptions(schoolId);

  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  // 操作列渲染
  const optionRender = (
    record: Merchant,
    actions: {
      handleEdit: (record: Merchant) => void;
      handleDelete: (id: Key[]) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:merchantDetail:update');
    const canDelete = hasPermission('mp:merchantSort:delete');

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

  // 定义API调用函数
  const fetchApi = async (params?: any) => {
    const response = await apis.getMerchantsList(params);
    return {
      data: response.data.list,
      total: response.data.total,
    };
  };

  const updateApi = async (params: any) => {
    const newParams = {
      id: params.id,
      store_name: params.store_name,
      phone: params.phone,
      site: params.site,
      status: params.status,
      type: params.type,
      category: params.category,
      longitude: params.location[0],
      latitude: params.location[1],
      is_dormitory_store: params.is_dormitory_store,
      recommend: params.recommend,
      open_hour: params.open_hour,
      closed_hour: params.closed_hour,
    };
    newParams.is_dormitory_store = Number(params.is_dormitory_store);
    console.log('newParams', newParams);
    const response = await apis.modifyMerchantsList(newParams);
    return response.data;
  };

  const deleteApi = async (id: number | number[]) => {
    // 处理单个ID或多个ID的情况
    const ids = Array.isArray(id) ? id : [id];
    const response = await apis.deleteMerchantsList({ ids });
    return response;
  };

  // 编辑时数据转换函数
  const handleEditOpen = (record: Merchant) => {
    // 将longitude和latitude转换为location数组
    const processedRecord = {
      ...record,
      location: record.longitude && record.latitude ? [record.longitude, record.latitude] : undefined,
    };
    console.log('handleEditOpen processedRecord:', processedRecord);
    return processedRecord;
  };

  return (
    <CRUDPageTemplate
      title="商家管理"
      isDelete={true}
      searchConfig={searchList(groupedCityOptions, isLoadingOptions)}
      disableBatchUpdate={true}
      columns={tableColumns.filter((col) => col.dataIndex !== 'action')}
      formConfig={formList({
        categoryOptions,
      })}
      initCreate={initCreate}
      isAddOpen={false}
      disableCreate={!hasPermission('mp:merchantSort:add')}
      disableBatchDelete={!hasPermission('mp:merchantSort:delete')}
      onEditOpen={handleEditOpen}
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
