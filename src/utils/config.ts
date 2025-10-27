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
