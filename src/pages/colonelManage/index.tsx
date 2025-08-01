import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type Colonel } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { getProvinceList, getCityName } from '@/servers/city';
import {
  getColonelList,
  addColonel,
  updateColonel,
  deleteColonel,
  getSchoolListByCityId,
} from '@/servers/colonel';
// 初始化新增数据
const initCreate: Partial<Colonel> = {
  id: 0,
  name: '',
  phone: '',
  password: '',
  city_id: 1, // 默认城市ID
  status: 1, // 默认状态
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

function ColleaguesPage() {
  const [groupedCityOptions, setGroupedCityOptions] = useState<GroupedOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  // 【新增】学校选择框的状态
  const [schoolOptions, setSchoolOptions] = useState<SchoolOption[]>([]);
  const [isSchoolLoading, setIsSchoolLoading] = useState(false);
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

  // 【新增】当城市选择变化时，调用此函数获取学校列表
  const handleCityChange = async (cityId: string) => {
    console.log(cityId);
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
      console.log('✅ 即将设置的学校选项 (schoolOptions):', optionsToSet);

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
      console.log(
        `编辑框已打开 (回调模式)，检测到 city_id: ${record.city_id}。正在加载学校列表...`,
      );
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
      handleDelete: (id: number) => void;
    },
  ) => <TableActions record={record} onEdit={actions.handleEdit} onDelete={actions.handleDelete} />;

  return (
    <CRUDPageTemplate
      title="团长管理"
      searchConfig={searchList()}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList({
        groupedCityOptions,
        isLoadingOptions,
        schoolOptions,
        isSchoolLoading,
      })}
      initCreate={initCreate}
      apis={{
        fetchApi: colonelApis.fetch,
        createApi: colonelApis.create,
        updateApi: (id: number, params: any) => {
          return colonelApis.update({ id, ...params });
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
