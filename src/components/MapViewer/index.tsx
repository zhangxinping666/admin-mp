import React from 'react';
import { Modal } from 'antd';
import { Amap, Marker } from '@amap/amap-react';

interface MapViewerProps {
  /** 是否显示弹窗 */
  visible: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 位置坐标 [经度, 纬度] */
  position: [number, number];
  /** 弹窗标题 */
  title?: string;
  /** 地址文本 */
  address?: string;
  /** 缩放级别 */
  zoom?: number;
}

/**
 * 只读地图查看器组件
 * 用于在弹窗中展示位置信息，不支持编辑
 */
const MapViewer: React.FC<MapViewerProps> = ({
  visible,
  onClose,
  position,
  title = '位置查看',
  address,
  zoom = 15,
}) => {
  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      {address && (
        <div style={{ marginBottom: 16 }}>
          <strong>地址：</strong>
          {address}
        </div>
      )}
      <div style={{ marginBottom: 8 }}>
        <strong>坐标：</strong>
        经度 {position[0].toFixed(6)}，纬度 {position[1].toFixed(6)}
      </div>
      <div style={{ height: '400px', borderRadius: 8, overflow: 'hidden' }}>
        <Amap center={position} zoom={zoom}>
          <Marker position={position} />
        </Amap>
      </div>
    </Modal>
  );
};

export default MapViewer;