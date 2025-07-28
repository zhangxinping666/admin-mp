import { getAccessToken } from '@/stores/token';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useOutlet, useLocation } from 'react-router-dom';
import { Skeleton, message } from 'antd';
import { Icon } from '@iconify/react';
import { debounce } from 'lodash';
import { useMenuStore, useUserStore } from '@/stores';
import { useCommonStore } from '@/hooks/useCommonStore';
import KeepAlive from 'react-activation';
import Menu from './components/Menu';
import Header from './components/Header';
import Tabs from './components/Tabs';
import Forbidden from '@/pages/403';
import styles from './index.module.less';
import { getUserInfoServe } from '@/servers/login';
import { getPermissions } from '@/servers/login';
import type { SideMenu } from '#/public';
import { extractRoutePathsFromMenus } from '@/utils/menuUtils';

function Layout() {
  const { pathname, search } = useLocation();
  const uri = pathname + search;
  const token = getAccessToken();
  const outlet = useOutlet();
  const [isLoading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const { setPermissions, setUserInfo, setMenuPermissions } = useUserStore((state) => state);
  const { setMenuList, toggleCollapsed, togglePhone } = useMenuStore((state) => state);

  const { menuPermissions, userId, isMaximize, isCollapsed, isPhone, isRefresh } = useCommonStore();

  /** 获取用户信息（仅在必要时获取权限和菜单数据） */
  const initializeUserData = useCallback(async () => {
    try {
      setLoading(true);

      // 获取用户信息
      const { data: userInfo } = await getUserInfoServe();
      setUserInfo(userInfo.data);
      // 只有在权限为空时才获取权限和菜单信息，避免与Guards.tsx冲突
      if (menuPermissions.length === 0) {
        console.log('Layout检测到权限为空，获取权限和菜单信息');
        // const permissionsResponse = await getPermissions({ role: 'admin' });
        // console.log('Layout中获取权限和菜单信息:', permissionsResponse);
        // const { perms, menus } = permissionsResponse.data;
        console.log('Layout中获取权限和菜单信息:', menus);
        // 设置权限和菜单
        const menus = [
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
        const perms = ['acl:perm:search'];
        setPermissions(perms || []);
        setMenuList(menus || []);
        // 设置菜单权限
        setMenuPermissions(extractRoutePathsFromMenus(menus || []));
      } else {
        console.log('Layout检测到权限已存在，跳过权限获取，避免与Guards.tsx冲突');
      }
    } catch (err) {
      console.error('获取用户数据失败:', err);
      // 发生错误时不清空权限，避免影响已登录用户
      console.warn('保持现有权限状态，避免清空已有权限');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuPermissions.length]);

  useEffect(() => {
    // 当用户信息缓存不存在时则重新获取
    if (token && !userId) {
      initializeUserData();
    }
  }, [initializeUserData, token, userId]);

  /** 判断是否是手机端 */
  const handleIsPhone = debounce(() => {
    const isPhone = window.innerWidth <= 768;
    // 手机首次进来收缩菜单
    if (isPhone) toggleCollapsed(true);
    togglePhone(isPhone);
  }, 500);

  // 监听是否是手机端
  useEffect(() => {
    handleIsPhone();
    window.addEventListener('resize', handleIsPhone);

    return () => {
      window.removeEventListener('resize', handleIsPhone);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="layout">
      {contextHolder}
      <Menu />
      <div className={styles.layout_right}>
        <div
          id="header"
          className={`
            border-bottom
            transition-all
            ${styles.header}
            ${isCollapsed ? styles['header-close-menu'] : ''}
            ${isMaximize ? styles['header-none'] : ''}
            ${isPhone ? `!left-0 z-999` : ''}
          `}
        >
          <Header />
          <Tabs />
        </div>
        <div
          id="layout-content"
          className={`
            overflow-auto
            transition-all
            ${styles.con}
            ${isMaximize ? styles['con-maximize'] : ''}
            ${isCollapsed ? styles['con-close-menu'] : ''}
            ${isPhone ? `!left-0 !w-full` : ''}
          `}
        >
          {isLoading && menuPermissions.length === 0 && (
            <Skeleton active className="p-30px" paragraph={{ rows: 10 }} />
          )}
          {!isLoading && menuPermissions.length === 0 && <Forbidden />}
          {isRefresh && (
            <div
              className={`
              absolute
              left-50%
              top-50%
              -rotate-x-50%
              -rotate-y-50%
            `}
            >
              <Icon className="text-40px animate-spin" icon="ri:loader-2-fill" />
            </div>
          )}
          {menuPermissions.length > 0 && (
            <KeepAlive id={uri} name={uri}>
              <div
                className={`
                  content-transition
                `}
              >
                <Suspense
                  fallback={
                    <div className="p-30px">
                      <Skeleton active paragraph={{ rows: 10 }} />
                    </div>
                  }
                >
                  {outlet}
                </Suspense>
              </div>
            </KeepAlive>
          )}
        </div>
      </div>
    </div>
  );
}

export default Layout;
