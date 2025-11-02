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
      // 分组：左侧选择类型，右侧输入关键词
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

    // 将地区筛选插入到基础字段之前
    return [...locationFields, ...baseFields];
  }

  // 没有options时，只返回基础字段
  const baseFields: BaseSearchList[] = [
    // 分组：左侧选择类型，右侧输入关键词
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
    render: (value: number) => (
      <span style={{ color: value === 1 ? '#faad14' : value === 2 ? '#1890ff' : '#ff4d4f' }}>
        {value === 0 ? '全部' : value === 1 ? '待支付' : value === 2 ? '已取消' : value === 3 ? '待核销' : value === 4 ? '待评价' : value === 5 ? '已过期' : value === 6 ? '已退款' : '已退款'}
      </span>
    ),
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

// 生成模拟订单列表数据（分页、可根据部分查询参数过滤）
export async function mockOrderList(params: OrderListReq = {}): Promise<OrderListRes> {
  const {
    page = 1,
    page_size = 10,
    user_phone,
    status,
    product_name,
    store_name,
    order_item_no,
    province_id,
    city_id,
    school_id,
  } = params as any;

  const total = 57; // 模拟总数
  const pages = Math.ceil(total / page_size);
  const start = (page - 1) * page_size;
  const end = Math.min(start + page_size, total);

  // 基础字典
  const provinces = ['浙江', '江苏', '广东', '北京'];
  const cities = ['杭州', '南京', '广州', '北京'];
  const schools = ['浙江大学', '南京大学', '中山大学', '北京大学'];
  const stores = ['慢跑旗舰店', '慢跑校区店', '慢跑体验店', '慢跑直销店'];
  const products = ['晨跑月卡', '夜跑季卡', '校园跑步周卡', '户外跑步年卡'];

  const list = Array.from({ length: end - start }, (_, idx) => {
    const i = start + idx + 1;
    const st = ((i % 6) + 1); // 1-6循环：待支付/已取消/待核销/待评价/已过期/已退款
    const price = 99 + (i % 5) * 20; // 99/119/139/159/179
    const quantity = (i % 3) + 1; // 1-3
    const totalAmount = price * quantity;
    const payable = totalAmount - (i % 2 === 0 ? 10 : 0);
    const province = provinces[i % provinces.length];
    const city = cities[i % cities.length];
    const school = schools[i % schools.length];
    const store = stores[i % stores.length];
    const product = products[i % products.length];
    const now = new Date(Date.now() - i * 3600_000);
    const createdAt = now.toISOString();
    const createdTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    return {
      item_id: i,
      order_item_no: `OI${String(20250000 + i)}`,
      order_id: 100000 + i,
      product_name: product,
      sku_description: `规格-${(i % 3) + 1}`,
      quantity,
      price,
      total: totalAmount,
      payable_amount: payable,
      refund_amount: i % 7 === 0 ? 10 : 0,
      gold_bean_amount: i % 5 === 0 ? 5 : 0,
      product_image_url: 'https://dummyimage.com/120x120/eee/333&text=Run',
      item_status: st,
      item_status_text: ['全部', '待支付', '已取消', '待核销', '待评价', '已过期', '已退款'][st] || '待支付',
      // 额外字段以适配表格
      status: st, // 表格列使用 status
      created_time: createdTime, // 表格列使用 created_time
      // 详情字段
      expired_at: undefined,
      paid_at: undefined,
      verified_at: undefined,
      completed_at: undefined,
      cancelled_at: undefined,
      created_at: createdAt,
      store_name: store,
      user_id: 5000 + i,
      username: `用户${i}`,
      phone: `138${String(10000000 + i).slice(-8)}`,
      // 位置相关（表格中会render）
      province,
      city_name: city,
      school_name: school,
    } as any;
  });

  // 简单过滤逻辑（只做包含判断）
  const filtered = list.filter((item) => {
    const matchPhone = user_phone ? String(item.phone).includes(String(user_phone)) : true;
    const matchStatus = status ? item.status === Number(status) : true;
    const matchProduct = product_name ? String(item.product_name).includes(String(product_name)) : true;
    const matchStore = store_name ? String(item.store_name).includes(String(store_name)) : true;
    const matchOrderNo = order_item_no ? String(item.order_item_no).includes(String(order_item_no)) : true;
    const matchProvince = province_id ? String(item.province).includes(String(province_id)) : true;
    const matchCity = city_id ? String(item.city_name).includes(String(city_id)) : true;
    const matchSchool = school_id ? String(item.school_name).includes(String(school_id)) : true;
    return matchPhone && matchStatus && matchProduct && matchStore && matchOrderNo && matchProvince && matchCity && matchSchool;
  });

  return {
    code: 200,
    messages: 'ok',
    data: {
      list: filtered,
      page,
      page_size,
      pages,
      total,
    },
  };
}
