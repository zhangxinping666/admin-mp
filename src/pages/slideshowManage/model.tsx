import { BaseFormList, BaseSearchList } from "#/form";
import { Image } from "antd";

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
          label: "下架",
          value: 6,
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
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: '图片',
    dataIndex: 'image_url',
    key: 'image_url',
    ellipsis: true,
    render: (value: string) => {
      return <Image src={value} alt={'轮播图图片'} style={{ width: '100px', height: '100px' }} onError={() => <div>图片加载失败</div>} />
    }
  },
  {
    title: '状态',
    dataIndex: 'status_text',
    key: 'status_text',
  },
  {
    title: '学校',
    dataIndex: 'school_name',
    key: 'school_name',
    ellipsis: true,
  },
  {
    title: '学校团长',
    dataIndex: 'leader_name',
    key: 'leader_name',
    ellipsis: true,
  },
  {
    title: '发起角色',
    dataIndex: 'applied_by_role',
    key: 'applied_by_role',
  },
  {
    title: '是否代申请',
    dataIndex: 'is_proxy_apply',
    key: 'is_proxy_apply',
    render: (value: boolean) => value ? '是' : '否',
  },
  {
    title: '代申请人',
    dataIndex: 'applied_by_role',
    key: 'applied_by_role',
  },
  {
    title: '代申请理由',
    dataIndex: 'proxy_apply_reason',
    key: 'proxy_apply_reason',
    ellipsis: true,
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
  },
  {
    title: '是否置顶',
    dataIndex: 'is_pinned',
    key: 'is_pinned',
    render: (value: boolean) => value ? '是' : '否',
  },
  {
    title: '是否隐藏',
    dataIndex: 'is_hidden',
    key: 'is_hidden',
    render: (value: boolean) => value ? '是' : '否',
  },
  {
    title: '跳转类型',
    dataIndex: 'jump_type',
    key: 'jump_type',
  },
  {
    title: '跳转链接',
    dataIndex: 'jump_value',
    key: 'jump_value',
    ellipsis: true,
    render: (value: string) => {
      if (value.startsWith('http')) {
        return <a href={value} target="_blank" rel="noopener noreferrer">{value}</a>
      }
      return value ? value : '-'
    }
  },
  {
    title: '小程序appid',
    dataIndex: 'jump_app_id',
    key: 'jump_app_id',
    ellipsis: true,
    render: (value: string) => value ? value : '-',
  },
  {
    title: '审查理由',
    dataIndex: 'review_comment',
    key: 'review_comment',
    ellipsis: true,
  },
  {
    title: '开始时间',
    dataIndex: 'start_time',
    key: 'start_time',
  },
  {
    title: '结束时间',
    dataIndex: 'end_time',
    key: 'end_time',
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
  },
  {
    title: '更新时间',
    dataIndex: 'updated_at',
    key: 'updated_at',
  },
]

export const addFormColumns = (isRequired?: any, setIsRequired?: any, statusOption?: any): BaseFormList[] => {
  return [
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
      label: '状态',
      name: 'status',
      component: 'Select',
      rules: FORM_REQUIRED,
      componentProps: (form) => ({
        placeholder: '请选择状态',
        options: statusOption || [
          {
            label: '草稿',
            value: 1,
          },
          {
            label: '待审核',
            value: 2,
          }
        ],
        onChange: (value: number) => {
          const newRequired = { ...isRequired };
          switch (value) {
            case 1:
              newRequired['start_time'] = false
              newRequired['end_time'] = false
              newRequired['review_comment'] = false
              form.setFieldValue('is_proxy_apply', false)
              break;
            case 2:
              newRequired['start_time'] = true
              newRequired['end_time'] = true
              newRequired['review_comment'] = false
              form.setFieldValue('is_proxy_apply', true)
              break;
            case 3:
              newRequired['start_time'] = true
              newRequired['end_time'] = true
              newRequired['review_comment'] = true
              form.setFieldValue('is_proxy_apply', true)
              break;
          }
          setIsRequired(newRequired);
        }
      }),
    },
    {
      label: '跳转类型',
      name: 'jump_type',
      component: 'Select',
      rules: FORM_REQUIRED,
      componentProps: (form) => ({
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
        onChange: (value: string) => {
          const newRequired = { ...isRequired };
          if (value === 'miniprogram') {
            newRequired['jump_app_id'] = true
            newRequired['jump_link'] = false
          } else if (value === 'h5') {
            newRequired['jump_app_id'] = false
            newRequired['jump_link'] = true
          } else if (value === 'none') {
            newRequired['jump_app_id'] = false
            newRequired['jump_link'] = false
          }
          setIsRequired(newRequired);
        }
      })
    },
    {
      label: '跳转地址',
      name: 'jump_link',
      component: 'Input',
      rules: isRequired?.['jump_link'] ? FORM_REQUIRED : [],
      componentProps: {
        placeholder: '请输入跳转地址',
      },
    },
    {
      label: '小程序appid',
      name: 'jump_app_id',
      component: 'Input',
      rules: isRequired?.['jump_app_id'] ? FORM_REQUIRED : [],
      componentProps: {
        placeholder: '请输入小程序appid',
      },
    },
    {
      label: '开始展示时间',
      name: 'start_time',
      component: 'DatePicker',
      rules: isRequired?.['start_time'] ? FORM_REQUIRED : [],
      componentProps: {
        placeholder: '请选择开始展示时间',
        type: 'datetime',
        format: 'YYYY-MM-DD HH:mm:ss',
      }
    },
    {
      label: '结束展示时间',
      name: 'end_time',
      component: 'DatePicker',
      rules: isRequired?.['end_time'] ? FORM_REQUIRED : [],
      componentProps: {
        placeholder: '请选择结束展示时间',
        type: 'datetime',
        format: 'YYYY-MM-DD HH:mm:ss',
      }
    },
    {
      label: '申请说明',
      name: 'apply_comment',
      component: 'TextArea',
      rules: isRequired?.['apply_comment'] ? FORM_REQUIRED : [],
      componentProps: {
        placeholder: '请输入申请说明',
      }
    },
  ]
}

export const editFormColumns = (isRequired?: any, setIsRequired?: any): BaseFormList[] => [
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
    rules: FORM_REQUIRED,
    componentProps: (form) => ({
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
      onChange: (value: string) => {
        const newRequired = { ...isRequired }
        if (value === 'miniprogram') {
          newRequired['jump_app_id'] = true
          newRequired['jump_link'] = false
        } else if (value === 'h5') {
          newRequired['jump_app_id'] = false
          newRequired['jump_link'] = true
        } else if (value === 'none') {
          newRequired['jump_app_id'] = false
          newRequired['jump_link'] = false
        }
        setIsRequired(newRequired)

      }
    })
  },
  {
    label: '跳转地址',
    name: 'jump_link',
    component: 'Input',
    rules: isRequired?.['jump_link'] ? FORM_REQUIRED : [],
    componentProps: {
      placeholder: '请输入跳转地址',
    },
  },
  {
    label: '小程序appid',
    name: 'jump_app_id',
    rules: isRequired?.['jump_app_id'] ? FORM_REQUIRED : [],
    component: 'Input',
    componentProps: {
      placeholder: '请输入小程序appid',
    },
  },
  {
    label: '开始展示时间',
    name: 'start_time',
    component: 'DatePicker',
    componentProps: {
      placeholder: '请选择开始展示时间',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm:ss',
    }
  },
  {
    label: '结束展示时间',
    name: 'end_time',
    component: 'DatePicker',
    componentProps: {
      placeholder: '请选择结束展示时间',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm:ss',
    }
  },
]

export const applicationFormColumns: (isRequired?: any, setIsRequired?: any, options?: any) => BaseFormList[] = (isRequired?: any, setIsRequired?: any, options?: any) => [
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
    label: '申请描述',
    name: 'apply_description',
    component: 'TextArea',
    componentProps: {
      placeholder: '请输入申请描述',
    },
  },
  {
    label: '开始展示时间',
    name: 'start_time',
    component: 'DatePicker',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请选择开始展示时间',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm:ss',
    }
  },
  {
    label: '结束展示时间',
    name: 'end_time',
    component: 'DatePicker',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请选择结束展示时间',
      type: 'datetime',
      format: 'YYYY-MM-DD HH:mm:ss',
    }
  },
]

export const approveFormColumns: () => BaseFormList[] = () => [
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
    rules: FORM_REQUIRED,
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

export const configFormColumns: (isRequired?: any, setIsRequired?: any, options?: any) => BaseFormList[] = (isRequired?: any, setIsRequired?: any, options?: any) => [
  {
    label: '轮播图ID',
    name: 'id',
    component: 'Select',
    rules: FORM_REQUIRED,
    componentProps: {
      disabled: true,
      placeholder: '请选择轮播图ID',
    },
  },
  {
    label: '置顶',
    name: 'is_pinned',
    component: 'Switch',
    componentProps: {
      placeholder: '请选择是否置顶',
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
      defaultValue: 100,
    },
  },
  {
    label: '是否隐藏',
    name: 'is_hidden',
    component: 'Switch',
    componentProps: {
      placeholder: '请选择是否隐藏',
    },
  },
]

export const cancelApplicationFormColumns: () => BaseFormList[] = () => [
  {
    label: 'ID',
    name: 'id',
    component: 'Input',
    rules: FORM_REQUIRED,
    componentProps: {
      disabled: true,
    },
  }
]