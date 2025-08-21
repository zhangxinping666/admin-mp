import React, { useEffect, useRef, useState } from 'react';
import { Modal, Spin, message } from 'antd';
import AMapLoader from '@amap/amap-jsapi-loader';

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
  const [loading, setLoading] = useState(false);
  const [mapError, setMapError] = useState<string>('');
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // 使用固定的容器ID
  const mapContainerId = useRef(`map-container-${Math.random().toString(36).substr(2, 9)}`).current;

  useEffect(() => {
    if (!visible) {
      return;
    }

    // 延迟初始化，确保DOM已经渲染
    const initTimer = setTimeout(() => {
      initMap();
    }, 100);

    return () => {
      clearTimeout(initTimer);
      destroyMap();
    };
  }, [visible]);

  const initMap = async () => {
    // 检查容器是否存在
    const container = document.getElementById(mapContainerId);
    if (!container) {
      setMapError('地图容器初始化失败');
      return;
    }

    setLoading(true);
    setMapError('');

    try {
      // 设置安全密钥
      (window as any)._AMapSecurityConfig = {
        securityJsCode:
          import.meta.env.VITE_AMAP_SECURITY_CODE || 'a5de0f21bc64ec16502458795e3d0827',
      };

      const AMap = await AMapLoader.load({
        key: import.meta.env.VITE_AMAP_KEY || 'f757a8c9e806b7d556eb132b2eba1d33',
        version: '2.0',
        plugins: ['AMap.Marker', 'AMap.ToolBar', 'AMap.Scale'],
      });

      console.log('高德地图API加载成功');

      // 再次检查容器（防止异步过程中DOM被销毁）
      const containerCheck = document.getElementById(mapContainerId);
      if (!containerCheck) {
        console.error('地图容器已被销毁');
        setMapError('地图容器已被销毁');
        setLoading(false);
        return;
      }

      // 创建地图实例
      const mapInstance = new AMap.Map(mapContainerId, {
        zoom: zoom,
        center: position,
        viewMode: '2D',
        resizeEnable: true,
        showLabel: true,
      });

      // 等待地图加载完成
      mapInstance.on('complete', () => {
        console.log('地图渲染完成');

        // 添加工具栏和比例尺
        mapInstance.addControl(
          new AMap.ToolBar({
            position: 'RT',
          }),
        );
        mapInstance.addControl(new AMap.Scale());

        // 添加标记
        const marker = new AMap.Marker({
          position: position,
          map: mapInstance,
          title: address || '位置标记',
          animation: 'AMAP_ANIMATION_DROP',
        });

        // 自动调整视野
        mapInstance.setFitView([marker], false, [50, 50, 50, 50]);

        setLoading(false);
      });

      mapRef.current = mapInstance;
      console.log('地图实例创建成功');
    } catch (error: any) {
      console.error('地图初始化失败:', error);
      setMapError(error.message || '地图加载失败');
      setLoading(false);
      message.error('地图加载失败，请检查网络连接或刷新页面重试');
    }
  };

  const destroyMap = () => {
    if (mapRef.current) {
      console.log('销毁地图实例');
      try {
        mapRef.current.destroy();
      } catch (e) {
        console.error('销毁地图失败:', e);
      }
      mapRef.current = null;
    }
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
      maskClosable={false}
      afterOpenChange={(open) => {
        // Modal完全打开后再初始化地图
        if (open && !mapRef.current) {
          console.log('Modal已打开，准备初始化地图');
        }
      }}
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
      <div
        style={{
          position: 'relative',
          height: '400px',
          borderRadius: 8,
          overflow: 'hidden',
          background: '#f5f5f5',
          border: '1px solid #e8e8e8',
        }}
      >
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Spin tip="地图加载中..." />
          </div>
        )}

        {mapError && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
              color: '#ff4d4f',
              textAlign: 'center',
            }}
          >
            <div>地图加载失败</div>
            <div style={{ fontSize: 12, marginTop: 8 }}>{mapError}</div>
            <div style={{ fontSize: 12, marginTop: 8, color: '#666' }}>
              请检查网络连接或刷新页面重试
            </div>
          </div>
        )}

        <div
          ref={mapContainerRef}
          id={mapContainerId}
          style={{
            width: '100%',
            height: '100%',
            visibility: loading || mapError ? 'hidden' : 'visible',
          }}
        />
      </div>

      {/* 调试信息 */}
      {process.env.NODE_ENV === 'development' && (
        <div
          style={{
            marginTop: 10,
            padding: '8px',
            background: '#f0f0f0',
            borderRadius: 4,
            fontSize: 12,
            color: '#666',
            fontFamily: 'monospace',
          }}
        ></div>
      )}
    </Modal>
  );
};

export default MapViewer;
