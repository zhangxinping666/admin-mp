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
      const { data: userInfo } = await getUserInfoServe();
      setUserInfo(userInfo.data);
      // 只有在权限为空时才获取权限和菜单信息，避免与Guards.tsx冲突
      if (menuPermissions.length === 0) {
        const permissionsResponse = await getPermissions({ role: userInfo.name });
        const { perms, menus } = permissionsResponse.data;
        // 设置权限和菜单
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
