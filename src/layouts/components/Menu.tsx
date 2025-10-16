import type { MenuProps } from 'antd';
import { MenuItem } from '@/pages/login/model';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Menu } from 'antd';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useCommonStore } from '@/hooks/useCommonStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMenuStore } from '@/stores';
import { getFirstMenu, getOpenMenuByRouter } from '@/menus/utils/helper';
import { buildMenuTree } from '@/menus/utils/menuTree';
import styles from '../index.module.less';
import Logo from '@/assets/images/logo.png';
import { getMenuByKey } from '@/menus/utils/helper';
import type { ReactNode } from 'react';

function LayoutMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [antdMenuItems, setAntdMenuItems] = useState<MenuItemType[]>([]);

  const { isMaximize, isCollapsed, isPhone, openKeys, selectedKeys, permissions, menuList } =
    useCommonStore();
  const { setOpenKeys } = useMenuStore((state) => state);
  const { setSelectedKeys } = useMenuStore((state) => state);
  const { toggleCollapsed } = useMenuStore((state) => state);
  interface antMenu {
    key: number,
    label: string;
    icon: string | ReactNode,
    children?: antMenu[]
  }
  type MenuItemType = Required<MenuProps>['items'][number];
  function transformMenuItems(menus: antMenu[]): MenuItemType[] {
    if (!menus) {
      return [];
    }
    return menus.map((menuItem): MenuItemType => {
      const baseItem = {
        key: menuItem.key,
        label: menuItem.label,
        icon: menuItem.icon ? <div>{menuItem.icon}</div> : null,
      };

      if (menuItem.children && menuItem.children.length > 0) {
        return {
          ...baseItem,
          children: transformMenuItems(menuItem.children),
        };
      }

      // 如果没有子菜单，直接返回基础对象
      return baseItem;
    });
  }
  // 处理菜单数据
  useEffect(() => {
    if (menuList.length > 0) {
      const menuListWithIcons = processMenuIcons(menuList);
      const treeMenus = buildMenuTree(menuListWithIcons);
      console.log("treeMenus", treeMenus)
      const convertToAntdItems = (menus: MenuItem[]): antMenu[] => {
        return menus.map((menu) => {
          const menuKey = (menu as any).id || (menu as any).key;
          const item: antMenu = {
            key: menuKey,
            label: (menu as any).name || (menu as any).label,
            icon: menu.icon,
          };

          // 如果有子菜单，递归处理
          if (menu.children && menu.children.length > 0) {
            item.children = convertToAntdItems(menu.children);
          }
          return item;
        });
      };

      const antdItems: antMenu[] = convertToAntdItems(treeMenus);
      const formattedItems = transformMenuItems(antdItems);
      setAntdMenuItems(formattedItems);
    } else {
      setAntdMenuItems([]);
    }
  }, [menuList, permissions, pathname]);

  useEffect(() => {
    const currentPath = pathname;
    const findMenuByPath = (menus: MenuItem[], targetPath: string): MenuItem | null => {
      for (const menu of menus) {
        if (menu.route_path === targetPath) {
          return menu;
        }
        if (menu.children?.length) {
          const found = findMenuByPath(menu.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    const menuItem = findMenuByPath(menuList, currentPath);

    if (menuItem) {
      const selectedKey = String((menuItem as any).id || (menuItem as any).key);
      setSelectedKeys([selectedKey]);
    } else {
      setSelectedKeys([]);
    }

    const newOpenKeys = getOpenMenuByRouter(currentPath);
    const needsNewOpenKeys = newOpenKeys.some((key) => !openKeys.includes(key));

    if (needsNewOpenKeys) {
      const mergedOpenKeys = [...new Set([...openKeys, ...newOpenKeys])];
      setOpenKeys(mergedOpenKeys);
    }
  }, [pathname, menuList, openKeys]);

  //处理菜单图标
  const processMenuIcons = useCallback((menus: MenuItem[]): MenuItem[] => {
    return menus.map((menu) => {
      const processedMenu = { ...menu };
      // 处理图标
      if (processedMenu.icon && typeof processedMenu.icon === 'string') {
        processedMenu.icon = <Icon icon={processedMenu.icon} />;
      }
      return processedMenu;
    });
  }, []);

  //处理跳转
  const goPath = (path: string) => {
    navigate(path);
  };

  //点击菜单
  const onClickMenu: MenuProps['onClick'] = (e) => {
    const menuItem = getMenuByKey(menuList, e.key);
    if (!menuItem || !menuItem.route_path) {
      console.warn('未找到匹配的菜单项或该项无 route_path:', e.key);
      return;
    }
    const targetPath = menuItem.route_path;
    const newOpenKeys = getOpenMenuByRouter(targetPath);
    const mergedOpenKeys = [...new Set([...openKeys, ...newOpenKeys])];
    goPath(targetPath);
    setSelectedKeys([String(e.key)]);
    setOpenKeys(mergedOpenKeys);
    if (isPhone) {
      hiddenMenu();
    }
  };

  const handleOpenChange: MenuProps['onOpenChange'] = (keys) => {
    setOpenKeys(keys);
  };

  const onClickLogo = () => {
    const firstMenu = getFirstMenu(menuList);
    if (firstMenu)
      goPath(firstMenu);
    if (isPhone) hiddenMenu();
  };

  const hiddenMenu = () => {
    toggleCollapsed(true);
  };

  return useMemo(
    () => (
      <>
        <div
          className={`
            transition-all
            overflow-auto
            z-2
            ${styles.menu}
            ${isCollapsed ? styles['menu-close'] : ''}
            ${isMaximize || (isPhone && isCollapsed) ? styles['menu-none'] : ''}
            ${isPhone ? '!z-1002' : ''}
          `}
        >
          <div
            className={`
              text-white
              flex
              content-center
              px-5
              py-2
              cursor-pointer
              ${isCollapsed ? 'justify-center' : ''}
            `}
            onClick={onClickLogo}
          >
            <img src={Logo} width={30} height={30} className="object-contain" alt="logo" />

            <span
              className={`
              text-white
              ml-3
              text-xl
              font-bold
              truncate
              ${isCollapsed ? 'hidden' : ''}
            `}
            >
              {t('public.currentName')}
            </span>
          </div>

          <Menu
            id="layout-menu"
            className="z-1000"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            mode="inline"
            theme="dark"
            forceSubMenuRender
            inlineCollapsed={isPhone ? false : isCollapsed}
            items={antdMenuItems}
            onClick={onClickMenu}
            onOpenChange={handleOpenChange}
          />
        </div>

        {isPhone && !isCollapsed && (
          <div
            className={`
              ${styles.cover}
              fixed
              w-full
              h-full
              bg-gray-500
              bg-opacity-10
              z-1001
            `}
            onClick={hiddenMenu}
          />
        )}
      </>
    ),
    [openKeys, selectedKeys, isCollapsed, isMaximize, isPhone, antdMenuItems],
  );
}

export default LayoutMenu;
