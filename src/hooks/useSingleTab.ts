import { useTranslation } from 'react-i18next';
import { getMenuName, getOpenMenuByRouter } from '@/menus/utils/helper';
import { ADD_TITLE, EDIT_TITLE } from '@/utils/config';
import { setTitle } from '@/utils/helper';
import { useCommonStore } from './useCommonStore';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useMenuStore } from '@/stores';
interface Props {
  fatherPath: string;
  zhTitle: string;
  enTitle: string;
  name?: string;
}

export function useSingleTab(props: Props) {
  const { fatherPath, zhTitle, enTitle, name } = props;
  const { t, i18n } = useTranslation();
  const { search } = useLocation();
  const { setOpenKeys, setSelectedKeys } = useMenuStore((state) => state);
  const { isPhone, isCollapsed, menuList } = useCommonStore();


  // 处理默认展开
  useEffect(() => {
    const title = handleGetTitle();
    setTitle(t, title);
    const newOpenKey = getOpenMenuByRouter(fatherPath);
    const fatherPathArray = new Array(fatherPath)
    if (!isPhone && !isCollapsed) {
      setOpenKeys(newOpenKey);
      setSelectedKeys(fatherPathArray);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * 添加标签
   * @param path - 路径
   */

  /** 获取路由对应名称 */
  const getNameByRoute = (): string => {
    const route = search?.substring(1, search.length);
    const list = route?.split('&');

    for (let i = 0; i < list?.length; i++) {
      const item = list[i];
      const arr = item?.split('=');
      const key = arr?.[0];
      const value = arr?.[1];
      if (key === name) {
        return value;
      }
    }

    return '';
  };

  /** 设置标题 */
  const handleGetTitle = () => {
    let result = '',
      newUpdateTitle = '',
      newCreateTitle = '';
    const routeName = getNameByRoute();
    const title = i18n.language === 'zh' ? zhTitle : enTitle;

    if (!title) {
      const menuName = getMenuName(menuList, fatherPath);
      newCreateTitle = `${title || ADD_TITLE(t)}${menuName}`;
      newUpdateTitle = `${EDIT_TITLE(t, routeName, menuName)}`;
    } else {
      const label = routeName ? `(${routeName})` : '';
      newCreateTitle = `${title || ADD_TITLE(t)}${label}`;
      newUpdateTitle = `${title}${label}`;
    }
    result = routeName ? newUpdateTitle : newCreateTitle;
    return result;
  };

  return [];
}
