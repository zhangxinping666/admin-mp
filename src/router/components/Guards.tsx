import { useEffect, useState } from 'react';
import { getAccessToken, setAccessToken, setRefreshToken } from '@/stores/token';
import { useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { decryption } from '@manpao/utils';
import { login, getUserInfoServe, getPermissions } from '@/servers/login';
import { buildMenuTree } from '@/menus/utils/menuTree';
import { getFirstMenu } from '@/menus/utils/helper';
import { useUserStore } from '@/stores/user';
import { extractRoutePathsFromMenus } from '@/utils/menuUtils';
import nprogress from 'nprogress';
import Layout from '@/layouts';
import { useCommonStore } from '@/hooks/useCommonStore';
import { useMenuStore } from '@/stores/menu';
import { checkPermission } from '@/utils/permissions';
import Forbidden from '@/pages/403';
// 记住我相关常量
const CHECK_REMEMBER = 'remember-me';

function Guards() {
  const outlet = useOutlet();
  const navigate = useNavigate();
  const location = useLocation();
  const token = getAccessToken();
  const [isAutoLogging, setIsAutoLogging] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false); // 标识数据是否已加载完成
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 标识是否为初始加载
  const { setUserInfo, setPermissions, setMenuPermissions, userInfo } = useUserStore(
    (state) => state,
  );
  const { getLoginInfo, clearLoginInfo, permissions, menuList } = useCommonStore();
  const setMenuList = useMenuStore((state) => state.setMenuList);

  // 顶部进度条
  useEffect(() => {
    nprogress.start();
  }, []);

  // 自动登录逻辑
  const tryAutoLogin = async () => {
    const remember = localStorage.getItem(CHECK_REMEMBER);
    const { account, password } = getLoginInfo();
    // 检查是否开启记住我且存在账号密码
    if (remember !== 'false' && account && password) {
      try {
        setIsAutoLogging(true);
        const decryptedPassword = decryption(password);
        const loginResponse = await login({
          account,
          password: decryptedPassword.value,
        });
        const loginResult = loginResponse.data;
        const { access_token, refresh_token } = loginResult;
        setAccessToken(access_token);
        setRefreshToken(refresh_token);

        const { data: userInfo } = await getUserInfoServe();
        setUserInfo(userInfo.data);
        // 设置token和用户信息

        const permissionsResponse = await getPermissions({ role: userInfo.name });
        const { menus, perms } = permissionsResponse.data;

        // 从菜单中提取route_path作为权限（与登录逻辑保持一致）
        const routePermissions = extractRoutePathsFromMenus(menus);
        setPermissions(routePermissions);

        const menuTree = buildMenuTree(menus);
        setMenuList(menus);
        setMenuPermissions(routePermissions);
        setIsDataLoaded(true); // 标记数据加载完成
        return true;
      } catch (error) {
        console.error('自动登录失败:', error);
        clearLoginInfo();
        localStorage.setItem(CHECK_REMEMBER, 'false');
        return false;
      } finally {
        setIsAutoLogging(false);
      }
    }
    return false;
  };

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
      const { menus, perms } = permissionsResponse.data;

      // 从菜单中提取route_path作为权限（与登录逻辑保持一致）
      const routePermissions = extractRoutePathsFromMenus(menus);

      // 合并路径权限和功能权限
      const finalPermissions = [...routePermissions, ...(perms || [])];
      setPermissions(finalPermissions);

      setMenuList(menus);
      setMenuPermissions(finalPermissions);
      setIsDataLoaded(true); // 标记数据加载完成
    } catch (error) {
      navigate(`/login`, { replace: true });
      console.error('Guards获取权限数据失败:', error);
    }
  };

  const checkRoutePermission = (pathname: string, userPermissions: string[]): boolean => {
    if (pathname === '/login' || pathname === '/') {
      return true;
    }

    return checkPermission(pathname, userPermissions);
  };

  useEffect(() => {
    // 如果是登录页面且已有token，不要阻止后续逻辑，让第二个useEffect处理重定向
    if (location.pathname === '/login' && !token) {
      setIsInitialLoad(false);
      return;
    }
    if (token && permissions.length === 0 && !isAutoLogging) {
      loadPermissionsData().finally(() => {
        setIsInitialLoad(false);
      });
      return;
    }
    if (!token && !isAutoLogging) {
      tryAutoLogin()
        .then((success) => {
          if (!success) {
            // 避免重复跳转到登录页面
            if (location.pathname !== '/login') {
              navigate(`/login`, { replace: true });
            }
          }
        })
        .finally(() => {
          setIsInitialLoad(false);
        });
    } else if (token && permissions.length > 0) {
      setIsInitialLoad(false);
    }
  }, [permissions.length, token, location.pathname]);
  useEffect(() => {
    if (!isInitialLoad && token && menuList.length > 0) {
      // 已登录用户访问登录页面时，重定向到首页或第一个有权限的菜单
      if (location.pathname === '/login') {
        const firstMenu = getFirstMenu(menuList, permissions);
        if (firstMenu) {
          navigate(firstMenu, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        return;
      }

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

      const hasPermission = checkRoutePermission(location.pathname, permissions);

      if (!isValidMenuPath || !hasPermission) {
        const firstMenu = getFirstMenu(menuList, permissions);
        if (firstMenu && firstMenu !== location.pathname) {
          navigate(firstMenu, { replace: true });
        }
      }
    }
  }, [location.pathname, permissions, token, menuList, isDataLoaded, isInitialLoad]);
  /** 渲染页面 */
  const renderPage = () => {
    if (isAutoLogging) {
      return (
        <div className="w-screen h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div>页面加载中...</div>
          </div>
        </div>
      );
    }

    // 移除这里的重复逻辑，让 useEffect 来统一处理已登录用户访问登录页面的情况
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
