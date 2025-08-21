import React, { useEffect } from 'react';
import './style.css';
import AMapLoader from '@amap/amap-jsapi-loader';

const MapPicker = React.memo(
  ({
    center,
    city,
    zoom,
    onSave,
    initValue,
  }: {
    center?: number[];
    initValue?: () => number[];
    city?: number | string;
    zoom?: number;
    onSave?: (data: any) => void; // 选择回调，更新表单数据
  }) => {
    // 计算默认中心点坐标，并确保坐标有效
    const getDefaultCenter = () => {
      // 尝试从initValue函数获取坐标
      if (initValue) {
        const value = initValue();
        if (Array.isArray(value) && value.length === 2 && !isNaN(value[0]) && !isNaN(value[1])) {
          return value;
        }
      }

      // 尝试使用center属性
      if (Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
        return center;
      }

      // 使用默认坐标
      return [116.397428, 39.90923];
    };
    const defaultCenter = getDefaultCenter();
    console.log('地图中心点坐标:', defaultCenter);
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
          // 添加比例尺插件
          const scale = new AMap.Scale();
          map.addControl(scale);
          // 定位
          const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true, // 是否使用高精度定位，默认：true
            timeout: 10000, // 设置定位超时时间，默认：无穷大
            offset: [10, 20], // 定位按钮的停靠位置的偏移量
            zoomToAccuracy: true, //  定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
            position: 'RB', //  定位按钮的排放位置,  RB表示右下
          });

          geolocation.getCurrentPosition(function (status: any, result: any) {
            if (status == 'complete') {
              onComplete(result);
            } else {
              onError(result);
            }
          });

          function onComplete(data: any) {
            // data是具体的定位信息
            console.log('定位成功', data);
          }

          function onError(data: any) {
            // 定位出错
            console.log('定位出错', data);
          }
          // 输入框
          const autoOptions = {
            //城市，默认全国
            city: city || '全国',
            citylimit: true,
            //使用联想输入的 input 的 id
            input: 'search-input',
          };
          const autocomplete = new AMap.AutoComplete(autoOptions);
          autocomplete.on('select', function (e: any) {
            console.log('选择', e);
            map.setCenter(e.poi.location);
            marker.setPosition(e.poi.location);
            onSave?.(e.poi);
          });
        })
        .catch((e) => {
          console.error('地图加载失败:', e);
        });

      return () => {
        map?.destroy();
      };
    }, []);

    return (
      <div>
        {/* 搜索框 */}
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            id="search-input"
            placeholder="请输入地点名称"
            style={{ padding: '5px', width: '200px' }}
          />
        </div>

        {/* 地图容器 */}
        <div id="container" style={{ height: '400px' }}></div>
      </div>
    );
  },
);

export default MapPicker;
