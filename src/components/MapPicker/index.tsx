import React from 'react';
import { useState, useEffect } from 'react';
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
  const defaultCenter: [number, number] = [116.397428, 39.90923];
  const [center, setCenter] = useState<[number, number]>(initCenter || defaultCenter);

  // 监听initCenter变化，更新地图中心点
  useEffect(() => {
    if (initCenter && Array.isArray(initCenter) && initCenter.length === 2 && 
        typeof initCenter[0] === 'number' && typeof initCenter[1] === 'number' &&
        initCenter[0] !== 0 && initCenter[1] !== 0) {
      console.log('MapPicker: initCenter changed', initCenter);
      setCenter(initCenter);
    }
  }, [initCenter]);

  // 监听value变化，如果有value则使用value作为中心点
  useEffect(() => {
    if (value && Array.isArray(value) && value.length === 2 && 
        typeof value[0] === 'number' && typeof value[1] === 'number' &&
        value[0] !== 0 && value[1] !== 0) {
      console.log('MapPicker: value changed', value);
      setCenter(value);
    }
  }, [value]);

  /**
   * 处理地图点击事件
   * @param e 地图点击事件对象
   */
  const handleClick = (map: any, e: { lnglat: { lng: number; lat: number } }) => {
    console.log('e', e.lnglat.lng, e.lnglat.lat);
    const newPosition: [number, number] = [e.lnglat.lng, e.lnglat.lat];
    setCenter(newPosition);
    console.log('onChange', onChange);
    onChange?.(newPosition);
  };

  // 确保center是有效的数组
  const safeCenter = center && Array.isArray(center) && center.length === 2 ? center : defaultCenter;

  return (
    <div style={{ height: '300px', paddingBottom: 20, borderRadius: 8 }}>
      <div style={{ marginBottom: 8 }}>
        <Space>
          <Typography.Text strong>经度:</Typography.Text>
          <Typography.Text>{safeCenter[0].toFixed(6)}</Typography.Text>
          <Typography.Text strong>纬度:</Typography.Text>
          <Typography.Text>{safeCenter[1].toFixed(6)}</Typography.Text>
        </Space>
      </div>
      <Amap center={safeCenter} zoom={zoom || 15} onHotspotClick={handleClick}>
        <Marker position={safeCenter} />
      </Amap>
    </div>
  );
};

export default MapPicker;
