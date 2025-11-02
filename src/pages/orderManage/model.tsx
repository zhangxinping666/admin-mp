import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { useState, useEffect, useCallback } from 'react';
import { getProvinces, getCitiesByProvince, getSchoolsByCityId } from '@/servers/trade-blotter/location';
import {
  createInputSearch,
  createSelectSearch,
  createProvinceCitySchoolSearch,
  SEARCH_INPUT_WIDTH,
  SEARCH_SELECT_WIDTH
} from '@/utils/searchConfig';

export interface OrderListReq {
  order_item_no?: string;
  product_name?: string;
  store_name?: string;
  user_phone?: string;
  item_status?: number;
  start_time?: string;
  end_time?: string;
  province_id?: string;
  city_id?: string;
  school_id?: string;
  page?: number;
  page_size?: number;
}
export interface OrderItem {
  item_id?: number;
  order_item_no?: string;
  order_id?: number;
  product_name?: string;
  sku_description?: string;
  quantity?: number;
  price?: number;
  total?: number;
  payable_amount?: number;
  refund_amount?: number;
  gold_bean_amount?: number;
  product_image_url?: string;
  item_status?: number;
  item_status_text?: string;
  expired_at?: string;
  paid_at?: string;
  verified_at?: string;
  completed_at?: string;
  cancelled_at?: string;
  created_at?: string;
  store_name?: string;
  user_id?: number;
  username?: string;
  phone?: string;
}

export interface OrderListData {
  list: OrderItem[];
  page: number;
  page_size: number;
  pages: number;
  total: number;
}

export interface OrderListRes {
  code: number;
  messages: string;
  data: OrderListData;
}

export interface CertItem {
  user_id: number;
  id: number;
  name: string;
  card_id: number;
  front: string;
  back: string;
  status: number;
  user_phone: string;
  created_time: string;
  updated_time: string;
  reject_reason?: string; // 拒绝原因
  audit_user?: string; // 审核人
  audit_time?: string; // 审核时间
  province?: string;
  city_name?: string;
  school_name?: string;
}
export interface UpdateCert {
  id: number;
  status: number;
  reason?: string; // 拒绝原因
}
export interface CertDetailResult {
  code: number;
  data: ReviewData;
}
export interface ReviewData {
  list: ReviewInfo[];
  page: number;
  page_size: number;
  pages: number;
  total: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface ReviewInfo {
  reason: string;
  reviewTime: string;
  reviewer: string;
  status: number;
}

export interface CertListResult {
  code: number;
  message: string; // 注意：根据您的JSON数据，这里是 message (单数)
  data: CertList;
}

export interface CertList {
  list: CertItem[];
  page: number;
  page_size: number;
  pages: number;
  total: number;
}

type OptionType = { label: string; value: string | number };

const DEFAULT_ALL_OPTION = (label = '全部', value: string | number = ''): OptionType => ({
  label,
  value,
});

export const useLocationOptions = () => {
  const [provinceOptions, setProvinceOptions] = useState<OptionType[]>([DEFAULT_ALL_OPTION()]);
  const [cityOptions, setCityOptions] = useState<OptionType[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<OptionType[]>([]);

  // 加载省份
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const { data } = await getProvinces(0);
        if (Array.isArray(data) && data.length > 0) {
          setProvinceOptions([
            DEFAULT_ALL_OPTION(),
            ...data.map((p) => ({ label: p.name, value: p.city_id })),
          ]);
        }
      } catch (error) {
        console.error('加载省份失败', error);
        setProvinceOptions([DEFAULT_ALL_OPTION()]);
      }
    };
    loadProvinces();
  }, []);

  // 加载城市
  const loadCities = useCallback(async (provinceId: string) => {
    if (!provinceId || provinceId === '') {
      setCityOptions([]);
      setSchoolOptions([]);
      return;
    }
    try {
      const { data } = await getCitiesByProvince(Number(provinceId));
      setCityOptions([
        DEFAULT_ALL_OPTION(),
        ...(Array.isArray(data) ? data.map((c) => ({ label: c.name, value: c.city_id })) : []),
      ]);
      setSchoolOptions([]); // 清空学校选项
    } catch (error) {
      console.error('加载城市失败', error);
      setCityOptions([DEFAULT_ALL_OPTION()]);
      setSchoolOptions([]);
    }
  }, []);

  // 加载学校
  const loadSchools = useCallback(async (cityId: string) => {
    if (!cityId || cityId === '') {
      setSchoolOptions([]);
      return;
    }
    try {
      const { data } = await getSchoolsByCityId(Number(cityId));
      setSchoolOptions([
        DEFAULT_ALL_OPTION(),
        ...(Array.isArray(data) ? data.map((s) => ({ label: s.name, value: s.school_id || s.id })) : []),
      ]);
    } catch (error) {
      console.error('加载学校失败', error);
      setSchoolOptions([DEFAULT_ALL_OPTION()]);
    }
  }, []);

  return {
    provinceOptions,
    cityOptions,
    schoolOptions,
    loadCities,
    loadSchools,
  };
};

// 搜索配置
export const searchList = (
  options?: ReturnType<typeof useLocationOptions>
): BaseSearchList[] => {
  // 如果传入了 options，添加省市学校筛选
  if (options) {
    const locationFields = createProvinceCitySchoolSearch({
      provinceOptions: options.provinceOptions,
      cityOptions: options.cityOptions,
      schoolOptions: options.schoolOptions,
      loadCities: options.loadCities,
      loadSchools: options.loadSchools,
    });

    const baseFields: BaseSearchList[] = [
      createInputSearch({
        label: '用户电话',
        name: 'user_phone',
        placeholder: '请输入用户电话',
        width: SEARCH_INPUT_WIDTH,
      }),
      createSelectSearch({
        label: '状态',
        name: 'status',
        options: [
          { label: '全部', value: 0 },
          { label: '审核中', value: 1 },
          { label: '审核成功', value: 2 },
          { label: '审核失败', value: 3 },
        ],
        placeholder: '请选择状态',
        width: SEARCH_SELECT_WIDTH,
      }),
    ];

    // 将地区筛选插入到基础字段之前
    return [...locationFields, ...baseFields];
  }

  // 没有options时，只返回基础字段
  const baseFields: BaseSearchList[] = [
    createInputSearch({
      label: '用户电话',
      name: 'user_phone',
      placeholder: '请输入用户电话',
      width: SEARCH_INPUT_WIDTH,
    }),
    createSelectSearch({
      label: '状态',
      name: 'status',
      options: [
        { label: '全部', value: 0 },
        { label: '审核中', value: 1 },
        { label: '审核成功', value: 2 },
        { label: '审核失败', value: 3 },
      ],
      placeholder: '请选择状态',
      width: SEARCH_SELECT_WIDTH,
    }),
  ];

  return baseFields;
};

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '用户名称',
    dataIndex: 'username',
    key: 'username',
    width: 120,
    ellipsis: true,
  },
  {
    title: '用户电话',
    dataIndex: 'phone',
    key: 'phone',
    width: 120,
    ellipsis: true,
  },
  {
    title: '省份',
    dataIndex: 'province',
    key: 'province',
    width: 100,
    ellipsis: true,
    render: (value: string) => value || '-',
  },
  {
    title: '城市',
    dataIndex: 'city_name',
    key: 'city_name',
    width: 100,
    ellipsis: true,
    render: (value: string) => value || '-',
  },
  {
    title: '学校',
    dataIndex: 'school_name',
    key: 'school_name',
    width: 150,
    ellipsis: true,
    render: (value: string) => value || '-',
  },
   {
    title: '店铺名称',
    dataIndex: 'store_name',
    key: 'store_name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '商品名称',
    dataIndex: 'product_name',
    key: 'product_name',
    width: 150,
    ellipsis: true,
  },
    {
    title: '订单号',
    dataIndex: 'order_item_no',
    key: 'order_item_no',
    width: 150,
    ellipsis: true,
  },
  {
    title: '申请审批时间',
    dataIndex: 'created_time',
    key: 'created_time',
    width: 150,
    ellipsis: true,
  },
  {
    title: '订单状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (value: number) => (
      <span style={{ color: value === 1 ? '#faad14' : value === 2 ? '#1890ff' : '#ff4d4f' }}>
        {value === 0 ? '全部' : value === 1 ? '待支付' : value === 2 ? '已取消' : value === 3 ? '待核销' : value === 4 ? '待评价' : value === 5 ? '已过期' : value === 6 ? '已退款' : '已退款'}
      </span>
    ),
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 120,
    fixed: 'right',
  },
];

// 表单配置
export const formList = (): BaseFormList[] => [
  {
    label: '状态',
    name: 'status',
    component: 'Select',
    placeholder: '请选择状态',
    componentProps: {
      options: [
        { label: '审核成功', value: 2 },
        { label: '审核失败', value: 3 },
        { label: '审核中', value: 1 },
      ],
    },
  },
];
