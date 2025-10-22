import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type City, useLocationOptions, UserSimple } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { Tooltip } from 'antd';
import BaseBtn from '@/components/Buttons/components/BaseBtn';
import { getCitiesByProvince } from '@/servers/trade-blotter/location';
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
      const Data = response as unknown as UserSimple
      console.log('用户接口返回数据:', response);

      // 检查不同的数据结构可能性
      if (Data && Data.code === 2000) {
        // 直接在response层级有code
        const users = Data.data || [];
        const userOptionsList = users.map((user: any) => ({
          label: user.username,
          value: user.id,
        }));
        setUserOptions(userOptionsList);
      } else if (response.data && response.data.code === 0) {
        // 在response.data层级有code
        const users = response.data.data || [];
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
      // 过滤掉"全部"选项，只保留真实的省份
      const realProvinces = locationOptions.provinceOptions.filter(
        (p) => p.value !== '全部'
      );

      if (realProvinces.length === 0) {
        return; // 省份数据还未加载
      }

      try {
        // 为每个省份加载城市数据a
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

      } catch (error) {
        console.error('加载分组城市选项失败:', error);
      }
    };
    fetchAndGroupData();
  }, [locationOptions.provinceOptions]);
  // 操作列渲染
  const optionRender = (
    record: City,
    actions: {
      handleEdit: (record: City) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:city:update');

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
      title="城市运营商"
      isDelete={true}  // 添加这一行
      searchConfig={searchList(locationOptions)}
      columns={tableColumns.filter((col: any) =>
        col.dataIndex !== 'action')}
      formConfig={formList({
        groupedCityOptions,
        isLoadingOptions,
        userOptions,
        isLoadingUsers,
      })}
      initCreate={initCreate}
      disableCreate={!hasPermission('mp:city:add')}
      disableBatchDelete={!hasPermission('mp:city:delete ')}
      apis={{
        fetchApi: cityApis.fetch,
        createApi: cityApis.create,
        updateApi: (data: any) => {
          return cityApis.update(data);
        },
        deleteApi: (id: Array<number>) =>
          cityApis.delete(id),
      }}
      optionRender={optionRender}
    />
  );
};

export default CitiesPage;
