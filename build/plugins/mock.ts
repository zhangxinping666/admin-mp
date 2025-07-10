import { viteMockServe } from 'vite-plugin-mock';
import type { PluginOption } from 'vite';

export function createMockPlugin(mode: string): PluginOption {
  return viteMockServe({
    mockPath: 'mock',
    enable: mode === 'development',
    watchFiles: true,
    logger: true,
  });
}
