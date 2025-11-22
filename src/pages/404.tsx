import { getFirstMenu, getMenuByKey } from '@/menus/utils/helper';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCommonStore } from '@/hooks/useCommonStore';
import { useTabsStore } from '@/stores';
import { Button } from 'antd';
import styles from './all.module.less';

function NotFound() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { menuList } = useCommonStore();
  const { addTabs, setActiveKey } = useTabsStore();

  /** 跳转首页 */
  const goIndex = () => {
    const firstMenu = getFirstMenu(menuList) as string;
    navigate(firstMenu);
    const menuItem = getMenuByKey(menuList, firstMenu);
    if (menuItem) {
      setActiveKey(firstMenu);
      // 转换 MenuItem 为 TabsData 格式
      addTabs({
        key: firstMenu,
        label: menuItem.label || '',
        labelZh: menuItem.label || '',
        labelEn: menuItem.label || '',
        nav: [],
      });
    }
  };

  return (
    <div className="absolute left-50% top-50% -translate-x-1/2 -translate-y-1/2 text-center">
      <h1 className={`${styles.animation} w-full text-6rem font-bold`}>404</h1>
      <p className="w-full text-20px font-bold mt-15px">{t('public.notFindMessage')}</p>
      <Button className="mt-25px margin-auto" onClick={goIndex}>
        {t('public.returnHome')}
      </Button>
    </div>
  );
}

export default NotFound;
