import React, { useState, useEffect } from 'react';
import { Space, InputNumber, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

interface AmountRangeInputProps {
  value?: [number | null, number | null];
  onChange?: (value: [number | null, number | null]) => void;
  onErrorChange?: (error: string) => void; // 新增错误状态回调
  placeholder?: [string, string];
  min?: number;
  max?: number;
  precision?: number;
  style?: React.CSSProperties;
}

/**
 * 金额区间输入组件
 */
const AmountRangeInput: React.FC<AmountRangeInputProps> = (props) => {
  const { t } = useTranslation();
  const {
    value = [null, null],
    onChange,
    onErrorChange, // 新增错误状态回调
    placeholder = [t('public.inputPleaseEnter'), t('public.inputPleaseEnter')],
    min = 0,
    max,
    precision = 2,
    style,
  } = props;

  const [error, setError] = useState<string>('');

  // 验证金额区间
  useEffect(() => {
    let errorMessage = '';
    
    if (value[0] !== null && value[1] === null) {
      errorMessage = '请输入最大金额';
    } else if (value[0] === null && value[1] !== null) {
      errorMessage = '请输入最小金额';
    } else if (value[0] !== null && value[1] !== null && value[0] > value[1]) {
      errorMessage = '最小金额不能大于最大金额';
    }
    
    setError(errorMessage);
    
    // 将错误状态暴露给父组件
    if (onErrorChange) {
      onErrorChange(errorMessage);
    }
  }, [value, onErrorChange]);

  const handleMinChange = (minValue: number | null) => {
    if (onChange) {
      onChange([minValue, value[1]]);
    }
  };

  const handleMaxChange = (maxValue: number | null) => {
    if (onChange) {
      onChange([value[0], maxValue]);
    }
  };

  // 修改组件的返回部分，移除内部的错误显示
  return (
    <div>
      <Space style={{ width: '100%', ...style }}>
        <InputNumber
          style={{ width: '100%' }}
          placeholder={placeholder[0]}
          value={value[0]}
          onChange={handleMinChange}
          min={min}
          max={max}
          precision={precision}
          status={error ? 'error' : undefined}
        />
        <span>-</span>
        <InputNumber
          style={{ width: '100%' }}
          placeholder={placeholder[1]}
          value={value[1]}
          onChange={handleMaxChange}
          min={min}
          max={max}
          precision={precision}
          status={error ? 'error' : undefined}
        />
      </Space>
      {/* 移除这行，让表单统一显示错误 */}
      {/* {error && <Typography.Text type="danger" style={{ fontSize: '12px' }}>{error}</Typography.Text>} */}
    </div>
  );
};

export default AmountRangeInput;
