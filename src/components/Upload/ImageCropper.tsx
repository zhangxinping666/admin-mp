import React, { useState, useRef, useCallback } from 'react';
import { Modal, Button, Slider, Space, message } from 'antd';
import { RotateLeftOutlined, RotateRightOutlined, ZoomInOutlined, ZoomOutOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';

export interface ImageCropperProps {
  visible: boolean;
  file: File | null;
  onCancel: () => void;
  onOk: (croppedFile: File) => void;
  aspectRatio?: number; // 裁剪比例，如 16/9, 1, 4/3 等
  cropShape?: 'rect' | 'round'; // 裁剪形状
  quality?: number; // 输出质量
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  visible,
  file,
  onCancel,
  onOk,
  aspectRatio,
  cropShape = 'rect',
  quality = 0.9,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageUrl, setImageUrl] = useState<string>('');

  // 加载图片
  React.useEffect(() => {
    if (file && visible) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setImageLoaded(false);
      setScale(1);
      setRotation(0);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file, visible]);

  // 图片加载完成
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    if (imageRef.current) {
      const { naturalWidth, naturalHeight } = imageRef.current;
      const containerWidth = 400;
      const containerHeight = 300;
      
      // 计算初始裁剪区域
      let cropWidth = Math.min(naturalWidth * 0.8, containerWidth * 0.8);
      let cropHeight = cropWidth;
      
      if (aspectRatio) {
        cropHeight = cropWidth / aspectRatio;
      }
      
      setCropArea({
        x: (containerWidth - cropWidth) / 2,
        y: (containerHeight - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
      });
    }
  }, [aspectRatio]);

  // 开始拖拽
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - cropArea.x, y: e.clientY - cropArea.y });
  }, [cropArea]);

  // 拖拽中
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setCropArea(prev => ({
      ...prev,
      x: Math.max(0, Math.min(newX, 400 - prev.width)),
      y: Math.max(0, Math.min(newY, 300 - prev.height)),
    }));
  }, [isDragging, dragStart]);

  // 结束拖拽
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 旋转图片
  const handleRotate = useCallback((direction: 'left' | 'right') => {
    setRotation(prev => {
      const newRotation = direction === 'left' ? prev - 90 : prev + 90;
      return newRotation % 360;
    });
  }, []);

  // 缩放图片
  const handleScale = useCallback((value: number) => {
    setScale(value);
  }, []);

  // 执行裁剪
  const handleCrop = useCallback(async () => {
    if (!imageRef.current || !canvasRef.current || !file) {
      message.error('图片未加载完成');
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = imageRef.current;
    
    // 设置画布尺寸
    canvas.width = cropArea.width;
    canvas.height = cropArea.height;
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 保存上下文状态
    ctx.save();
    
    // 如果是圆形裁剪，创建圆形路径
    if (cropShape === 'round') {
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, 2 * Math.PI);
      ctx.clip();
    }
    
    // 计算图片在容器中的位置和尺寸
    const containerWidth = 400;
    const containerHeight = 300;
    const imgDisplayWidth = img.naturalWidth * scale;
    const imgDisplayHeight = img.naturalHeight * scale;
    const imgX = (containerWidth - imgDisplayWidth) / 2;
    const imgY = (containerHeight - imgDisplayHeight) / 2;
    
    // 计算裁剪区域在原图中的位置
    const cropX = (cropArea.x - imgX) / scale;
    const cropY = (cropArea.y - imgY) / scale;
    const cropWidth = cropArea.width / scale;
    const cropHeight = cropArea.height / scale;
    
    // 应用旋转
    if (rotation !== 0) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }
    
    // 绘制裁剪后的图片
    ctx.drawImage(
      img,
      Math.max(0, cropX),
      Math.max(0, cropY),
      Math.min(cropWidth, img.naturalWidth - cropX),
      Math.min(cropHeight, img.naturalHeight - cropY),
      0,
      0,
      canvas.width,
      canvas.height
    );
    
    // 恢复上下文状态
    ctx.restore();
    
    // 转换为Blob
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now(),
        });
        onOk(croppedFile);
      } else {
        message.error('裁剪失败');
      }
    }, file.type, quality);
  }, [cropArea, scale, rotation, cropShape, quality, file, onOk]);

  return (
    <Modal
      title="图片裁剪"
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="ok" type="primary" onClick={handleCrop} disabled={!imageLoaded}>
          确定
        </Button>,
      ]}
    >
      <div style={{ textAlign: 'center' }}>
        {/* 图片预览区域 */}
        <div
          style={{
            position: 'relative',
            width: 400,
            height: 300,
            margin: '0 auto 16px',
            border: '1px solid #d9d9d9',
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {imageUrl && (
            <img
              ref={imageRef}
              src={imageUrl}
              alt="preview"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
                maxWidth: 'none',
                maxHeight: 'none',
                pointerEvents: 'none',
              }}
              onLoad={handleImageLoad}
            />
          )}
          
          {/* 裁剪框 */}
          {imageLoaded && (
            <div
              style={{
                position: 'absolute',
                left: cropArea.x,
                top: cropArea.y,
                width: cropArea.width,
                height: cropArea.height,
                border: '2px solid #1890ff',
                borderRadius: cropShape === 'round' ? '50%' : 0,
                cursor: 'move',
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
              }}
              onMouseDown={handleMouseDown}
            >
              {/* 裁剪框角落的拖拽点 */}
              <div
                style={{
                  position: 'absolute',
                  top: -4,
                  left: -4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1890ff',
                  cursor: 'nw-resize',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1890ff',
                  cursor: 'ne-resize',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: -4,
                  left: -4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1890ff',
                  cursor: 'sw-resize',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  width: 8,
                  height: 8,
                  backgroundColor: '#1890ff',
                  cursor: 'se-resize',
                }}
              />
            </div>
          )}
        </div>
        
        {/* 控制面板 */}
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Button
              icon={<RotateLeftOutlined />}
              onClick={() => handleRotate('left')}
              disabled={!imageLoaded}
            >
              左旋转
            </Button>
            <Button
              icon={<RotateRightOutlined />}
              onClick={() => handleRotate('right')}
              disabled={!imageLoaded}
            >
              右旋转
            </Button>
          </Space>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ZoomOutOutlined />
            <Slider
              style={{ flex: 1 }}
              min={0.1}
              max={3}
              step={0.1}
              value={scale}
              onChange={handleScale}
              disabled={!imageLoaded}
            />
            <ZoomInOutlined />
            <span style={{ minWidth: 40 }}>{Math.round(scale * 100)}%</span>
          </div>
        </Space>
      </div>
      
      {/* 隐藏的画布用于裁剪 */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Modal>
  );
};

export default ImageCropper;