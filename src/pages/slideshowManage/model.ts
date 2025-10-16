import { BaseFormList, BaseSearchList } from "#/form";
import { FieldConfig } from "@/shared/components/DetailModal";

export interface Draft {
  /**
   * 发起申请的角色
   */
  applied_by_role: string;
  /**
   * 申请详情
   */
  apply_description: string;
  created_at: string;
  /**
   * 描述，可能返回空值
   */
  description: string;
  /**
   * 结束展示时间，管理员申请时定的
   */
  end_time: string;
  id: number;
  /**
   * 图片url，前端传给后端的
   */
  image_url: string;
  /**
   * 是否隐藏
   */
  is_hidden: boolean;
  /**
   * 是否置顶
   */
  is_pinned: boolean;
  /**
   * 是否为“代申请”，城市管理员替团长申请时，为true
   */
  is_proxy_apply: boolean;
  /**
   * 小程序appid，跳转时使用
   */
  jump_app_id: string;
  /**
   * 跳转类型
   */
  jump_type: string;
  /**
   * 链接
   */
  jump_value: string;
  /**
   * 优先级
   */
  priority: number;
  /**
   * 团长
   */
  school_id: number;
  /**
   * 团长ID
   */
  school_leader_id: number;
  /**
   * 开始展示时间，管理员申请时定的
   */
  start_time: string;
  /**
   * 状态，    CarouselStatusDraft      = "DRAFT"      // 草稿
   * CarouselStatusPending    = "PENDING"    // 待审核
   * CarouselStatusApproved   = "APPROVED"   // 已通过
   * CarouselStatusRejected   = "REJECTED"   // 已拒绝
   * CarouselStatusDisplaying = "DISPLAYING" // 展示中
   * CarouselStatusExpired    = "EXPIRED"    // 已过期  -- 还没来的及展示，就已经过期
   * CarouselStatusDisplayed  = "DISPLAYED"  // 已展示过 -- 在轮播图展示中过期的
   */
  status: number;
  /**
   * 状态的中文解释
   */
  status_text: string;
  /**
   * 标题
   */
  title: string;
  updated_at: string;
}

export interface Application {
  id: number;
  action: string;
  comment?: string;
  priority?: number;
}

export interface SearchParams {
  /**
   * 发起申请的角色（可选枚举： leader-团长 、 city_admin 、 super_admin ）
   */
  applied_by_role?: string;
  /**
   * 城市范围筛选
   */
  city_id?: number;
  /**
   * 结束时间范围，格式 YYYY-MM-DD HH:mm:ss
   */
  end_time?: string;
  /**
   * 是否代申请筛选
   */
  is_proxy_apply?: boolean;
  /**
   * 默认 1
   */
  page?: number;
  /**
   * 每页数量，默认 10
   */
  page_size?: number;
  /**
   * 学校范围筛选
   */
  school_id?: string;
  /**
   * 开始时间范围，格式 YYYY-MM-DD HH:mm:ss
   */
  start_time?: string;
  /**
   * - 1 ：草稿（Draft）
   * - 2 ：待审（Pending）
   * - 3 ：已审（Approved）
   * - 4 ：拒绝（Rejected）
   * - 5 ：展示中（Displaying）
   * - 6 ：已过期（Expired）
   * - 7 ：已展示（Displayed）
   */
  status?: number;
  /**
   * 标题模糊匹配
   */
  title?: string;
}

export const SearchConfig = (): BaseSearchList[] => [
  {
    label: "发起申请的角色",
    name: "applied_by_role",
    component: "Select",
    componentProps: {
      placeholder: "请选择发起申请的角色",
      options: [
        {
          label: "团长",
          value: "leader",
        },
        {
          label: "城市管理员",
          value: "city_admin",
        },
        {
          label: "超级管理员",
          value: "super_admin",
        },
      ],
    },
  },
  {
    label: "状态",
    name: "status",
    component: "Select",
    componentProps: {
      placeholder: "请选择状态",
      options: [
        {
          label: "草稿",
          value: 1,
        },
        {
          label: "待审",
          value: 2,
        },
        {
          label: "已审",
          value: 3,
        },
        {
          label: "拒绝",
          value: 4,
        },
        {
          label: "展示中",
          value: 5,
        },
        {
          label: "已过期",
          value: 6,
        },
        {
          label: "已展示",
          value: 7,
        },
      ],
    },
  },
  {
    label: "标题模糊匹配",
    name: "title",
    component: "Input",
    componentProps: {
      placeholder: "请输入标题",
    }
  },
  {
    label: "是否代申请筛选",
    name: "is_proxy_apply",
    component: "Select",
    componentProps: {
      placeholder: "请选择是否代申请",
      options: [
        {
          label: "全部",
          value: "",
        },
        {
          label: "是",
          value: "true",
        },
        {
          label: "否",
          value: "false",
        },
      ],
    },
  },
  {
    label: "开始时间范围",
    name: "start_time",
    component: "DatePicker",
    componentProps: {
      type: "daterange",
      format: "YYYY-MM-DD HH:mm:ss",
    }
  },
  {
    label: "结束时间范围",
    name: "end_time",
    component: "DatePicker",
    componentProps: {
      type: "daterange",
      format: "YYYY-MM-DD HH:mm:ss",
    }
  },
]

export const tableColumns: TableColumn[] = [
  {
    title: '标题',
    dataIndex: 'title',
    key: 'title',
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'status_text',
    key: 'status_text',
    width: 100,
  },
  {
    title: '发起角色',
    dataIndex: 'applied_by_role',
    key: 'applied_by_role',
    width: 120,
  },
  {
    title: '是否代申请',
    dataIndex: 'is_proxy_apply',
    key: 'is_proxy_apply',
    width: 100,
    render: (value: boolean) => value ? '是' : '否',
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 80,
  },
  {
    title: '是否置顶',
    dataIndex: 'is_pinned',
    key: 'is_pinned',
    width: 100,
    render: (value: boolean) => value ? '是' : '否',
  },
  {
    title: '是否隐藏',
    dataIndex: 'is_hidden',
    key: 'is_hidden',
    width: 100,
    render: (value: boolean) => value ? '是' : '否',
  },
  {
    title: '跳转类型',
    dataIndex: 'jump_type',
    key: 'jump_type',
    width: 120,
  },
  {
    title: '开始时间',
    dataIndex: 'start_time',
    key: 'start_time',
    width: 180,
  },
  {
    title: '结束时间',
    dataIndex: 'end_time',
    key: 'end_time',
    width: 180,
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180,
  },
  {
    title: '更新时间',
    dataIndex: 'updated_at',
    key: 'updated_at',
    width: 180,
  },
]

export const addFormColumns = (isRequired?: boolean): BaseFormList[] => [
  {
    label: '标题',
    name: 'title',
    component: 'Input',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请输入标题',
    },
  },
  {
    label: "描述",
    name: 'description',
    component: 'Input',
    componentProps: {
      placeholder: '请输入描述',
    },
  },
  {
    label: '图片地址',
    name: 'image_url',
    component: 'Input',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请输入图片地址',
    },
  },
  {
    label: '跳转类型',
    name: 'jump_type',
    component: 'Select',
    rules: isRequired ? FORM_REQUIRED : [],
    componentProps: {
      placeholder: '请选择跳转类型',
      options: [
        {
          label: 'h5',
          value: 'h5',
        },
        {
          label: 'miniprogram',
          value: 'miniprogram',
        },
        {
          label: 'none',
          value: 'none',
        },
      ],
    },
  },
  {
    label: '跳转地址',
    name: 'jump_link',
    component: 'Input',
    rules: isRequired ? FORM_REQUIRED : [],
    componentProps: {
      placeholder: '请输入跳转地址',
    },
  },
  {
    label: '小程序appid',
    name: 'jump_app_id',
    component: 'Input',
    rules: isRequired ? FORM_REQUIRED : [],
    componentProps: {
      placeholder: '请输入小程序appid',
    },
  }
]

export const editFormColumns: () => BaseFormList[] = () => [
  {
    label: 'ID',
    name: 'id',
    component: 'Input',
    rules: FORM_REQUIRED,
    componentProps: {
      disabled: true,
    },
  },
  ...addFormColumns(),
]

export const applicationFormColumns: () => BaseFormList[] = () => [
  {
    label: 'ID',
    name: 'id',
    component: 'Input',
    rules: FORM_REQUIRED,
    componentProps: {
      disabled: true,
    },
  },
  {
    label: '操作',
    name: 'action',
    component: 'Select',
    componentProps: {
      placeholder: '请选择操作',
      options: [
        {
          label: '通过',
          value: 'approve',
        },
        {
          label: '拒绝',
          value: 'reject',
        },
      ],
    },
  },
  {
    label: '审批意见',
    name: 'comment',
    component: 'TextArea',
    componentProps: {
      placeholder: '请输入审批意见',
    },
  },
  {
    label: '优先级',
    name: 'priority',
    component: 'InputNumber',
    componentProps: {
      placeholder: '请选择优先级(1-1000)',
      max: 1000,
      min: 1,
    },
  }
]