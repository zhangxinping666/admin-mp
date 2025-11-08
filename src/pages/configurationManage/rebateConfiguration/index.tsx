import { Tooltip } from 'antd';
import BaseBtn from '@/components/Buttons/components/BaseBtn';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import dayjs from 'dayjs';
import {
  searchList,
  tableColumns,
  formList,
  type RebateConfigItem,
} from './model';
import {
  getRebateConfigList,
  addRebateConfig,
  updateRebateConfig,
  deleteRebateConfig,
} from '@/servers/configuration/rebate';

// API 配置
const rebateConfigApis = {
  fetch: getRebateConfigList,
  create: addRebateConfig,
  update: (data: any) => updateRebateConfig(data.id, data),
  delete: (ids: number[]) => {
    // 批量删除需要逐个调用
    return Promise.all(ids.map((id) => deleteRebateConfig(id)));
  },
};

// 初始化新增数据
const initCreate: Partial<RebateConfigItem> = {
  config_name: '',
  category_id: null,
  platform_rate: '0',
  promoter_rate: '0',
  buyer_points_rate: '0',
  min_order_amount: '0',
  max_order_amount: null,
  priority: 0,
  status: 1,
  valid_from: dayjs().format('YYYY-MM-DD HH:mm:ss'),
};

const RebateConfigurationPage = () => {
  const { permissions } = useUserStore();

  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  // 操作列渲染
  const optionRender = (
    record: RebateConfigItem,
    actions: {
      handleEdit: (record: RebateConfigItem) => void;
      handleDelete?: (id: number[]) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:rebate:update');
    const canDelete = hasPermission('mp:rebate:del');

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
    // 转换日期格式
    const formattedValues = { ...values };

    if (formattedValues.valid_from) {
      formattedValues.valid_from = dayjs(formattedValues.valid_from).format(
        'YYYY-MM-DD HH:mm:ss',
      );
    }

    if (formattedValues.valid_to) {
      formattedValues.valid_to = dayjs(formattedValues.valid_to).format(
        'YYYY-MM-DD HH:mm:ss',
      );
    }

    // 处理空值字段
    Object.keys(formattedValues).forEach((key) => {
      if (formattedValues[key] === '' || formattedValues[key] === undefined) {
        formattedValues[key] = null;
      }
    });

    return formattedValues;
  };

  // 编辑时转换数据格式
  const onEditOpen = (record: RebateConfigItem) => {
    const editData = { ...record };

    // 转换日期为 dayjs 对象
    if (editData.valid_from || editData.valid_start_time) {
      editData.valid_from = dayjs(editData.valid_from || editData.valid_start_time) as any;
    }

    if (editData.valid_to || editData.valid_end_time) {
      editData.valid_to = dayjs(editData.valid_to || editData.valid_end_time) as any;
    }

    return editData;
  };

  return (
    <CRUDPageTemplate
      title="返利配置"
      isDelete={true}
      searchConfig={searchList}
      columns={tableColumns}
      formConfig={formList}
      initCreate={initCreate}
      scrollX={1500}
      disableCreate={!hasPermission('mp:rebate:add')}
      disableBatchDelete={!hasPermission('mp:rebate:del')}
      apis={{
        fetchApi: rebateConfigApis.fetch,
        createApi: rebateConfigApis.create,
        updateApi: rebateConfigApis.update,
        deleteApi: rebateConfigApis.delete,
      }}
      optionRender={optionRender}
      handleFormValue={handleFormValue}
      onEditOpen={onEditOpen}
    />
  );
};

export default RebateConfigurationPage;
