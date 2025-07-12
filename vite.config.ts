import { defineConfig, loadEnv } from 'vite';
import { createProxy } from './build/vite/proxy';
import { createVitePlugins } from './build/plugins';
import { buildOptions } from './build/vite/build';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载对应 mode（例如 development / test / uat / production）下的 .env 文件
  const root = process.cwd();
  const env = loadEnv(mode, root);
  // 判断当前是否是本地开发环境
  const isMock = mode === 'mock';
  const isDev = mode === 'development';
  return {
    plugins: createVitePlugins(mode),
    // 自定义全局常量（在代码中可以用 __APP_ENV__ 获取当前环境，比如 'development'）
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '#': '/types',
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          charset: false,
        },
      },
    },
    server: {
      port: 7000, // 开发服务端口
      open: true, // 启动后自动打开浏览器
      proxy:
        isDev || isMock
          ? createProxy([
              ['/api', env.VITE_API_BASE_URL],
              ['/ws', env.VITE_WS_BASE_URL],
              ['/events', env.VITE_SSE_BASE_URL],
            ])
          : undefined,
    },
    build: buildOptions(),
  };
});
