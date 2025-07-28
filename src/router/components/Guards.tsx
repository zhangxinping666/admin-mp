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
  const { setUserInfo, setPermissions, setMenuPermissions } = useUserStore((state) => state);
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

        const { data: user } = await getUserInfoServe();
        setUserInfo(user);
        // 设置token和用户信息

        const menu = [
          {
            key: 1,
            pid: 0,
            label: '仪表盘',
            icon: 'la:tachometer-alt',
            sort: 1,
            type: 2,
            route_path: '/dashboard',
            component_path: '/dashboard',
            permission: 'dashboard',
            route_name: '/dashboard',
          },
          {
            key: 201,
            pid: 0,
            label: '组件',
            icon: 'fluent:box-20-regular',
            sort: 1,
            type: 1,
            route_path: '/demo',
            component_path: 'Layout',
            permission: 'demo',
            route_name: '/demo',
          },
          {
            key: 202,
            pid: 201,
            label: '剪切板',
            icon: null,
            sort: 1,
            type: 2,
            route_path: '/demo/copy',
            component_path: '/demo/copy/index',
            permission: 'demo/copy',
            route_name: '/demo/copy',
          },
          {
            key: 203,
            pid: 201,
            label: '水印',
            icon: null,
            sort: 2,
            type: 2,
            route_path: '/demo/watermark',
            component_path: '/demo/watermark/index',
            permission: 'demo/watermark',
            route_name: '/demo/watermark',
          },
          {
            key: 204,
            pid: 201,
            label: '虚拟滚动',
            icon: null,
            sort: 3,
            type: 2,
            route_path: '/demo/virtualScroll',
            component_path: '/demo/virtualScroll/index',
            permission: 'demo/virtualScroll',
            route_name: '/demo/virtualScroll',
          },
          {
            key: 205,
            pid: 201,
            label: '富文本',
            icon: null,
            sort: 4,
            type: 2,
            route_path: '/demo/editor',
            component_path: '/demo/editor/index',
            permission: 'demo/editor',
            route_name: '/demo/editor',
          },
          {
            key: 206,
            pid: 201,
            label: '层级1',
            icon: null,
            sort: 5,
            type: 1,
            route_path: '/demo/level1',
            component_path: 'Layout',
            permission: 'demo/level1',
            route_name: '/demo/level1',
          },
          {
            key: 207,
            pid: 206,
            label: '层级2',
            icon: null,
            sort: 1,
            type: 1,
            route_path: '/demo/level1/level2',
            component_path: 'Layout',
            permission: 'demo/level1/level2',
            route_name: '/demo/level1/level2',
          },
          {
            key: 208,
            pid: 207,
            label: '层级3',
            icon: null,
            sort: 1,
            type: 2,
            route_path: '/demo/level1/level2/level3',
            component_path: '/demo/level1/level2/level3/index',
            permission: 'demo/level1/level2/level3',
            route_name: '/demo/level1/level2/level3',
          },
          {
            key: 209,
            pid: 0,
            label: '商家管理',
            icon: 'la:tachometer-alt',
            sort: 1,
            type: 1,
            route_path: '/merchantManage',
            component_path: 'layout',
            permission: 'merchantManage',
            route_name: '/merchantManage',
          },
          {
            key: 210,
            pid: 209,
            label: '商家分类',
            icon: null,
            sort: 1,
            type: 2,
            route_path: '/merchantManage/merchantSort',
            component_path: '/merchantManage/merchantSort/index',
            permission: 'merchantManage/merchantSort',
            route_name: '/merchantManage/merchantSort',
          },
          {
            key: 211,
            pid: 209,
            label: '商家详情列表',
            icon: null,
            sort: 2,
            type: 2,
            route_path: '/merchantManage/merchants',
            component_path: '/merchantManage/merchants/index',
            permission: 'merchantManage/merchants',
            route_name: '/merchantManage/merchants',
          },
          {
            key: 212,
            pid: 209,
            label: '商家申请列表',
            icon: null,
            sort: 3,
            type: 2,
            route_path: '/merchantManage/merchantApplication',
            component_path: '/merchantManage/merchantApplication/index',
            permission: 'merchantManage/merchantApplication',
            route_name: '/merchantManage/merchantApplication',
          },
          {
            key: 213,
            pid: 0,
            label: '楼栋楼层管理',
            icon: 'fluent:box-20-regular',
            sort: 1,
            type: 2,
            route_path: '/buildsManage',
            component_path: '/buildsManage',
            permission: 'buildsManage',
            route_name: '/buildsManage',
          },

          {
            key: 214,
            pid: 0,
            label: '余额明细管理',
            icon: 'fluent:box-20-regular',
            sort: 1,
            type: 2,
            route_path: '/balanceManage',
            component_path: '/balanceManage',
            permission: 'balanceManage',
            route_name: '/balanceManage',
          },
          {
            key: 215,
            pid: 0,
            label: '字典管理',
            icon: 'la:tachometer-alt',
            sort: 1,
            type: 2,
            route_path: '/dictionaryManage',
            component_path: '/dictionaryManage',
            permission: 'dictionaryManage',
            route_name: '/dictionaryManage',
          },
          {
            key: 216,
            pid: 0,
            label: '学校管理',
            icon: 'la:tachometer-alt',
            sort: 1,
            type: 2,
            route_path: '/schoolsManage',
            component_path: '/schoolsManage',
            permission: 'schoolsManage',
            route_name: '/schoolsManage',
          },
          {
            key: 300,
            pid: 0,
            label: '交易流水管理',
            icon: 'la:tachometer-alt',
            sort: 1,
            type: 2,
            route_path: '/tradeBlotterManage',
            component_path: '/tradeBlotterManage',
            permission: 'tradeBlotterManage',
            route_name: '/tradeBlotterManage',
          },
          {
            key: 226,
            pid: 0,
            label: '用户管理',
            icon: 'la:tachometer-alt',
            sort: 1,
            type: 2,
            route_path: '/usersManage',
            component_path: '/usersManage',
            permission: 'usersManage',
            route_name: '/usersManage',
          },
          {
            key: 229,
            pid: 0,
            label: '城市管理',
            icon: 'la:tachometer-alt',
            sort: 1,
            type: 2,
            route_path: '/citysManage',
            component_path: '/citysManage',
            permission: 'citysManage',
            route_name: '/citysManage',
          },
          {
            key: 239,
            pid: 0,
            label: '团长管理',
            icon: 'la:tachometer-alt',
            sort: 1,
            type: 2,
            route_path: '/colonelManage',
            component_path: '/colonelManage',
            permission: 'colonelManage',
            route_name: '/colonelManage',
          },
          {
            key: 249,
            pid: 0,
            label: '实名认证',
            icon: 'la:tachometer-alt',
            sort: 1,
            type: 2,
            route_path: '/certManage',
            component_path: '/certManage',
            permission: 'certManage',
            route_name: '/certManage',
          },
          {
            key: 250,
            pid: 0,
            label: '权限管理',
            icon: 'la:tachometer-alt',
            sort: 1,
            type: 2,
            route_path: '/permissionManage',
            component_path: '/permissionManage',
            permission: 'permissionManage',
            route_name: '/permissionManage',
          },
          {
            key: 251,
            pid: 250,
            label: '菜单管理',
            icon: 'la:tachometer-alt',
            sort: 1,
            type: 2,
            route_path: '/permissionManage/menuManage',
            component_path: '/permissionManage/menuManage/index',
            permission: 'permissionManage/menuManage',
            route_name: '/permissionManage/menuManage',
          },
          {
            key: 252,
            pid: 250,
            label: '角色管理',
            icon: 'la:tachometer-alt',
            sort: 1,
            type: 2,
            route_path: '/permissionManage/roleManage',
            component_path: '/permissionManage/menuManage/index',
            permission: 'permissionManage/roleManage',
            route_name: '/permissionManage/roleManage',
          },
          {
            key: 253,
            pid: 250,
            label: 'API管理',
            icon: 'la:tachometer-alt',
            sort: 1,
            type: 2,
            route_path: '/permissionManage/apiManage',
            component_path: '/permissionManage/apiManage/index',
            permission: 'permissionManage/apiManage',
            route_name: '/permissionManage/apiManage',
          },
        ];
        // const permissionsResponse = await getPermissions({ role: 'admin' });
        // const { menus, perms } = permissionsResponse.data;
        const perms = ['acl:perm:search'];
        setPermissions(perms);

        const menuTree = buildMenuTree(menu);
        console.log('Guards中转换后的菜单树:', menuTree);
        setMenuList(menu);
        setMenuPermissions(extractRoutePathsFromMenus(menu));
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
      const permissionsResponse = await getPermissions({ role: 'admin' });
      const { menus, perms } = permissionsResponse.data;
      setPermissions(perms);

      const menuTree = buildMenuTree(menus);
      console.log('Guards中转换后的菜单树:', menuTree);
      setMenuList(menus);
      setMenuPermissions(extractRoutePathsFromMenus(menus));
      setIsDataLoaded(true); // 标记数据加载完成
    } catch (error) {
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
    if (location.pathname === '/login') {
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
  }, [permissions.length]);

  useEffect(() => {
    if (!isInitialLoad && token && permissions.length > 0 && menuList.length > 0 && isDataLoaded) {
      if (['/', '/403', '/404', '/login'].includes(location.pathname)) {
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

    if (token && location.pathname === '/login') {
      if (menuList.length > 0 && permissions.length > 0) {
        const firstMenu = getFirstMenu(menuList, permissions);
        if (firstMenu) {
          navigate(firstMenu, { replace: true });
          return null;
        }
      }
      navigate('/', { replace: true });
      return null;
    }

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
