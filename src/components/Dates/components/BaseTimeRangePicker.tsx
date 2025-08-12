import type { TimeRangePickerProps } from 'antd';
import { TimePicker } from 'antd';
import { stringRang2DayjsRang } from '../utils/helper';
import { SmileOutlined } from '@ant-design/icons';

const { RangePicker } = TimePicker;

function BaseTimePicker(props: TimeRangePickerProps) {
  const { value } = props;
  const params = { ...props };

  // 如果值不是dayjs类型则进行转换
  if (value) params.value = stringRang2DayjsRang(value);
  console.log('范围时间选择器value', value);
  return <RangePicker prefix={<SmileOutlined />} {...params} />;
}

export default BaseTimePicker;
