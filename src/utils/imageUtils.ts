/**
 * 图片处理工具类
 */

export interface ImageCompressOptions {
  quality?: number; // 压缩质量 0-1
  maxWidth?: number; // 最大宽度
  maxHeight?: number; // 最大高度
  format?: 'jpeg' | 'png' | 'webp'; // 输出格式
}

export interface ImageResizeOptions {
  width?: number;
  height?: number;
  mode?: 'contain' | 'cover' | 'fill'; // 缩放模式
}

/**
 * 将文件转换为base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * 将base64转换为Blob
 */
export const base64ToBlob = (base64: string, mimeType: string = 'image/jpeg'): Blob => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

/**
 * 压缩图片
 */
export const compressImage = (
  file: File,
  options: ImageCompressOptions = {}
): Promise<Blob> => {
  const { quality = 0.8, maxWidth, maxHeight, format = 'jpeg' } = options;
  
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // 计算新的尺寸
      if (maxWidth && width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (maxHeight && height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // 绘制图片
      ctx.drawImage(img, 0, 0, width, height);
      
      // 转换为Blob
      canvas.toBlob(
        (blob) => resolve(blob!),
        `image/${format}`,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * 调整图片尺寸
 */
export const resizeImage = (
  file: File,
  options: ImageResizeOptions
): Promise<Blob> => {
  const { width: targetWidth, height: targetHeight, mode = 'contain' } = options;
  
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      const { width: imgWidth, height: imgHeight } = img;
      let { width, height } = img;
      let x = 0, y = 0;

      if (targetWidth && targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        switch (mode) {
          case 'contain':
            // 保持比例，完全显示
            const scale = Math.min(targetWidth / imgWidth, targetHeight / imgHeight);
            width = imgWidth * scale;
            height = imgHeight * scale;
            x = (targetWidth - width) / 2;
            y = (targetHeight - height) / 2;
            break;
          case 'cover':
            // 保持比例，填满容器
            const coverScale = Math.max(targetWidth / imgWidth, targetHeight / imgHeight);
            width = imgWidth * coverScale;
            height = imgHeight * coverScale;
            x = (targetWidth - width) / 2;
            y = (targetHeight - height) / 2;
            break;
          case 'fill':
            // 拉伸填满
            width = targetWidth;
            height = targetHeight;
            break;
        }
      } else if (targetWidth) {
        canvas.width = targetWidth;
        canvas.height = (imgHeight * targetWidth) / imgWidth;
        width = targetWidth;
        height = canvas.height;
      } else if (targetHeight) {
        canvas.width = (imgWidth * targetHeight) / imgHeight;
        canvas.height = targetHeight;
        width = canvas.width;
        height = targetHeight;
      }

      // 绘制图片
      ctx.drawImage(img, x, y, width, height);
      
      // 转换为Blob
      canvas.toBlob((blob) => resolve(blob!));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * 获取图片信息
 */
export const getImageInfo = (file: File): Promise<{
  width: number;
  height: number;
  size: number;
  type: string;
  name: string;
}> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: file.size,
        type: file.type,
        name: file.name,
      });
    };
    
    img.onerror = () => reject(new Error('无法读取图片信息'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 验证图片文件
 */
export const validateImage = (
  file: File,
  options: {
    maxSize?: number; // MB
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    allowedTypes?: string[];
  } = {}
): Promise<{ valid: boolean; error?: string }> => {
  const {
    maxSize = 10,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  } = options;

  return new Promise((resolve) => {
    // 检查文件类型
    if (!allowedTypes.includes(file.type)) {
      resolve({ valid: false, error: `不支持的文件类型: ${file.type}` });
      return;
    }

    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      resolve({ valid: false, error: `文件大小超过限制: ${maxSize}MB` });
      return;
    }

    // 检查图片尺寸
    getImageInfo(file)
      .then(({ width, height }) => {
        if (minWidth && width < minWidth) {
          resolve({ valid: false, error: `图片宽度不能小于 ${minWidth}px` });
          return;
        }
        if (minHeight && height < minHeight) {
          resolve({ valid: false, error: `图片高度不能小于 ${minHeight}px` });
          return;
        }
        if (maxWidth && width > maxWidth) {
          resolve({ valid: false, error: `图片宽度不能大于 ${maxWidth}px` });
          return;
        }
        if (maxHeight && height > maxHeight) {
          resolve({ valid: false, error: `图片高度不能大于 ${maxHeight}px` });
          return;
        }
        resolve({ valid: true });
      })
      .catch(() => {
        resolve({ valid: false, error: '无法读取图片信息' });
      });
  });
};

/**
 * 创建图片缩略图
 */
export const createThumbnail = (
  file: File,
  size: number = 200
): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      const { width, height } = img;
      const scale = Math.min(size / width, size / height);
      const newWidth = width * scale;
      const newHeight = height * scale;

      canvas.width = size;
      canvas.height = size;

      // 居中绘制
      const x = (size - newWidth) / 2;
      const y = (size - newHeight) / 2;
      
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, x, y, newWidth, newHeight);
      
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };

    img.src = URL.createObjectURL(file);
  });
};