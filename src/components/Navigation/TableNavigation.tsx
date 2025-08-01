import React from 'react';
import { Breadcrumb, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

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

      // 根据路径映射生成标题
      let segmentTitle = segment;
      switch (segment) {
        case 'permissionManage':
          segmentTitle = '权限管理';
          break;
        case 'menuManage':
          segmentTitle = '菜单管理';
          break;
        case 'roleManage':
          segmentTitle = '角色管理';
          break;
        case 'apiManage':
          segmentTitle = 'API管理';
          break;
        case 'merchantManage':
          segmentTitle = '商户管理';
          break;
        case 'merchantSort':
          segmentTitle = '商户分类';
          break;
        case 'merchantApplication':
          segmentTitle = '商户申请';
          break;
        case 'content':
          segmentTitle = '内容管理';
          break;
        case 'article':
          segmentTitle = '文章管理';
          break;
        case 'dictionaryManage':
          segmentTitle = '字典管理';
          break;
        case 'tradeBlotterManage':
          segmentTitle = '交易流水管理';
          break;
        case 'schoolsManage':
          segmentTitle = '学校管理';
          break;
        case 'usersManage':
          segmentTitle = '用户管理';
          break;
        case 'balanceManage':
          segmentTitle = '余额管理';
          break;
        case 'buildsManage':
          segmentTitle = '建筑管理';
          break;
        case 'certManage':
          segmentTitle = '认证管理';
          break;
        case 'citysManage':
          segmentTitle = '城市管理';
          break;
        case 'colonelManage':
          segmentTitle = '团长管理';
          break;
        default:
          segmentTitle = title || segment;
      }

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
        {/* 面包屑导航 */}
        <Breadcrumb
          style={{ fontSize: '20px', fontWeight: 'bold' }}
          className="text-base"
          items={generateBreadcrumbItems()}
        />
      </div>

      <div className="flex items-center space-x-1">
        {/* 自定义操作按钮 */}
        {customActions}

        {/* 返回按钮 */}
        <Button onClick={() => window.history.back()} type="default" size="large">
          返回
        </Button>
      </div>
    </div>
  );
};

export default TableNavigation;
