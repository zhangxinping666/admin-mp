import { useState, useEffect } from 'react';
import { CRUDPageTemplate } from '@/shared';
import {
  searchList,
  tableColumns,
  formList,
  merchantOrderConfig,
  type MerchantApplication,
} from './model';
import { Key } from 'react';
import * as apis from './apis';
import useCategoryOptions from '@/shared/hooks/useCategoryOptions';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import dayjs from 'dayjs';
import useGroupCitySchoolOptions from '@/shared/hooks/useGroupedCityOptions';
import { Space } from 'antd';
import { BaseBtn } from '@/components/Buttons';
import useUsersOptions from '@/shared/hooks/useUsersOptions';

const MerchantApplicationPage = () => {
  // 获取用户信息
  const { permissions, userInfo } = useUserStore();
  const schoolId = userInfo?.school_id;
  const roleId = userInfo?.role_id;
  const [categoryOptions] = useCategoryOptions(schoolId);

  const [isDormStore, setIsDormStore] = useState(false);

  const [userOptions] = useUsersOptions();

  const locationOptions = useGroupCitySchoolOptions();

  // 为城市运营商自动加载所属城市的学校
  useEffect(() => {
    if (userInfo?.role_id === 5 && userInfo?.city_id) {
      locationOptions.loadSchools(userInfo.city_id);
    }
  }, [userInfo, locationOptions.loadSchools]);
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
  // 处理表单值
  const handleFormValue = (value: any) => {
    value.location = [value.longitude, value.latitude];
    /**
     * 将时间字符串转换为dayjs对象
     * @param timeStr 时间字符串，可以是HH:mm格式或时间戳
     * @param defaultHour 默认小时数
     * @returns dayjs对象
     */
    const parseTime = (timeStr: any, defaultHour: number) => {
      if (!timeStr) return dayjs().hour(defaultHour).minute(0);

      // 如果是时间戳
      if (typeof timeStr === 'number') {
        return dayjs(timeStr);
      }

      // 如果是HH:mm格式
      if (typeof timeStr === 'string' && timeStr.includes(':')) {
        const [hours, minutes] = timeStr.split(':');
        return dayjs().hour(Number(hours)).minute(Number(minutes));
      }

      // 其他情况返回默认时间
      return dayjs().hour(defaultHour).minute(0);
    };

    value.time_range = [
      parseTime(value.open_hour, 8), // 默认8:00
      parseTime(value.closed_hour, 22), // 默认22:00
    ];
    return value;
  };

  // 格式化历史审核记录数据
  const formatHistoryData = (data: any) => {
    const formattedData = data.map((item: any) => ({
      operatorName: item.operator_name,
      remark: item.remark,
      status: item.to_status,
      createTime: dayjs(item.create_time),
      updateTime: dayjs(item.update_time),
      ...item,
    }));
    delete formattedData['operator_name'];
    delete formattedData['to_status'];
    delete formattedData['create_time'];
    delete formattedData['update_time'];
    return formattedData;
  };

  // 操作列渲染
  const optionRender = (
    record: MerchantApplication,
    actions: {
      handleEdit: (record: MerchantApplication) => void;
      handleDelete?: (id: Key[]) => void;
      handleDetail: (record: MerchantApplication) => void; // 新增：审批详情处理函数
      handleHistory: (id: number) => void; // 新增：历史审核记录处理函数
    },
  ) => {
    const canEdit = hasPermission('mp:merchantApl:update');
    const canDelete = hasPermission('mp:merchantApl:delete');

    return (
      <Space size="small">
        {record.apply_status === 3 && (
          <BaseBtn
            type="primary"
            size="small"
            onClick={() => actions.handleEdit(record)}
            disabled={!canEdit}
          >
            审核
          </BaseBtn>
        )}
        <BaseBtn
          type="default"
          size="small"
          onClick={() => {
            const formatRecord = {
              merchantDetail: {
                name: record.name,
                store_name: record.store_name,
                phone: record.phone,
                province: record.province,
                city: record.city,
                school_name: record.school_name,
                type: record.type,
                category: record.category,
                location: {
                  address: record.address,
                  longitude: record.longitude,
                  latitude: record.latitude,
                },
                images: {
                  storefront_image: record.storefront_image,
                  business_license_image: record.business_license_image,
                  food_license_image: record.food_license_image,
                  medical_certificate_image: record.medical_certificate_image,
                  student_id_card_image: record.student_id_card_image,
                  identity_card_image: record.identity_card_image,
                },
                start_time: record.start_time,
                end_time: record.end_time,
                is_dorm_store: record.is_dorm_store,
              },
              orderDetail: {
                amount: record.amount,
                order_number: record.order_number,
                pay_channel: record.pay_channel,
              },
            };
            actions.handleDetail(formatRecord as any);
          }}
        >
          审批详情
        </BaseBtn>
        <BaseBtn
          type="default"
          size="small"
          onClick={() => actions.handleHistory(record.merchant_id!)}
        >
          历史审核记录
        </BaseBtn>
      </Space>
    );
  };
  return (
    <CRUDPageTemplate
      disableBatchUpdate={false}
      // isAddOpen={roleId === 4}
      isAdapt={true}
      isDelete={true}
      formatHistoryData={formatHistoryData}
      detailConfig={merchantOrderConfig}
      handleFormValue={handleFormValue}
      isApplication={true}
      isAddOpen={false}
      title="商家申请"
      searchConfig={searchList(locationOptions, userInfo || undefined)}
      columns={tableColumns().filter((col) => col.dataIndex !== 'action')}
      formConfig={formList({ userOptions })}
      initCreate={initCreate}
      disableCreate={!hasPermission('mp:merchantApl:add')}
      disableBatchDelete={!hasPermission('mp:merchantApl:delete')}
      onEditOpen={(record) => {
        return {
          id: record.id,
          user_id: record.user_id,
          apply_status: record.apply_status,
        };
      }}
      apis={{
        fetchHistoryApi: async (id: number) => {
          const params = {
            merchant_id: id,
          };

          return apis.getStoreApplyHistory(params);
        },

        fetchApi: async (params) => {
          // 为城市运营商自动添加city_id过滤
          if (userInfo?.role_id === 5 && userInfo?.city_id) {
            params = { ...params, city_id: userInfo.city_id };
          }
          params.start_time = params.time_range?.[0];
          params.end_time = params.time_range?.[1];
          setIsDormStore(params.is_dorm_store);
          delete params.time_range;
          try {
            const res = await apis.getApplicationList(params);
            // 检查响应和数据是否存在
            if (!res || !res.data || !Array.isArray(res.data.list)) {
              console.error('API 返回格式不符合预期:', res);
              return { data: { list: [], total: 0 } };
            }

            // 处理数据
            res.data.list.forEach((item: any) => {
              item.location = {
                address: item.address,
                longitude: item.longitude,
                latitude: item.latitude,
              };
            });

            return res;
          } catch (error) {
            // 返回默认空数据，避免组件崩溃
            return { data: { list: [], total: 0 } };
          }
        },
        createApi: async (data) => {
          data.is_dorm_store = data.is_dorm_store === 0 ? false : true;
          data.longitude = data.location?.[0];
          data.latitude = data.location?.[1];
          data.open_hour = data.time_range?.[0];
          data.close_hour = data.time_range?.[1];
          delete data.location;
          const res = await apis.createApplication(data);
          return res;
        },
        updateApi: (params: any) => {
          if (params.apply_status === 3) {
            throw new Error('待审核状态不能进行操作');
          }
          const id = params.id?.[0];
          if (!id) {
            throw new Error('请选择要操作的记录');
          }
          console.log(params);

          return apis.updateApplication({
            id: Number(id),
            apply_status: Number(params.apply_status),
            reason: params.reason,
            user_id: Number(params.user_id),
          });
        },
        deleteApi: (params: any) => {
          const idList = Array.isArray(params) ? params : [params];
          return apis.deleteApplication({ ids: idList });
        },
      }}
      optionRender={optionRender as any}
    />
  );
};

export default MerchantApplicationPage;
