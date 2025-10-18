import { useEffect, useState, useRef } from 'react';
import { getAccessToken, setAccessToken, setRefreshToken, clearAllTokens } from '@/stores/token';
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
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 标识是否为初始加载
  const isLoadingPermissionsRef = useRef(false); // 使用ref避免状态更新导致重新渲染
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
    if (isLoadingPermissionsRef.current) {
      return;
    }

    try {
      isLoadingPermissionsRef.current = true;
      const currentUserInfo = userInfo;
      if (!currentUserInfo || !currentUserInfo.name) {
        return;
      }
      const permissionsResponse = await getPermissions({ role: currentUserInfo.name });
      const Data = permissionsResponse.data as unknown as PermissionsData;
      const { menus, perms } = Data;
      const routePermissions = extractRoutePathsFromMenus(menus);
      const finalPermissions = [...routePermissions, ...(perms || [])];

      setPermissions(finalPermissions);
      setMenuList(menus);
      setMenuPermissions(routePermissions);
    } catch (error: any) {
      console.error('[Guards] 获取权限数据失败:', error);
      // 只有在非取消错误时才清除数据
      if (error?.name !== 'CanceledError') {
        setPermissions([]);
        setMenuPermissions([]);
        setMenuList([]);
        setUserInfo(null);
        navigate(`/login`, { replace: true });
      }
    } finally {
      isLoadingPermissionsRef.current = false;
    }
  };

  const checkRoutePermission = (pathname: string, userPermissions: string[]): boolean => {
    if (pathname === '/login' || pathname === '/') {
      return true;
    }

    return checkPermission(pathname, userPermissions);
  };

  // 主加载逻辑 - 只依赖关键状态变化
  useEffect(() => {
    console.log('[Guards] 主加载逻辑触发', {
      pathname: location.pathname,
      hasToken: !!token,
      hasUserInfo: !!userInfo,
      permissionsLength: permissions.length,
      isInitialLoad
    });

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

    // 有token但无权限数据,且有用户信息时加载权限
    if (token && permissions.length === 0 && userInfo && !isLoadingPermissionsRef.current) {
      console.log('[Guards] 检测到需要加载权限数据');
      loadPermissionsData().finally(() => {
        setIsInitialLoad(false);
      });
      return;
    }
    if (!token) {
      setPermissions([]);
      setMenuPermissions([]);
      setMenuList([]);
      setUserInfo(null);
      clearAllTokens();
      if (location.pathname !== '/login') {
        navigate(`/login`, { replace: true });
      }
      setIsInitialLoad(false);
    } else if (token && permissions.length > 0) {
      setIsInitialLoad(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userInfo?.id, permissions.length, location.pathname]);

  // 路由权限校验 - 只在数据完全加载后执行
  useEffect(() => {
    if (!isInitialLoad && token && menuList.length > 0 && menuPermissions.length > 0) {
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
      if (!isValidMenuPath || !hasPermission) {
        console.warn('[Guards] 无权限或路径不在菜单中, 跳转到第一个菜单');
        const firstMenu = getFirstMenu(menuList);
        if (firstMenu && firstMenu !== location.pathname) {
          navigate(firstMenu, { replace: true });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, isInitialLoad, menuList.length, menuPermissions.length]);

  // 登录页面重定向逻辑
  useEffect(() => {
    if (token && location.pathname === '/login') {
      console.log('[Guards] 在登录页但有token,准备跳转');
      if (permissions.length > 0 && menuPermissions.length > 0) {
        const firstMenu = getFirstMenu(menuList);
        if (firstMenu) {
          navigate(firstMenu, { replace: true });
        } else {
          setAccessToken('');
          setRefreshToken('');
          setPermissions([]);
          setMenuPermissions([]);
          setMenuList([]);
          setUserInfo(null);
        }
      } else if (!isLoadingPermissionsRef.current) {
        // 如果还没有权限数据且没有正在加载,先跳转到根路径,让权限加载逻辑处理
        console.log('[Guards] 权限数据未加载,跳转到根路径');
        navigate('/', { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, location.pathname, permissions.length, menuPermissions.length]);

  /** 渲染页面 */
  const renderPage = () => {
    // 如果有token但访问登录页面,显示加载状态(实际会被useEffect重定向)
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
