import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type Colonel, useLocationOptions } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { getProvinceList, getCityName } from '@/servers/city';
import { getUserListByPage } from '@/servers/user';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import { Tooltip } from 'antd';

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
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const locationOptions = useLocationOptions();
  // 【新增】学校选择框的状态
  const [schoolOptions, setSchoolOptions] = useState<SchoolOption[]>([]);
  const [isSchoolLoading, setIsSchoolLoading] = useState(false);
  // 【新增】用户选择框的状态
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  // 检查权限的辅助函数
  const { permissions } = useUserStore();
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  // 【新增】加载用户数据
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

  // 【新增】当城市选择变化时，调用此函数获取学校列表
  const handleCityChange = async (cityId: string) => {
    if (!cityId) {
      setSchoolOptions([]); // 如果清空城市，则清空学校列表
      return;
    }
    setIsSchoolLoading(true);
    try {
      const response = await getSchoolListByCityId(cityId);
      const schools = response.data || [];

      const optionsToSet = schools.map((school: any) => ({
        label: school.name, // 再次确认这里的字段名是 name 还是 school_name
        value: school.id,
      }));

      // 【添加这行调试代码】

      setSchoolOptions(optionsToSet);
    } catch (error) {
      console.error('加载学校列表失败:', error);
      setSchoolOptions([]); // 出错时清空列表
    } finally {
      setIsSchoolLoading(false);
    }
  };
  const onEditOpenCallback = (record: any) => {
    // 检查这条记录中是否存在 city_id
    if (record.city_id) {
      // 调用您已经写好的 handleCityChange 来加载学校列表
      handleCityChange(record.city_id);
    }
  };
  const handleFormValuesChange = (changedValues: any, allValues: any, form: any) => {
    if ('city_id' in changedValues) {
      const newCityId = changedValues.city_id;
      handleCityChange(newCityId);

      // 确保 form 存在再调用
      if (form) {
        form.setFieldsValue({
          school_id: undefined,
        });
      }
    }
  };
  // 操作列渲染
  const optionRender = (
    record: Colonel,
    actions: {
      handleEdit: (record: Colonel) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:colonel:update');

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
      title="团长管理"
      searchConfig={searchList(locationOptions)}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList({
        groupedCityOptions,
        isLoadingOptions,
        schoolOptions,
        isSchoolLoading,
        userOptions,
        isLoadingUsers,
      })}
      initCreate={initCreate}
      disableCreate={!hasPermission('mp:colonel:add')}
      disableBatchDelete={!hasPermission('mp:colonel:delete')}
      apis={{
        fetchApi: colonelApis.fetch,
        createApi: colonelApis.create,
        updateApi: (data: any) => {
          // useCRUD传递的格式是 { id, ...values }
          return colonelApis.update(data);
        },
        deleteApi: (id: Array<number>) => colonelApis.delete(id),
      }}
      optionRender={optionRender}
      onFormValuesChange={(changedValues: any, allValues: any) => {
        if ('city_id' in changedValues) {
          const newCityId = changedValues.city_id;
          handleCityChange(newCityId);
        }
      }}
      onEditOpen={onEditOpenCallback}
    />
  );
}

export default ColleaguesPage;
