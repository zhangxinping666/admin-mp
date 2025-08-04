import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type School } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { getSchoolList, addSchool, updateSchool, deleteSchool } from '@/servers/school';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import { getProvinceList, getCityName } from '@/servers/city';
// 初始化新增数据
const initCreate: Partial<School> = {
  id: 0,
  name: '',
  address: '',
  city_id: 1, // 默认城市ID
  logo_image_url: '',
  city_name: '',
  province: '',
  status: 1, // 默认状态
};
const schoolApis = {
  fetch: getSchoolList,
  create: addSchool,
  update: updateSchool,
  delete: deleteSchool,
};
interface GroupedOption {
  label: string; // 省份名
  options: { label: string; value: number }[]; // 该省份下的城市列表
}
const SchoolsPage = () => {
  const { permissions } = useUserStore();
  const [groupedCityOptions, setGroupedCityOptions] = useState<GroupedOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  // 加载省市数据
  useEffect(() => {
    const fetchAndGroupData = async () => {
      setIsLoadingOptions(true);
      try {
        const provinceResponse = await getProvinceList();
        const provinces = provinceResponse.data || [];
        // 【修正】使用 province.province 来获取省份名称
        const cityPromises = provinces.map((province: any) => getCityName(province.province));
        const cityResponses = await Promise.all(cityPromises);
        const finalOptions = provinces.map((province: any, index: number) => {
          const cities = cityResponses[index].data || [];
          return {
            // 【修正】使用 province.province 来设置分组标题
            label: province.province,
            options: cities.map((city: any) => ({
              label: city.city_name,
              value: city.id,
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
      searchConfig={searchList()}
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
        createApi: schoolApis.create,
        fetchApi: schoolApis.fetch,
        updateApi: (data: any) => {
          console.log('学校管理 updateApi 接收到的数据:', data);
          return schoolApis.update(data);
        },
        deleteApi: (id: number[]) => schoolApis.delete(id),
      }}
      optionRender={optionRender}
    />
  );
};

export default SchoolsPage;
