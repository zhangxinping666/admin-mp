import { CRUDPageTemplate } from "@/shared";
import { cancelApplicationFormColumns, configFormColumns, addFormColumns, editFormColumns, SearchConfig, tableColumns, applicationFormColumns, approveFormColumns, type Draft, Application } from "./model"
import { useUserStore } from "@/stores/user";
import { checkPermission } from "@/utils/permissions";
import { Key } from "react";
import useGroupedCityOptions from "@/shared/hooks/useGroupedCityOptions";
import {
  getCarouselList,
  createCarousel,
  deleteCarousel,
  updateCarousel,
  reviewCityCarousel,
  applySchoolCarousel,
  toggleCarousel,
  cancelApplySchoolCarousel,
} from "./apis";
import useSchoolOptions from "@/shared/hooks/useSchoolOptions";
import { Space } from "antd";
import useRequireMap from "@/shared/hooks/useRequireMap";



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
  console.log("更新轮播图草稿:", data);
  return { code: 200, message: "更新成功" };
};

const mockDeleteApi = async (ids: Key[]) => {
  console.log("删除轮播图草稿:", ids);
  return { code: 200, message: "删除成功" };
};

export default function slideshowManage() {
  const { permissions, getRoleId, userInfo } = useUserStore();
  let searchConfig = SearchConfig();
  let addFormConfig = addFormColumns();
  let editFormConfig = editFormColumns();
  let applicationFormConfig = applicationFormColumns();
  const locationOptions = useGroupedCityOptions();
  const { schoolOptions } = useSchoolOptions();
  const { schoolOptions: citySchoolOptions } = useSchoolOptions(userInfo?.city_id);
  const addOptions = useGroupedCityOptions();

  const hasPermission = (permission: string) => checkPermission(permission, permissions);
  // 2:超级管理员 4:学校团长 5:城市运营商
  const role_id = getRoleId() || 0;

  // 状态管理
  const [isReviewCommentRequired, setIsReviewCommentRequired] = useState(false);
  const [isProxyApplyRequired, setIsProxyApplyRequired] = useState(false);
  const [isEditRequired, setIsEditRequired] = useRequireMap(editFormConfig);
  const [isAddRequired, setIsAddRequired] = useRequireMap(addFormConfig);
  const [isApplicationRequired, setIsApplicationRequired] = useRequireMap(applicationFormColumns());

  const statusOptions = [
    {
      label: '草稿',
      value: 1,
    },
    {
      label: '待审核',
      value: 2,
    },
    {
      label: '已通过',
      value: 3,
    },
  ]
  // 修改编辑菜单
  const [isApprove, setIsApprove] = useState(false);
  const [isApplication, setIsApplication] = useState(false);
  const [isConfig, setIsConfig] = useState(false);
  const [isCancelApplication, setIsCancelApplication] = useState(false);
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
            console.log('搜索省份选择', form);
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
          return {
            placeholder: '请选择学校',
            options: schoolOptions,
          }
        },
      },
      ...addFormColumns(isAddRequired, setIsAddRequired, statusOptions),
      {
        label: '代申请',
        name: 'is_proxy_apply',
        component: 'Switch',
        rules: FORM_REQUIRED,
        componentProps: (form) => ({
          defaultValue: true,
          value: form.getFieldValue('status') !== 1,
          disabled: true,
          onChange: (value: boolean) => {
            setIsProxyApplyRequired(value);
          }
        })
      },
      {
        label: '代申请理由',
        name: 'proxy_apply_reason',
        component: 'TextArea',
        rules: isProxyApplyRequired ? FORM_REQUIRED : [],
        componentProps: {
          placeholder: '请输入代申请理由',
        }
      },
      {
        label: '审批意见',
        name: 'review_comment',
        component: 'TextArea',
        rules: isReviewCommentRequired ? FORM_REQUIRED : [],
        componentProps: {
          placeholder: '请输入审批意见',
        }
      }
    ]
    applicationFormConfig = [
      ...applicationFormColumns(isApplicationRequired, setIsApplicationRequired, { schoolOptions: schoolOptions }),
      {
        label: '代申请',
        name: 'is_proxy_apply',
        component: 'Switch',
        rules: FORM_REQUIRED,
        componentProps: (form) => {
          form.setFieldsValue({ is_proxy_apply: true });
          return {
            placeholder: '请选择代申请',
            disabled: true,
          }
        },
      },
      {
        label: '代申请的学校',
        name: 'target_school_id',
        component: 'Select',
        rules: FORM_REQUIRED,
        componentProps: {
          placeholder: '请选择申请的学校',
          options: schoolOptions || [],
        },
      },
      {
        label: '代申请原因',
        name: 'proxy_apply_reason',
        component: 'TextArea',
        rules: FORM_REQUIRED,
        componentProps: {
          placeholder: '请输入代申请原因',
        },
      },
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
          return {
            placeholder: '请选择学校',
            options: addOptions.schoolOptions,
            onChange: (value: string) => {
              console.log('选择学校', value);
            },
          }
        },
      },
      ...addFormColumns(isAddRequired, setIsAddRequired, statusOptions,),
      {
        label: '代申请',
        name: 'is_proxy_apply',
        component: 'Switch',
        rules: FORM_REQUIRED,
        componentProps: (form) => ({
          defaultValue: true,
          value: form.getFieldValue('status') !== 1,
          disabled: true
        })
      },
      {
        label: '代申请理由',
        name: 'proxy_apply_reason',
        component: 'TextArea',
        rules: FORM_REQUIRED,
        componentProps: {
          placeholder: '请输入代申请理由',
        }
      },
      {
        label: '审批意见',
        name: 'review_comment',
        component: 'TextArea',
        rules: isReviewCommentRequired ? FORM_REQUIRED : [],
        componentProps: {
          placeholder: '请输入审批意见',
        }
      }
    ]
    applicationFormConfig = [
      ...applicationFormColumns(isApplicationRequired, setIsApplicationRequired, { schoolOptions: schoolOptions }),
      {
        label: '代申请',
        name: 'apply_comment',
        component: 'Switch',
        rules: FORM_REQUIRED,
        componentProps: {
          placeholder: '请选择代申请',
          disabled: true,
          value: true,
          defaultValue: true,
        },
      },
      {
        label: '代申请的学校',
        name: 'apply_school_id',
        component: 'Select',
        rules: FORM_REQUIRED,
        componentProps: {
          placeholder: '请选择申请的学校',
          options: citySchoolOptions || [],
        },
      },
      {
        label: '代申请原因',
        name: 'proxy_apply_reason',
        component: 'TextArea',
        componentProps: {
          placeholder: '请输入代申请原因',
        },
      },
    ]
  } else {
    searchConfig = SearchConfig();
    addFormConfig = addFormColumns(isAddRequired, setIsAddRequired);
  }


  // 新增接口
  const createApi = async (data: Draft) => {
    return createCarousel(data );
  };

  // 获取列表接口
  const fetchApi = async (params: any) => {
    return getCarouselList(params );
  };

  // 更新接口
  const updateApi = async (data: Draft & Application) => {
    if (isApprove) {
      return reviewCityCarousel(data);
    }
    if (isApplication) {
      return applySchoolCarousel(data);
    }
    if (isConfig) {
      return toggleCarousel(data);
    }
    if (isCancelApplication) {
      return cancelApplySchoolCarousel(data);
    }
    return updateCarousel(data);
  };

  // 删除接口
  const deleteApi = async (ids: Key[]) => {
    return deleteCarousel({ id_list: ids });
  };

  // 操作列渲染
  const optionRender = (record: Draft, actions: { handleDelete?: (id: Key[]) => void; handleEdit: (record: Draft) => void; }) => {
    return (
      <>
        <Space size={20}>
          {(hasPermission('mp:slideshow:application') && String(record.status_text) === '待审核') && <BaseBtn
            onClick={() => {
              setIsApprove(true);
              setIsApplication(false);
              setIsConfig(false);
              actions.handleEdit(record);
            }}
            type="primary"
          >审批</BaseBtn>}
          {
            String(record.status_text) === '待审核' && <BaseBtn
              onClick={() => {
                setIsCancelApplication(true);
                setIsApplication(false);
                setIsApprove(false);
                setIsConfig(false);
                actions.handleEdit(record);
              }}
            >
              取消申请
            </BaseBtn>}
          {(String(record.status_text) === "草稿" || String(record.status_text) === "已拒绝") &&
            <BaseBtn onClick={() => {
              setIsApplication(true);
              setIsConfig(false);
              setIsApprove(false);
              actions.handleEdit(record);
            }}>
              申请
            </BaseBtn>}
          {String(record.status_text) === '草稿' && <BaseBtn
            onClick={() => {
              setIsApplication(false);
              setIsApprove(false);
              setIsConfig(false);
              actions.handleEdit(record);
            }}
            type="primary"
          >更新</BaseBtn>}
          {
            (hasPermission('mp:slideshow:select-city-school') || hasPermission('mp:slideshow:select-school')) && <BaseBtn
              onClick={() => {
                setIsConfig(true);
                setIsApplication(false);
                setIsApprove(false);
                actions.handleEdit(record);
              }}
              type="primary"
            >配置轮播</BaseBtn>}
          {(String(record.status_text) === '草稿' || String(record.status_text) === '已拒绝') && <BaseBtn
            onClick={() => {
              actions.handleDelete?.([record.id]);
            }}
            danger
          >删除</BaseBtn>}
        </Space >

      </>

    );
  };

  return (
    <>
      <CRUDPageTemplate
        title="轮播图草稿管理"
        isDelete={true}
        searchConfig={searchConfig} // 传入城市选项和学校选项
        columns={tableColumns}
        addFormConfig={addFormConfig} // 表单配置需要根据实际需求定义
        formConfig={isConfig ? configFormColumns() : isApplication ? applicationFormConfig : isApprove ? approveFormColumns() : isCancelApplication ? cancelApplicationFormColumns() : editFormColumns(isEditRequired, setIsEditRequired)}
        initCreate={{
          title: "",
          status: 1,
          applied_by_role: "super_admin",
          priority: 1,
          is_pinned: false,
          is_hidden: false,
          jump_type: 'none',
          start_time: "",
          end_time: "",
          apply_description: "",
          description: "",
          image_url: "",
          jump_app_id: "",
          jump_value: "",
          school_id: undefined,
          school_leader_id: undefined,
          is_proxy_apply: false,
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
    </>

  );
}