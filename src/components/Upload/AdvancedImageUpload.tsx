import React, { useState, useCallback } from 'react';
import { Upload, Button, Modal, message, Progress, Space } from 'antd';
import {
  UploadOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
  CameraOutlined,
  FileImageOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps, RcFile } from 'antd/es/upload/interface';

export interface AdvancedImageUploadProps {
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  maxCount?: number;
  maxSize?: number; // MB
  accept?: string;
  listType?: 'text' | 'picture' | 'picture-card' | 'picture-circle';
  disabled?: boolean;
  multiple?: boolean;
  showUploadList?: boolean;
  uploadText?: string;
  cropEnabled?: boolean;
  quality?: number; // 图片质量 0-1
  resize?: {
    width?: number;
    height?: number;
    mode?: 'contain' | 'cover' | 'fill';
  };
}

const AdvancedImageUpload: React.FC<AdvancedImageUploadProps> = ({
  value = [],
  onChange,
  maxCount = 1,
  maxSize = 2,
  accept = 'image/png,image/jpeg,image/jpg,image/gif,image/webp',
  listType = 'picture-card',
  disabled = false,
  multiple = false,
  showUploadList = true,
  uploadText = '上传图片',
  cropEnabled = false,
  quality = 0.8,
  resize,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // 获取文件的base64
  const getBase64 = useCallback((file: RcFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }, []);

  // 图片压缩
  const compressImage = useCallback(
    (file: RcFile, quality: number = 0.8): Promise<Blob> => {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const img = new Image();

        img.onload = () => {
          let { width, height } = img;

          // 如果设置了resize参数，调整尺寸
          if (resize) {
            if (resize.width && resize.height) {
              width = resize.width;
              height = resize.height;
            } else if (resize.width) {
              height = (height * resize.width) / width;
              width = resize.width;
            } else if (resize.height) {
              width = (width * resize.height) / height;
              height = resize.height;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(resolve, file.type, quality);
        };

        img.src = URL.createObjectURL(file);
      });
    },
    [resize]
  );

  // 预览图片
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  // 文件上传前的校验
  const beforeUpload = useCallback(
    (file: RcFile) => {
      // 检查文件类型
      const acceptTypes = accept.split(',').map((type) => type.trim());
      const isValidType = acceptTypes.some((type) => {
        if (type.startsWith('.')) {
          return file.name.toLowerCase().endsWith(type.toLowerCase());
        }
        return file.type === type;
      });

      if (!isValidType) {
        message.error(`只能上传 ${accept} 格式的图片!`);
        return false;
      }

      // 检查文件大小
      const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
      if (!isLtMaxSize) {
        message.error(`图片大小不能超过 ${maxSize}MB!`);
        return false;
      }

      return true;
    },
    [accept, maxSize]
  );

  // 自定义上传请求
  const customRequest: UploadProps['customRequest'] = useCallback(
    async (options) => {
      const { file, onSuccess, onError, onProgress } = options;
      const rcFile = file as RcFile;

      try {
        // 模拟上传进度
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const currentProgress = prev[rcFile.uid] || 0;
            const newProgress = Math.min(currentProgress + Math.random() * 30, 90);
            onProgress?.({ percent: newProgress });
            return { ...prev, [rcFile.uid]: newProgress };
          });
        }, 200);

        // 压缩图片（如果需要）
        let processedFile: Blob | RcFile = rcFile;
        if (quality < 1 || resize) {
          processedFile = await compressImage(rcFile, quality);
        }

        // 转换为base64
        const base64 = await getBase64(rcFile);

        // 模拟网络延迟
        await new Promise((resolve) => setTimeout(resolve, 500));

        clearInterval(progressInterval);
        setUploadProgress((prev) => ({ ...prev, [rcFile.uid]: 100 }));
        onProgress?.({ percent: 100 });

        // 成功回调
        onSuccess?.({
          url: base64,
          name: rcFile.name,
          status: 'done',
          size: processedFile.size,
          type: rcFile.type,
        });
      } catch (error) {
        console.error('Upload error:', error);
        onError?.(error as Error);
      }
    },
    [quality, resize, compressImage, getBase64]
  );

  // 文件列表变化
  const handleChange: UploadProps['onChange'] = useCallback(
    ({ fileList: newFileList }) => {
      // 清理已完成上传的进度
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        newFileList.forEach((file) => {
          if (file.status === 'done' || file.status === 'error') {
            delete newProgress[file.uid];
          }
        });
        return newProgress;
      });

      onChange?.(newFileList);
    },
    [onChange]
  );

  // 移除文件
  const handleRemove = useCallback(
    (file: UploadFile) => {
      const newFileList = value.filter((item) => item.uid !== file.uid);
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[file.uid];
        return newProgress;
      });
      onChange?.(newFileList);
    },
    [value, onChange]
  );

  // 上传按钮
  const uploadButton = (
    <div style={{ textAlign: 'center' }}>
      {listType === 'picture-card' ? (
        <>
          <PlusOutlined style={{ fontSize: '16px', color: '#999' }} />
          <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>{uploadText}</div>
        </>
      ) : (
        <Button icon={<UploadOutlined />} disabled={disabled}>
          {uploadText}
        </Button>
      )}
    </div>
  );

  // 自定义上传列表项
  const customItemRender = (originNode: React.ReactElement, file: UploadFile) => {
    const progress = uploadProgress[file.uid];
    if (progress && progress < 100) {
      return (
        <div style={{ position: 'relative' }}>
          {originNode}
          <Progress
            percent={progress}
            size="small"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              margin: 0,
            }}
          />
        </div>
      );
    }
    return originNode;
  };

  return (
    <>
      <Upload
        accept={accept}
        listType={listType}
        fileList={value}
        onPreview={handlePreview}
        onChange={handleChange}
        onRemove={handleRemove}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        disabled={disabled}
        multiple={multiple}
        maxCount={maxCount}
        showUploadList={{
          showPreviewIcon: true,
          showRemoveIcon: !disabled,
          showDownloadIcon: false,
          ...showUploadList,
        }}
        itemRender={customItemRender}
      >
        {value.length >= maxCount ? null : uploadButton}
      </Upload>

      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        centered
      >
        <img
          alt="preview"
          style={{
            width: '100%',
            maxHeight: '70vh',
            objectFit: 'contain',
          }}
          src={previewImage}
        />
      </Modal>
    </>
  );
};

export default AdvancedImageUpload;