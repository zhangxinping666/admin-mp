import React, { useState } from 'react';
import { Modal } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

export interface UploadImg {
  uid: string;
  name: string;
  status?: string;
  url: string;
  response?: {
    url: string;
  };
}

export interface ImagePreviewProps {
  imageUrl: UploadImg[] | UploadImg | string;
  alt?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  baseUrl?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  alt = '图片',
  width = 60,
  height = 60,
  style = {},
  baseUrl = 'http://192.168.10.7:8082',
}) => {
  const [visible, setVisible] = useState(false);

  // 获取完整图片URL的函数
  const getFullImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // 处理不同格式的图片URL
  const getImageUrl = () => {
    let rawUrl = '';

    if (typeof imageUrl === 'string') {
      rawUrl = imageUrl;
    } else if (Array.isArray(imageUrl)) {
      const firstImage = imageUrl[0];
      if (!firstImage) return '';
      rawUrl = firstImage.url || firstImage.response?.url || '';
    } else if (imageUrl && typeof imageUrl === 'object') {
      rawUrl = imageUrl.url || imageUrl.response?.url || '';
    }

    return getFullImageUrl(rawUrl);
  };

  const processedUrl = getImageUrl();

  if (!processedUrl) {
    return (
      <div
        style={{
          width,
          height,
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #d9d9d9',
          borderRadius: '6px',
          color: '#999',
          fontSize: '12px',
          ...style,
        }}
      >
        暂无图片
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          cursor: 'pointer',
          ...style,
        }}
        onClick={() => setVisible(true)}
      >
        <img
          src={processedUrl}
          alt={alt}
          style={{
            width,
            height,
            objectFit: 'cover',
            borderRadius: '6px',
            border: '1px solid #d9d9d9',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0,
            transition: 'opacity 0.3s',
            borderRadius: '6px',
          }}
          className="image-preview-overlay"
        >
          <EyeOutlined style={{ color: 'white', fontSize: '16px' }} />
        </div>
      </div>

      <Modal
        open={visible}
        title="图片预览"
        footer={null}
        onCancel={() => setVisible(false)}
        width={800}
        centered
      >
        <img
          alt={alt}
          style={{
            width: '100%',
            maxHeight: '70vh',
            objectFit: 'contain',
          }}
          src={processedUrl}
        />
      </Modal>

      <style>{`
        .image-preview-overlay:hover {
          opacity: 1 !important;
        }
      `}</style>
    </>
  );
};

export default ImagePreview;