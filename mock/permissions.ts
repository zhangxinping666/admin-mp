import { MockMethod } from 'vite-plugin-mock';

import { resultSuccess } from './_utils';

export default [
  // refresh-permissions 接口
  {
    url: '/api/user/refresh-permissions',
    method: 'get',
    response: ({ query }) => {
      // 判断是否有 ?refresh_cache
      if (query.refresh_cache !== undefined) {
        return resultSuccess({
          token: 'mock_token_123456',
          user: {
            id: 1,
            username: 'south后台',
            email: '1275093225@qq.com',
            phone: '123456789',
          },
          permissions: [
            '/dashboard',
            '/demo',
            '/demo/copy',
            '/demo/editor',
            '/demo/wangEditor',
            '/demo/virtualScroll',
            '/demo/watermark',
            '/demo/dynamic',
            '/demo/level',
            '/authority/user',
            '/authority/user/index',
            '/authority/user/create',
            '/authority/user/update',
            '/authority/user/view',
            '/authority/user/delete',
            '/authority/user/authority',
            '/authority/role',
            '/authority/role/index',
            '/authority/role/create',
            '/authority/role/update',
            '/authority/role/view',
            '/authority/role/delete',
            '/authority/menu',
            '/authority/menu/index',
            '/authority/menu/create',
            '/authority/menu/update',
            '/authority/menu/view',
            '/authority/menu/delete',
            '/content/article',
            '/content/article/index',
            '/content/article/create',
            '/content/article/update',
            '/content/article/view',
            '/content/article/delete',
          ],
        });
      } else {
        return { code: 400, message: '缺少参数 refresh_cache' };
      }
    },
  },
] as MockMethod[];
