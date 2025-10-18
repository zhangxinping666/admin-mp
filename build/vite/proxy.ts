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

      // ✅ 关键配置: 转发 Cookie (支持 HttpOnly Cookie 认证)
      configure: (proxy) => {
        proxy.on('proxyRes', (proxyRes) => {
          const cookies = proxyRes.headers['set-cookie'];
          if (cookies) {
            // 移除 Domain 限制,允许本地开发
            proxyRes.headers['set-cookie'] = cookies.map(cookie =>
              cookie.replace(/Domain=[^;]+/gi, '')
                    .replace(/Secure/gi, '') // 本地开发移除 Secure 限制
            );
          }
        });
      },
    };
  }

  return res;
}
