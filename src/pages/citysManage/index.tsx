import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type City, useLocationOptions } from './model';
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
import { getUserListByPage } from '@/servers/user';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
// 定义 Select 组件分组选项的最终结构
interface GroupedOption {
  label: string; // 省份名
  options: { label: string; value: number }[]; // 该省份下的城市列表
}

// 定义用户选项结构
interface UserOption {
  label: string;
  value: number;
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
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const locationOptions = useLocationOptions();

  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };
  // 加载用户数据
  const fetchUserOptions = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await getUserListByPage();
      console.log('用户接口返回数据:', response);

      // 检查不同的数据结构可能性
      if (response && response.code === 2000) {
        // 直接在response层级有code
        const users = response.data || [];
        console.log('用户数据 (方式1):', users);
        const userOptionsList = users.map((user: any) => ({
          label: user.username,
          value: user.id,
        }));
        setUserOptions(userOptionsList);
      } else if (response.data && response.data.code === 0) {
        // 在response.data层级有code
        const users = response.data.data || [];
        console.log('用户数据 (方式2):', users);
        const userOptionsList = users.map((user: any) => ({
          label: user.username,
          value: user.id,
        }));
        setUserOptions(userOptionsList);
      } else {
        console.log('未知的数据结构:', response);
      }
    } catch (error) {
      console.error('加载用户选项失败:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // 加载省市数据
  useEffect(() => {
    const fetchAndGroupData = async () => {
      setIsLoadingOptions(true);
      try {
        const provinceResponse = await getProvinceList(0);
        console.log('省份接口返回数据:', provinceResponse);

        const provinces = provinceResponse.data || [];
        console.log('省份数据:', provinces);

        // 【修正】使用 province.province 来获取省份名称
        const cityPromises = provinces.map((province: any) => getCityName(province.city_id));
        const cityResponses = await Promise.all(cityPromises);

        console.log('城市接口返回数据:', cityResponses);

        const finalOptions = provinces.map((province: any, index: number) => {
          const cities = cityResponses[index].data || [];
          console.log(`${province.name} 的城市数据:`, cities);

          return {
            // 【修正】使用 province.province 来设置分组标题
            label: province.name,
            options: cities.map((city: any) => ({
              label: city.name,
              value: city.city_id,
            })),
          };
        });

        console.log('最终分组选项:', finalOptions);
        setGroupedCityOptions(finalOptions);
      } catch (error) {
        console.error('加载省市选项失败:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    fetchAndGroupData();
    fetchUserOptions();
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
      title="城市运营商"
      searchConfig={searchList(locationOptions)}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList({
        groupedCityOptions,
        isLoadingOptions,
        userOptions,
        isLoadingUsers,
      })}
      initCreate={initCreate}
      disableCreate={!hasPermission('mp:city:add')}
      disableBatchDelete={!hasPermission('mp:city:delete')}
      apis={{
        fetchApi: cityApis.fetch,
        createApi: cityApis.create,
        updateApi: (data: any) => {
          return cityApis.update(data);
        },
        deleteApi: (id: Array<number>) => cityApis.delete(id),
      }}
      optionRender={optionRender}
    />
  );
};

export default CitiesPage;
