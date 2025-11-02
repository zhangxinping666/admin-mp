import React, { useEffect } from 'react';
import './style.css';
import AMapLoader from '@amap/amap-jsapi-loader';

const MapViewer = React.memo(
  ({ center, zoom, height }: { center?: number[]; zoom?: number; height?: number }) => {
    // 计算默认中心点坐标，并确保坐标有效
    const getDefaultCenter = () => {
      // 尝试使用center属性
      if (Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
        return center;
      }

      // 使用默认坐标
      return [116.397428, 39.90923];
    };
    const defaultCenter = getDefaultCenter();
    useEffect(() => {
      let map: any = null;
      (window as any)._AMapSecurityConfig = {
        securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE,
      };
      AMapLoader.load({
        key: import.meta.env.VITE_AMAP_KEY + '',
        version: '2.0',
        plugins: ['AMap.Scale', 'AMap.AutoComplete', 'AMap.Geolocation'],
      })
        .then((AMap) => {
          map = new AMap.Map('container', {
            viewMode: '3D',
            zoom: zoom || 11,
            center: new AMap.LngLat(defaultCenter[0], defaultCenter[1]),
          });
          //创建一个 Marker 实例：
          const marker = new AMap.Marker({
            position: new AMap.LngLat(defaultCenter[0], defaultCenter[1]), //经纬度对象，也可以是经纬度构成的一维数组[116.39, 39.9]
          });
          //将创建的点标记添加到已有的地图实例：
          map.add(marker);
        })
        .catch((e) => {
          console.error('地图加载失败:', e);
        });

      return () => {
        map?.destroy();
      };
    }, []);

    return <div id="container" style={{ minWidth: '200px', height: height || '400px' }}></div>;
  },
);

export default MapViewer;
