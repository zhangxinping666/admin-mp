import type { BaseSearchList } from '#/form';
import type { TableColumn } from '#/public';
import { useState, useEffect, useCallback } from 'react';
import { getProvinces, getCitiesByProvince, getSchoolsByCityId } from '@/servers/trade-blotter/location';
import {
  createSelectSearch,
  createProvinceCitySchoolSearch,
  SEARCH_SELECT_WIDTH
} from '@/utils/searchConfig';
import type { FieldConfig } from '@/shared/components/DetailModal';

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
  if (options) {
    const locationFields = createProvinceCitySchoolSearch({
      provinceOptions: options.provinceOptions,
      cityOptions: options.cityOptions,
      schoolOptions: options.schoolOptions,
      loadCities: options.loadCities,
      loadSchools: options.loadSchools,
    });

    const baseFields: BaseSearchList[] = [
      ({
        label: '搜索',
        name: 'search_type',
        component: 'Select',
        groupId: 'quick-search',
        componentProps: {
          options: [
            { label: '商家名称', value: 'store_name' },
            { label: '商品名称', value: 'product_name' },
            { label: '订单号', value: 'order_item_no' },
            { label: '用户手机号', value: 'user_phone' },
          ],
          placeholder: '请选择类型',
          allowClear: true,
        },
      } as unknown as BaseSearchList),
      ({
        label: '',
        name: 'search_value',
        component: 'Input',
        groupId: 'quick-search',
        placeholder: '请输入关键词',
      } as unknown as BaseSearchList),
      createSelectSearch({
        label: '状态',
        name: 'status',
        options: [
          { label: '全部', value: 0 },
          { label: '待支付', value: 1 },
          { label: '已取消', value: 2 },
          { label: '待核销', value: 3 },
          { label: '待评价', value: 4 },
          { label: '已过期', value: 5 },
          { label: '已退款', value: 6 },
        ],
        placeholder: '请选择订单状态',
        width: SEARCH_SELECT_WIDTH,
      }),
      {
        label: '时间范围',
        name: 'time_range',
        component: 'RangePicker',
        componentProps: {
          format: 'YYYY-MM-DD HH:mm:ss',
        },
      },
    ];

    return [...locationFields, ...baseFields];
  }

  // 没有options时，只返回基础字段
  const baseFields: BaseSearchList[] = [
    ({
      label: '搜索',
      name: 'search_type',
      component: 'Select',
      groupId: 'quick-search',
      componentProps: {
        options: [
          { label: '商家名称', value: 'store_name' },
          { label: '商品名称', value: 'product_name' },
          { label: '订单号', value: 'order_item_no' },
          { label: '用户手机号', value: 'user_phone' },
        ],
        placeholder: '请选择类型',
        allowClear: true,
      },
    } as unknown as BaseSearchList),
    ({
      label: '',
      name: 'search_value',
      component: 'Input',
      groupId: 'quick-search',
      placeholder: '请输入关键词',
    } as unknown as BaseSearchList),
    createSelectSearch({
      label: '状态',
      name: 'status',
      options: [
        { label: '全部', value: 0 },
        { label: '待支付', value: 1 },
        { label: '已取消', value: 2 },
        { label: '待核销', value: 3 },
        { label: '待评价', value: 4 },
        { label: '已过期', value: 5 },
        { label: '已退款', value: 6 },
      ],
      placeholder: '请选择订单状态',
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
    title: '创建时间',
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
    render: (value: number) => {
      const getStatusColor = (status: number) => {
        switch (status) {
          case 1: return '#faad14'; // 待支付 - 橙色（提醒）
          case 2: return '#8c8c8c'; // 已取消 - 灰色（中性）
          case 3: return '#1890ff'; // 待核销 - 蓝色（进行中）
          case 4: return '#722ed1'; // 待评价 - 紫色（待处理）
          case 5: return '#ff4d4f'; // 已过期 - 红色（警告）
          case 6: return '#52c41a'; // 已退款 - 绿色（成功）
          default: return '#52c41a'; // 已完成 - 绿色（成功）
        }
      };
      const getStatusText = (status: number) => {
        switch (status) {
          case 0: return '全部';
          case 1: return '待支付';
          case 2: return '已取消';
          case 3: return '待核销';
          case 4: return '待评价';
          case 5: return '已过期';
          case 6: return '已退款';
          default: return '已完成';
        }
      };
      return (
        <span style={{ color: getStatusColor(value) }}>
          {getStatusText(value)}
        </span>
      );
    },
  },
  {
    title: '实付金额',
    dataIndex: 'payable_amount',
    key: 'payable_amount',
    width: 150,
    ellipsis: true,
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 120,
    fixed: 'right',
  },
];


// 详情弹窗字段配置（精简版）
const formatDateTime = (v: any) => {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const Y = d.getFullYear();
  const M = String(d.getMonth() + 1).padStart(2, '0');
  const D = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
};

export const orderDetailConfig: FieldConfig[] = [
  { label: '订单项ID', key: 'item_id' },
  { label: '订单号', key: 'order_item_no' },
  { label: '订单ID', key: 'order_id' },
  { label: '商品名称', key: 'product_name' },
  { label: '规格描述', key: 'sku_description' },
  { label: '数量', key: 'quantity' },
  { label: '价格', key: 'price' },
  { label: '总价', key: 'total' },
  { label: '实付金额', key: 'payable_amount' },
  { label: '退款金额', key: 'refund_amount' },
  { label: '金豆抵扣额度', key: 'gold_bean_amount' },
  { label: '商品链接', key: 'product_image_url', isImage: true },
  { label: '订单状态-数字', key: 'item_status' },
  { label: '订单状态', key: 'item_status_text' },
  { label: '店铺名', key: 'store_name' },
  { label: '用户ID', key: 'user_id' },
  { label: '用户名', key: 'username' },
  { label: '手机号', key: 'phone' },
  { label: '创建时间', key: 'created_at', render: formatDateTime },
  { label: '支付时间', key: 'paid_at', render: formatDateTime },
  { label: '核销时间', key: 'verified_at', render: formatDateTime },
  { label: '完成时间', key: 'completed_at', render: formatDateTime },
  { label: '取消时间', key: 'cancelled_at', render: formatDateTime },
  { label: '过期时间', key: 'expired_at', render: formatDateTime },
];
