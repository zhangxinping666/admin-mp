import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Space, Divider, Typography, message } from 'antd';
import {
  ImageUpload,
  AdvancedImageUpload,
  CropImageUpload,
  ImagePreview,
} from '@/components/Upload';
import type { UploadFile } from 'antd';
import type { UploadImg } from '@/components/Upload';

const { Title, Paragraph, Text } = Typography;

const ImageUploadExample: React.FC = () => {
  const [form] = Form.useForm();
  const [basicFiles, setBasicFiles] = useState<UploadFile[]>([]);
  const [advancedFiles, setAdvancedFiles] = useState<UploadFile[]>([]);
  const [cropFiles, setCropFiles] = useState<UploadFile[]>([]);
  const [previewImages] = useState<UploadImg[]>([
    {
      uid: '1',
      name: '示例图片1.jpg',
      url: 'https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=Image+1',
    },
    {
      uid: '2',
      name: '示例图片2.jpg',
      url: 'https://via.placeholder.com/300x200/2196F3/FFFFFF?text=Image+2',
    },
  ]);

  const handleFormSubmit = (values: any) => {
    message.success('表单提交成功！');
  };

  const handleUploadSuccess = (file: UploadFile, fileList: UploadFile[]) => {
    message.success(`${file.name} 上传成功！`);
  };

  const handleUploadError = (error: any, file: UploadFile) => {
    console.error('上传失败:', error, file);
    message.error(`${file.name} 上传失败！`);
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography>
        <Title level={2}>图片上传组件示例</Title>
        <Paragraph>
          本页面展示了项目中各种图片上传组件的使用方法，包括基础上传、高级上传和裁剪上传功能。
        </Paragraph>
      </Typography>

      <Row gutter={[24, 24]}>
        {/* 基础图片上传 */}
        <Col span={24}>
          <Card title="基础图片上传 (ImageUpload)" size="small">
            <Paragraph>
              <Text type="secondary">
                基础的图片上传组件，支持文件类型验证、大小限制和预览功能。
              </Text>
            </Paragraph>
            <ImageUpload
              value={basicFiles}
              onChange={setBasicFiles}
              maxCount={3}
              maxSize={2}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
            <Divider />
            <Text strong>当前文件列表:</Text>
            <pre style={{ background: '#f5f5f5', padding: 8, marginTop: 8 }}>
              {JSON.stringify(basicFiles, null, 2)}
            </pre>
          </Card>
        </Col>

        {/* 高级图片上传 */}
        <Col span={24}>
          <Card title="高级图片上传 (AdvancedImageUpload)" size="small">
            <Paragraph>
              <Text type="secondary">
                增强版图片上传组件，支持图片压缩、进度显示和多种上传样式。
              </Text>
            </Paragraph>
            <AdvancedImageUpload
              value={advancedFiles}
              onChange={setAdvancedFiles}
              maxCount={5}
              maxSize={5}
              listType="picture-card"
              enableCompress
              compressOptions={{ quality: 0.8, maxWidth: 1920, maxHeight: 1080 }}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
            <Divider />
            <Text strong>当前文件列表:</Text>
            <pre style={{ background: '#f5f5f5', padding: 8, marginTop: 8 }}>
              {JSON.stringify(advancedFiles, null, 2)}
            </pre>
          </Card>
        </Col>

        {/* 裁剪图片上传 */}
        <Col span={24}>
          <Card title="裁剪图片上传 (CropImageUpload)" size="small">
            <Paragraph>
              <Text type="secondary">带图片裁剪功能的上传组件，支持自定义裁剪比例和形状。</Text>
            </Paragraph>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>正方形裁剪:</Text>
                <CropImageUpload
                  value={cropFiles}
                  onChange={setCropFiles}
                  maxCount={1}
                  aspectRatio={1}
                  cropShape="rect"
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
              </div>

              <div>
                <Text strong>圆形裁剪:</Text>
                <CropImageUpload
                  maxCount={1}
                  aspectRatio={1}
                  cropShape="round"
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
              </div>

              <div>
                <Text strong>16:9 比例裁剪:</Text>
                <CropImageUpload
                  maxCount={1}
                  aspectRatio={16 / 9}
                  cropShape="rect"
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
              </div>
            </Space>
            <Divider />
            <Text strong>当前文件列表:</Text>
            <pre style={{ background: '#f5f5f5', padding: 8, marginTop: 8 }}>
              {JSON.stringify(cropFiles, null, 2)}
            </pre>
          </Card>
        </Col>

        {/* 图片预览组件 */}
        <Col span={24}>
          <Card title="图片预览组件 (ImagePreview)" size="small">
            <Paragraph>
              <Text type="secondary">
                用于在表格或其他地方显示图片的预览组件，支持点击放大查看。
              </Text>
            </Paragraph>
            <Space direction="vertical">
              <div>
                <Text strong>单张图片预览:</Text>
                <ImagePreview images={previewImages[0]} />
              </div>

              <div>
                <Text strong>多张图片预览:</Text>
                <ImagePreview images={previewImages} />
              </div>

              <div>
                <Text strong>字符串URL预览:</Text>
                <ImagePreview images="https://via.placeholder.com/150x150/FF5722/FFFFFF?text=URL" />
              </div>
            </Space>
          </Card>
        </Col>

        {/* 表单集成示例 */}
        <Col span={24}>
          <Card title="表单集成示例" size="small">
            <Paragraph>
              <Text type="secondary">演示如何在Ant Design表单中使用图片上传组件。</Text>
            </Paragraph>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFormSubmit}
              initialValues={{
                avatar: [],
                gallery: [],
                thumbnail: [],
              }}
            >
              <Form.Item
                label="头像上传"
                name="avatar"
                rules={[{ required: true, message: '请上传头像' }]}
              >
                <CropImageUpload maxCount={1} aspectRatio={1} cropShape="round" maxSize={1} />
              </Form.Item>

              <Form.Item label="图片库" name="gallery">
                <AdvancedImageUpload maxCount={6} listType="picture-card" enableCompress />
              </Form.Item>

              <Form.Item label="缩略图" name="thumbnail">
                <ImageUpload maxCount={1} maxSize={0.5} />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    提交表单
                  </Button>
                  <Button onClick={() => form.resetFields()}>重置</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ImageUploadExample;
