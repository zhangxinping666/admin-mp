import { CRUDPageTemplate } from "@/shared";
import { TableActions } from "@/shared/components/TableActions";
import { addFormColumns, editFormColumns, SearchConfig, tableColumns, applicationFormColumns, type Draft, Application } from "./model";
import { useUserStore } from "@/stores/user";
import { checkPermission } from "@/utils/permissions";
import { Key } from "react";
import useGroupedCityOptions from "@/shared/hooks/useGroupedCityOptions";
import {
  getSchoolCarouselList,
  getCityCarousel,
  createSchoolCarousel,
  deleteSchoolCarousel,
  updateSchoolCarousel,
  reviewCityCarousel
} from "./apis";
import useSchoolOptions from "@/shared/hooks/useSchoolOptions";
import { Space } from "antd";



// 模拟API函数 - 实际使用时需要替换为真实的API调用
const mockFetchApi = async (params: any) => {
  // 模拟数据
  const mockData: Draft[] = [
    {
      id: 1,
      title: "首页轮播图",
      status: 1,
      status_text: "草稿",
      applied_by_role: "super_admin",
      is_proxy_apply: false,
      priority: 1,
      is_pinned: true,
      is_hidden: false,
      jump_type: "page",
      start_time: "2024-01-01 00:00:00",
      end_time: "2024-12-31 23:59:59",
      created_at: "2024-01-01 10:00:00",
      updated_at: "2024-01-01 10:00:00",
      apply_description: "首页轮播图申请",
      description: "首页轮播图描述",
      image_url: "https://example.com/image.jpg",
      jump_app_id: "",
      jump_value: "/home",
      school_id: 0,
      school_leader_id: 0,
    }
  ];

  return {
    data: {
      list: mockData,
      total: mockData.length,
      page: params.page || 1,
      page_size: params.page_size || 10,
    }
  };
};

const mockUpdateApi = async (data: Draft) => {
  return { code: 200, message: "更新成功" };
};

const mockDeleteApi = async (ids: Key[]) => {
  return { code: 200, message: "删除成功" };
};

export default function slideshowManage() {
  const { permissions, getRoleId, userInfo } = useUserStore();
  let searchConfig = SearchConfig();
  let addFormConfig = addFormColumns();
  const locationOptions = useGroupedCityOptions();
  const { schoolOptions } = useSchoolOptions();
  const addOptions = useGroupedCityOptions();
  // 修改编辑菜单
  const [formConfig, setFormConfig] = useState(editFormColumns());
  const [isRequired, setIsRequired] = useState(false);
  const hasPermission = (permission: string) => checkPermission(permission, permissions);
  // 2:超级管理员 4:学校团长 5:城市运营商
  const role_id = getRoleId() || 0;



  // 初始化搜索,新增,编辑配置
  if (hasPermission('mp:slideshow:select-city-school')) {
    searchConfig = [
      {
        label: "地区",
        name: "province_id",
        component: "Select",
        componentProps: (form) => ({
          placeholder: "请选择省份",
          options: locationOptions.provinceOptions,
          onChange: (value: string) => {
            locationOptions.loadCities(value);
            form.setFieldsValue({ city_id: undefined, school_id: undefined });
            form.validateFields(['city_id', 'school_id']);
          },
        }),
      },
      {
        label: "",
        name: "city_id",
        component: "Select",
        componentProps: (form) => ({
          placeholder: "请选择城市",
          options: locationOptions.cityOptions,
          disabled: locationOptions.cityOptions.length === 0,
          onChange: (value: string) => {
            locationOptions.loadSchools(value);
            form.setFieldsValue({ school_id: undefined });
            form.validateFields(['school_id']);
          },
        }),
      },
      {
        label: "",
        name: "school_id",
        component: "Select",
        componentProps: {
          placeholder: "请选择学校",
          options: locationOptions.schoolOptions,
          disabled: locationOptions.schoolOptions.length === 0,
        },
      },
      ...searchConfig
    ]
    addFormConfig = [
      {
        label: '学校',
        name: 'school_id',
        component: 'Select',
        rules: FORM_REQUIRED,
        componentProps: (form) => {
          form.setFieldsValue({ school_id: undefined });
          return {
            placeholder: '请选择学校',
            options: schoolOptions,
          }
        },
      },
      {
        label: '状态',
        name: 'status',
        component: 'Select',
        rules: FORM_REQUIRED,
        componentProps: () => ({
          placeholder: '请选择状态',
          options: [{
            label: '草稿',
            value: 1,
          },
          {
            label: '待审',
            value: 2,
          },
          {
            label: '已审',
            value: 3
          },
          {
            label: '拒绝',
            value: 4
          },
          {
            label: '展示中',
            value: 5,
          },
          {
            label: '已过期',
            value: 6
          },
          {
            label: '已展示',
            value: 7
          }
          ],
          onChange: (value: number) => {
            if (value !== 1) {
              setIsRequired(true);
            } else {
              setIsRequired(false);
            }
          }
        }),
      },
      ...addFormColumns(isRequired)
    ]

  } else if (hasPermission('mp:slideshow:select-school')) {
    locationOptions.loadSchools(userInfo?.city_id || '');
    addOptions.loadSchools(userInfo?.city_id || '');
    searchConfig = [
      {
        label: "请选择学校",
        name: "school_id",
        component: "Select",
        componentProps: {
          placeholder: "请选择学校",
          options: locationOptions.schoolOptions,
        },
      },
      ...searchConfig,
    ]
    addFormConfig = [
      {
        label: '学校',
        name: 'school_id',
        component: 'Select',
        rules: FORM_REQUIRED,
        componentProps: (form) => {
          form?.setFieldsValue({ school_id: undefined });
          return {
            placeholder: '请选择学校',
            options: addOptions.schoolOptions,
          }
        },
      },
      {
        label: '状态',
        name: 'status',
        component: 'Select',
        rules: FORM_REQUIRED,
        componentProps: () => ({
          placeholder: '请选择状态',
          options: [{
            label: '草稿',
            value: 1,
          },
          {
            label: '待审',
            value: 2,
          },
          {
            label: '已审',
            value: 3
          },
          {
            label: '拒绝',
            value: 4
          },
          {
            label: '展示中',
            value: 5,
          },
          {
            label: '已过期',
            value: 6
          },
          {
            label: '已展示',
            value: 7
          }
          ],
          onChange: (value: number) => {
            if (value !== 1) {
              setIsRequired(true);
            } else {
              setIsRequired(false);
            }
          }
        }),
      },
      ...addFormColumns(isRequired)
    ]
  } else {
    searchConfig = SearchConfig();
    addFormConfig = addFormColumns()
  }


  // 新增接口
  const createApi = async (data: Draft) => {
    return createSchoolCarousel(data);
  };

  // 获取列表接口
  const fetchApi = async (param: any) => {
    if (role_id === '4') {
      return getSchoolCarouselList(param);
    } else if (role_id === '5') {
      return getCityCarousel(param);
    } else if (role_id === '2') {
      return mockFetchApi(param);
    }
  };

  // 更新接口
  const updateApi = async (data: Draft & Application) => {
    if (data.action) {
      return reviewCityCarousel(data);
    }
    return updateSchoolCarousel(data);
  };

  // 删除接口
  const deleteApi = async (ids: Key[]) => {
    return deleteSchoolCarousel(ids);
  };

  // 操作列渲染
  const optionRender = (record: Draft, actions: { handleDelete?: (id: Key[]) => void; handleEdit: (record: Draft) => void; }) => {
    return (
      <>
        <Space size={20}>
          {hasPermission('mp:slideshow:application') && <TableActions
            record={record}
            onEdit={() => {
              setFormConfig(applicationFormColumns());
              actions.handleEdit(record)
            }}
            editText="审批"
          ></TableActions>}
          <TableActions
            record={record}
            onDelete={actions.handleDelete}
            onEdit={() => {
              setFormConfig(editFormColumns());
              actions.handleEdit(record)
            }}
            editText="编辑"

          />
        </Space>

      </>

    );
  };

  return (
    <CRUDPageTemplate
      title="轮播图草稿管理"
      isDelete={true}
      searchConfig={searchConfig} // 传入城市选项和学校选项
      columns={tableColumns}
      addFormConfig={addFormConfig} // 表单配置需要根据实际需求定义
      formConfig={formConfig}
      initCreate={{
        title: "",
        status: 1,
        applied_by_role: "super_admin",
        is_proxy_apply: false,
        priority: 1,
        is_pinned: false,
        is_hidden: false,
        jump_type: undefined,
        start_time: "",
        end_time: "",
        apply_description: "",
        description: "",
        image_url: "",
        jump_app_id: "",
        jump_value: "",
        school_id: 0,
        school_leader_id: 0,
      }}
      disableCreate={hasPermission('mp:slideshow:draft:add')}
      disableBatchDelete={hasPermission('mp:slideshow:draft:delete')}
      apis={{
        fetchApi: fetchApi,
        createApi: createApi,
        updateApi: updateApi,
        deleteApi: deleteApi,
      }}
      optionRender={optionRender}
    />
  );
}