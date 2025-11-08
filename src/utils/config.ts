import { RuleObject } from 'antd/es/form';
import { StoreValue } from 'antd/es/form/interface';
import type { TFunction } from 'i18next';

/**
 * @description: 配置项
 */
export const TITLE_SUFFIX = (t: TFunction) => t('public.currentName'); // 标题后缀
export const WATERMARK_PREFIX = 'admin'; // 水印前缀
export const LANG = 'lang'; // 语言
export const VERSION = 'admin_version'; // 版本
export const EMPTY_VALUE = '-'; // 空值显示
export const THEME_KEY = 'theme_key'; // 主题

// 初始化分页数据
export const INIT_PAGINATION = {
  page: 1,
  pageSize: 20,
  total: 0,
};

// 日期格式化
export const DATE_FORMAT = 'YYYY-MM-DD';
export const TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

// 公共组件默认值
export const FORM_REQUIRED = [{ required: true }]; // 表单必填校验

/**
 * 校验：不能为负数 (必须 >= 0)
 * @description 注意：此规则不检查空值。
 * @example rules: [...FORM_REQUIRED, ...FORM_NOT_NEGATIVE]
 */
export const FORM_NOT_NEGATIVE = [
  {
    validator: (_: any, value: string | number) => {
      if (value && parseFloat(value as string) < 0) {
        return Promise.reject(new Error('不能为负数'));
      }
      return Promise.resolve();
    },
  },
];
/**
 * 校验：必须大于 0
 * @description 注意：此规则不检查空值。如果需要必填，请配合 FORM_REQUIRED 使用。
 * @example rules: [...FORM_REQUIRED, ...FORM_GT_ZERO]
 */
export const FORM_GT_ZERO = [
  {
    validator: (_: any, value: string | number) => {
      // 如果值存在 (不为 null/undefined/空字符串) 且不大于 0
      if (value && parseFloat(value as string) <= 0) {
        return Promise.reject(new Error('必须大于 0'));
      }
      return Promise.resolve();
    },
  },
];
/**
 * 校验：必须小于 100
 * @description 注意：此规则不检查空值。
 * @example rules: [...FORM_NOT_NEGATIVE, ...FORM_LT_100]
 */
export const FORM_LT_100 = [
  {
    validator: (_: any, value: string | number) => {
      if (value && parseFloat(value as string) >= 100) {
        return Promise.reject(new Error('必须小于 100'));
      }
      return Promise.resolve();
    },
  },
];

/**
 * 校验：必须小于等于 100 (常用于百分比)
 * @description 注意：此规则不检查空值。
 * @example rules: [...FORM_REQUIRED, ...FORM_NOT_NEGATIVE, ...FORM_LTE_100]
 */
export const FORM_LTE_100 = [
  {
    validator: (_: any, value: string | number) => {
      if (value && parseFloat(value as string) > 100) {
        return Promise.reject(new Error('必须小于或等于 100'));
      }
      return Promise.resolve();
    },
  },
];
/**
 *
 * @param required 是否必填
 * @param message 校验失败提示
 *
 * @returns
 */
export const PHONE_RULE = (required: boolean = false, message?: string) => {
  return [
    {
      validator: (rule: RuleObject, value: StoreValue, callback: (error?: string) => void) => {
        if (value && !/^1[3456789]\d{9}$/.test(value as string)) {
          callback(message || '请输入正确的手机号');
        } else {
          callback();
        }
      },
      required: required,
    },
  ];
};

// 新增/编辑标题
export const ADD_TITLE = (t: TFunction, title?: string) =>
  t('public.createTitle', { title: title ?? '' });
export const EDIT_TITLE = (t: TFunction, name: string, title?: string) =>
  `${t('public.editTitle', { title: title ?? '' })}${name ? `(${name})` : ''}`;

// 密码规则
export const PASSWORD_RULE = (t: TFunction) => ({
  pattern: /^(?=.*\d)(?=.*[a-zA-Z])[\da-zA-Z~!@#$%^&*+\.\_\-*]{6,30}$/,
  message: t('login.passwordRuleMessage'),
});

// 环境判断
const ENV = import.meta.env.VITE_APP_ENV as string;
// 生成环境所用的接口
const URL = import.meta.env.VITE_APP_BASE_URL as string;
// 上传地址
export const FILE_API = `${ENV === 'development' ? '/api' : URL}/authority/file/upload-file`;
