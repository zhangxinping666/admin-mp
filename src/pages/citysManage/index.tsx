import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type City } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import {
  getCityList,
  addCity,
  updateCity,
  deleteCity,
  getProvinceList,
  getCityName,
} from '@/servers/city';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
// 定义 Select 组件分组选项的最终结构
interface GroupedOption {
  label: string; // 省份名
  options: { label: string; value: number }[]; // 该省份下的城市列表
}
const cityApis = {
  fetch: getCityList,
  create: addCity,
  update: updateCity,
  delete: deleteCity,
};
// 初始化新增数据
const initCreate: Partial<City> = {
  city_name: '',
  name: '',
  phone: '',
  password: '', // 默认密码
  status: 1, // 默认状态
};

const CitiesPage = () => {
  const { permissions } = useUserStore();
  const [groupedCityOptions, setGroupedCityOptions] = useState<GroupedOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };
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
  // 操作列渲染
  const optionRender = (
    record: City,
    actions: {
      handleEdit: (record: City) => void;
      handleDelete: (id: number) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:city:update');
    const canDelete = hasPermission('mp:city:delete');

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
      title="城市管理"
      searchConfig={searchList()}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList({
        groupedCityOptions,
        isLoadingOptions,
      })}
      initCreate={initCreate}
      disableCreate={!hasPermission('mp:city:add')}
      disableBatchDelete={!hasPermission('mp:city:delete')}
      apis={{
        fetchApi: cityApis.fetch,
        createApi: cityApis.create,
        updateApi: (id: number, data: any) => {
          return cityApis.update({ ...data, id });
        },
        deleteApi: (id: Array<number>) => cityApis.delete(id),
      }}
      optionRender={optionRender}
    />
  );
};

export default CitiesPage;
