import React from 'react';
import { useState } from 'react';
import { Amap, Marker } from '@amap/amap-react';
import { Typography } from 'antd';
import { Space } from 'antd';

interface MapPickerProps {
  /** 初始中心点坐标 */
  initCenter?: [number, number];
  /** 初始缩放级别 */
  zoom?: number;
  /** 当前值 */
  value?: [number, number];
  /** 值变更回调 */
  onChange?: (value: [number, number]) => void;
  /** 获取初始化中心点坐标 */
  initValue?: () => [number, number];

  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示坐标值 */
  showCoordinate?: boolean;
}

/**
 * 地图选择器组件
 * 用于在表单中选择地理位置坐标
 */
const MapPicker: React.FC<MapPickerProps> = ({
  initCenter,
  zoom,
  value,
  onChange,
  initValue,
}: MapPickerProps) => {
  const [center, setCenter] = useState<any>(initCenter);
  useEffect(() => {
    if (initValue) {
      try {
        const coordinates = initValue();
        // 验证坐标数据格式
        if (!Array.isArray(coordinates) || coordinates.length !== 2) {
          console.error('initValue返回的坐标格式不正确，应为[经度, 纬度]数组');
          return;
        }

        // 验证经纬度范围
        const [lng, lat] = coordinates;
        if (typeof lng !== 'number' || typeof lat !== 'number') {
          console.error('经纬度应为数字类型');
          return;
        }

        if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
          console.error('经纬度范围无效：经度应在-180到180之间，纬度应在-90到90之间');
          return;
        }

        setCenter(coordinates);
      } catch (e) {
        console.error('初始化中心点坐标执行出错:', e);
      }
    }
  }, [initValue]);

  /**
   * 处理地图点击事件
   * @param e 地图点击事件对象
   */
  const handleClick = (map: any, e: { lnglat: { lng: number; lat: number } }) => {
    console.log('e', e.lnglat.lng, e.lnglat.lat);
    setCenter([e.lnglat.lng, e.lnglat.lat]);
    console.log('onChange', onChange);
    onChange?.([e.lnglat.lng, e.lnglat.lat]);
  };

  return (
    <div style={{ height: '300px', paddingBottom: 20, borderRadius: 8 }}>
      {
        <div style={{ marginBottom: 8 }}>
          <Space>
            <Typography.Text strong>经度:</Typography.Text>
            <Typography.Text>{center[0].toFixed(6)}</Typography.Text>
            <Typography.Text strong>纬度:</Typography.Text>
            <Typography.Text>{center[1].toFixed(6)}</Typography.Text>
          </Space>
        </div>
      }
      <Amap center={value || center} zoom={zoom} onHotspotClick={handleClick}>
        {value && <Marker position={value} />}
      </Amap>
    </div>
  );
};

export default MapPicker;
