import type { TabsProps } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMenuByKey } from '@/menus/utils/helper';
import { message, Tabs, Dropdown } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAliveController } from 'react-activation';
import { useDropdownMenu } from '../hooks/useDropdownMenu';
import { useCommonStore } from '@/hooks/useCommonStore';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { getTabTitle } from '../utils/helper';
import { setTitle } from '@/utils/helper';
import styles from '../index.module.less';
import TabRefresh from './TabRefresh';
import TabMaximize from './TabMaximize';
import TabOptions from './TabOptions';

function LayoutTabs() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const uri = pathname + search;
  const { refresh, dropScope } = useAliveController();
  const [messageApi, contextHolder] = message.useMessage();
  const [time, setTime] = useState<null | NodeJS.Timeout>(null);
  const [isChangeLang, setChangeLang] = useState(false); // 是否切换语言
  const [refreshTime, seRefreshTime] = useState<null | NodeJS.Timeout>(null);
  const setRefresh = usePublicStore((state) => state.setRefresh);
  const {
    tabs,
    isCloseTabsLock,
    activeKey, // 选中的标签值
    setActiveKey,
    addTabs,
    closeTabs,
    setNav,
    toggleCloseTabsLock,
    switchTabsLang,
  } = useTabsStore(useShallow((state) => state));

  // 获取当前语言
  const currentLanguage = i18n.language;

  const { permissions, isMaximize, menuList } = useCommonStore();

  /**
   * 添加标签
   * @param path - 路径
   */
  const handleAddTab = useCallback(
    (path = uri) => {
      // 1. 前置条件检查：确保有权限和菜单数据，并且路径不是根路径
      if (permissions.length === 0 || menuList.length === 0 || path === '/') {
        return;
      }

      // 2. 【核心修改】直接在【原始的、扁平的】menuList 数组上使用 .find() 方法
      //    根据传入的路径(path)来查找匹配的菜单项
      const foundMenuItem = menuList.find((menu) => menu.route_path === path);

      // 3. 根据查找结果更新 Tabs 状态
      if (foundMenuItem) {
        // 如果找到了匹配的菜单项
        const key = foundMenuItem.route_path;
        const label = foundMenuItem.label;

        // 验证：只有当 key 和 label 都存在时才添加标签
        if (key && label && key !== '/') {
          // 添加标签到 tabs 数组
          addTabs({
            key,
            label,
            labelZh: label,
            labelEn: label,
            closable: true,
            nav: [],
          });

          // 设置激活的标签
          setActiveKey(key);
          setChangeLang(true);
        } else {
          console.warn(`标签数据无效: key=${key}, label=${label}`);
        }
      } else {
        setActiveKey(path);
        console.warn(`在菜单列表中未找到路径: ${path}，可能是一个非菜单页面。`);
      }
    },
    [uri, permissions, menuList, setActiveKey, setNav, addTabs, setChangeLang, currentLanguage],
  );

  useEffect(() => {
    handleAddTab();
  }, [permissions, menuList]);

  useEffect(() => {
    switchTabsLang(currentLanguage);
  }, [currentLanguage]);

  useEffect(() => {
    if (isChangeLang) {
      switchTabsLang(currentLanguage);
      setChangeLang(false);
    }
  }, [isChangeLang]);

  useEffect(() => {
    handleSetTitle();

    return () => {
      if (time) {
        clearTimeout(time);
        setTime(null);
      }

      if (refreshTime) {
        clearTimeout(refreshTime);
        seRefreshTime(null);
      }
    };
  }, []);

  useEffect(() => {
    // 当选中贴标签不等于当前路由则跳转
    if (activeKey !== uri) {
      const key = isCloseTabsLock ? activeKey : uri;
      handleSetTitle();

      // 如果是关闭标签则直接跳转
      if (isCloseTabsLock) {
        navigate(key);
        toggleCloseTabsLock(false);
        handleUpdateBreadcrumb(key);
      } else {
        handleAddTab(key);
      }
    }
  }, [activeKey, uri]);

  /**
   * 设置浏览器标签
   * @param list - 菜单列表
   * @param path - 路径
   */
  const handleSetTitle = useCallback(() => {
    const path = `${pathname}${search || ''}`;
    const title = getTabTitle(tabs, path);
    if (title) setTitle(t, title);
  }, [pathname]);

  /**
   * 处理更改
   * @param key - 唯一值
   */
  const onChange = (key: string) => {
    navigate(key);
  };

  /**
   * 更新面包屑
   * @param key - 菜单
   */
  const handleUpdateBreadcrumb = (key: string) => {
    if (pathname !== key) {
      const menuByKeyProps = {
        menus: menuList,
        permissions,
        key,
      };
    }
  };

  /**
   * 删除标签
   * @param targetKey - 目标key值
   */
  const remove = (targetKey: string) => {
    closeTabs(targetKey, dropScope);
  };

  /**
   * 处理编辑
   * @param targetKey - 目标key值
   * @param action - 动作
   */
  const onEdit: TabsProps['onEdit'] = (targetKey, action) => {
    if (action === 'remove') {
      remove(targetKey as string);
    }
  };

  /**
   * 点击重新加载
   * @param key - 点击值
   */
  const onClickRefresh = useCallback(
    (key = activeKey) => {
      // 如果key不是字符串格式则退出
      if (typeof key !== 'string') return;

      // 定时器没有执行时运行
      if (!time) {
        setRefresh(true);
        refresh(key);

        setTime(
          setTimeout(() => {
            messageApi.success({
              content: t('public.refreshSuccessfully'),
              key: 'refresh',
            });
            setRefresh(false);
            setTime(null);
          }, 100),
        );

        seRefreshTime(
          setTimeout(() => {
            seRefreshTime(null);
          }, 1000),
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [activeKey, time],
  );

  // 渲染重新加载
  const RefreshRender = useMemo(() => {
    return <TabRefresh isRefresh={!!refreshTime} onClick={onClickRefresh} />;
  }, [refreshTime, onClickRefresh]);

  // 渲染标签操作
  const TabOptionsRender = useMemo(() => {
    return <TabOptions activeKey={activeKey} handleRefresh={onClickRefresh} />;
  }, [activeKey, onClickRefresh]);

  // 渲染最大化操作
  const TabMaximizeRender = useMemo(() => {
    return <TabMaximize />;
  }, []);

  // 标签栏功能
  const tabOptions = [
    { element: RefreshRender },
    { element: TabOptionsRender },
    { element: TabMaximizeRender },
  ];

  // 下拉菜单
  const dropdownMenuParams = { activeKey, handleRefresh: onClickRefresh };
  const [items, onClick] = useDropdownMenu(dropdownMenuParams);

  /** 二次封装标签 */
  const renderTabBar: TabsProps['renderTabBar'] = (tabBarProps, DefaultTabBar) => (
    <DefaultTabBar {...tabBarProps}>
      {(node) => (
        <Dropdown
          key={node.key}
          menu={{
            items: items(node.key as string),
            onClick: (e) => onClick(e.key, node.key as string),
          }}
          trigger={['contextMenu']}
        >
          <div className="mr-1px">{node}</div>
        </Dropdown>
      )}
    </DefaultTabBar>
  );

  return (
    <div
      className={`
      w-[calc(100%-5px)]
      flex
      items-end
      justify-between
      mx-3
      transition-all
      ${isMaximize ? styles['con-maximize'] : ''}
    `}
    >
      {contextHolder}
      {tabs.length > 0 ? (
        <Tabs
          hideAdd
          className={`w-[calc(100%-110px)] h-30px py-0 ${styles['layout-tabs']}`}
          items={[...tabs]}
          onChange={onChange}
          activeKey={activeKey}
          type="editable-card"
          onEdit={onEdit}
          renderTabBar={renderTabBar}
        />
      ) : (
        <span></span>
      )}

      <div className="flex">
        {tabOptions?.map((item, index) => (
          <div
            key={index}
            className={`
                left-divide-tab
                change
                divide-solid
                w-36px
                h-36px
                hover:opacity-70
                flex
                place-content-center
                items-center
              `}
          >
            {item.element}
          </div>
        ))}
      </div>
    </div>
  );
}

export default LayoutTabs;
