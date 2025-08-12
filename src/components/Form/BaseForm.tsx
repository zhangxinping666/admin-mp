import type { CSSProperties, ReactNode, Ref } from 'react';
import type { BaseFormData, BaseFormList } from '#/form';
import type { ColProps, FormInstance } from 'antd';
import { forwardRef, useEffect } from 'react';
import { FormProps } from 'antd';
import { Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { getComponent } from './utils/componentMap';
import { filterEmptyStr, filterFormItem, handleValuePropName } from './utils/helper';
import { filterDayjs } from '../Dates/utils/helper';

interface Props extends FormProps {
  list: BaseFormList[];
  data: BaseFormData;
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
  labelCol?: Partial<ColProps>;
  wrapperCol?: Partial<ColProps>;
  handleFinish: FormProps['onFinish'];
  onValuesChange?: FormProps['onValuesChange'];
}

const BaseForm = forwardRef((props: Props, ref: Ref<FormInstance>) => {
  const {
    list,
    data,
    style,
    className,
    children,
    labelCol,
    wrapperCol,
    handleFinish,
    onValuesChange,
  } = props;
  const { t } = useTranslation();
  const [form] = Form.useForm();

  // 监听所有表单值的变化
  const formValues = Form.useWatch([], form);

  // 清除多余参数
  const formProps: Partial<Props> = { ...props };
  delete formProps.list;
  delete formProps.data;
  delete formProps.handleFinish;
  delete formProps.onValuesChange;

  // 监听传入表单数据，如果变化则替换表单
  useEffect(() => {
    form?.resetFields();
    form?.setFieldsValue(props.data);
  }, [form, props.data]);

  const validateMessages = {
    required: t('public.requiredForm', { label: '${label}' }),
    types: {
      email: t('public.validateEmail', { label: '${label}' }),
      number: t('public.validateNumber', { label: '${label}' }),
    },
    number: {
      range: t('public.validateRange', { label: '${label}', max: '${max}', min: '${min}' }),
    },
  };

  /** 回车处理 */
  const onPressEnter = () => {
    form?.submit();
  };

  /**
   * 提交表单
   * @param values - 表单值
   */
  const onFinish: FormProps['onFinish'] = (values) => {
    if (handleFinish) {
      // 将dayjs类型转为字符串
      let params = filterDayjs(values, list);
      // 过滤空字符串和前后空格
      params = filterEmptyStr(params);
      handleFinish?.(params);
    }
  };

  /**
   * 表单提交失败处理
   * @param errorInfo - 错误信息
   */
  const onFinishFailed: FormProps['onFinishFailed'] = (errorInfo) => {
    console.warn('表单错误:', errorInfo);
  };

  /**
   * 检查字段是否应该显示
   * @param item - 表单项
   */
  const shouldShowField = (item: BaseFormList) => {
    if (!item.showWhen) {
      return true; // 没有showWhen条件，默认显示
    }

    const { name, value: conditionValue } = item.showWhen;
    const actualValue = formValues?.[name];

    // 如果条件值是函数，调用函数进行判断
    if (typeof conditionValue === 'function') {
      return conditionValue(actualValue);
    }
    // 如果条件值是数组，检查实际值是否在数组内
    if (Array.isArray(conditionValue)) {
      return conditionValue.includes(actualValue);
    }
    // 否则，直接比较
    return actualValue === conditionValue;
  };

  /**
   * 渲染表单项
   * @param item - 表单项
   */
  const renderFormItem = (item: BaseFormList) => {
    // 检查是否应该显示该字段
    if (!shouldShowField(item)) {
      return null;
    }

    return (
      <Form.Item {...filterFormItem(item)} valuePropName={handleValuePropName(item.component)}>
        {item.component === 'customize'
          ? getComponent(t, item, onPressEnter, form)
          : getComponent(t, item, onPressEnter)}
      </Form.Item>
    );
  };

  return (
    <div className={className} style={style}>
      <Form
        {...formProps}
        ref={ref}
        form={form}
        labelCol={labelCol ? labelCol : { span: 6 }}
        wrapperCol={wrapperCol ? wrapperCol : { span: 18 }}
        initialValues={data}
        validateMessages={validateMessages}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        onValuesChange={onValuesChange}
        autoComplete="off"
      >
        {list?.map((item) => {
          // 检查是否应该显示该字段
          if (!shouldShowField(item)) {
            return null;
          }

          return (
            <div key={`${item.name}`}>
              {!item?.unit && <>{renderFormItem(item)}</>}

              {item.unit && (
                <Form.Item label={item.label}>
                  {renderFormItem({ ...item, noStyle: true })}
                  <span className="ml-5px whitespace-nowrap">{item.unit}</span>
                </Form.Item>
              )}
            </div>
          );
        })}

        {children}
      </Form>
    </div>
  );
});

export default BaseForm;
