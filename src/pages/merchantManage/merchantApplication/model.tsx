import type { TFunction } from 'i18next';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { FORM_REQUIRED } from '@/utils/config';
import { EnhancedImageUploader } from '@/shared/components/EnhancedImageUploader';

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

// 搜索配置
export const searchList = (): BaseSearchList[] => [
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
];

// 表格列配置
export const tableColumns: TableColumn[] = [
  {
    title: '商家名称',
    dataIndex: 'name',
    key: 'name',
    width: 120,
    ellipsis: true,
    fixed: 'left',
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
    width: 120,
    ellipsis: true,
  },
  {
    title: '商家类型',
    dataIndex: 'merchant_type',
    key: 'merchant_type',
    width: 120,
    ellipsis: true,
  },
  {
    title: '店铺门头图片',
    dataIndex: 'storefront_image',
    key: 'storefront_image',
    width: 220,
    ellipsis: true,
    render: (merchant_img: any) => {
      const getFullImageUrl = (url: any) => {
        if (!url) return '';
        // 确保url是字符串类型
        let urlStr = String(url);
        if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
          return urlStr;
        }
        urlStr = urlStr.replace(/\+/g, '%20'); // 取消注释这一行
        urlStr = urlStr.replace(/\\/g, '/'); // 添加这一行
        return `http://192.168.10.7:8082${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
      };
      const displayUrl = getFullImageUrl(merchant_img);
      return displayUrl ? (
        <div>
          <img
            src={displayUrl}
            alt="店铺门头图片"
            className="w-12 h-12 object-cover rounded-sm shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 mr-2"
          />
        </div>
      ) : (
        <span style={{ color: '#999' }}>无图片</span>
      );
    },
  },
  {
    title: '营业执照图片',
    dataIndex: 'business_license_image',
    key: 'business_license_image',
    width: 220,
    ellipsis: true,
    render: (merchant_img: any) => {
      const getFullImageUrl = (url: any) => {
        if (!url) return '';
        // 确保url是字符串类型
        let urlStr = String(url);
        if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
          return urlStr;
        }
        urlStr = urlStr.replace(/\+/g, '%20'); // 取消注释这一行
        urlStr = urlStr.replace(/\\/g, '/'); // 添加这一行
        return `http://192.168.10.7:8082${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
      };
      const displayUrl = getFullImageUrl(merchant_img);
      return displayUrl ? (
        <div>
          <img
            src={displayUrl}
            alt="营业执照图片"
            className="w-12 h-12 object-cover rounded-sm shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 mr-2"
          />
        </div>
      ) : (
        <span style={{ color: '#999' }}>无图片</span>
      );
    },
  },
  {
    title: '健康证明图片',
    dataIndex: 'medical_certificate_image',
    key: 'medical_certificate_image',
    width: 220,
    ellipsis: true,
    render: (merchant_img: any) => {
      const getFullImageUrl = (url: any) => {
        if (!url) return '';
        // 确保url是字符串类型
        let urlStr = String(url);
        if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
          return urlStr;
        }
        urlStr = urlStr.replace(/\+/g, '%20'); // 取消注释这一行
        urlStr = urlStr.replace(/\\/g, '/'); // 添加这一行
        return `http://192.168.10.7:8082${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
      };
      const displayUrl = getFullImageUrl(merchant_img);
      return displayUrl ? (
        <div>
          <img
            src={displayUrl}
            alt="健康证明图片"
            className="w-12 h-12 object-cover rounded-sm shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 mr-2"
          />
        </div>
      ) : (
        <span style={{ color: '#999' }}>无图片</span>
      );
    },
  },
  {
    title: '支付金额',
    dataIndex: 'amount',
    key: 'amount',
    width: 120,
    ellipsis: true,
  },
  {
    title: '费用说明',
    dataIndex: 'fee_description',
    key: 'fee_description',
    width: 120,
    ellipsis: true,
  },
  {
    title: '备注图片',
    dataIndex: 'remark_image_path',
    key: 'remark_image_path',
    width: 120,
    ellipsis: true,
    render: (merchant_img: any) => {
      const getFullImageUrl = (url: any) => {
        if (!url) return '';
        // 确保url是字符串类型
        const urlStr = String(url);
        if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
          return urlStr;
        }
        return `http://192.168.10.7:8082${urlStr.startsWith('/') ? '' : '/'}${urlStr}`;
      };

      const displayUrl = getFullImageUrl(merchant_img);

      return displayUrl ? (
        <img
          src={displayUrl}
          alt="备注图片"
          style={{
            width: '50px',
            height: '50px',
            objectFit: 'cover',
            borderRadius: '4px',
          }}
        />
      ) : (
        <span style={{ color: '#999' }}>无图片</span>
      );
    },
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: 120,
    ellipsis: true,
  },
  {
    title: '支付渠道',
    dataIndex: 'pay_channel',
    key: 'pay_channel',
    width: 120,
    ellipsis: true,
  },
  {
    title: '订单号',
    dataIndex: 'order_number',
    key: 'order_number',
    width: 120,
    ellipsis: true,
  },
  {
    title: '申请状态',
    dataIndex: 'apply_status',
    key: 'apply_status',
    width: 120,
    ellipsis: true,
    render: (text: number) => {
      if (text === 1) {
        return <span style={{ color: 'orange' }}>待审核</span>;
      } else if (text === 2) {
        return <span style={{ color: 'green' }}>审核通过</span>;
      } else if (text === 3) {
        return <span style={{ color: 'red' }}>审核拒绝</span>;
      }
    },
  },
  {
    title: '支付状态',
    dataIndex: 'pay_status',
    key: 'pay_status',
    width: 120,
    ellipsis: true,
    render: (text) => {
      if (text === 0) {
        return <span style={{ color: 'orange' }}>未支付</span>;
      } else if (text === 1) {
        return <span style={{ color: 'green' }}>已支付</span>;
      }
    },
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: 'address',
    width: 120,
    ellipsis: true,
  },
  {
    title: '店铺类别ID',
    dataIndex: 'category_id',
    key: 'category_id',
    width: 120,
    ellipsis: true,
  },
  {
    title: '开业时间',
    dataIndex: 'open_hour',
    key: 'open_hour',
    width: 120,
    ellipsis: true,
  },
  {
    title: '关闭时间',
    dataIndex: 'close_hour',
    key: 'close_hour',
    width: 120,
    ellipsis: true,
  },
  {
    title: '操作',
    dataIndex: 'action',
    key: 'action',
    width: 120,
    ellipsis: true,
  },
];

// 表单配置项
export const formList = (): BaseFormList[] => [
  {
    label: '商家ID',
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
    label: '申请状态',
    name: 'apply_status',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: {
      placeholder: '请选择申请状态',
      options: [
        { label: '待审核', value: 1 },
        { label: '审核通过', value: 2 },
        { label: '审核拒绝', value: 3 },
      ],
    },
  },
];

// 新增表单配置项
export const addFormList = (params: {
  categoryOptions: any;
  usersOptions: any;
}): BaseFormList[] => [
  {
    name: 'user_id',
    label: '用户ID',
    rules: FORM_REQUIRED,
    component: 'Select',
    componentProps: {
      placeholder: '请选择用户ID',
      disabled: false,
      options: params.usersOptions,
    },
  },
  {
    name: 'name',
    label: '店铺名称',
    component: 'Input',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请输入店铺名称',
    },
  },
  {
    name: 'category',
    label: '店铺类别',
    component: 'Select',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请选择店铺类别',
      options: params.categoryOptions,
    },
  },
  {
    name: 'merchant_type',
    label: '商家类型',
    component: 'Select',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请选择商家类型',
      options: [
        { label: '校内', value: '校内' },
        { label: '校外', value: '校外' },
      ],
    },
  },
  {
    name: 'address',
    label: '地址',
    component: 'Input',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请输入地址',
    },
  },
  {
    label: '位置',
    name: 'location',
    rules: FORM_REQUIRED,
    component: 'customize',
    componentProps: (form) => {
      return {
        initCenter: [116.397428, 39.90923],
        zoom: 15,
        onChange: (value: number[]) => {
          console.log('value', value);
          form.setFieldsValue({
            location: value,
          });
        },
        initValue: () => {
          return form.getFieldValue('location');
        },
      };
    },
    render: (props: any) => {
      return <MapPicker {...props} />;
    },
  },
  {
    name: 'is_dorm_store',
    label: '是否宿舍店',
    component: 'Select',
    rules: FORM_REQUIRED,
    componentProps: {
      options: [
        { label: '是', value: 1 },
        { label: '否', value: 0 },
      ],
    },
  },
  {
    name: 'status',
    label: '营业状态',
    component: 'Select',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请选择营业状态',
      options: [
        { label: '营业中', value: 1 },
        { label: '休息中', value: 2 },
      ],
    },
  },
  {
    label: '营业时间',
    name: 'time_range',
    rules: FORM_REQUIRED,
    component: 'TimeRangePicker',
    componentProps: {
      placeholder: '请选择营业时间',
      format: 'HH:mm',
    },
  },
  {
    name: 'phone',
    label: '手机号',
    component: 'Input',
    rules: PHONE_RULE(true, '请输入手机号'),
    componentProps: {
      placeholder: '请输入手机号',
    },
  },
  {
    name: 'storefront_image',
    label: '商家门头图片',

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
    name: 'business_license_image',
    label: '营业执照图片',

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
    name: 'medical_certificate_image',
    label: '健康证明图片',

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
    name: 'apply_status',
    label: '审批状态',
    component: 'Select',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请选择审批状态',
      options: [
        { label: '待审核', value: 1 },
        { label: '审核通过', value: 2 },
        { label: '审核拒绝', value: 3 },
      ],
    },
  },
  {
    name: 'pay_channel',
    label: '支付渠道',
    component: 'Select',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请选择支付渠道',
      options: [
        { label: '支付宝', value: '支付宝支付' },
        { label: '微信', value: '微信支付' },
      ],
      defaultValue: '支付宝支付',
    },
  },
  {
    name: 'amount',
    label: '金额',
    component: 'Input',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请输入金额',
    },
  },
  {
    name: 'fee_description',
    label: '费用说明',
    component: 'Input',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请输入费用说明',
    },
  },
  {
    name: 'pay_type',
    label: '支付类型',
    component: 'Select',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请选择支付类型',
      options: [
        { label: '真实支付', value: '真实支付' },
        { label: '手动录入', value: '手动录入' },
      ],
    },
  },
  {
    name: 'remark_image',
    label: '支付图像',
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
    name: 'order_number',
    label: '订单号',
    component: 'Input',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请输入订单号',
    },
  },
  {
    name: 'pay_status',
    label: '支付状态',
    component: 'Select',
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: '请选择支付状态',
      options: [
        { label: '支付成功', value: 1 },
        { label: '支付失败', value: 0 },
      ],
    },
  },
];
