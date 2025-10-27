import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type School } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { BaseBtn } from '@/components/Buttons';
import { Tooltip } from 'antd';
import { getSchoolList, addSchool, updateSchool } from '@/servers/school';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import { getCitiesByProvince } from '@/servers/trade-blotter/location';
import { useLocationOptions } from './model';

// 初始化新增数据
const initCreate: Partial<School> = {
  id: 0,
  name: '',
  address: '',
  city_id: 2, // 默认城市ID
  logo_image_url: '',
  city_name: '',
  province: '',
  latitude: 39.90923, // 默认纬度
  longitude: 116.397428, // 默认经度 
  status: 1, // 默认状态
};
const schoolApis = {
  fetch: getSchoolList,
  create: addSchool,
  update: updateSchool,
};
interface GroupedOption {
  label: string; // 省份名（作为分组标题）
  options: { label: string; value: number }[]; // 该省份下的城市列表
}
const SchoolsPage = () => {
  const { permissions, userInfo } = useUserStore();
  const [groupedCityOptions, setGroupedCityOptions] = useState<GroupedOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [cityName, setCityName] = useState<string>('');
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const locationOptions = useLocationOptions(userInfo?.role_id === 5);

  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  // 基于 locationOptions 构建分组的城市选项
  useEffect(() => {
    console.log('[SchoolsPage] 构建城市选项 useEffect 触发');

    const buildGroupedCityOptions = async () => {
      // 城市运营商：只加载自己的城市
      if (userInfo?.role_id === 5 && userInfo?.city_id) {
        console.log('[SchoolsPage] 城市运营商：加载自己的城市');
        try {
          const { data } = await getCitiesByProvince(userInfo.city_id);
          const cities = data || [];
          const city = cities.find((c: any) => c.city_id === userInfo.city_id);
          if (city) {
            setCityName(city.name);
            setGroupedCityOptions([{
              label: '当前城市',
              options: [{ label: city.name, value: userInfo.city_id }]
            }]);
          }
        } catch (error) {
          console.error('[SchoolsPage] 加载城市信息失败:', error);
        }
        setIsLoadingOptions(false);
        return;
      }

      // 非城市运营商：基于 locationOptions 构建分组城市数据
      const realProvinces = locationOptions.provinceOptions.filter(
        (p) => p.value !== '全部'
      );

      if (realProvinces.length === 0) {
        console.log('[SchoolsPage] 省份数据还未加载');
        return;
      }

      console.log('[SchoolsPage] 非城市运营商：构建分组城市数据，省份数量:', realProvinces.length);
      setIsLoadingOptions(true);
      try {
        const cityPromises = realProvinces.map(async (province) => {
          const { data } = await getCitiesByProvince(Number(province.value));
          const cities = data || [];
          return {
            label: province.label,
            options: cities.map((city: any) => ({
              label: city.name,
              value: city.city_id,
            })),
          };
        });

        const finalOptions = await Promise.all(cityPromises);
        setGroupedCityOptions(finalOptions);
        console.log('[SchoolsPage] 分组城市数据构建完成');
      } catch (error) {
        console.error('[SchoolsPage] 加载分组城市选项失败:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    buildGroupedCityOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationOptions.provinceOptions]);

  // 编辑时的数据转换
  const handleEditOpen = (record: School): any => {
    console.log('===== 编辑数据初始化 =====');
    console.log('原始记录:', record);

    // 设置编辑的学校ID，用于重名检查时排除自身
    setEditingId(record.id);

    const editData = {
      ...record,
      school_logo: record.logo_image_url,
      city_id: record.city_id, // Select组件直接使用城市ID即可
      location:
        record.longitude && record.latitude ? [record.longitude, record.latitude] : undefined,
      longitude: record.longitude,
      latitude: record.latitude,
    };

    // 如果是城市运营商编辑，确保使用其所属城市ID
    if (userInfo?.role_id === 5 && userInfo?.city_id) {
      editData.city_id = userInfo.city_id;
    }

    console.log('编辑表单初始数据:', editData);
    return editData;
  };

  // 新增时清除编辑ID
  const handleCreateClick = () => {
    setEditingId(undefined);
  };

  // 处理表单值，将后端的longitude/latitude转换为前端的location数组
  const handleFormValue = (value: any) => {
    // 如果有经纬度数据，转换为location数组
    if (value.longitude && value.latitude) {
      value.location = [value.longitude, value.latitude];
    }
    return value;
  };

  // 操作列渲染 - 只显示编辑按钮
  const optionRender = (
    record: School,
    actions: {
      handleEdit: (record: School) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:school:update');

    return (
      <Tooltip title={!canEdit ? '无权限操作' : ''}>
        <BaseBtn onClick={() => canEdit && actions.handleEdit(record)} disabled={!canEdit}>
          编辑
        </BaseBtn>
      </Tooltip>
    );
  };

  return (
    <CRUDPageTemplate
      title="学校管理"
      isDelete={false}
      searchConfig={searchList(locationOptions, userInfo || undefined)}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList({
        groupedCityOptions,
        isLoadingOptions,
        userInfo: userInfo || undefined,
        cityName,
        editingId,
      })}
      initCreate={userInfo?.role_id === 5 && userInfo?.city_id
        ? { ...initCreate, city_id: userInfo.city_id }
        : initCreate}
      onEditOpen={handleEditOpen}
      onCreateClick={handleCreateClick}
      handleFormValue={handleFormValue}
      isAddOpen={true}
      disableCreate={!hasPermission('mp:school:add')}
      disableBatchDelete={true}
      apis={{
        createApi: (data: any) => {
          const submitData = { ...data };
          // 从location数组提取经纬度
          if (data.location && Array.isArray(data.location)) {
            submitData.longitude = data.location[0];
            submitData.latitude = data.location[1];
          }
          // 删除location字段，因为后端不需要
          delete submitData.location;

          // 城市运营商强制使用其所属城市ID
          if (userInfo?.role_id === 5 && userInfo?.city_id) {
            submitData.city_id = userInfo.city_id;
          }

          console.log('提交的学校数据:', submitData);
          return schoolApis.create(submitData);
        },
        fetchApi: (params: any) => {
          // 为城市运营商自动添加city_id过滤
          if (userInfo?.role_id === 5 && userInfo?.city_id) {
            params.city_id = userInfo.city_id;
          }
          return schoolApis.fetch(params);
        },
        updateApi: (data: any) => {
          console.log('===== 更新前的表单数据 =====');
          console.log('原始数据:', data);
          console.log('location字段:', data.location);
          console.log('longitude字段:', data.longitude);
          console.log('latitude字段:', data.latitude);

          const submitData = { ...data };
          // 从location数组提取经纬度
          if (data.location && Array.isArray(data.location)) {
            submitData.longitude = data.location[0];
            submitData.latitude = data.location[1];
            console.log('从location提取经纬度:', {
              longitude: submitData.longitude,
              latitude: submitData.latitude,
            });
          } else {
            console.log('使用原有的longitude和latitude字段');
          }

          // 城市运营商强制使用其所属城市ID
          if (userInfo?.role_id === 5 && userInfo?.city_id) {
            submitData.city_id = userInfo.city_id;
          }

          // 删除location字段，因为后端不需要
          delete submitData.location;
          console.log('===== 最终提交的数据 =====');
          console.log('提交数据:', submitData);
          return schoolApis.update(submitData);
        },
      }}
      optionRender={optionRender}
    />
  );
};

export default SchoolsPage;
