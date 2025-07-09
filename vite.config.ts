import { defineConfig, loadEnv } from 'vite';
import { handleEnv } from './build/utils/helper';
import { createProxy } from './build/vite/proxy';
import { createVitePlugins } from './build/plugins';
import { buildOptions } from './build/vite/build';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const root = process.cwd();
  const env = loadEnv(mode, root);
  const viteEnv = handleEnv(env);
  const { VITE_SERVER_PORT, VITE_PROXY } = viteEnv;

  return {
    plugins: createVitePlugins(),
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
      open: true,
      port: VITE_SERVER_PORT,
      // 跨域处理
      proxy: createProxy(VITE_PROXY),
    },
    build: buildOptions(),
  };
});
