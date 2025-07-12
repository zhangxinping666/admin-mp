import type { BuildOptions } from 'vite';
import { splitJSModules } from '../utils/helper';

/**
 * @description 分包配置
 */
export function buildOptions(): BuildOptions {
  return {
    chunkSizeWarningLimit: 1000, // 大于1000k才警告
    sourcemap: process.env.NODE_ENV !== 'production', // 非 prod 开启 surce map
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
