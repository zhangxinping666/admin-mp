import { useEffect, useState, useRef } from 'react';
import { getAccessToken, setAccessToken, clearAllTokens } from '@/stores/token';
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
import { useTabsStore } from '@/stores';
import { PermissionsData } from '@/pages/login/model'

const LoadingRedirct = () => (
  <div className="w-screen h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <div>正在加载...</div>
    </div>
  </div>
)
function Guards() {
  const outlet = useOutlet();
  const navigate = useNavigate();
  const location = useLocation();
  const token = getAccessToken();
  const { closeAllTab, setActiveKey } = useTabsStore((state) => state);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const isLoadingPermissionsRef = useRef(false);
  const { setUserInfo, setPermissions, setMenuPermissions, userInfo } = useUserStore(
    (state) => state,
  );
  const { permissions, menuPermissions } = useUserStore((state) => state);
  const setMenuList = useMenuStore((state) => state.setMenuList);
  const { menuList } = useMenuStore();

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
      if (error?.name !== 'CanceledError') {
        setPermissions([]);
        setMenuPermissions([]);
        setMenuList([]);
        setUserInfo(null);
      }
    } finally {
      isLoadingPermissionsRef.current = false;
    }
  };

  // 认证与权限加载
  useEffect(() => {
    if (location.pathname === '/login' && !token) {
      setPermissions([]);
      setMenuPermissions([]);
      setMenuList([]);
      setUserInfo(null);
      closeAllTab();
      setActiveKey('');
      setIsInitialLoad(false);
      return;
    }

    if (token && permissions.length === 0 && userInfo && !isLoadingPermissionsRef.current) {
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
  }, [token, userInfo?.id, permissions.length, location.pathname]);

  //已登录用户的“路由授权”处理器
  useEffect(() => {
    if (!isInitialLoad && token && permissions.length > 0) {
      if (['/', '/403', '/404'].includes(location.pathname)) {
        return;
      }
      if (menuPermissions.length > 0) {
        const hasPermission = menuPermissions.includes(location.pathname);
        if (!hasPermission) {
          const firstMenu = getFirstMenu(menuList);
          if (firstMenu && firstMenu !== location.pathname) {
            console.warn('[Guards] 跳转到第一个有权限的菜单:', firstMenu);
            navigate(firstMenu, { replace: true });
          }
        }
      }
    }
  }, [location.pathname, isInitialLoad, token, permissions.length, menuPermissions, menuList]);

  //处理“已登录访问 /login”的边缘情况
  useEffect(() => {
    if (token && location.pathname === '/login') {
      if (permissions.length > 0 && menuPermissions.length > 0) {
        const firstMenu = getFirstMenu(menuList);
        if (firstMenu) {
          navigate(firstMenu, { replace: true });
        } else {
          setAccessToken('');
          setPermissions([]);
          setMenuPermissions([]);
          setMenuList([]);
          setUserInfo(null);
        }
      } else if (!isLoadingPermissionsRef.current) {
        navigate('/', { replace: true });
      }
    }
  }, [token, location.pathname, permissions.length, menuPermissions.length]);

  const renderPage = () => {
    if (location.pathname === '/login') {
      if (token) {
        return <LoadingRedirct />
      }
      //没有token正常显示登录页
      return <div>{outlet}</div>
    }
    if (!token) {
      return <LoadingRedirct />
    }
    if (token && (isInitialLoad || (permissions.length === 0 && isLoadingPermissionsRef.current))) {
      return <LoadingRedirct />
    }
    if (token && permissions.length > 0) {
      return <Layout />
    }
    return <LoadingRedirct />
  };

  return <>{renderPage()}</>;
}

export default Guards;
