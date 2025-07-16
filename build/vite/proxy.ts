import type { ProxyOptions } from 'vite';

type ProxyList = [string, string][];

type ProxyTargetList = Record<string, ProxyOptions>;
/**
 * 创建本地代理
 * @param list  前缀 + target
 */
export function createProxy(list: ProxyList = []) {
  const res: ProxyTargetList = {};

  for (const [prefix, target] of list) {
    res[prefix] = {
      target,
      changeOrigin: true,
      ws: prefix === '/ws', // 如果是 /ws，启用 websocket
      rewrite: (path) => path.replace(new RegExp(`^${prefix}`), ''),
    };
  }

  return res;
}
