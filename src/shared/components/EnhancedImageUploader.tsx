import { Upload, message, Image, Modal } from 'antd';
import { UploadProps, UploadFile } from 'antd/es/upload';
import { PlusOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { getImage } from '@/servers/img';
import { isArray } from 'lodash';

type EnhancedImageUploaderProps = {
  value?: string | string[];
  onChange?: (url: string | string[]) => void;
  maxSize?: number; // MB
  baseUrl?: string; // 基础URL，用于包装相对路径
  disabled?: boolean;
  maxCount?: number; // 最大上传数量，默认为1（单张）
};

export const EnhancedImageUploader = ({
  value,
  onChange,
  maxSize = 2,
  baseUrl = 'http://192.168.10.7:8082',
  disabled = false,
  maxCount = 1,
}: EnhancedImageUploaderProps) => {
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  // 规范化value为数组格式以便内部处理
  const normalizedValue = isArray(value) ? value : value ? [value] : [];

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
        // 根据maxCount决定返回格式
        let newUrls;
        if (maxCount === 1) {
          // 单张模式，直接替换
          newUrls = imageUrl;
        } else {
          // 多张模式，添加到数组
          newUrls = [...normalizedValue, imageUrl];
        }

        onChange?.(newUrls);
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

  // 删除图片
  const handleDelete = (index: number) => {
    if (disabled) return;

    const newUrls = [...normalizedValue];
    newUrls.splice(index, 1);

    // 根据maxCount决定返回格式
    if (maxCount === 1) {
      onChange?.(newUrls[0] || '');
    } else {
      onChange?.(newUrls);
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

    // 检查是否超过最大数量
    if (maxCount > 1 && normalizedValue.length >= maxCount) {
      message.error(`最多只能上传${maxCount}张图片`);
      return false;
    }

    return true;
  };

  const handlePreview = (url: string, index: number) => {
    setPreviewImage(getFullImageUrl(url));
    setCurrentPreviewIndex(index);
    setPreviewVisible(true);
  };

  // 切换到下一张图片
  const handleNext = () => {
    const nextIndex = (currentPreviewIndex + 1) % normalizedValue.length;
    setPreviewImage(getFullImageUrl(normalizedValue[nextIndex]));
    setCurrentPreviewIndex(nextIndex);
  };

  // 切换到上一张图片
  const handlePrev = () => {
    const prevIndex = (currentPreviewIndex - 1 + normalizedValue.length) % normalizedValue.length;
    setPreviewImage(getFullImageUrl(normalizedValue[prevIndex]));
    setCurrentPreviewIndex(prevIndex);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      {/* 上传按钮 */}
      {!disabled && (maxCount === 1 || normalizedValue.length < maxCount) && (
        <Upload
          name="image"
          listType="picture-card"
          showUploadList={false}
          customRequest={customUpload}
          beforeUpload={beforeUpload}
          disabled={disabled || loading}
          style={{ width: '104px', height: '104px' }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlusOutlined style={{ fontSize: '16px', marginBottom: '8px' }} />
            <div style={{ fontSize: '12px' }}>{maxCount > 1 ? '添加图片' : '上传图片'}</div>
          </div>
        </Upload>
      )}

      {/* 已上传的图片 */}
      {normalizedValue.map((url, index) => {
        const displayUrl = getFullImageUrl(url);
        return (
          <div key={index} style={{ position: 'relative', width: '104px', height: '104px' }}>
            <img
              src={displayUrl}
              alt={`图片 ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '6px',
              }}
              onClick={() => handlePreview(url, index)}
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
                }}
                className="upload-mask"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(index);
                }}
              >
                <DeleteOutlined style={{ color: 'white', fontSize: '18px' }} />
              </div>
            )}
          </div>
        );
      })}

      {/* 自定义预览模态框 */}
      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="80%"
        style={{ top: 20 }}
      >
        <div
          style={{
            position: 'relative',
            height: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {normalizedValue.length > 1 && (
            <button
              onClick={handlePrev}
              style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
              }}
              className="preview-btn"
            >
              上一张
            </button>
          )}
          <img
            src={previewImage}
            alt="预览图片"
            style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
          />
          {normalizedValue.length > 1 && (
            <button
              onClick={handleNext}
              style={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
              }}
              className="preview-btn"
            >
              下一张
            </button>
          )}
          <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, textAlign: 'center' }}>
            {currentPreviewIndex + 1} / {normalizedValue.length}
          </div>
        </div>
      </Modal>

      <style>{`
        .upload-mask:hover {
          opacity: 1 !important;
        }
        .preview-btn {
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          padding: 10px 20px;
          cursor: pointer;
          border-radius: 4px;
        }
        .preview-btn:hover {
          background-color: rgba(0, 0, 0, 0.7);
        }
      `}</style>
    </div>
  );
};
