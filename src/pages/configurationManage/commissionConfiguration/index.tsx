import { Tooltip, Modal } from 'antd';
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
  platform_rate: '40',
  promoter_rate: '30',
  leader_rate: '20',
  operator_rate: '10',
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
    const showDeleteConfirm = () => {
      Modal.confirm({
        title: '温馨提示',
        content: '您确定要删除这条记录吗？此操作不可撤销。',
        okText: '确认删除',
        okType: 'danger',
        cancelText: '取消',
        // 关键：在 onOk 回调中执行真正的删除操作
        onOk() {
          actions.handleDelete?.([record.id!]);
        },
      });
    };
    return (
      <div className="flex gap-2">
        <Tooltip >
          <BaseBtn onClick={() => actions.handleEdit(record)}>
            编辑
          </BaseBtn>
        </Tooltip>
        <BaseBtn
          danger
          onClick={showDeleteConfirm}
        >
          删除
        </BaseBtn>

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
