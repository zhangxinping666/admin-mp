# 图片上传组件库

本组件库提供了一套完整的图片上传解决方案，包括基础上传、高级上传、裁剪上传和图片预览功能。

## 组件列表

### 1. ImageUpload - 基础图片上传

基础的图片上传组件，提供文件选择、预览和上传功能。

**特性:**
- 文件类型验证（JPG/PNG）
- 文件大小限制
- 图片预览
- 自定义上传请求
- 支持多文件上传

### 4. ImagePreview - 图片预览

用于在表格或其他地方显示图片的预览组件。

**特性:**
- 支持单张或多张图片显示
- 点击放大查看
- 支持多种数据格式
- 响应式设计

**使用示例:**
```tsx
import { ImagePreview } from '@/components/Upload';

// 单张图片
<ImagePreview images="https://example.com/image.jpg" />

// 多张图片
<ImagePreview images={[
  { uid: '1', name: 'image1.jpg', url: 'https://example.com/1.jpg' },
  { uid: '2', name: 'image2.jpg', url: 'https://example.com/2.jpg' }
]} />
```

### imageUtils

提供图片处理相关的工具函数：

```tsx
import {
  fileToBase64,
  base64ToBlob,
  compressImage,
  resizeImage,
  getImageInfo,
  validateImage,
  createThumbnail
} from '@/utils/imageUtils';

// 文件转base64
const base64 = await fileToBase64(file);

// 压缩图片
const compressedBlob = await compressImage(file, {
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1080
});

// 验证图片
const validation = await validateImage(file, {
  maxSize: 2, // 2MB
  allowedTypes: ['image/jpeg', 'image/png']
});

// 获取图片信息
const info = await getImageInfo(file);
```

## 表单集成

所有上传组件都可以直接在Ant Design表单中使用：

```tsx
<Form>
  <Form.Item name="gallery" label="图片库">
    <AdvancedImageUpload
      maxCount={6}
      listType="picture-card"
      enableCompress
    />
  </Form.Item>
</Form>
```

## 配置选项

### 通用配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| value | UploadFile[] | [] | 文件列表 |
| onChange | (fileList: UploadFile[]) => void | - | 文件列表变化回调 |
| maxCount | number | 1 | 最大文件数量 |
| maxSize | number | 2 | 最大文件大小(MB) |
| allowedTypes | string[] | ['image/jpeg', 'image/png'] | 允许的文件类型 |
| disabled | boolean | false | 是否禁用 |
| onUploadSuccess | (file, fileList) => void | - | 上传成功回调 |
| onUploadError | (error, file) => void | - | 上传失败回调 |

### 裁剪相关配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| enableCrop | boolean | true | 是否启用裁剪 |
| aspectRatio | number | - | 裁剪比例 |
| cropShape | 'rect' \| 'round' | 'rect' | 裁剪形状 |
| cropQuality | number | 0.9 | 裁剪质量 |

### 压缩相关配置

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| enableCompress | boolean | false | 是否启用压缩 |
| compressOptions | object | - | 压缩配置 |
| compressOptions.quality | number | 0.8 | 压缩质量 |
| compressOptions.maxWidth | number | - | 最大宽度 |
| compressOptions.maxHeight | number | - | 最大高度 |

## 注意事项

1. **文件大小限制**: 建议根据实际需求设置合理的文件大小限制
2. **图片格式**: 默认支持JPG和PNG格式，可通过`allowedTypes`自定义
3. **裁剪功能**: 裁剪功能需要现代浏览器支持Canvas API
4. **移动端适配**: 组件已针对移动端进行优化，支持触摸操作
5. **性能考虑**: 大量图片上传时建议使用分页或懒加载

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- 移动端浏览器

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基础图片上传功能
- 支持图片裁剪功能
- 支持图片压缩功能
- 支持图片预览功能