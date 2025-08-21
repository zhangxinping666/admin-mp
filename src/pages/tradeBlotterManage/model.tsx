import { useState, useEffect, useCallback } from 'react';
import { valueToLabel } from '@/utils/helper';
import {
  getProvinces,
  getSchoolsByCityId,
  getCitiesByProvince,
} from '@/servers/trade-blotter/location';
import { TIME_FORMAT, EMPTY_VALUE } from '@/utils/config';
import dayjs from 'dayjs';
type OptionType = { label: string; value: string | number };

/**
 * 支付类型、交易状态、分组选项
 */
export const PAY_TYPE_OPTIONS = [
  { label: '全部', value: 0 },
  { label: '微信', value: 1 },
  { label: '支付宝', value: 2 },
];

export const TRADE_STATUS_OPTIONS = [
  { label: '全部', value: 0 },
  { label: '失败', value: 1 },
  { label: '成功', value: 2 },
];

export const CATEGORY_OPTIONS = [
  { label: '全部', value: 0 },
  { label: '商家入驻', value: 1 },
  { label: '推广', value: 2 },
  { label: '退款', value: 3 },
];

// 默认“全部”选项
const DEFAULT_ALL_OPTION = (label = '全部', value: string | number = '全部'): OptionType => ({
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
      }
    };
    loadProvinces();
  }, []);

  // 加载城市
  const loadCities = useCallback(async (province: string) => {
    console.log(province);
    if (!province || province === '全部') {
      setCityOptions([]);
      return;
    }
    try {
      const { data } = await getCitiesByProvince(Number(province));
      setCityOptions([
        DEFAULT_ALL_OPTION('全部', 0),
        ...(Array.isArray(data) ? data.map((c) => ({ label: c.name, value: c.city_id })) : []),
      ]);
    } catch (error) {
      console.error('加载城市失败', error);
      setCityOptions([DEFAULT_ALL_OPTION('全部', 0)]);
    }
  }, []);

  // 加载学校
  const loadSchools = useCallback(async (cityId: string | number) => {
    if (!cityId || cityId === 0) {
      setSchoolOptions([]);
      return;
    }
    try {
      const { data } = await getSchoolsByCityId(cityId);
      setSchoolOptions([
        DEFAULT_ALL_OPTION('全部', 0),
        ...(Array.isArray(data) ? data.map((s) => ({ label: s.name, value: s.id })) : []),
      ]);
    } catch (error) {
      console.error('加载学校失败', error);
      setSchoolOptions([DEFAULT_ALL_OPTION('全部', 0)]);
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

/**
 * 搜索配置
 */
export const searchList = (options: ReturnType<typeof useLocationOptions>): BaseSearchList[] => [
  {
    label: '用户名',
    name: 'user_name',
    component: 'Input',
    componentProps: {
      placeholder: '请输入用户名',
    },
    wrapperWidth: 180, // 添加固定宽度
  },
  {
    label: '支付方式',
    name: 'pay_type',
    wrapperWidth: 120,
    component: 'Select',
    componentProps: {
      options: PAY_TYPE_OPTIONS,
    },
  },
  {
    label: '地区',
    name: 'province',
    component: 'Select',
    wrapperWidth: 180, // 添加固定宽度
    componentProps: (form) => ({
      options: options.provinceOptions,
      placeholder: '请选择省份',
      allowClear: true,
      onChange: async (value: string) => {
        // 清空城市和学校选择
        form.setFieldsValue({ city: undefined, school: undefined });
        await options.loadCities(value);
        form.validateFields(['city', 'school']);
      },
    }),
  },
  {
    label: '',
    name: 'city',
    component: 'Select',
    wrapperWidth: 180, // 添加固定宽度
    componentProps: (form) => {
      const provinceValue = form.getFieldValue('province');
      return {
        placeholder: '请选择城市',
        allowClear: true,
        disabled: !provinceValue,
        options: options.cityOptions,
        onChange: async (value: string) => {
          form.setFieldsValue({ school: undefined });
          await options.loadSchools(value);
          form.validateFields(['school']);
        },
      };
    },
  },
  {
    label: '',
    name: 'school',
    component: 'Select',
    wrapperWidth: 180, // 添加固定宽度
    componentProps: (form) => {
      const cityValue = form.getFieldValue('city');
      return {
        placeholder: '请选择学校',
        allowClear: true,
        disabled: !cityValue || cityValue === '',
        options: options.schoolOptions,
      };
    },
  },
];

/**
 * 表格列配置
 */
export const tableColumns = (): TableColumn[] => [
  {
    title: '用户名',
    dataIndex: 'user_name',
    width: 100,
  },
  {
    title: '流水号',
    dataIndex: 'flow_no',
    width: 160,
    fixed: 'left',
  },
  {
    title: '第三方流水号',
    dataIndex: 'third_flow_no',
    width: 160,
  },
  {
    title: '类别',
    dataIndex: 'category',
    width: 100,
  },
  {
    title: '金额',
    dataIndex: 'amount',
    width: 100,
    render: (value: number) => <span>¥{value?.toFixed(2)}</span>,
  },
  {
    title: '订单号',
    dataIndex: 'order_no',
    width: 160,
  },
  {
    title: '省份',
    dataIndex: 'province',
    width: 100,
  },
  {
    title: '城市',
    dataIndex: 'city',
    width: 100,
  },
  {
    title: '学校',
    dataIndex: 'school',
    width: 120,
  },

  {
    title: '支付类型',
    dataIndex: 'pay_type',
    width: 100,
    render: (value: number) => <span>{valueToLabel(value, PAY_TYPE_OPTIONS)}</span>,
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    width: 150,
    render: (value: string) => (
      <span>{value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : EMPTY_VALUE}</span>
    ),
  },
];
