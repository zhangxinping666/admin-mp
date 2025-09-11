import { useState, useEffect, useCallback } from 'react';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { EnhancedImageUploader } from '@/shared/components/EnhancedImageUploader';
import { Space, Tooltip } from 'antd';
import { render } from 'nprogress';
import dayjs from 'dayjs';

// 楼栋接口定义
export interface User {
  id: number;
  avatar: string;
  image_id?: number;
  nickname: string;
  phone: string;
  city: string;
  school: string;
  wechat: string;
  alipay: string;
  last_time: string;
  status: number;
}
export interface updateUserForm {
  id: number;
  image: string;
  image_id?: number;
  nickname: string;
  phone: string;
  city: string;
  school: string;
  wechat: string;
  alipay: string;
  status: number;
}

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface UserListResult {
  code: number;
  message: string; // 注意：根据您的JSON数据，这里是 message (单数)
  data: {
    list: User[];
    page: number;
    page_size: number;
    pages: number;
    total: number;
  };
}

export interface UserDetailResult {
  code: number;
  data: User;
}

// 余额明细搜索配置
export const searchDetailList = (): BaseSearchList[] => [
  {
    label: '时间范围',
    name: 'time_range',
    component: 'RangePicker',
  },
  {
    label: '流水号',
    name: 'transaction_no',
    component: 'Input',
  },
  {
    label: '关联流水号',
    name: 'order_no',
    component: 'Input',
  },
  {
    label: '类别',
    name: 'category',
    component: 'Select',
    componentProps: {
      placeholder: '请选择类别',
      options: [
        { label: '全部', value: '' },
        { label: '商户入驻', value: 'merchant_entrance' },
        { label: '提现', value: 'withdrawal' },
        { label: '返佣', value: 'rebate' },
        { label: '提现申请中', value: 'withdraw_processing' },
      ],
    },
  },
  {
    label: '交易类型',
    name: 'transaction_type',
    component: 'Select',
    componentProps: {
      placeholder: '请选择交易类型',
      options: [
        { label: '全部', value: 0 },
        { label: '收入', value: 1 },
        { label: '支出', value: 2 },
      ],
    },
  },
];
type OptionType = { label: string; value: string | number };
// 默认“全部”选项
const DEFAULT_ALL_OPTION = (label = '全部', value: string | number = '全部'): OptionType => ({
  label,
  value,
});

import {
  getProvinces,
  getSchoolsByCityId,
  getCitiesByProvince,
} from '@/servers/trade-blotter/location';
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
// 搜索配置
export const searchList = (
  options: ReturnType<typeof useLocationOptions>,
  userInfo?: { role_id: number; city_id: number },
): BaseSearchList[] => {
  // 获取用户角色ID
  const roleId = userInfo?.role_id;

  // 基础搜索字段（所有角色都有）
  const baseSearchFields: BaseSearchList[] = [
    {
      label: '用户昵称',
      name: 'nickname',
      component: 'Input',
      placeholder: '请输入团长昵称',
    },
    {
      label: '电话',
      name: 'phone',
      component: 'Input',
      placeholder: '请输入用户电话',
    },
    {
      component: 'Select',
      name: 'identity_id',
      label: '身份',
      componentProps: {
        options: [
          { label: '普通用户', value: 1 },
          { label: '团长', value: 2 },
          { label: '商户', value: 3 },
          { label: '城市运营商', value: 4 },
        ],
      },
    },
  ];

  // 地区搜索字段（根据角色显示）
  const locationSearchFields: BaseSearchList[] = [];

  // role_id=2（超级管理员）显示完整的省市学校选择
  if (roleId === 2) {
    locationSearchFields.push(
      {
        label: '地区',
        name: 'pid',
        component: 'Select',
        wrapperWidth: 120,
        groupId: 'location', // 添加groupId将三个下拉框分组
        componentProps: (form) => ({
          options: options.provinceOptions,
          placeholder: '请选择省份',
          allowClear: true,
          onChange: async (value: string) => {
            form.setFieldsValue({ city_id: undefined, school_id: undefined });
            await options.loadCities(value);
            form.validateFields(['city_id', 'school_id']);
          },
        }),
      },
      {
        label: '',
        name: 'city_id',
        component: 'Select',
        wrapperWidth: 120,
        groupId: 'location', // 添加groupId将三个下拉框分组
        componentProps: (form) => {
          const provinceValue = form.getFieldValue('pid');
          return {
            placeholder: '请选择城市',
            allowClear: true,
            disabled: !provinceValue,
            options: options.cityOptions,
            onChange: async (value: string) => {
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
        wrapperWidth: 120,
        groupId: 'location', // 添加groupId将三个下拉框分组
        componentProps: (form) => {
          const cityValue = form.getFieldValue('city_id');
          return {
            placeholder: '请选择学校',
            allowClear: true,
            disabled: !cityValue || cityValue === '',
            options: options.schoolOptions,
          };
        },
      },
    );
  } else if (roleId === 5) {
    // 城市运营商：只显示学校选择（自动过滤所属城市）
    locationSearchFields.push({
      label: '学校',
      name: 'school_id',
      component: 'Select',
      wrapperWidth: 180,
      componentProps: {
        placeholder: '请选择学校',
        allowClear: true,
        options: options.schoolOptions,
      },
    });
  }
  // role_id=4（团长）不显示任何地区字段

  // 状态字段（所有角色都有）
  const statusField: BaseSearchList = {
    component: 'Select',
    name: 'status',
    label: '状态',
    componentProps: {
      options: [
        { label: '全部', value: 0 },
        { label: '启用', value: 1 },
        { label: '禁用', value: 2 },
      ],
    },
  };

  return [...baseSearchFields, ...locationSearchFields, statusField];
};

// 表格列配置
export const tableColumns: (
  handleViewDetails: (record: any, event?: React.MouseEvent) => void,
) => TableColumn[] = (handleViewDetails) => [
  {
    title: '昵称',
    dataIndex: 'nickname',
    key: 'nickname',
    width: 150,
    ellipsis: true,
  },
  {
    title: '头像',
    dataIndex: 'avatar',
    key: 'avatar',
    width: 100,
    render: (avatar: string) => {
      const getFullImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
          return url;
        }
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `http://192.168.10.7:8082${cleanUrl}`;
      };

      const displayUrl = getFullImageUrl(avatar);
      return displayUrl ? (
        <img
          src={displayUrl}
          alt="头像"
          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
        />
      ) : (
        <div
          style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            color: '#999',
          }}
        >
          暂无头像
        </div>
      );
    },
  },
  {
    title: '电话',
    dataIndex: 'phone',
    key: 'phone',
    width: 100,
  },
  {
    title: '城市',
    dataIndex: 'city',
    key: 'city',
    width: 100,
  },
  {
    title: '学校',
    dataIndex: 'school',
    key: 'school',
    width: 100,
  },
  {
    title: '可用余额',
    dataIndex: 'total_amount',
    key: 'total_amount',
    width: 100,
    render: (value: number, record: any) => {
      return (
        <>
          <Space
            className="blinking-eye"
            style={{ cursor: 'pointer' }}
            size={1}
            onClick={(e) => {
              handleViewDetails(record, e);
            }}
          >
            <span>{value?.toFixed(2) || '0.00'}</span>
            {/* 添加眼睛SVG图标，使用blink动画 */}
            <span className="ml-1 mr-1 inline-block align-middle">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4.5C7 4.5 2.73 7.61 1 12C2.73 16.39 7 19.5 12 19.5C17 19.5 21.27 16.39 23 12C21.27 7.61 17 4.5 12 4.5Z"
                  stroke="#1890FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                  fill="#1890FF"
                />
              </svg>
            </span>
            <span>元</span>
          </Space>
        </>
      );
    },
  },
  {
    title: '最后登录时间',
    dataIndex: 'last_time',
    key: 'last_time',
    width: 100,
    render: (value: string) => {
      if (value) {
        return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
      }
      return '-';
    },
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 100,
    render: (value: string) => {
      if (value) {
        return dayjs(value).format('YYYY-MM-DD HH:mm:ss');
      }
      return '-';
    },
  },

  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    render: (value: number) => (
      <span style={{ color: value === 1 ? 'green' : 'red' }}>{value === 1 ? '启用' : '禁用'}</span>
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

// 详情表格列配置
export const detailTableColumns: TableColumn[] = [
  {
    title: '流水号',
    dataIndex: 'transaction_id',
    key: 'transaction_id',
    width: 80,
  },
  {
    title: '交易金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 100,
    render: (value: number, record: any) => (
      <span
        style={{
          color: record.transaction_type === 1 ? '#52c41a' : '#ff4d4f',
          fontWeight: 500,
        }}
      >
        {record.transaction_type === 1 ? '+' : '-'}
        {Math.abs(value)?.toFixed(2)}
      </span>
    ),
  },
  {
    title: '关联流水号',
    dataIndex: 'order_no',
    key: 'order_no',
    width: 100,
  },
  {
    title: '交易类型(收入/支出)',
    dataIndex: 'transaction_type_name',
    key: 'transaction_type_name',
    width: 100,
    render: (value: string, record: any) => (
      <span
        style={{
          color: record.transaction_type === 1 ? '#52c41a' : '#ff4d4f',
        }}
      >
        {value}
      </span>
    ),
  },
  {
    title: '期初余额',
    dataIndex: 'opening_balance',
    key: 'opening_balance',
    width: 120,
    render: (value: number) => <span style={{ color: '#666' }}>{value?.toFixed(2) || '0.00'}</span>,
  },
  {
    title: '期末余额',
    dataIndex: 'closing_balance',
    key: 'closing_balance',
    width: 120,
    render: (value: number) => (
      <span style={{ color: '#1890ff', fontWeight: 500 }}>{value?.toFixed(2) || '0.00'}</span>
    ),
  },
  {
    title: '备注信息',
    dataIndex: 'remark',
    key: 'remark',
    width: 100,
    render: (value: string) => (
      <span style={{ color: '#666' }}>{value ? value : '无备注信息'}</span>
    ),
  },
  {
    title: '操作时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 160,
    render: (value: string) => <span style={{ color: '#666' }}>{value}</span>,
  },
  {
    title: '类别',
    dataIndex: 'category',
    key: 'category',
    width: 100,
    render: (value: string) => {
      const category: any = {
        merchant_entrance: '商家',
        withdrawal: '提现',
        rebate: '返佣',
        withdraw_processing: '提现申请中',
      };
      return <span style={{ color: '#666' }}>{category[`${value}`] || '用户'}</span>;
    },
  },
];

// 表单配置
export const formList = (): BaseFormList[] => [
  {
    label: '昵称',
    name: 'nickname',
    component: 'Input',
    placeholder: '请输入学校名称',
    rules: FORM_REQUIRED,
  },
  {
    label: '头像',
    name: 'image',
    component: 'customize',
    rules: FORM_REQUIRED,
    render: (props: any) => {
      const { value, onChange } = props;
      return (
        <EnhancedImageUploader
          value={value}
          onChange={onChange}
          maxSize={2}
          baseUrl="http://192.168.10.7:8082"
        />
      );
    },
  },
  {
    label: '状态',
    name: 'status',
    component: 'Select',
    placeholder: '请选择状态',
    rules: FORM_REQUIRED,
    componentProps: {
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 2 },
      ],
    },
  },
];
