import React from 'react';
import { Breadcrumb, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMenuStore } from '@/stores';
import type { MenuItem } from '@/pages/login/model';

export interface TableNavigationProps {
  title?: string;
  customActions?: React.ReactNode;
  breadcrumbItems?: Array<{
    title: string;
    path?: string;
    icon?: React.ReactNode;
  }>;
}

const TableNavigation: React.FC<TableNavigationProps> = ({
  title,
  customActions,
  breadcrumbItems,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuList = useMenuStore((state) => state.menuList);

  /**
   * 从菜单数据中递归查找路由对应的标题
   */
  const findMenuTitle = (routePath: string, menus: MenuItem[]): string | null => {
    for (const menu of menus) {
      // 匹配当前菜单项
      if (menu.route_path === routePath) {
        return menu.label as string;
      }
      // 递归查找子菜单
      if (menu.children && menu.children.length > 0) {
        const childTitle = findMenuTitle(routePath, menu.children);
        if (childTitle) return childTitle;
      }
    }
    return null;
  };

  // 生成面包屑导航
  const generateBreadcrumbItems = () => {
    if (breadcrumbItems) {
      return breadcrumbItems.map((item, index) => ({
        key: index,
        title: (
          <span
            className={item.path ? 'cursor-pointer hover:text-blue-500' : ''}
            onClick={() => item.path && navigate(item.path)}
          >
            {item.icon && <span className="mr-1">{item.icon}</span>}
            {item.title}
          </span>
        ),
      }));
    }

    // 自动生成面包屑
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items: any[] = [];

    // 根据路径生成面包屑
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;

      // 动态从菜单数据中查找标题（替代硬编码的 switch-case）
      const menuTitle = findMenuTitle(currentPath, menuList);
      const segmentTitle = menuTitle || title || segment;

      items.push({
        key: currentPath,
        title: isLast ? (
          <span>{segmentTitle}</span>
        ) : (
          <span
            className="cursor-pointer hover:text-blue-500"
            onClick={() => navigate(currentPath)}
          >
            {segmentTitle}
          </span>
        ),
      });
    });

    return items;
  };

  return (
    <div className="flex justify-between items-center mb--2  px-2  rounded-lg text-base">
      <div className="flex items-center space-x-2">
        <Breadcrumb
          style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 6px 8px' }}
          className="text-base"
          items={generateBreadcrumbItems()}
        />
      </div>

      <div className="flex items-center space-x-1">
        {customActions}
      </div>
    </div>
  );
};

export default TableNavigation;
