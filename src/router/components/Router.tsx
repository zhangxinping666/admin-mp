import type { RouteObject } from 'react-router-dom';
import type { DefaultComponent } from '@loadable/component';
import { useEffect } from 'react';
import { useLocation, useRoutes } from 'react-router-dom';
import nprogress from 'nprogress';

import { handleRoutes } from '../utils/helper';
import Login from '@/pages/login';
import Forget from '@/pages/forget';
import NotFound from '@/pages/404';
import Guards from './Guards';
import { useMenuStore } from '../../stores/menu';

type PageFiles = Record<string, () => Promise<DefaultComponent<unknown>>>;
const pages = import.meta.glob('../../pages/**/*.tsx') as PageFiles;
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
        index: true,
        element: <Login />,
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'forget',
        element: <Forget />,
      },
      ...layouts,
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

  useEffect(() => {
    nprogress.done();
    return () => {
      nprogress.start();
    };
  }, [location]);

  return element;
}

export default App;
