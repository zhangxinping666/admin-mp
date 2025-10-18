import type { RouteObject } from 'react-router-dom';
import type { DefaultComponent } from '@loadable/component';
import { useEffect } from 'react';
import { useLocation, useRoutes } from 'react-router-dom';
import nprogress from 'nprogress';

// 导入你的工具函数、页面和组件
import { handleRoutes } from '../utils/helper';
import Login from '@/pages/login';
import Forget from '@/pages/forget';
import NotFound from '@/pages/404';
import Guards from './Guards';
import { useMenuStore } from '../../stores/menu';

// --- 逻辑重构部分 ---
type PageFiles = Record<string, () => Promise<DefaultComponent<unknown>>>;
const pages = import.meta.glob('../../pages/**/*.tsx') as PageFiles;
console.log("pages", pages)
const layouts = handleRoutes(pages);
function getRoutePaths(menus: any[]): string[] {
  if (!Array.isArray(menus) || menus.length === 0) {
    return [];
  }
  return menus.map((menuItem) => menuItem.path);
}

const newRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Guards />,
    children: [
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'forget',
        element: <Forget />,
      },
      ...layouts, // layouts 是在模块加载时就计算好的
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];

function App() {
  const location = useLocation();
  const element = useRoutes(newRoutes);
  const setRoutePages = useMenuStore((state) => state.setRoutePages);
  useEffect(() => {
    const routePaths = getRoutePaths(layouts);
    setRoutePages(routePaths);
  }, [layouts]);

  // 6. 处理顶部进度条的逻辑
  useEffect(() => {
    nprogress.done(); // 进入新页面，先完成上一次的进度条
    return () => {
      nprogress.start(); // 离开页面，开始新的进度条
    };
  }, [location]);

  return element;
}

export default App;
