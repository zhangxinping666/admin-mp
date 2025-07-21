import { useEffect, useState } from 'react';
import { getAccessToken, setRefreshToken } from '@/stores/token';
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
        const refresh_token = loginResult.refresh_token;
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
      return;
    }

    // 有token但没有权限数据时，获取权限信息
    if (token && permissions.length === 0 && !isAutoLogging) {
      loadPermissionsData();
      return;
    }
    
    // 无token且不在自动登录过程中时，尝试自动登录
    if (!token && !isAutoLogging) {
      // 尝试自动登录
      tryAutoLogin().then((success) => {
        if (!success) {
          // 避免重复跳转到登录页面
          if (location.pathname !== '/login') {
            const param =
              location.pathname?.length > 1
                ? `?redirect=${encodeURIComponent(location.pathname + location.search)}`
                : '';
            navigate(`/login${param}`, { replace: true });
          }
        }
      });
    }
  }, [permissions.length]);

  // 监听路由变化，检查权限
  useEffect(() => {
    // 只有在有token和权限数据时才进行权限检查
    if (token && permissions.length > 0) {
      const hasPermission = checkRoutePermission(location.pathname, permissions);
      
      if (!hasPermission) {
        console.warn(`用户没有访问路径 ${location.pathname} 的权限`);
        // 可以选择跳转到403页面或者跳转到有权限的首页
        const firstMenu = getFirstMenu(menuList, permissions);
        if (firstMenu) {
          navigate(firstMenu, { replace: true });
        } else {
          // 如果没有任何有权限的菜单，跳转到403页面
          navigate('/403', { replace: true });
        }
      }
    }
  }, [location.pathname, permissions, token, menuList]);

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
