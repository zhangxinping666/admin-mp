import { Upload, message } from 'antd';
import { UploadProps } from 'antd/es/upload';
import { PlusOutlined } from '@ant-design/icons';

type ImageUploaderProps = {
  value?: string;
  onChange?: (url: string) => void;
  action?: string;
  maxSize?: number; // MB
};

export const ImageUploader = ({
  value,
  onChange,
  action = 'image/upload',
  maxSize = 2,
}: ImageUploaderProps) => {
  const handleChange: UploadProps['onChange'] = ({ file }) => {
    if (file.status === 'done') {
      console.log('file', file);
      const url = file.response?.data?.url || file.response?.url || file.response?.imageUrl;
      url ? onChange?.(url) : message.error('没有接受到图片URL，请重试');
    } else if (file.status === 'error') {
      message.error(file.error?.message || '上传失败');
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

  return (
    <Upload
      name="image"
      listType="picture-card"
      showUploadList={false}
      action={`${import.meta.env.VITE_API_BASE_URL || ''}/${action}`}
      beforeUpload={beforeUpload}
      onChange={handleChange}
    >
      {value ? (
        <img src={value} alt="预览" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div>
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>上传</div>
        </div>
      )}
    </Upload>
  );
};
