import type { BuildOptions } from 'vite';
import { splitJSModules } from '../utils/helper';

/**
 * @description 构建配置（根据环境优化）
 */
export function buildOptions(mode?: string): BuildOptions {
  // 通过 Vite mode 参数判断是否为开发环境
  const isDev = mode === 'development' || process.env.NODE_ENV === 'development';
  
  // 开发环境：优先构建速度
  if (isDev) {
    return {
      sourcemap: true, // 开发环境启用sourcemap便于调试
      minify: false,   // 不压缩，节省时间
      rollupOptions: {
        output: {
          // 简化文件名，减少处理时间
          chunkFileNames: 'js/[name].js',
          entryFileNames: 'js/[name].js', 
          assetFileNames: '[ext]/[name].[ext]',
        },
      },
    };
  }
  
  // 生产环境：完整优化配置
  return {
    chunkSizeWarningLimit: 1000, // 大于1000k才警告
    sourcemap: false, // 生产环境关闭sourcemap
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境时移除console和debugger
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name].[hash].js', // 动态 chunk
        entryFileNames: 'assets/js/[name].[hash].js', // 入口 chunk
        assetFileNames: 'assets/[ext]/[name].[hash].[ext]', // 静态资源
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // 自动拆第三方依赖
            return splitJSModules(id);
          }
        },
      },
    },
  };
}
