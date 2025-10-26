import React, { useEffect, useRef } from 'react';
import './style.css';
// @ts-ignore 忽略类型检查,因为高德地图SDK没有提供TypeScript类型定义
import AMapLoader from '@amap/amap-jsapi-loader';

const MapPicker = React.memo(
  ({
    center,
    city,
    zoom,
    onSave,
    onChange,
    initValue,
    value,
  }: {
    center?: number[];
    initValue?: () => number[];
    value?: number[]; // 添加value属性，用于受控组件
    city?: number | string;
    zoom?: number;
    onSave?: (data: any) => void; // 选择回调，更新表单数据
    onChange?: (location: number[]) => void; // 位置变化回调
  }) => {
    const mapRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const [currentPosition, setCurrentPosition] = React.useState<number[]>(() => {
      // 优先使用value属性
      if (
        value &&
        Array.isArray(value) &&
        value.length === 2 &&
        !isNaN(value[0]) &&
        !isNaN(value[1])
      ) {
        return value;
      }
      // 然后尝试从initValue函数获取坐标
      if (initValue) {
        const initVal = initValue();
        if (
          Array.isArray(initVal) &&
          initVal.length === 2 &&
          !isNaN(initVal[0]) &&
          !isNaN(initVal[1])
        ) {
          return initVal;
        }
      }
      // 尝试使用center属性
      if (Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
        return center;
      }
      // 使用默认坐标
      return [116.397428, 39.90923];
    });

    console.log('当前位置坐标:', currentPosition);
    useEffect(() => {
      (window as any)._AMapSecurityConfig = {
        securityJsCode: import.meta.env.VITE_AMAP_SECURITY_CODE,
      };
      AMapLoader.load({
        key: import.meta.env.VITE_AMAP_KEY + '',
        version: '2.0',
        plugins: ['AMap.Scale', 'AMap.AutoComplete', 'AMap.Geolocation', 'AMap.Geocoder'],
      })
        .then((AMap: any) => {
          const map = new AMap.Map('container', {
            viewMode: '3D',
            zoom: zoom || 11,
            center: new AMap.LngLat(currentPosition[0], currentPosition[1]),
          });
          mapRef.current = map;

          //创建一个可拖拽的 Marker 实例：
          const marker = new AMap.Marker({
            position: new AMap.LngLat(currentPosition[0], currentPosition[1]), //经纬度对象
            draggable: true, // 设置标记可拖拽
            cursor: 'move', // 鼠标悬停时显示移动光标
          });
          markerRef.current = marker;

          //将创建的点标记添加到已有的地图实例：
          map.add(marker);

          // 创建Geocoder实例用于逆地理编码
          const geocoder = new AMap.Geocoder({
            city: '全国',
            radius: 1000,
            extensions: 'all',
          });

          // 逆地理编码函数
          const getAddressFromPosition = (lng: number, lat: number, callback?: (address: string) => void) => {
            geocoder.getAddress([lng, lat], function (status: string, result: any) {
              if (status === 'complete' && result.info === 'OK') {
                const address = result.regeocode.formattedAddress;
                console.log('逆地理编码成功:', address);
                if (callback) {
                  callback(address);
                }
              } else {
                console.log('逆地理编码失败:', status, result);
                if (callback) {
                  callback('');
                }
              }
            });
          };

          // 监听标记拖拽结束事件
          marker.on('dragend', function (e: any) {
            const position = marker.getPosition();
            console.log('标记拖拽结束:', position);
            const newPosition = [position.lng, position.lat];

            // 更新内部状态
            setCurrentPosition(newPosition);

            // 触发onChange回调，更新表单位置数据
            if (onChange) {
              onChange(newPosition);
            }

            // 获取地址并触发onSave回调
            getAddressFromPosition(position.lng, position.lat, (address) => {
              if (onSave) {
                onSave({
                  location: { lng: position.lng, lat: position.lat },
                  name: address || '地图选点',
                  address: address || '地图选点位置',
                });
              }
            });
          });
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
            console.log('搜索选择:', e);
            const newPosition = [e.poi.location.lng, e.poi.location.lat];

            // 更新内部状态
            setCurrentPosition(newPosition);

            // 更新地图和标记
            map.setCenter(e.poi.location);
            marker.setPosition(e.poi.location);

            // 触发 onSave 回调，传递完整的地点信息
            if (onSave) {
              onSave({
                location: { lng: e.poi.location.lng, lat: e.poi.location.lat },
                name: e.poi.name || '搜索选点',
                address: e.poi.address || e.poi.district || e.poi.name || '搜索选点位置',
              });
            }

            // 触发 onChange 回调，更新坐标
            if (onChange && e.poi.location) {
              onChange(newPosition);
            }
          });

          // 点击地图选择位置
          map.on('click', function (e: any) {
            console.log('点击地图', e);

            // 点击地图时，将标记移动到点击位置
            marker.setPosition(e.lnglat);

            // 更新内部状态
            const newPosition = [e.lnglat.lng, e.lnglat.lat];
            setCurrentPosition(newPosition);

            // 先触发 onChange 回调，立即更新坐标
            if (onChange) {
              onChange(newPosition);
            }

            // 然后获取地址并触发 onSave 回调
            getAddressFromPosition(e.lnglat.lng, e.lnglat.lat, (address) => {
              if (onSave) {
                onSave({
                  location: { lng: e.lnglat.lng, lat: e.lnglat.lat },
                  name: address || '地图选点',
                  address: address || '地图选点位置',
                });
              }
            });
          });
        })
        .catch((e: any) => {
          console.error('地图加载失败:', e);
        });

      return () => {
        mapRef.current?.destroy();
        mapRef.current = null;
        markerRef.current = null;
      };
    }, []);

    return (
      <div>
        {/* 搜索框和提示 */}
        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="text"
            id="search-input"
            placeholder="请输入地点名称搜索"
            style={{
              padding: '5px',
              width: '300px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
            }}
          />
        </div>

        {/* 地图容器 */}
        <div
          id="container"
          style={{ height: '400px', borderRadius: '4px', overflow: 'hidden' }}
        ></div>
      </div>
    );
  },
);

export default MapPicker;
