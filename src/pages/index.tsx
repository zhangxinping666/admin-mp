import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirstMenu } from '@/menus/utils/helper';
import { useCommonStore } from '@/hooks/useCommonStore';

function Page() {
  const { permissions, menuList } = useCommonStore();
  const navigate = useNavigate();

  useEffect(() => {
    // 只有当菜单和权限都加载完成时才跳转
    if (menuList.length > 0 && permissions.length > 0) {
      const firstMenu = getFirstMenu(menuList);
      if (firstMenu && firstMenu !== '/') {
        navigate(firstMenu, { replace: true });
      }
    }
  }, [menuList, permissions, navigate]);
  return <div></div>;
}

export default Page;
