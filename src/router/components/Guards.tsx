import { useEffect, useState } from 'react';
import { getAccessToken, setAccessToken, setRefreshToken } from '@/stores/token';
import { useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { getPermissions } from '@/servers/login';
import { getFirstMenu } from '@/menus/utils/helper';
import { useUserStore } from '@/stores/user';
import { extractRoutePathsFromMenus } from '@/utils/menuUtils';
import nprogress from 'nprogress';
import Layout from '@/layouts';
import { useMenuStore } from '@/stores/menu';
import { checkPermission } from '@/utils/permissions';
import Forbidden from '@/pages/403';
import { PermissionsData } from '@/pages/login/model'

function Guards() {
  const outlet = useOutlet();
  const navigate = useNavigate();
  const location = useLocation();
  const token = getAccessToken();
  const [isDataLoaded, setIsDataLoaded] = useState(false); // 标识数据是否已加载完成
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 标识是否为初始加载
  const { setUserInfo, setPermissions, setMenuPermissions, userInfo } = useUserStore(
    (state) => state,
  );
  const { permissions, menuPermissions } = useUserStore((state) => state);
  const setMenuList = useMenuStore((state) => state.setMenuList);
  const { menuList } = useMenuStore();

  // 顶部进度条
  useEffect(() => {
    nprogress.start();
  }, []);

  const loadPermissionsData = async () => {
    try {
      // 获取当前用户信息
      const currentUserInfo = userInfo;
      if (!currentUserInfo || !currentUserInfo.name) {
        console.error('用户信息不存在，跳转到登录页');
        navigate(`/login`, { replace: true });
        return;
      }
      const permissionsResponse = await getPermissions({ role: currentUserInfo.name });
      const Data = permissionsResponse.data as unknown as PermissionsData;
      const { menus, perms } = Data;
      // 从菜单中提取route_path作为权限（与登录逻辑保持一致）
      const routePermissions = extractRoutePathsFromMenus(menus);
      const finalPermissions = [...routePermissions, ...(perms || [])];
      setPermissions(finalPermissions);

      setMenuList(menus);
      setMenuPermissions(finalPermissions);
      setIsDataLoaded(true); // 标记数据加载完成
    } catch (error) {
      console.error('Guards获取权限数据失败:', error);
      // 清除可能存在的过期数据
      setPermissions([]);
      setMenuPermissions([]);
      setMenuList([]);
      setUserInfo(null);
      navigate(`/login`, { replace: true });
    }
  };

  const checkRoutePermission = (pathname: string, userPermissions: string[]): boolean => {
    if (pathname === '/login' || pathname === '/') {
      return true;
    }

    return checkPermission(pathname, userPermissions);
  };

  useEffect(() => {
    // 如果是登录页面且没有token,直接完成初始化
    if (location.pathname === '/login' && !token) {
      // 清除可能存在的过期数据
      setPermissions([]);
      setMenuPermissions([]);
      setMenuList([]);
      setUserInfo(null);
      setIsInitialLoad(false);
      return;
    }
    if (token && permissions.length === 0) {
      loadPermissionsData().finally(() => {
        setIsInitialLoad(false);
      });
      return;
    }
    if (!token) {
      // 没有token时,清除所有用户相关数据
      setPermissions([]);
      setMenuPermissions([]);
      setMenuList([]);
      setUserInfo(null);

      // 避免重复跳转到登录页面
      if (location.pathname !== '/login') {
        navigate(`/login`, { replace: true });
      }
      setIsInitialLoad(false);
    } else if (token && permissions.length > 0) {
      setIsInitialLoad(false);
    }
  }, [permissions.length, token, location.pathname]);
  useEffect(() => {
    if (!isInitialLoad && token && menuList.length > 0 && permissions.length > 0) {
      // 特殊路径不做校验
      if (['/', '/403', '/404'].includes(location.pathname)) {
        return;
      }

      const isValidMenuPath = menuList.some((menu) => {
        const checkMenuPath = (menuItem: any): boolean => {
          if (menuItem.route_path === location.pathname) {
            return true;
          }
          if (menuItem.children && menuItem.children.length > 0) {
            return menuItem.children.some(checkMenuPath);
          }
          return false;
        };
        return checkMenuPath(menu);
      });
      const hasPermission = menuPermissions.includes(location.pathname);
      // 如果没有权限或不在菜单中，跳转到第一个有权限的菜单
      if (!isValidMenuPath || !hasPermission) {
        console.warn('[Guards] Access denied, redirecting to first menu');
        const firstMenu = getFirstMenu(menuList);
        if (firstMenu && firstMenu !== location.pathname) {
          navigate(firstMenu, { replace: true });
        }
      }
    }
  }, [location.pathname, permissions, token, menuList, menuPermissions, isDataLoaded, isInitialLoad]);
  useEffect(() => {
    if (token && location.pathname === '/login') {
      if (permissions.length > 0 && menuPermissions.length > 0) {
        const firstMenu = getFirstMenu(menuList);
        if (firstMenu) {
          navigate(firstMenu, { replace: true });
        } else {
          // 如果没有有权限的菜单，说明权限数据有问题，清除token
          console.warn('没有找到有权限的菜单，可能权限数据异常，清除token');
          setAccessToken('');
          setRefreshToken('');
          setPermissions([]);
          setMenuPermissions([]);
          setMenuList([]);
          setUserInfo(null);
        }
      } else {
        // 如果还没有权限数据，先跳转到根路径，让权限加载逻辑处理
        navigate('/', { replace: true });
      }
    }
  }, [token, location.pathname, navigate, permissions, menuPermissions]);
  /** 渲染页面 */
  const renderPage = () => {
    // 如果有token但访问登录页面，显示加载状态（实际会被useEffect重定向）
    if (token && location.pathname === '/login') {
      return (
        <div className="w-screen h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div>正在跳转...</div>
          </div>
        </div>
      );
    }

    // 没有token时才显示登录页面
    if (location.pathname === '/login') {
      return <div>{outlet}</div>;
    }

    if (token && permissions.length > 0) {
      const hasPermission = checkRoutePermission(location.pathname, permissions);
      if (!hasPermission) {
        return <Forbidden />;
      }
    }

    return <Layout />;
  };

  return <>{renderPage()}</>;
}

export default Guards;
