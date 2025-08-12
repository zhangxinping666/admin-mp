import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useCommonStore } from '@/hooks/useCommonStore';
import BaseContent from '../../components/Content/BaseContent';
import BaseCard from '../../components/Card/BaseCard';
import BaseSearch from '../../components/Search/BaseSearch';
import type { BaseFormData } from '#/form';
import { searchList } from './model';
// import { getDataTrends } from '@/servers/dashboard';
import Bar from './components/Bar';
import Line from './components/Line';
import Block from './components/Block';

// 初始化搜索
const initSearch = {
  pay_date: ['2022-10-19', '2022-10-29'],
};

function Dashboard() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [isLoading, setLoading] = useState(false);
  const { isPhone, menuPermissions } = useCommonStore();

  // 检查当前路由是否有权限
  const isPermission = menuPermissions.includes(pathname);

  /**
   * 搜索提交
   * @param values - 表单返回数据
   */
  const handleSearch = useCallback(async (values: BaseFormData) => {
    // 数据转换
    values.all_pay = values.all_pay ? 1 : undefined;

    // const query = { ...values };
    try {
      setLoading(true);
      // await getDataTrends(query);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleSearch(initSearch);
  }, [handleSearch]);

  useEffect(() => {}, [isPermission]);

  return (
    <BaseContent isPermission={isPermission}>
      <BaseCard>
        <BaseSearch
          list={searchList(t)}
          data={initSearch}
          initialValues={initSearch}
          isLoading={isLoading}
          handleFinish={handleSearch}
        />
      </BaseCard>

      <BaseCard className="mt-10px">
        <div className="pt-10px">
          <Block />
        </div>

        <div className="flex flex-wrap justify-between w-full">
          <div className={`mb-10px ${isPhone ? 'w-full' : 'w-49.5%'}`}>
            <Line />
          </div>
          <div className={`mb-10px ${isPhone ? 'w-full' : 'w-49.5%'}`}>
            <Bar />
          </div>
        </div>
      </BaseCard>
    </BaseContent>
  );
}

export default Dashboard;
