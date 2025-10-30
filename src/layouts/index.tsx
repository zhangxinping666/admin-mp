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
import { UserInfo } from '@/pages/login/model';

function Layout() {
  const { pathname, search } = useLocation();
  const uri = pathname + search;
  const token = getAccessToken();
  const outlet = useOutlet();
  const [isLoading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const { setUserInfo } = useUserStore((state) => state);
  const { toggleCollapsed, togglePhone } = useMenuStore((state) => state);

  const { menuPermissions, userId, isMaximize, isCollapsed, isPhone, isRefresh } = useCommonStore();

  const initializeUserData = useCallback(async () => {
    if (userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: userInfo } = await getUserInfoServe();
      const userInformation = userInfo as unknown as UserInfo
      setUserInfo(userInformation);
    } catch (err) {
      messageApi.error('获取用户信息失败');
    } finally {
      setLoading(false);
    }
  }, [userId, setUserInfo, messageApi]);

  useEffect(() => {
    if (token && !userId) {
      initializeUserData();
    } else {
      setLoading(false);
    }
  }, [token, userId, initializeUserData]);

  const handleIsPhone = debounce(() => {
    const isPhone = window.innerWidth <= 768;
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
