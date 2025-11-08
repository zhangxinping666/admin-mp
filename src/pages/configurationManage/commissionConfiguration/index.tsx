import { Tooltip } from 'antd';
import BaseBtn from '@/components/Buttons/components/BaseBtn';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import {
  searchList,
  tableColumns,
  formList,
  type CommissionConfigItem,
} from './model';
import {
  getCommissionConfigList,
  addCommissionConfig,
  updateCommissionConfig,
  deleteCommissionConfig,
} from '@/servers/configuration/commission';

// API 配置
const commissionConfigApis = {
  fetch: getCommissionConfigList,
  create: addCommissionConfig,
  update: (data: any) => updateCommissionConfig(data.id, data),
  delete: (ids: number[]) => {
    // 批量删除需要逐个调用
    return Promise.all(ids.map((id) => deleteCommissionConfig(id)));
  },
};

// 初始化新增数据
const initCreate: Partial<CommissionConfigItem> = {
  business_type: '',
  platform_rate: '0',
  promoter_rate: '0',
  leader_rate: '0',
  operator_rate: '0',
  amount: '0',
  status: 1,
};

const CommissionConfigurationPage = () => {
  const { permissions } = useUserStore();

  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  // 操作列渲染
  const optionRender = (
    record: CommissionConfigItem,
    actions: {
      handleEdit: (record: CommissionConfigItem) => void;
      handleDelete?: (id: number[]) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:commission:update');
    const canDelete = hasPermission('mp:commission:del');

    return (
      <div className="flex gap-2">
        <Tooltip title={!canEdit ? '无权限操作' : ''}>
          <BaseBtn onClick={() => canEdit && actions.handleEdit(record)} disabled={!canEdit}>
            编辑
          </BaseBtn>
        </Tooltip>
        <Tooltip title={!canDelete ? '无权限操作' : ''}>
          <BaseBtn
            danger
            onClick={() => canDelete && actions.handleDelete?.([record.id!])}
            disabled={!canDelete}
          >
            删除
          </BaseBtn>
        </Tooltip>
      </div>
    );
  };

  // 处理表单数据转换
  const handleFormValue = (values: any) => {
    const formattedValues = { ...values };

    // 处理空值字段
    Object.keys(formattedValues).forEach((key) => {
      if (formattedValues[key] === '' || formattedValues[key] === undefined) {
        formattedValues[key] = null;
      }
    });

    return formattedValues;
  };

  return (
    <CRUDPageTemplate
      title="分佣配置"
      isDelete={true}
      searchConfig={searchList}
      columns={tableColumns}
      formConfig={formList}
      initCreate={initCreate}
      scrollX={1300}
      disableCreate={!hasPermission('mp:commission:add')}
      disableBatchDelete={!hasPermission('mp:commission:del')}
      apis={{
        fetchApi: commissionConfigApis.fetch,
        createApi: commissionConfigApis.create,
        updateApi: commissionConfigApis.update,
        deleteApi: commissionConfigApis.delete,
      }}
      optionRender={optionRender}
      handleFormValue={handleFormValue}
    />
  );
};

export default CommissionConfigurationPage;
