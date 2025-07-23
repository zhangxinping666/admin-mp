import type { MenuProps } from 'antd';
import type { SideMenu } from '#/public';

type MenuItem = Required<MenuProps>['items'][number];
import { useCallback, useEffect, useMemo, useState, startTransition } from 'react';
import { Menu } from 'antd';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useCommonStore } from '@/hooks/useCommonStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMenuStore } from '@/stores';
import { getFirstMenu, getOpenMenuByRouter, splitPath, filterMenus } from '@/menus/utils/helper';
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
  /**
   * 将SideMenu转换为antd MenuItem格式
   * @param menus - SideMenu数组
   */
  const convertToAntdMenuItems = useCallback((menus: SideMenu[]): MenuItem[] => {
    return menus.map((menu) => {
      const menuItem: MenuItem = {
        key: String(menu.key), // 确保key是字符串类型
        label: menu.label,
        icon: menu.icon,
      };

      // 如果有子菜单，递归转换
      if (menu.children && menu.children.length > 0) {
        (menuItem as any).children = convertToAntdMenuItems(menu.children);
      }

      return menuItem;
    });
  }, []);

  // 处理菜单数据
  useEffect(() => {
    if (menuList.length > 0 && permissions.length > 0) {
      // 先根据权限过滤菜单
      const filteredMenus = filterMenus(menuList, permissions);
      console.log(filteredMenus);
      // 然后处理菜单图标
      const menuListWithIcons = processMenuIcons(filteredMenus);
      // 构建树形结构
      const menuTree = buildMenuTree(menuListWithIcons);
      console.log(menuTree);
      // 最后转换为antd菜单格式
      const antdItems = convertToAntdMenuItems(menuTree);
      setAntdMenuItems(antdItems);
      console.log(111111111111);
    } else {
      setAntdMenuItems([]);
    }
  }, [menuList, permissions, pathname, convertToAntdMenuItems]);

  useEffect(() => {
    const currentPath = pathname;
    // 递归函数，在menuList中查找与当前路径匹配的菜单项
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
      setSelectedKeys([String(menuItem.key)]);
    }

    // 智能设置展开的菜单项：只在必要时更新openKeys
    const newOpenKeys = getOpenMenuByRouter(currentPath);

    // 检查当前路径是否需要展开新的菜单项
    const needsNewOpenKeys = newOpenKeys.some((key) => !openKeys.includes(key));

    if (needsNewOpenKeys) {
      // 合并现有的展开状态和新需要展开的菜单项
      const mergedOpenKeys = [...new Set([...openKeys, ...newOpenKeys])];
      setOpenKeys(mergedOpenKeys);
    }
    console.log(pathname);
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
  // 假设 finalMenuItems 是您传递给 <Menu> items 属性的那个【树形数组】

  const onClickMenu: MenuProps['onClick'] = (e) => {
    const menuItem = getMenuByKey(menuList, e.key);
    console.log('点击的菜单路径:', menuItem?.route_path); // 添加这行

    if (!menuItem || !menuItem.route_path) {
      console.warn('未找到匹配的菜单项或该项无 route_path:', e.key);
      return;
    }

    if (menuItem.route_path === pathname) {
      return;
    }

    // 在跳转前，保存当前的展开状态并计算新的展开状态
    const targetPath = menuItem.route_path;
    const newOpenKeys = getOpenMenuByRouter(targetPath);

    // 合并当前展开的菜单和新路径需要展开的菜单
    const mergedOpenKeys = [...new Set([...openKeys, ...newOpenKeys])];

    goPath(targetPath);
    console.log('targetPath' + targetPath);
    // 点击菜单时设置选中的key，确保类型一致
    setSelectedKeys([String(e.key)]);
    // 保持父级菜单展开状态
    setOpenKeys(mergedOpenKeys);

    if (isPhone) {
      hiddenMenu();
    }
  };

  const handleOpenChange: MenuProps['onOpenChange'] = (keys) => {
    // 用户手动控制菜单展开/收起时，直接更新状态
    // 这样可以覆盖自动展开逻辑，给用户完全的控制权
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
