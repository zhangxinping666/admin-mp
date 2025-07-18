import type {
  InputProps,
  InputNumberProps,
  SelectProps,
  TreeSelectProps,
  RadioProps,
  DatePickerProps,
  TimePickerProps,
  UploadProps,
  RateProps,
  CheckboxProps,
  SliderSingleProps,
  TimeRangePickerProps,
  TransferProps,
  FormItemProps,
} from 'antd';
import type { Key, ReactNode } from 'react';
import type { RangePickerProps } from 'antd/lib/date-picker';
import type { DefaultOptionType } from 'antd/lib/select';
import type { RuleObject } from 'antd/lib/form';
import type { ServerResult } from '@manpao/request';
import type { BusinessComponents } from '@/components/Business';
import type { EditorProps } from '@/components/WangEditor';
import type { FormInstance } from 'antd/es/form';

// 数据类型
export type BaseFormData = Record<string, unknown>;

// 基础数据组件
type DefaultDataComponents =
  | 'Input'
  | 'InputNumber'
  | 'TextArea'
  | 'InputPassword'
  | 'AutoComplete'
  | 'customize';

// 下拉组件
type SelectComponents = 'Select' | 'TreeSelect' | 'ApiSelect' | 'ApiTreeSelect';

// 复选框组件
type CheckboxComponents = 'Checkbox' | 'CheckboxGroup';

// 单选框组件
type RadioComponents = 'RadioGroup' | 'Switch';

// 时间组件
type TimeComponents = 'DatePicker' | 'RangePicker' | 'TimePicker' | 'TimeRangePicker';

// 上传组件
type UploadComponents = 'Upload';

// 星级组件
type RateComponents = 'Rate';

// 穿梭框组件
type TransferComponents = 'Transfer';

// 滑动输入条组件
type SliderComponents = 'Slider';

// 自定义组件
type CustomizeComponents = 'Customize';

// 富文本编辑器
type EditorComponents = 'RichEditor';

// 密码强度组件
type PasswordStrength = 'PasswordStrength';

type AmountRangeInput = 'AmountRangeInput';
// 组件集合
export type ComponentType =
  | DefaultDataComponents
  | SelectComponents
  | CheckboxComponents
  | TimeComponents
  | RadioComponents
  | CustomizeComponents
  | UploadComponents
  | RateComponents
  | SliderComponents
  | EditorComponents
  | PasswordStrength
  | TransferComponents
  | BusinessComponents
  | AmountRangeInput;

// 接口返回的选项类型
export interface ApiResult extends Omit<DefaultOptionType, 'value'> {
  label: ReactNode;
  title?: ReactNode;
  key?: Key;
  value?: string | number;
}

// api 函数类型
export type ApiFn = {
  <T extends unknown[]>(...params: T): Promise<ServerResult<unknown>>;
};

// api 参数
interface ApiParam {
  api?: ApiFn;
  params?: object | unknown[];
  apiResultKey?: string;
}

// ApiSelect
export type ApiSelectProps = ApiParam & SelectProps;

// ApiTreeSelect
export type ApiTreeSelectProps = ApiParam & TreeSelectProps;

// 所有组件的参数类型合集
export type ComponentProps =
  | InputProps
  | InputNumberProps
  | SelectProps
  | TreeSelectProps
  | CheckboxProps
  | RadioProps
  | DatePickerProps
  | TimePickerProps
  | UploadProps
  | RateProps
  | SliderSingleProps
  | TimeRangePickerProps
  | TransferProps
  | RangePickerProps
  | ApiSelectProps
  | ApiTreeSelectProps
  | EditorProps;

// 渲染时可用的组件参数合集
export type RenderComponentProps = InputProps &
  InputNumberProps &
  SelectProps &
  TreeSelectProps &
  CheckboxProps &
  RadioProps &
  DatePickerProps &
  TimePickerProps &
  UploadProps &
  RateProps &
  SliderSingleProps &
  TimeRangePickerProps &
  TransferProps &
  RangePickerProps &
  ApiSelectProps &
  ApiTreeSelectProps &
  EditorProps;

// 表单校验规则
export type FormRule = RuleObject & {
  trigger?: 'blur' | 'change' | ['change', 'blur'];
};

// 表单项定义
export interface BaseFormList extends FormItemProps {
  name: string | string[]; // 表单域字段
  label: string; // 标签
  placeholder?: string; // 占位符
  hidden?: boolean; // 是否隐藏
  unit?: string; // 单位，无法和extra一起显示
  rules?: FormRule[]; // 校验规则
  labelWidth?: number; // label宽度
  wrapperWidth?: number; // 内容宽度
  component: ComponentType; // 组件类型
  componentProps?: ComponentProps | ((form: FormInstance) => ComponentProps); // 支持静态或动态返回组件参数
  render?: (props: RenderComponentProps) => ReactNode; // 自定义渲染
}

// 搜索项定义
export interface BaseSearchList extends BaseFormList {
  labelWidth?: number; // 临时使用

  // TODO...
}
