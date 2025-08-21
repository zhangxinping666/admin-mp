import React, { useState } from 'react';
import { Space, Button, Modal } from 'antd';
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

      {/* 地图弹窗 */}
      <Modal
        title={`${record.name} - 位置查看`}
        open={mapVisible}
        onCancel={() => setMapVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        {mapVisible && hasValidLocation && (
          <>
            {record.address && (
              <div style={{ marginBottom: 16 }}>
                <strong>地址：</strong>
                {record.address}
              </div>
            )}
            <div style={{ marginBottom: 8 }}>
              <strong>坐标：</strong>
              经度 {record.longitude.toFixed(6)}，纬度 {record.latitude.toFixed(6)}
            </div>
            <div style={{ 
              borderRadius: 8, 
              overflow: 'hidden',
              border: '1px solid #e8e8e8' 
            }}>
              <MapViewer 
                center={[record.longitude, record.latitude]} 
                zoom={15}
                height={400}
              />
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default AddressWithLocation;
