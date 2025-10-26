import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type Colonel, useLocationOptions } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { getCitiesByProvince } from '@/servers/trade-blotter/location';
import { getUserListByPage } from '@/servers/user';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import { Tooltip } from 'antd';
import { BaseBtn } from '@/components/Buttons';
import { UserSimple } from '../citysManage/model';

import {
  getColonelList,
  addColonel,
  updateColonel,
  deleteColonel,
  getSchoolListByCityId,
} from '@/servers/colonel';
// 初始化新增数据
// 初始化数据将在数据加载完成后动态设置
let initCreate: Partial<Colonel> = {
  id: 0,
  name: '',
  phone: '',
  password: '',
  city_id: undefined, // 将在数据加载后设置为第一个城市ID
  status: 1, // 默认状态
  school_id: undefined, // 将在数据加载后设置为第一个学校ID
  user_id: undefined, // 关联用户ID
};
const colonelApis = {
  fetch: getColonelList,
  create: addColonel,
  update: updateColonel,
  delete: deleteColonel,
};
interface GroupedOption {
  label: string; // 省份名
  options: { label: string; value: number }[]; // 该省份下的城市列表
}
interface SchoolOption {
  label: string;
  value: number;
}
interface UserOption {
  label: string;
  value: number;
}

function ColleaguesPage() {
  const [groupedCityOptions, setGroupedCityOptions] = useState<GroupedOption[]>([]);
  const locationOptions = useLocationOptions();
  const [schoolOptions, setSchoolOptions] = useState<SchoolOption[]>([]);
  const [isSchoolLoading, setIsSchoolLoading] = useState(false);
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [cityName, setCityName] = useState<string>('');
  const { permissions, userInfo } = useUserStore();
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  const fetchUserOptions = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await getUserListByPage();
      const Data = response as unknown as UserSimple
      if (Data && Data.code === 2000) {
        const users = Data.data || [];
        const userOptionsList = users.map((user: any) => ({
          label: user.username,
          value: user.id,
        }));
        setUserOptions(userOptionsList);
      } else if (response.data && response.data.code === 0) {
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

  // 加载用户数据
  useEffect(() => {
    fetchUserOptions();
  }, []);

  // 基于 locationOptions 构建分组的城市选项
  useEffect(() => {
    const buildGroupedCityOptions = async () => {
      const realProvinces = locationOptions.provinceOptions.filter(
        (p) => p.value !== '全部'
      );
      if (realProvinces.length === 0) {
        return;
      }

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

        // 如果是城市运营商，自动设置城市名称并加载学校
        if (userInfo?.role_id === 5 && userInfo?.city_id) {
          for (const province of finalOptions) {
            const city = province.options.find((c: any) => c.value === userInfo.city_id);
            console.log(city)
            if (city) {
              setCityName(city.city_name);
              handleCityChange(String(userInfo.city_id));
              break;
            }
          }
        }
      } catch (error) {
        console.error('加载分组城市选项失败:', error);
      }
    };

    buildGroupedCityOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationOptions.provinceOptions]);

  const handleCityChange = async (cityId: string) => {
    if (!cityId) {
      setSchoolOptions([]);
      return;
    }
    setIsSchoolLoading(true);
    try {
      const response = await getSchoolListByCityId(cityId);
      const schools = response.data || [];

      const optionsToSet = schools.map((school: any) => ({
        label: school.name,
        value: school.id,
      }));

      setSchoolOptions(optionsToSet);
    } catch (error) {
      setSchoolOptions([]);
    } finally {
      setIsSchoolLoading(false);
    }
  };
  const onEditOpenCallback = (record: any) => {
    if (record.city_id) {
      handleCityChange(record.city_id);
    }
  };
  const optionRender = (
    record: Colonel,
    actions: {
      handleEdit: (record: Colonel) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:colonel:update');
    return (
      <Tooltip title={!canEdit ? `${record.city_name}` : ''}>
        <BaseBtn onClick={() => canEdit && actions.handleEdit(record)} disabled={!canEdit}>
          编辑
        </BaseBtn>
      </Tooltip>
    );
  };

  return (

    <CRUDPageTemplate
      title="团长管理"
      isDelete={true}  // 添加这个属性
      searchConfig={searchList(locationOptions,
        userInfo || undefined)}
      columns={tableColumns.filter((col: any) =>
        col.dataIndex !== 'action')}
      formConfig={formList({
        groupedCityOptions,
        schoolOptions,
        isSchoolLoading,
        userOptions,
        isLoadingUsers,
        userInfo: userInfo || undefined,
        cityName,
      })}
      initCreate={userInfo?.role_id === 5 &&
        userInfo?.city_id
        ? {
          ...initCreate, city_id:
            userInfo.city_id
        }
        : initCreate}
      onEditOpen={onEditOpenCallback}
      disableCreate={!hasPermission('mp:colonel:add')}
      disableBatchDelete={!hasPermission('mp:colonel:delete ')}
      apis={{
        fetchApi: colonelApis.fetch,
        createApi: colonelApis.create,
        updateApi: (data: any) => {
          return colonelApis.update(data);
        },
        deleteApi: (id: Array<number>) =>
          colonelApis.delete(id),
      }}
      optionRender={optionRender}
      onFormValuesChange={(changedValues: any, allValues: any) => {
        // 监听城市选择变化，加载对应的学校列表
        if (changedValues.city_id !== undefined) {
          handleCityChange(String(changedValues.city_id));
        }
      }}
    />
  );
}

export default ColleaguesPage;
