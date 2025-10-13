import type { TFunction } from 'i18next';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED, PHONE_RULE } from '@/utils/config';
import LocationRenderer from '@/shared/components/LocationRenderer';
import dayjs from 'dayjs';
import { FieldConfig } from '@/shared/components/DetailModal';

// 商家入驻申请数据接口
export interface MerchantApplication {
  address?: string;
  amount?: number;
  apply_status?: number;
  category_id?: number;
  close_hour?: string;
  fee_description?: string;
  storefront_image?: string;
  business_license_image?: string;
  medical_certificate_image?: string;
  id: number;
  merchant_type?: string;
  name?: string;
  open_hour?: string;
  order_number?: string;
  pay_channel?: string;
  pay_status?: number;
  phone?: string;
  remark_image_path?: string;
  type?: string;
  [property: string]: any;
}

// 商家入驻申请列表接口
export interface MerchantApplicationList {
  items: MerchantApplication[];
  total: number;
}

// 商家入驻申请查询参数接口
export interface MerchantApplicationQuery {
  name?: string;
  phone?: string;
}

export const merchantOrderConfig: FieldConfig[] = [
  /* ===== 商户信息 ===== */
  { key: 'merchantDetail.name', label: '商户名称', group: '商户信息' },
  { key: 'merchantDetail.store_name', label: '门店名称', group: '商户信息' },
  { key: 'merchantDetail.phone', label: '联系电话', group: '商户信息' },
  { key: 'merchantDetail.province', label: '省份', group: '商户信息' },
  { key: 'merchantDetail.city', label: '城市', group: '商户信息' },
  { key: 'merchantDetail.school_name', label: '学校名称', group: '商户信息' },
  { key: 'merchantDetail.type', label: '门店类型', group: '商户信息' },
  { key: 'merchantDetail.category', label: '经营品类', group: '商户信息' },
  { key: 'merchantDetail.start_time', label: '营业开始时间', group: '商户信息' },
  { key: 'merchantDetail.end_time', label: '营业结束时间', group: '商户信息' },
  { key: 'merchantDetail.is_dorm_store', label: '是否宿舍门店', group: '商户信息' },

  // 位置
  {
    key: 'merchantDetail.location',
    label: '位置',
    render: (value: any) => {
      return <LocationRenderer value={value} />;
    },
  },

  // 图片（根据 is_dorm_store 过滤在配置里做）
  {
    key: 'merchantDetail.images.storefront_image',
    label: '门店照片',
    group: '商户信息',
    isImage: true,
  },
  {
    key: 'merchantDetail.images.business_license_image',
    label: '营业执照',
    group: '商户信息',
    isImage: true,
  },
  {
    key: 'merchantDetail.images.food_license_image',
    label: '食品经营许可证',
    group: '商户信息',
    isImage: true,
  },
  {
    key: 'merchantDetail.images.medical_certificate_image',
    label: '健康证',
    group: '商户信息',
    isImage: true,
  },
  {
    key: 'merchantDetail.images.student_id_card_image',
    label: '学生证',
    group: '商户信息',
    isImage: true,
  },
  {
    key: 'merchantDetail.images.identity_card_image',
    label: '身份证',
    group: '商户信息',
    isImage: true,
  },

  /* ===== 订单信息 ===== */
  { key: 'orderDetail.amount', label: '订单金额', group: '订单信息' },
  { key: 'orderDetail.order_number', label: '订单号', group: '订单信息' },
  { key: 'orderDetail.pay_channel', label: '支付渠道', group: '订单信息' },
];

// 搜索配置
export const searchList = (
  options: any,
  userInfo?: { role_id: number; city_id: number },
): BaseSearchList[] => {
  let list: BaseSearchList[] = [];
  const roleId = userInfo?.role_id;

  if (roleId === 2) {
    list = [
      {
        label: '商家名称',
        name: 'name',
        component: 'Input',
        placeholder: '请输入商家名称',
      },
      {
        label: '地区',
        name: 'pid',
        component: 'Select',
        wrapperWidth: 180,
        componentProps: (form) => ({
          options: options.provinceOptions,
          placeholder: '请选择省份',
          allowClear: true,
          onChange: async (value: string) => {
            // 清空城市选择
            form.setFieldsValue({ city: undefined });
            await options.loadCities(value);
            form.validateFields(['city']);
          },
        }),
      },
      {
        label: '',
        name: 'city_id',
        component: 'Select',
        wrapperWidth: 180,
        componentProps: (form) => {
          const provinceValue = form.getFieldValue('pid');
          return {
            placeholder: '请选择城市',
            allowClear: true,
            disabled: !provinceValue,
            options: options.cityOptions,
            onChange: async (value: string) => {
              // 清空学校选择
              form.setFieldsValue({ school_id: undefined });
              await options.loadSchools(value);
              form.validateFields(['school_id']);
            },
          };
        },
      },
      {
        label: '',
        name: 'school_id',
        component: 'Select',
        placeholder: '请输入学校名称',
        componentProps: (form) => {
          const cityValue = form.getFieldValue('city_id');
          console.log('获取城市', cityValue);

          return {
            placeholder: '请选择学校',
            allowClear: true,
            disabled: !cityValue,
            options: options.schoolOptions,
          };
        },
      },
      {
        label: '手机号',
        name: 'phone',
        rules: PHONE_RULE(false, '请输入正确的手机号'),
        component: 'Input',
        placeholder: '请输入手机号',
      },
      {
        label: '时间范围',
        name: 'time_range',
        component: 'RangePicker',
        componentProps: {
          format: 'YYYY-MM-DD ',
        },
      },
      {
        component: 'Select',
        name: 'status',
        label: '状态',
        componentProps: {
          placeholder: '请选择状态',
          options: [
            { label: '全部', value: 0 },
            { label: '待审批', value: 1 },
            { label: '审批通过', value: 2 },
            { label: '审批失败', value: 3 },
          ],
        },
      },
    ];
  } else if (roleId === 4) {
    list = [
      {
        label: '商家名称',
        name: 'name',
        component: 'Input',
        placeholder: '请输入商家名称',
      },
      {
        label: '手机号',
        name: 'phone',
        rules: PHONE_RULE(false, '请输入正确的手机号'),
        component: 'Input',
        placeholder: '请输入手机号',
      },
      {
        label: '时间范围',
        name: 'time_range',
        component: 'RangePicker',
        componentProps: {
          format: 'YYYY-MM-DD ',
        },
      },
      {
        component: 'Select',
        name: 'status',
        label: '状态',
        componentProps: {
          placeholder: '请选择状态',
          options: [
            { label: '全部', value: 0 },
            { label: '待审批', value: 1 },
            { label: '审批通过', value: 2 },
            { label: '审批失败', value: 3 },
          ],
        },
      },
    ];
  } else if (roleId === 5) {
    list = [
      {
        label: '商家名称',
        name: 'name',
        component: 'Input',
        placeholder: '请输入商家名称',
      },
      {
        label: '手机号',
        name: 'phone',
        rules: PHONE_RULE(false, '请输入正确的手机号'),
        component: 'Input',
        placeholder: '请输入手机号',
      },
      {
        label: '时间范围',
        name: 'time_range',
        component: 'RangePicker',
        componentProps: {
          format: 'YYYY-MM-DD ',
        },
      },
      {
        label: '学校',
        name: 'school_id',
        component: 'Select',
        placeholder: '请输入学校名称',
        componentProps: {
          placeholder: '请选择学校',
          allowClear: true,
          options: options.schoolOptions,
        },
      },
      {
        component: 'Select',
        name: 'status',
        label: '状态',
        componentProps: {
          placeholder: '请选择状态',
          options: [
            { label: '全部', value: 0 },
            { label: '待审批', value: 3 },
            { label: '审批通过', value: 1 },
            { label: '审批失败', value: 2 },
          ],
        },
      },
    ];
  }
  return list;
};
// 表格列配置
export const tableColumns = (): TableColumn[] => {
  let list: TableColumn[] = [];
  list = [
    { title: '用户姓名', dataIndex: 'name', key: 'name' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    {
      title: '校内/校外',
      dataIndex: 'merchant_type',
      key: 'type',
      render: (value: string) => {
        return value;
      },
    },
    {
      title: '申请时间',
      dataIndex: 'create_time',
      key: 'create_time',
      render: (value: string) => {
        return <span>{dayjs(value).format('YYYY-MM-DD HH:mm:ss')}</span>;
      },
    },
    {
      title: '费用',
      dataIndex: 'amount',
      key: 'amount',
      render: (value: number) => {
        return <span>{value.toFixed(2)}</span>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (value: number) => {
        return value === 3 ? '待审批' : value === 1 ? '审批通过' : '审批失败';
      },
    },
    {
      title: '审核时间',
      dataIndex: 'update_time',
      key: 'update_time',
      render: (value: string) => {
        return value ? <span>{dayjs(value).format('YYYY-MM-DD HH:mm:ss')}</span> : '-';
      },
    },
  ];
  return list;
};
// 表单配置项
export const formList = (): BaseFormList[] => [
  {
    label: '申请表ID',
    name: 'id',
    rules: FORM_REQUIRED,
    component: 'Input',
    componentProps: {
      placeholder: '请输入商家ID',
      maxLength: 11,
      disabled: true,
    },
  },
  {
    label: '审核理由',
    name: 'reason',
    component: 'TextArea',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请输入审核理由',
    },
  },
  {
    label: '申请状态',
    name: 'apply_status',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: {
      placeholder: '请选择申请状态',
      options: [
        { label: '待审核', value: 3 },
        { label: '审核通过', value: 1 },
        { label: '审核拒绝', value: 2 },
      ],
    },
  },
];
