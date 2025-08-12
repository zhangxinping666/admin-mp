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
}: MapPickerProps) => {
  const [center, setCenter] = useState<any>(initCenter);

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
