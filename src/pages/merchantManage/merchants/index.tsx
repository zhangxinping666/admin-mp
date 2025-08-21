import { useState, useEffect } from 'react';
import { CRUDPageTemplate, TableActions } from '@/shared';
import { searchList, tableColumns, formList, type Merchant } from './model';
import * as apis from './apis';
import { Key } from 'react';
import useCategoryOptions from '@/shared/hooks/useCategoryOptions';
import useGroupCitySchoolOptions from '@/shared/hooks/useGroupedCityOptions';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import dayjs from 'dayjs';
import { Col, Grid, Modal, Row, Space } from 'antd';
import { wrap } from 'module';
import { BaseBtn } from '@/components/Buttons';

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
  const { permissions, userInfo } = useUserStore();
  const schoolId = userInfo?.school_id;
  // 替换原来的状态定义和useEffect
  const locationOptions = useGroupCitySchoolOptions();
  
  // 为城市运营商自动加载所属城市的学校
  useEffect(() => {
    if (userInfo?.role_id === 5 && userInfo?.city_id) {
      locationOptions.loadSchools(userInfo.city_id);
    }
  }, [userInfo, locationOptions.loadSchools]);

  const [categoryOptions] = useCategoryOptions(schoolId);
  // 附件详情状态
  const [detailVisible, setDetailVisible] = useState(false);
  // 附件详情数据
  const [detailData, setDetailData] = useState<string[]>([]);

  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  // 附件信息
  const handleAttachment = (record: Merchant) => {
    setDetailVisible(true);
    if (record) {
      if (record.is_dormitory_store) {
        setDetailData([record.identity_card_image, record.student_id_card_image]);
      } else {
        setDetailData([
          record.storefront_image,
          record.business_license_image,
          record.food_license_image,
          record.medical_certificate_image,
        ]);
      }
    } else {
      console.error('record is undefined');
    }
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
      <>
        <Space size={8}>
          <TableActions
            record={record}
            onEdit={actions.handleEdit}
            disableEdit={!canEdit}
            disableDelete={!canDelete}
          />
          <BaseBtn type="primary" onClick={() => handleAttachment(record)}>
            附件信息
          </BaseBtn>
        </Space>
      </>
    );
  };

  // 定义API调用函数
  const fetchApi = async (params?: any) => {
    // 为城市运营商自动添加city_id过滤
    if (userInfo?.role_id === 5 && userInfo?.city_id) {
      params = { ...params, city_id: userInfo.city_id };
    }
    const response = await apis.getMerchantsList(params);
    response.data.list.forEach((item: Merchant) => {
      item.location = {
        address: item.site,
        longitude: item.longitude,
        latitude: item.latitude,
      };
      item.timer_range = [item.open_hour, item.closed_hour];
    });

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
      open_hour: params.time_range[0],
      closed_hour: params.time_range[1],
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

  // 处理表单值
  const handleFormValue = (value: any) => {
    value.location = [value.longitude, value.latitude];
    value.is_dormitory_store = Number(value.is_dormitory_store);
    value.store_recommend = Number(value.store_recommend);

    const parseTime = (timeStr: any, defaultHour: number) => {
      try {
        if (!timeStr) return dayjs().hour(defaultHour).minute(0);

        // 如果是dayjs对象直接返回
        if (dayjs.isDayjs(timeStr)) return timeStr;

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
      } catch (e) {
        console.error('时间解析错误:', e);
        return dayjs().hour(defaultHour).minute(0);
      }
    };

    value.time_range = [parseTime(value.open_hour, 8), parseTime(value.closed_hour, 22)];

    // 验证time_range格式
    if (!dayjs.isDayjs(value.time_range[0]) || !dayjs.isDayjs(value.time_range[1])) {
      console.error('时间格式验证失败:', value.time_range);
      value.time_range = [dayjs().hour(8).minute(0), dayjs().hour(22).minute(0)];
    }

    return value;
  };
  const getFullImageUrl = (url: any) => {
    if (!url) return '';
    // 确保url是字符串类型
    const urlStr = String(url);
    if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
      return urlStr;
    }
    return `http://192.168.10.7:8082${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
  };

  return (
    <>
      <CRUDPageTemplate
        title="商家管理"
        isDelete={true}
        handleFormValue={handleFormValue}
        searchConfig={searchList(locationOptions, categoryOptions, userInfo || undefined)}
        disableBatchUpdate={true}
        columns={tableColumns.filter((col) => col.dataIndex !== 'action')}
        formConfig={formList({
          categoryOptions,
        })}
        initCreate={initCreate}
        isAddOpen={false}
        disableCreate={!hasPermission('mp:merchantSort:add')}
        disableBatchDelete={!hasPermission('mp:merchantSort:delete')}
        // onEditOpen={handleEditOpen}
        apis={{
          fetchApi,
          updateApi,
          deleteApi,
        }}
        optionRender={optionRender as any}
      />
      <Modal
        title="商家详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        width={1200}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            flexWrap: 'wrap',
          }}
        >
          {detailData.map((item, index) => (
            <div key={index} style={{ width: '50%' }}>
              {item ? (
                <img
                  src={getFullImageUrl(item)}
                  alt={`分类图标 ${index + 1}`}
                  style={{
                    width: '100%', // 增加图片宽度以适应垂直布局
                    height: '50%',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
              ) : (
                <span style={{ color: '#999', width: '150px', textAlign: 'center' }}>无图片</span>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default MerchantsPage;
