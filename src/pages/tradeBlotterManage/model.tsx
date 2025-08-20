import { useState, useEffect, useCallback } from 'react';
import type { TFunction } from 'i18next';
import { valueToLabel } from '@/utils/helper';
import {
  getProvinces,
  getSchoolsByCityId,
  getCitiesByProvince,
} from '@/servers/trade-blotter/location';
import { TIME_FORMAT } from '@/utils/config';
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
export const searchList = (
  t: TFunction,
  options: ReturnType<typeof useLocationOptions>,
): BaseSearchList[] => [
  {
    label: t('tradeBlotter.flowNo'),
    name: 'flow_no',
    component: 'Input',
    componentProps: {
      placeholder: t('tradeBlotter.flowNoPlaceholder'),
    },
    wrapperWidth: 180, // 添加固定宽度
  },
  {
    label: t('tradeBlotter.orderNo'),
    name: 'order_no',
    component: 'Input',
    componentProps: {
      placeholder: t('tradeBlotter.orderNoPlaceholder'),
    },
    wrapperWidth: 180, // 添加固定宽度
  },
  {
    label: t('tradeBlotter.userName'),
    name: 'user_name',
    component: 'Input',
    componentProps: {
      placeholder: t('tradeBlotter.userNamePlaceholder'),
    },
    wrapperWidth: 180, // 添加固定宽度
  },
  {
    label: t('tradeBlotter.createTime'),
    name: 'create_time_range',
    component: 'RangePicker',
    componentProps: {
      placeholder: [t('tradeBlotter.startTime'), t('tradeBlotter.endTime')],
      allowClear: true,
      showTime: true,
      format: TIME_FORMAT,
    },
    wrapperWidth: 220, // 已有固定宽度
  },
  {
    label: t('tradeBlotter.province'),
    name: 'province',
    component: 'Select',
    wrapperWidth: 180, // 添加固定宽度
    componentProps: (form) => ({
      options: options.provinceOptions,
      placeholder: t('tradeBlotter.selectProvince'),
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
    label: t(''),
    name: 'city',
    component: 'Select',
    wrapperWidth: 180, // 添加固定宽度
    componentProps: (form) => {
      const provinceValue = form.getFieldValue('province');
      return {
        placeholder: t('tradeBlotter.selectCity'),
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
    label: t(''),
    name: 'school',
    component: 'Select',
    wrapperWidth: 180, // 添加固定宽度
    componentProps: (form) => {
      const cityValue = form.getFieldValue('city');
      return {
        placeholder: t('tradeBlotter.selectSchool'),
        allowClear: true,
        disabled: !cityValue || cityValue === '',
        options: options.schoolOptions,
      };
    },
  },
  // 以下表单项已有固定宽度，保持不变
  {
    label: t('tradeBlotter.payType'),
    name: 'pay_type',
    wrapperWidth: 120,
    component: 'Select',
    componentProps: {
      options: PAY_TYPE_OPTIONS,
    },
  },
  {
    label: t('tradeBlotter.status'),
    name: 'status',
    wrapperWidth: 100,
    component: 'Select',
    componentProps: {
      options: TRADE_STATUS_OPTIONS,
    },
  },
  {
    label: t('tradeBlotter.category'),
    name: 'category',
    wrapperWidth: 120,
    component: 'Select',
    componentProps: {
      options: CATEGORY_OPTIONS,
    },
  },
  {
    label: t('tradeBlotter.amountRange'),
    name: 'amount_range',
    component: 'AmountRangeInput',
    componentProps: (form) => ({
      placeholder: [t('tradeBlotter.minAmount'), t('tradeBlotter.maxAmount')],
      min: 0,
      precision: 2,
      style: { width: '100%' },
      onErrorChange: (error: string) => {
        // 如果有错误，设置表单项的错误状态
        if (error) {
          form.setFields([
            {
              name: 'amount_range',
              errors: [error],
            },
          ]);
        } else {
          // 清除错误状态
          form.setFields([
            {
              name: 'amount_range',
              errors: [],
            },
          ]);
        }
      },
    }),
    wrapperWidth: 300,
  },
];

/**
 * 表格列配置
 */
export const tableColumns = (t: TFunction): TableColumn[] => [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
    fixed: 'left',
  },
  {
    title: t('tradeBlotter.flowNo'),
    dataIndex: 'flow_no',
    width: 160,
    fixed: 'left',
  },
  {
    title: t('tradeBlotter.thirdFlowNo'),
    dataIndex: 'third_flow_no',
    width: 160,
  },
  {
    title: t('tradeBlotter.orderNo'),
    dataIndex: 'order_no',
    width: 160,
  },
  {
    title: t('tradeBlotter.userName'),
    dataIndex: 'user_name',
    width: 100,
  },
  {
    title: t('tradeBlotter.city'),
    dataIndex: 'city',
    width: 100,
  },
  {
    title: t('tradeBlotter.school'),
    dataIndex: 'school',
    width: 120,
  },
  {
    title: t('tradeBlotter.amount'),
    dataIndex: 'amount',
    width: 100,
    render: (value: number) => <span>¥{value?.toFixed(2)}</span>,
  },
  {
    title: t('tradeBlotter.payType'),
    dataIndex: 'pay_type',
    width: 100,
    render: (value: number) => <span>{valueToLabel(value, PAY_TYPE_OPTIONS)}</span>,
  },
  {
    title: t('tradeBlotter.status'),
    dataIndex: 'status',
    width: 80,
    render: (value: number) => {
      const statusMap = {
        1: { text: t('tradeBlotter.failed'), color: '#ff4d4f' },
        2: { text: t('tradeBlotter.success'), color: '#52c41a' },
      };
      const status = statusMap[value as keyof typeof statusMap];
      return status ? (
        <span style={{ color: status.color }}>{status.text}</span>
      ) : (
        <span>{value}</span>
      );
    },
  },
  {
    title: t('tradeBlotter.category'),
    dataIndex: 'category',
    width: 100,
    render: (value: number) => <span>{valueToLabel(value, CATEGORY_OPTIONS)}</span>,
  },
  {
    title: t('tradeBlotter.detail'),
    dataIndex: 'detail',
    width: 150,
    ellipsis: true,
  },
  {
    title: t('tradeBlotter.createTime'),
    dataIndex: 'create_time',
    width: 150,
    render: (value: string) => <span>{value || EMPTY_VALUE}</span>,
  },
];
