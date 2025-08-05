import { Upload, message, Image, Modal } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useState, useRef } from 'react';
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

  // 创建隐藏的文件输入引用
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 验证文件
      if (beforeUpload(file as any)) {
        customUpload({ file } as any);
      }
    }
    // 清空input值，允许重复选择同一文件
    event.target.value = '';
  };

  // 触发文件选择
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
        disabled={disabled || loading}
      />

      {/* 如果没有图片，显示上传按钮 */}
      {normalizedValue.length === 0 && (
        <div
          style={{
            width: '104px',
            height: '104px',
            border: '1px dashed #d9d9d9',
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundColor: disabled ? '#f5f5f5' : '#fafafa',
            transition: 'all 0.3s',
          }}
          onClick={!disabled ? triggerFileSelect : undefined}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = '#1890ff';
              e.currentTarget.style.backgroundColor = '#f0f8ff';
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = '#d9d9d9';
              e.currentTarget.style.backgroundColor = '#fafafa';
            }
          }}
        >
          <PlusOutlined
            style={{
              fontSize: '16px',
              marginBottom: '8px',
              color: disabled ? '#bfbfbf' : '#8c8c8c',
            }}
          />
          <div style={{ fontSize: '12px', color: disabled ? '#bfbfbf' : '#8c8c8c' }}>上传图片</div>
        </div>
      )}

      {/* 已上传的图片 */}
      {normalizedValue.map((url, index) => {
        const displayUrl = getFullImageUrl(url);
        return (
          <div
            key={index}
            className="image-container"
            style={{ position: 'relative', width: '104px', height: '104px' }}
          >
            <img
              src={displayUrl}
              alt={`图片 ${index + 1}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '6px',
                cursor: 'default',
              }}
            />
            {!disabled && (
              <>
                {/* 上传标识覆盖层 */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                    cursor: 'pointer',
                  }}
                  className="upload-overlay"
                  onClick={() => {
                    if (maxCount === 1) {
                      triggerFileSelect();
                    } else {
                      handlePreview(url, index);
                    }
                  }}
                >
                  {maxCount === 1 ? (
                    <>
                      <UploadOutlined
                        style={{ color: 'white', fontSize: '20px', marginBottom: '4px' }}
                      />
                      <div style={{ color: 'white', fontSize: '10px' }}>上传图片</div>
                    </>
                  ) : (
                    <>
                      <EyeOutlined
                        style={{ color: 'white', fontSize: '20px', marginBottom: '4px' }}
                      />
                      <div style={{ color: 'white', fontSize: '10px' }}>预览</div>
                    </>
                  )}
                </div>
                {/* 删除按钮 */}
                <div
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    width: '20px',
                    height: '20px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                    zIndex: 10,
                  }}
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                >
                  <DeleteOutlined style={{ color: 'white', fontSize: '12px' }} />
                </div>
              </>
            )}
          </div>
        );
      })}

      {/* 多图模式下的添加按钮 */}
      {maxCount > 1 &&
        normalizedValue.length > 0 &&
        normalizedValue.length < maxCount &&
        !disabled && (
          <div
            style={{
              width: '104px',
              height: '104px',
              border: '1px dashed #d9d9d9',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backgroundColor: '#fafafa',
              transition: 'all 0.3s',
            }}
            onClick={triggerFileSelect}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1890ff';
              e.currentTarget.style.backgroundColor = '#f0f8ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#d9d9d9';
              e.currentTarget.style.backgroundColor = '#fafafa';
            }}
          >
            <PlusOutlined style={{ fontSize: '16px', marginBottom: '8px', color: '#8c8c8c' }} />
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>添加图片</div>
          </div>
        )}

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
        .delete-btn:hover {
          opacity: 1 !important;
        }
        
        .image-container:hover .upload-overlay {
            opacity: 1 !important;
          }
          
          .image-container:hover .delete-btn {
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
