import { useEffect, useState } from 'react';
import { getAccessToken, setAccessToken, setRefreshToken } from '@/stores/token';
import { useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { decryption } from '@manpao/utils';
import { login, getUserInfoServe, getPermissions } from '@/servers/login';
import { buildMenuTree } from '@/menus/utils/menuTree';
import { getFirstMenu } from '@/menus/utils/helper';
import { useUserStore } from '@/stores/user';
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
  const { setUserInfo, setPermissions } = useUserStore((state) => state);
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

        // 尝试自动登录
        const loginResponse = await login({
          account,
          password: decryptedPassword.value,
        });
        const loginResult = loginResponse.data;
        // 从 LoginResult 对象中，访问其内部的 data 属性，再获取 token
        const { access_token, refresh_token } = loginResult;
        setAccessToken(access_token);
        setRefreshToken(refresh_token);

        const { data: user } = await getUserInfoServe();
        // 获取权限信息 - data 字段直接是 PermissionsData 对象
        setUserInfo(user);
        // 设置token和用户信息

        const permissionsResponse = await getPermissions({ role: 'admin' });
        const { menus, perms } = permissionsResponse.data;
        setPermissions(perms);

        // 将扁平化菜单数据转换为树形结构
        const menuTree = buildMenuTree(menus);
        console.log('Guards中转换后的菜单树:', menuTree);
        setMenuList(menus);
        setIsDataLoaded(true); // 标记数据加载完成
        return true;
      } catch (error) {
        console.error('自动登录失败:', error);
        // 清除无效的记住我数据
        clearLoginInfo();
        localStorage.setItem(CHECK_REMEMBER, 'false');
        return false;
      } finally {
        setIsAutoLogging(false);
      }
    }
    return false;
  };

  // 获取权限数据（用于有token但没有权限的情况）
  const loadPermissionsData = async () => {
    try {
      const permissionsResponse = await getPermissions({ role: 'admin' });
      const { menus, perms } = permissionsResponse.data;
      setPermissions(perms);

      // 将扁平化菜单数据转换为树形结构
      const menuTree = buildMenuTree(menus);
      console.log('Guards中转换后的菜单树:', menuTree);
      setMenuList(menus);
      setIsDataLoaded(true); // 标记数据加载完成
    } catch (error) {
      console.error('Guards获取权限数据失败:', error);
    }
  };

  // 检查当前路径是否有权限访问
  const checkRoutePermission = (pathname: string, userPermissions: string[]): boolean => {
    // 登录页面和首页不需要权限检查
    if (pathname === '/login' || pathname === '/') {
      return true;
    }

    // 使用权限检测工具函数检查路径权限
    return checkPermission(pathname, userPermissions);
  };

  useEffect(() => {
    // 如果已经在登录页面，不需要处理
    if (location.pathname === '/login') {
      setIsInitialLoad(false);
      return;
    }
    // 有token但没有权限数据时，获取权限信息
    if (token && permissions.length === 0 && !isAutoLogging) {
      loadPermissionsData().finally(() => {
        setIsInitialLoad(false);
      });
      return;
    }
    // 无token且不在自动登录过程中时，尝试自动登录
    if (!token && !isAutoLogging) {
      // 尝试自动登录
      tryAutoLogin()
        .then((success) => {
          if (!success) {
            // 避免重复跳转到登录页面
            if (location.pathname !== '/login') {
              // const param =
              //   location.pathname?.length > 1
              //     ? `?redirect=${encodeURIComponent(location.pathname + location.search)}`
              //     : '';
              navigate(`/login`, { replace: true });
            }
          }
        })
        .finally(() => {
          setIsInitialLoad(false);
        });
    } else if (token && permissions.length > 0) {
      // 如果已经有token和权限数据，标记初始加载完成
      setIsInitialLoad(false);
    }
  }, [permissions.length]);

  // 监听路由变化，检查权限
  useEffect(() => {
    // 只有在非初始加载、有token、权限数据和菜单数据且数据已完全加载时才进行权限检查
    if (!isInitialLoad && token && permissions.length > 0 && menuList.length > 0 && isDataLoaded) {
      // 跳过特殊页面的权限检查
      if (['/', '/403', '/404', '/login'].includes(location.pathname)) {
        return;
      }

      // 检查当前路径是否在菜单列表中
      const isValidMenuPath = menuList.some((menu) => {
        // 递归检查菜单及其子菜单
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

      // 检查用户是否有当前路径的权限
      const hasPermission = checkRoutePermission(location.pathname, permissions);

      // 如果路径不在菜单中或者用户没有权限，重定向到第一个有权限的菜单
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
    // 正在自动登录时显示加载状态
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

    // 如果已登录但在登录页面，跳转到第一个有效菜单
    if (token && location.pathname === '/login') {
      if (menuList.length > 0 && permissions.length > 0) {
        const firstMenu = getFirstMenu(menuList, permissions);
        if (firstMenu) {
          navigate(firstMenu, { replace: true });
          return null;
        }
      }
      // 如果菜单或权限还没加载完成，跳转到首页
      navigate('/', { replace: true });
      return null;
    }

    // 如果在登录页面且没有token，显示登录页面
    if (location.pathname === '/login') {
      return <div>{outlet}</div>;
    }

    // 检查当前路径权限（仅在有权限数据时检查）
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
