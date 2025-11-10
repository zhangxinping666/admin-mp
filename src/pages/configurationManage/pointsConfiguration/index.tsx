import { Tooltip, Modal } from 'antd';
import BaseBtn from '@/components/Buttons/components/BaseBtn';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import dayjs from 'dayjs';
import {
  searchList,
  tableColumns,
  formList,
  type PointsConfigItem,
} from './model';
import {
  getPointsConfigList,
  addPointsConfig,
  updatePointsConfig,
  deletePointsConfig,
} from '@/servers/configuration/points';

// API 配置
const pointsConfigApis = {
  fetch: getPointsConfigList,
  create: addPointsConfig,
  update: (data: any) => updatePointsConfig(data.id, data),
  delete: (ids: number[]) => {
    // 批量删除需要逐个调用
    return Promise.all(ids.map((id) => deletePointsConfig(id)));
  },
};

// 初始化新增数据
const initCreate: Partial<PointsConfigItem> = {
  rule_code: '',
  rule_name: '',
  business_type: '',
  exchange_rate: 100,
  status: 1,
  default_expire_days: 365,
  valid_start_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
  valid_end_time: null
};

const PointsConfigurationPage = () => {
  const { permissions } = useUserStore();

  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  // 操作列渲染
  const optionRender = (
    record: PointsConfigItem,
    actions: {
      handleEdit: (record: PointsConfigItem) => void;
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
    // 转换日期格式
    const formattedValues = { ...values };

    if (formattedValues.valid_start_time) {
      formattedValues.valid_start_time = dayjs(formattedValues.valid_start_time).format(
        'YYYY-MM-DD HH:mm:ss',
      );
    }

    if (formattedValues.valid_end_time) {
      formattedValues.valid_end_time = dayjs(formattedValues.valid_end_time).format(
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
  const onEditOpen = (record: PointsConfigItem) => {
    const editData = { ...record };

    // 转换日期为 dayjs 对象
    if (editData.valid_start_time) {
      editData.valid_start_time = dayjs(editData.valid_start_time) as any;
    }

    if (editData.valid_end_time) {
      editData.valid_end_time = dayjs(editData.valid_end_time) as any;
    }

    return editData;
  };

  return (
    <CRUDPageTemplate
      title="金豆配置"
      isDelete={true}
      searchConfig={searchList}
      columns={tableColumns}
      formConfig={formList}
      initCreate={initCreate}
      scrollX={1400}
      disableCreate={!hasPermission('mp:points:add')}
      disableBatchDelete={!hasPermission('mp:points:del')}
      apis={{
        fetchApi: pointsConfigApis.fetch,
        createApi: pointsConfigApis.create,
        updateApi: pointsConfigApis.update,
        deleteApi: pointsConfigApis.delete,
      }}
      optionRender={optionRender}
      handleFormValue={handleFormValue}
      onEditOpen={onEditOpen}
    />
  );
};

export default PointsConfigurationPage;
