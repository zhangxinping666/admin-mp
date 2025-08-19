import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type School } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { getSchoolList, addSchool, updateSchool, deleteSchool } from '@/servers/school';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import { getProvinceList, getCityName } from '@/servers/city';
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
  delete: deleteSchool,
};
interface GroupedOption {
  label: string; // 省份名（作为分组标题）
  options: { label: string; value: number }[]; // 该省份下的城市列表
}
const SchoolsPage = () => {
  const { permissions } = useUserStore();
  const [groupedCityOptions, setGroupedCityOptions] = useState<GroupedOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const locationOptions = useLocationOptions();
  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  // 加载省市数据
  useEffect(() => {
    const fetchAndGroupData = async () => {
      setIsLoadingOptions(true);
      try {
        const provinceResponse = await getProvinceList(0);
        const provinces = provinceResponse.data || [];
        // 【修正】使用 province.province 来获取省份名称
        const cityPromises = provinces.map((province: any) => getCityName(province.city_id));
        const cityResponses = await Promise.all(cityPromises);
        const finalOptions = provinces.map((province: any, index: number) => {
          const cities = cityResponses[index].data || [];
          return {
            label: province.name, // 省份名作为分组标题
            options: cities.map((city: any) => ({
              label: city.name,
              value: city.city_id,
            })),
          };
        });
        setGroupedCityOptions(finalOptions);
      } catch (error) {
        console.error('加载省市选项失败:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    fetchAndGroupData();
  }, []);

  // 编辑时的数据转换
  const handleEditOpen = (record: School) => {
    return {
      ...record,
      school_logo: record.logo_image_url,
      city_id: record.city_id, // Select组件直接使用城市ID即可
      location:
        record.longitude && record.latitude ? [record.longitude, record.latitude] : undefined,
    };
  };

  // 操作列渲染
  const optionRender = (
    record: School,
    actions: {
      handleEdit: (record: School) => void;
      handleDelete: (id: number) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:school:update');
    const canDelete = hasPermission('mp:school:delete');

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
      title="学校管理"
      searchConfig={searchList(locationOptions)}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList({
        groupedCityOptions,
        isLoadingOptions,
      })}
      initCreate={initCreate}
      onEditOpen={handleEditOpen}
      isAddOpen={true}
      disableCreate={!hasPermission('mp:school:add')}
      disableBatchDelete={!hasPermission('mp:school:delete')}
      apis={{
        createApi: (data: any) => {
          // 处理位置数据
          const submitData = { ...data };

          // 处理位置数据
          if (data.location && Array.isArray(data.location)) {
            submitData.longitude = data.location[0];
            submitData.latitude = data.location[1];
            delete submitData.location;
          }
          return schoolApis.create(submitData);
        },
        fetchApi: schoolApis.fetch,
        updateApi: (data: any) => {
          // 处理位置数据
          const submitData = { ...data };

          // 处理位置数据
          if (data.location && Array.isArray(data.location)) {
            submitData.longitude = data.location[0];
            submitData.latitude = data.location[1];
            delete submitData.location;
          }
          return schoolApis.update(submitData);
        },
        deleteApi: (id: number[]) => schoolApis.delete(id),
      }}
      optionRender={optionRender}
    />
  );
};

export default SchoolsPage;
