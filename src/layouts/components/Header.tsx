import type { MenuProps } from 'antd';
import { useMemo } from 'react';
import { useAliveController } from 'react-activation';
import { useNavigate } from 'react-router-dom';
import { clearAllTokens } from '@/stores/token';
import { App, Dropdown } from 'antd';
import { useTranslation } from 'react-i18next';
import { useCommonStore } from '@/hooks/useCommonStore';
import { useMenuStore, useTabsStore, useUserStore } from '@/stores';
import { logout } from '@/servers/login';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import Avatar from '@/assets/images/avatar.png';
import styles from '../index.module.less';
import Fullscreen from '@/components/Fullscreen';
import I18n from '@/components/I18n';
import Theme from '@/components/Theme';
type MenuKey = 'logout';

function Header() {
  const { t } = useTranslation();
  const { clear } = useAliveController();
  const { modal } = App.useApp();
  const { isCollapsed, isMaximize, username } = useCommonStore();
  const navigate = useNavigate();
  const toggleCollapsed = useMenuStore((state) => state.toggleCollapsed);
  const clearInfo = useUserStore((state) => state.clearInfo);
  const { closeAllTab, setActiveKey } = useTabsStore((state) => state);
  const { setPermissions, setMenuPermissions, setUserInfo } = useUserStore.getState();
  const { setMenuList } = useMenuStore.getState();
  const items: MenuProps['items'] = [
    {
      key: 'logout',
      label: <span>{t('public.signOut')}</span>,
      icon: <LogoutOutlined className="mr-1" />,
    },
  ];

  //点击退出登录触发事件
  const onClick: MenuProps['onClick'] = (e) => {
    switch (e.key as MenuKey) {
      case 'logout':
        handleLogout();
        break;

      default:
        break;
    }
  };

  //登出函数
  const handleLogout = () => {
    modal.confirm({
      title: t('public.kindTips'),
      icon: <ExclamationCircleOutlined />,
      content: t('public.signOutMessage'),
      onOk() {
        logout()
        clearInfo();
        closeAllTab();
        setActiveKey('');
        clearAllTokens();
        clear();
        setPermissions([]);
        setMenuPermissions([]);
        setMenuList([]);
        setUserInfo(null);
        navigate('/login');
      },
    });
  };


  const RightRender = () => {
    return useMemo(
      () => (
        <div className="flex items-center">
          <Fullscreen />
          <I18n />
          <Theme />
          <Dropdown className="min-w-50px" menu={{ items, onClick }}>
            <div
              className="ant-dropdown-link flex items-center cursor-pointer"
              onClick={(e) => e.preventDefault()}
            >
              <img
                src={Avatar}
                width={27}
                height={27}
                alt="Avatar"
                className="rounded-1/2 overflow-hidden object-cover bg-light-500"
              />
              <span className="ml-2 text-15px min-w-50px truncate">{username || 'admin'}</span>
            </div>
          </Dropdown>
        </div>

      ),
      [username],
    );
  };

  const IconRender = () => {
    return (
      <div className="text-lg cursor-pointer" onClick={() => toggleCollapsed(!isCollapsed)}>
        {isCollapsed && <MenuUnfoldOutlined />}
        {!isCollapsed && <MenuFoldOutlined />}
      </div>
    );
  };

  return (
    <>
      <header
        className={`
          border-bottom
          flex
          items-center
          justify-between
          px-6
          py-6px
          box-border
          transition-all
          ${styles['header-driver']}
          ${isMaximize ? styles.none : ''}
        `}
      >
        <div className="flex item-center">
          <IconRender />

        </div>

        <RightRender />
      </header>
    </>
  );
}

export default Header;
