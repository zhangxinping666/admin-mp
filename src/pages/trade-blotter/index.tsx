import type { BaseFormData } from '#/form';
import type { PagePermission } from '#/public';
import { useCallback, useEffect, useState } from 'react';
import { message, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { searchList, tableColumns, useLocationOptions } from './model';
import { getTradeBlotterListServe, getTradeBlotterExcelServe } from '@/servers/trade-blotter';
import { useCommonStore } from '@/hooks/useCommonStore';
import { INIT_PAGINATION } from '@/utils/config';
import BaseContent from '@/components/Content/BaseContent';
import BaseCard from '@/components/Card/BaseCard';
import BaseSearch from '@/components/Search/BaseSearch';
import BaseTable from '@/components/Table/BaseTable';
import BasePagination from '@/components/Pagination/BasePagination';
import { FileExcelOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { BaseBtn } from '@/components/Buttons';

function Page() {
  const { t } = useTranslation();
  const columns = tableColumns(t);
  const locationOptions = useLocationOptions(); // 在组件顶层调用hook
  const [isFetch, setFetch] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState<BaseFormData>({});
  const [page, setPage] = useState(INIT_PAGINATION.page);
  const [pageSize, setPageSize] = useState(INIT_PAGINATION.pageSize);
  const [total, setTotal] = useState(0);
  const [tableData, setTableData] = useState<FlowRecord[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const { permissions } = useCommonStore();

  // 权限前缀
  const permissionPrefix = '/trade-blotter';

  // 权限 - 临时设置为true用于开发调试
  const pagePermission: PagePermission = {
    page: true, // checkPermission(`${permissionPrefix}/index`, permissions),
    create: false, // 交易流水管理页面不需要新增功能
    update: false, // 交易流水管理页面不需要编辑功能
    delete: false, // 交易流水管理页面不需要删除功能
  };

  /** 获取表格数据 */
  const getPage = useCallback(async () => {
    const params = { ...searchData, page, page_size: pageSize };

    try {
      setLoading(true);
      const res = await getTradeBlotterListServe(params);
      const { data } = res;
      console.log(data);
      const { list, total } = data;
      setTotal(total || 0);
      setTableData(list || []);
    } finally {
      setFetch(false);
      setLoading(false);
    }
  }, [page, pageSize, searchData]);

  useEffect(() => {
    if (isFetch) getPage();
  }, [getPage, isFetch]);

  /**
   * 点击搜索
   * @param values - 表单返回数据
   */
  const onSearch = (values: BaseFormData) => {
    // 处理金额区间
    const searchValues = { ...values };
    if (searchValues.amount_range && Array.isArray(searchValues.amount_range)) {
      const [minAmount, maxAmount] = searchValues.amount_range;

      // 删除amount_range字段，改为使用min_amount和max_amount
      delete searchValues.amount_range;

      // 只有当值存在时才添加到搜索参数中
      if (minAmount !== null && minAmount !== undefined) {
        searchValues.min_amount = minAmount;
      }

      if (maxAmount !== null && maxAmount !== undefined) {
        searchValues.max_amount = maxAmount;
      }

      // 验证最小金额不大于最大金额
      if (minAmount !== null && maxAmount !== null && minAmount > maxAmount) {
        messageApi.warning('最小金额不能大于最大金额');
        return;
      }
    }

    // 处理创建时间区间
    if (searchValues.create_time_range && Array.isArray(searchValues.create_time_range)) {
      const [startTime, endTime] = searchValues.create_time_range;

      // 删除create_time_range字段，改为使用start_time和end_time
      delete searchValues.create_time_range;

      // 只有当值存在时才添加到搜索参数中
      if (startTime) {
        searchValues.start_time = startTime;
      }

      if (endTime) {
        searchValues.end_time = endTime;
      }
    }

    setPage(1);
    setSearchData(searchValues);
    setFetch(true);
  };

  // 首次进入自动加载接口数据
  useEffect(() => {
    if (pagePermission.page) getPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagePermission.page]);

  /**
   * 处理分页
   * @param page - 当前页数
   * @param pageSize - 每页条数
   */
  const onChangePagination = useCallback((page: number, pageSize: number) => {
    setPage(page);
    setPageSize(pageSize);
    setFetch(true);
  }, []);

  // 处理导出 Excel 逻辑
  const handleExportExcel = async () => {
    const params = { ...searchData };
    try {
      setLoading(true);
      console.log(searchData);
      console.log(params);
      const res = await getTradeBlotterExcelServe(params);
      console.log(res.data);
      // 创建一个 Blob 对象, type 指定 MIME 类型，让浏览器知道这是 Excel 文件
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '交易流水.xlsx';
      link.click();
      URL.revokeObjectURL(url);
      messageApi.success('导出成功');
      // 删除link
      document.body.removeChild(link);
    } catch (err) {
      messageApi.error('导出失败');
    } finally {
      setLoading(false);
    }
  };
  // 导出 Excel 按钮渲染
  const leftContentRender = (
    <div className="flex items-center">
      <BaseBtn isLoading={isLoading} onClick={handleExportExcel} icon={<FileExcelOutlined />}>
        {t('tradeBlotter.exportExcel')}
      </BaseBtn>
      <Tooltip title={t('tradeBlotter.exportExcelTip')}>
        <QuestionCircleOutlined className="ml-2 text-gray-400 cursor-pointer" />
      </Tooltip>
      <span className="ml-2 text-xs text-gray-400">{t('tradeBlotter.exportExcelTip')}</span>
    </div>
  );
  return (
    <BaseContent isPermission={pagePermission.page}>
      {contextHolder}
      <BaseCard>
        <BaseSearch
          list={searchList(t, locationOptions)}
          data={searchData}
          isLoading={isLoading}
          handleFinish={onSearch}
        />
      </BaseCard>

      <BaseCard className="mt-10px">
        <BaseTable
          isLoading={isLoading}
          isCreate={false}
          columns={columns}
          dataSource={tableData}
          getPage={getPage}
          leftContent={leftContentRender}
        />

        <BasePagination
          disabled={isLoading}
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={onChangePagination}
        />
      </BaseCard>
    </BaseContent>
  );
}

export default Page;
