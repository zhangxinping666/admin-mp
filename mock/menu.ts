import { MockMethod } from 'vite-plugin-mock';

import { resultSuccess } from './_utils';

export default [
  // 菜单接口
  {
    url: '/api/menu/list',
    method: 'get',
    response: () => {
      return resultSuccess([
        {
          label: '组件',
          labelEn: 'Components',
          icon: 'fluent:box-20-regular',
          key: '/demo',
          children: [
            { label: '剪切板', labelEn: 'Copy', key: '/demo/copy', rule: '/demo/copy' },
            {
              label: '水印',
              labelEn: 'Watermark',
              key: '/demo/watermark',
              rule: '/demo/watermark',
            },
            {
              label: '虚拟滚动',
              labelEn: 'Virtual Scroll',
              key: '/demo/virtualScroll',
              rule: '/demo/virtualScroll',
            },
            { label: '富文本', labelEn: 'Editor', key: '/demo/editor', rule: '/demo/editor' },
            {
              label: '动态路由参数',
              labelEn: 'Dynamic',
              key: '/demo/123/dynamic',
              rule: '/demo/dynamic',
            },
            {
              label: '层级1',
              labelEn: 'Level1',
              key: '/demo/level1',
              children: [
                {
                  label: '层级2',
                  labelEn: 'Level2',
                  key: '/demo/level1/level2',
                  children: [
                    {
                      label: '层级3',
                      labelEn: 'Level3',
                      key: '/demo/level1/level2/level3',
                      rule: '/demo/watermark',
                    },
                  ],
                },
              ],
            },
            {
              label: '系统管理',
              labelEn: 'System Management',
              icon: 'ion:settings-outline',
              key: '/system',
              children: [
                {
                  label: '用户管理',
                  labelEn: 'User Management',
                  key: '/system/user',
                  rule: '/authority/user',
                },
                {
                  label: '菜单管理',
                  labelEn: 'Menu Management',
                  key: '/system/menu',
                  rule: '/authority/menu',
                },
              ],
            },
            {
              label: '内容管理',
              labelEn: 'Content Management',
              icon: 'majesticons:article-search-line',
              key: '/content',
              children: [
                {
                  label: '文章管理',
                  labelEn: 'Article Management',
                  key: '/content/article',
                  rule: '/content/article',
                },
              ],
            },
            {
              label: '仪表盘',
              labelEn: 'Dashboard',
              icon: 'la:tachometer-alt',
              key: '/dashboard',
              rule: '/dashboard',
            },
          ],
        },
      ]);
    },
  },
] as MockMethod[];
