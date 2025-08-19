import React, { useState } from 'react';
import { Space, Button } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import MapViewer from '@/components/MapViewer';
import type { School } from '../model';

interface AddressWithLocationProps {
  record: School;
}

/**
 * 地址与定位图标组件
 * 显示地址文本，如果有经纬度则显示定位图标
 */
const AddressWithLocation: React.FC<AddressWithLocationProps> = ({ record }) => {
  const [mapVisible, setMapVisible] = useState(false);
  // 检查是否有有效的经纬度数据
  const hasValidLocation = record.longitude && record.latitude && 
    typeof record.longitude === 'number' && 
    typeof record.latitude === 'number';

  return (
    <>
      <Space>
        <span>{record.address || '-'}</span>
        {hasValidLocation && (
          <Button
            type="link"
            size="small"
            icon={<EnvironmentOutlined />}
            onClick={() => setMapVisible(true)}
            style={{
              padding: '0 4px',
              height: 'auto',
              color: '#1890ff',
            }}
            title="查看位置"
          />
        )}
      </Space>

      {hasValidLocation && (
        <MapViewer
          visible={mapVisible}
          onClose={() => setMapVisible(false)}
          position={[record.longitude, record.latitude]}
          title={`${record.name} - 位置查看`}
          address={record.address}
        />
      )}
    </>
  );
};

export default AddressWithLocation;
