import type { PluginOption } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';
import { timePlugin } from './time';
import { autoImportPlugin } from './autoImport';
import { versionUpdatePlugin } from './version';
import react from '@vitejs/plugin-react-swc';
import legacy from '@vitejs/plugin-legacy';
import unocss from 'unocss/vite';
import viteCompression from 'vite-plugin-compression';

/**
 * 创建 Vite 插件列表
 * @returns PluginOption[]
 */
export function createVitePlugins(mode: string): PluginOption[] {
  const isProd = mode === 'production';
  const isDev = mode === 'development' || mode === 'localhost' || mode === 'mock';
  const shouldReport = process.env.REPORT === 'true';
  
  // 基础插件：所有环境都需要
  const vitePlugins: PluginOption[] = [
    react(), // 使用 SWC 加速的 React 插件
  ];

  // 开发环境：只加载必要插件，优先速度
  if (isDev) {
    vitePlugins.push(
      unocss(), // UnoCSS 原子化 CSS（开发环境保留）
      autoImportPlugin(), // 自动导入（提升开发体验）
    );
  } else {
    // 非开发环境：完整插件配置
    vitePlugins.push(
      unocss(),
      versionUpdatePlugin(), // 打包后生成 version.json
      autoImportPlugin(),
    );
  }

  // 根据环境动态添加插件
  if (isProd) {
    if (shouldReport) {
      // 打包体积分析
      vitePlugins.push(
        visualizer({
          filename: './dist/report.html', // 打包后 在 dist 目录生成可视化报告
          gzipSize: true, // 显示各模块 gzip 压缩后的体积
          brotliSize: true, // 显示各模块 brotli 压缩后的体积
          open: false, // 打包后是否自动打开报告
        }),
      );
    }

    // TODO(human): 添加生产环境专用的性能优化插件
    // 在这里添加只在生产环境需要的插件，如Legacy浏览器支持和文件压缩
    
    // 兼容低版本浏览器(自动引入必要的 polyfill) - 仅生产环境
    vitePlugins.push(
      legacy({
        targets: [
          'Android > 39',
          'Chrome >= 60',
          'Safari >= 10.1',
          'iOS >= 10.3',
          'Firefox >= 54',
          'Edge >= 15',
        ],
        additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      }),
    );

    // 打包输出启用 gzip 压缩 - 仅生产环境
    vitePlugins.push(
      viteCompression({
        verbose: true, // 是否在控制台输出压缩结果（日志）
        disable: false, // 是否禁用插件，false 表示启用
        threshold: 10240, // 只对大于 10KB（10240 字节）的资源进行压缩
        algorithm: 'gzip', // 压缩算法，这里是 gzip（也可以写 'brotliCompress' 等）
        ext: '.gz', // 生成压缩文件的后缀名，比如 foo.js → foo.js.gz
      }),
    );
  }

  // 打包完成后打印打包时间
  vitePlugins.push(timePlugin());
  return vitePlugins;
}
