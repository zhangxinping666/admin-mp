import React, { useState, useCallback } from 'react';
import { Upload, Button, message, Space } from 'antd';
import { UploadOutlined, ScissorOutlined } from '@ant-design/icons';
import type { UploadProps, UploadFile } from 'antd';
import ImageCropper from './ImageCropper';
import { validateImage, fileToBase64 } from '@/utils/imageUtils';

export interface CropImageUploadProps extends Omit<UploadProps, 'customRequest' | 'beforeUpload'> {
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  maxCount?: number;
  maxSize?: number; // MB
  aspectRatio?: number; // 裁剪比例
  cropShape?: 'rect' | 'round'; // 裁剪形状
  enableCrop?: boolean; // 是否启用裁剪
  cropQuality?: number; // 裁剪质量
  allowedTypes?: string[];
  onUploadSuccess?: (file: UploadFile, fileList: UploadFile[]) => void;
  onUploadError?: (error: any, file: UploadFile) => void;
}

const CropImageUpload: React.FC<CropImageUploadProps> = ({
  value = [],
  onChange,
  maxCount = 1,
  maxSize = 2,
  aspectRatio,
  cropShape = 'rect',
  enableCrop = true,
  cropQuality = 0.9,
  allowedTypes = ['image/jpeg', 'image/png'],
  onUploadSuccess,
  onUploadError,
  disabled,
  ...restProps
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>(value);
  const [cropperVisible, setCropperVisible] = useState(false);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [pendingFile, setPendingFile] = useState<UploadFile | null>(null);

  // 同步外部value
  React.useEffect(() => {
    setFileList(value);
  }, [value]);

  // 文件上传前的校验
  const beforeUpload = useCallback(async (file: File) => {
    try {
      // 验证图片
      const validation = await validateImage(file, {
        maxSize,
        allowedTypes,
      });

      if (!validation.valid) {
        message.error(validation.error);
        return false;
      }

      // 如果启用裁剪，显示裁剪器
      if (enableCrop) {
        const uploadFile: UploadFile = {
          uid: `${Date.now()}-${Math.random()}`,
          name: file.name,
          status: 'uploading',
          originFileObj: file,
        };
        
        setCurrentFile(file);
        setPendingFile(uploadFile);
        setCropperVisible(true);
        return false; // 阻止自动上传
      }

      return true;
    } catch (error) {
      message.error('文件验证失败');
      return false;
    }
  }, [maxSize, allowedTypes, enableCrop]);

  // 自定义上传请求
  const customRequest = useCallback(async ({ file, onSuccess, onError }: any) => {
    try {
      // 模拟上传过程
      const base64 = await fileToBase64(file as File);
      
      // 模拟上传延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = {
        url: base64,
        name: (file as File).name,
        status: 'done',
      };
      
      onSuccess(response);
    } catch (error) {
      onError(error);
    }
  }, []);

  // 处理文件列表变化
  const handleChange = useCallback((info: { fileList: UploadFile[] }) => {
    const newFileList = info.fileList.map(file => {
      if (file.response) {
        return {
          ...file,
          url: file.response.url,
          status: 'done' as const,
        };
      }
      return file;
    });

    setFileList(newFileList);
    onChange?.(newFileList);

    // 处理上传成功的文件
    const successFile = newFileList.find(file => 
      file.status === 'done' && !fileList.find(f => f.uid === file.uid)
    );
    if (successFile) {
      onUploadSuccess?.(successFile, newFileList);
    }

    // 处理上传失败的文件
    const errorFile = newFileList.find(file => 
      file.status === 'error' && !fileList.find(f => f.uid === file.uid && f.status === 'error')
    );
    if (errorFile) {
      onUploadError?.(errorFile.error, errorFile);
    }
  }, [fileList, onChange, onUploadSuccess, onUploadError]);

  // 裁剪确认
  const handleCropOk = useCallback(async (croppedFile: File) => {
    if (!pendingFile) return;

    try {
      // 创建新的上传文件对象
      const newUploadFile: UploadFile = {
        ...pendingFile,
        originFileObj: croppedFile,
      };

      // 执行上传
      const base64 = await fileToBase64(croppedFile);
      
      const finalFile: UploadFile = {
        ...newUploadFile,
        url: base64,
        status: 'done',
        response: {
          url: base64,
          name: croppedFile.name,
        },
      };

      const newFileList = [...fileList, finalFile];
      setFileList(newFileList);
      onChange?.(newFileList);
      onUploadSuccess?.(finalFile, newFileList);
      
      message.success('图片上传成功');
    } catch (error) {
      message.error('图片处理失败');
      onUploadError?.(error, pendingFile);
    } finally {
      setCropperVisible(false);
      setCurrentFile(null);
      setPendingFile(null);
    }
  }, [pendingFile, fileList, onChange, onUploadSuccess, onUploadError]);

  // 裁剪取消
  const handleCropCancel = useCallback(() => {
    setCropperVisible(false);
    setCurrentFile(null);
    setPendingFile(null);
  }, []);

  // 移除文件
  const handleRemove = useCallback((file: UploadFile) => {
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    setFileList(newFileList);
    onChange?.(newFileList);
  }, [fileList, onChange]);

  // 预览文件
  const handlePreview = useCallback((file: UploadFile) => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  }, []);

  const uploadButton = (
    <Button icon={<UploadOutlined />} disabled={disabled}>
      {enableCrop ? '选择并裁剪图片' : '上传图片'}
    </Button>
  );

  return (
    <>
      <Upload
        {...restProps}
        fileList={fileList}
        beforeUpload={beforeUpload}
        customRequest={customRequest}
        onChange={handleChange}
        onRemove={handleRemove}
        onPreview={handlePreview}
        maxCount={maxCount}
        disabled={disabled}
        showUploadList={{
          showPreviewIcon: true,
          showRemoveIcon: !disabled,
          showDownloadIcon: false,
        }}
      >
        {fileList.length >= maxCount ? null : uploadButton}
      </Upload>

      {enableCrop && (
        <ImageCropper
          visible={cropperVisible}
          file={currentFile}
          onCancel={handleCropCancel}
          onOk={handleCropOk}
          aspectRatio={aspectRatio}
          cropShape={cropShape}
          quality={cropQuality}
        />
      )}

      {enableCrop && fileList.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <Space>
            <Button
              size="small"
              icon={<ScissorOutlined />}
              onClick={() => {
                const lastFile = fileList[fileList.length - 1];
                if (lastFile?.originFileObj) {
                  setCurrentFile(lastFile.originFileObj as File);
                  setPendingFile(lastFile);
                  setCropperVisible(true);
                }
              }}
              disabled={disabled || !fileList.some(f => f.originFileObj)}
            >
              重新裁剪
            </Button>
          </Space>
        </div>
      )}
    </>
  );
};

export default CropImageUpload;