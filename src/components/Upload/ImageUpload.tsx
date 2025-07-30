import React, { useState } from 'react';
import { Upload, Button, Modal, message } from 'antd';
import { UploadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';

export interface ImageUploadProps {
  value?: UploadFile[];
  onChange?: (fileList: UploadFile[]) => void;
  maxCount?: number;
  accept?: string;
  listType?: 'text' | 'picture' | 'picture-card' | 'picture-circle';
  disabled?: boolean;
  multiple?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  maxCount = 1,
  accept = 'image/png,image/jpeg,image/jpg',
  listType = 'picture-card',
  disabled = false,
  multiple = false,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  // 预览图片
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  // 文件上传前的校验
  const beforeUpload = (file: File) => {
    const isJpgOrPng =
      file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的图片!');
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小不能超过 2MB!');
      return false;
    }
    return true;
  };

  // 自定义上传请求
  const customRequest: UploadProps['customRequest'] = (options) => {
    const { file, onSuccess, onError } = options;

    const reader = new FileReader();
    reader.readAsDataURL(file as File);
    reader.onload = () => {
      setTimeout(() => {
        onSuccess?.({
          url: reader.result,
          name: (file as File).name,
          status: 'done',
        });
      }, 500);
    };
    reader.onerror = () => {
      onError?.(new Error('读取文件失败'));
    };
  };

  // 文件列表变化
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    onChange?.(newFileList);
  };

  // 移除文件
  const handleRemove = (file: UploadFile) => {
    const newFileList = value.filter((item) => item.uid !== file.uid);
    onChange?.(newFileList);
  };

  // 获取base64
  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const uploadButton = (
    <div>
      <UploadOutlined />
      <div style={{ marginTop: 8 }}>上传图片</div>
    </div>
  );

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
      >
        {value.length >= maxCount ? null : uploadButton}
      </Upload>

      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

export default ImageUpload;
