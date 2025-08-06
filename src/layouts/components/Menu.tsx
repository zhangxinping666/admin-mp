import type { MenuProps } from 'antd';
import type { SideMenu } from '#/public';

type MenuItem = Required<MenuProps>['items'][number];
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Menu } from 'antd';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useCommonStore } from '@/hooks/useCommonStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMenuStore } from '@/stores';
import { getFirstMenu, getOpenMenuByRouter, filterMenusByPermissions } from '@/menus/utils/helper';
import { buildMenuTree } from '@/menus/utils/menuTree';
import styles from '../index.module.less';
import Logo from '@/assets/images/logo.png';
import { getMenuByKey } from '@/menus/utils/helper';

function LayoutMenu() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [antdMenuItems, setAntdMenuItems] = useState<MenuItem[]>([]);

  const { isMaximize, isCollapsed, isPhone, openKeys, selectedKeys, permissions, menuList } =
    useCommonStore();
  const { setOpenKeys } = useMenuStore((state) => state);
  const { setSelectedKeys } = useMenuStore((state) => state);
  const { toggleCollapsed } = useMenuStore((state) => state);

  // 处理菜单数据
  useEffect(() => {
    if (menuList.length > 0) {
      const filteredMenus = filterMenusByPermissions(menuList, permissions);
      const menuListWithIcons = processMenuIcons(filteredMenus);
      const treeMenus = buildMenuTree(menuListWithIcons);
      const convertToAntdItems = (menus: SideMenu[]): MenuItem[] => {
        return menus.map((menu) => {
          const menuKey = (menu as any).id || (menu as any).key;
          const item: MenuItem = {
            key: String(menuKey),
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

      const antdItems = convertToAntdItems(treeMenus);
      console.log(111);
      console.log(antdItems);
      setAntdMenuItems(antdItems);
    } else {
      setAntdMenuItems([]);
    }
  }, [menuList, permissions, pathname]);

  useEffect(() => {
    const currentPath = pathname;
    const findMenuByPath = (menus: SideMenu[], targetPath: string): SideMenu | null => {
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

  /**
   * 处理菜单图标
   * @param menus - 菜单数组
   */
  const processMenuIcons = useCallback((menus: SideMenu[]): SideMenu[] => {
    return menus.map((menu) => {
      const processedMenu = { ...menu };
      // 处理图标
      if (processedMenu.icon && typeof processedMenu.icon === 'string') {
        processedMenu.icon = <Icon icon={processedMenu.icon} />;
      }
      // 递归处理子菜单
      if (processedMenu.children?.length) {
        processedMenu.children = processMenuIcons(processedMenu.children);
      }
      return processedMenu;
    });
  }, []);

  /**
   * 处理跳转
   * @param path - 路径
   */
  const goPath = (path: string) => {
    navigate(path);
  };

  /**
   * 点击菜单
   * @param e - 菜单事件
   */

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

  /** 点击logo */
  const onClickLogo = () => {
    const firstMenu = getFirstMenu(menuList, permissions);
    goPath(firstMenu);
    if (isPhone) hiddenMenu();
  };

  /** 隐藏菜单 */
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
