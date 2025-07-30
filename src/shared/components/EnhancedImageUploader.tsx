import { Upload, message, Image } from 'antd';
import { UploadProps, UploadFile } from 'antd/es/upload';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { getImage } from '@/servers/img';

type EnhancedImageUploaderProps = {
  value?: string;
  onChange?: (url: string) => void;
  maxSize?: number; // MB
  baseUrl?: string; // 基础URL，用于包装相对路径
  disabled?: boolean;
};

export const EnhancedImageUploader = ({
  value,
  onChange,
  maxSize = 2,
  baseUrl = 'http://192.168.10.7:8082',
  disabled = false,
}: EnhancedImageUploaderProps) => {
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  // 包装URL - 如果是相对路径则添加baseUrl
  const getFullImageUrl = (url: any) => {
    if (!url) return '';
    // 确保url是字符串类型
    const urlStr = String(url);
    if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
      return urlStr;
    }
    // 处理相对路径，确保路径格式正确
    const cleanUrl = urlStr.startsWith('/') ? urlStr : `/${urlStr}`;
    return `${baseUrl}${cleanUrl}`;
  };

  // 自定义上传函数
  const customUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setLoading(true);

    try {
      // 创建FormData
      const formData = new FormData();
      formData.append('images', file);

      // 调用上传接口
      const response = await getImage(formData as any);

      console.log('上传响应:', response);

      // 根据响应格式提取URL
      let imageUrl = '';
      if (response.data) {
        imageUrl = response.data[0] || response.data || response.data.path || '';
      }

      if (imageUrl) {
        // 传递原始的相对路径给表单，用于提交到后端
        onChange?.(imageUrl);
        onSuccess(response, file);
        message.success('图片上传成功');
      } else {
        throw new Error('未获取到图片URL');
      }
    } catch (error: any) {
      console.error('上传失败:', error);
      onError(error);
      message.error(error.message || '图片上传失败');
    } finally {
      setLoading(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isValidType = file.type.startsWith('image/');
    if (!isValidType) {
      message.error('只能上传图片文件');
      return false;
    }

    const isValidSize = file.size / 1024 / 1024 < maxSize;
    if (!isValidSize) {
      message.error(`图片大小不能超过${maxSize}MB`);
      return false;
    }

    return true;
  };

  const displayUrl = getFullImageUrl(value || '');

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Upload
        name="image"
        listType="picture-card"
        showUploadList={false}
        customRequest={customUpload}
        beforeUpload={beforeUpload}
        disabled={disabled || loading}
        style={{ width: '104px', height: '104px' }}
      >
        {displayUrl ? (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <img
              src={displayUrl}
              alt="预览"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '6px',
              }}
            />
            {!disabled && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
                className="upload-mask"
              >
                <div style={{ color: 'white', textAlign: 'center' }}>
                  <PlusOutlined
                    style={{ fontSize: '16px', marginBottom: '4px', display: 'block' }}
                  />
                  <div style={{ fontSize: '12px' }}>更换图片</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlusOutlined style={{ fontSize: '16px', marginBottom: '8px' }} />
            <div style={{ fontSize: '12px' }}>上传图片</div>
          </div>
        )}
      </Upload>

      {displayUrl && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              cursor: 'pointer',
              color: '#1890ff',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            onClick={() => setPreviewVisible(true)}
          >
            <EyeOutlined />
            预览
          </div>
        </div>
      )}

      <Image
        width={200}
        style={{ display: 'none' }}
        src={displayUrl}
        preview={{
          visible: previewVisible,
          onVisibleChange: (visible) => setPreviewVisible(visible),
        }}
      />

      <style>{`
        .upload-mask:hover {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};
