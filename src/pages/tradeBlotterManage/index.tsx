import type { BaseFormData } from '#/form';
import type { PagePermission } from '#/public';
import { useCallback, useEffect, useState } from 'react';
import { message } from 'antd';
import { searchList, tableColumns, useLocationOptions } from './model';
import { getTradeBlotterListServe } from '@/servers/trade-blotter';
import { INIT_PAGINATION } from '@/utils/config';
import BaseContent from '@/components/Content/BaseContent';
import BaseCard from '@/components/Card/BaseCard';
import BaseSearch from '@/components/Search/BaseSearch';
import BaseTable from '@/components/Table/BaseTable';
import CursorPagination from '@/components/Pagination/CursorPagination';
import { ExportExcelButton } from './components';
import { useUserStore } from '@/stores';
import { checkPermission } from '@/utils/permissions';

function Page() {
  const columns = tableColumns();
  const locationOptions = useLocationOptions(); // 在组件顶层调用hook
  const { permissions } = useUserStore();

  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };
  const [isFetch, setFetch] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState<BaseFormData>({});
  const [pageSize, setPageSize] = useState(INIT_PAGINATION.pageSize);
  const [tableData, setTableData] = useState<FlowRecord[]>([]);
  const [messageApi, contextHolder] = message.useMessage();

  // 游标分页相关状态
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [nextCreatedAt, setNextCreatedAt] = useState<string | null>(null);
  const [prevCursor, setPrevCursor] = useState<number | null>(null);
  const [prevCreatedAt, setPrevCreatedAt] = useState<string | null>(null);
  const [direction, setDirection] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // 仅用于UI显示
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);

  // 权限 - 临时设置为true用于开发调试
  const pagePermission: PagePermission = {
    page: true,
    create: false,
    update: false,
    delete: false,
  };

  /** 获取表格数据 */
  const getPage = useCallback(async () => {
    const params: any = { ...searchData };

    if (!direction) {
      params.page_size = pageSize;
    }
    else {
      params.page_size = pageSize;
      if (direction === 'next' && nextCursor && nextCreatedAt) {
        params.cursor_id = nextCursor;
        params.cursor_created_at = nextCreatedAt;
        params.direction = 'next';
      } else if (direction === 'prev' && prevCursor && prevCreatedAt) {
        params.cursor_id = prevCursor;
        params.cursor_created_at = prevCreatedAt;
        params.direction = 'prev';
      } else {
        // 如果没有游标，则无法继续分页，显示提示
        messageApi.warning('无法加载更多数据');
        setFetch(false);
        setLoading(false);
        return;
      }
    }

    try {
      setLoading(true);
      const res = await getTradeBlotterListServe(params);
      const { data } = res;
      // 解构数据，确保字段存在
      const list = data.list || [];
      const next_cursor = data.next_cursor;
      const next_created_at = data.next_created_at;
      const prev_cursor = data.prev_cursor;
      const prev_created_at = data.prev_created_at;
      const has_next = data.has_next ?? !!next_cursor;
      const has_prev = data.has_prev ?? !!prev_cursor;

      // 更新游标信息
      setNextCursor(next_cursor || null);
      setNextCreatedAt(next_created_at || null);
      setPrevCursor(prev_cursor || null);
      setPrevCreatedAt(prev_created_at || null);
      setHasNext(has_next);
      setHasPrev(has_prev);
      setTableData(list);
    } finally {
      setFetch(false);
      setLoading(false);
    }
  }, [
    pageSize,
    searchData,
    direction,
    nextCursor,
    nextCreatedAt,
    prevCursor,
    prevCreatedAt,
    messageApi,
  ]);

  useEffect(() => {
    if (isFetch) getPage();
  }, [getPage, isFetch]);


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

    // 重置游标状态
    setNextCursor(null);
    setNextCreatedAt(null);
    setPrevCursor(null);
    setPrevCreatedAt(null);
    setDirection(null);
    setCurrentPage(1);
    setHasNext(false);
    setHasPrev(false);

    setSearchData(searchValues);
    setLoading(true); // 设置加载状态
    setFetch(true);
  };

  // 首次进入自动加载接口数据
  useEffect(() => {
    if (pagePermission.page) getPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagePermission.page]);

  /**
   * 处理分页
   * @param page - 当前页数（仅用于UI显示）
   * @param pageSize - 每页条数
   */
  const onChangePagination = useCallback(
    (page: number, newPageSize: number) => {
      // 如果页码大小改变，重置分页状态
      if (newPageSize !== pageSize) {
        setDirection(null);
        setNextCursor(null);
        setNextCreatedAt(null);
        setPrevCursor(null);
        setPrevCreatedAt(null);
        setHasNext(false);
        setHasPrev(false);
        setCurrentPage(1);
        setPageSize(newPageSize);
        setLoading(true); // 设置加载状态
        setFetch(true);
        return;
      }

      // 设置分页方向
      if (page > currentPage) {
        // 只能向后翻一页
        if (page !== currentPage + 1) {
          messageApi.warning('游标分页只能一页一页地向后翻页');
          return;
        }
        // 检查是否有下一页
        if (!hasNext) {
          messageApi.warning('已经是最后一页了');
          return;
        }
        setDirection('next');
        setLoading(true); // 设置加载状态
      } else if (page < currentPage) {
        // 只能向前翻一页
        if (page !== currentPage - 1) {
          messageApi.warning('游标分页只能一页一页地向前翻页');
          return;
        }
        // 检查是否有上一页
        if (!hasPrev) {
          messageApi.warning('已经是第一页了');
          return;
        }
        setDirection('prev');
        setLoading(true); // 设置加载状态
      } else {
        // 页码相同，不做处理
        return;
      }

      setCurrentPage(page);
      setPageSize(newPageSize);
      setFetch(true);
    },
    [currentPage, pageSize, hasNext, hasPrev, messageApi],
  );

  // 导出 Excel 按钮渲染
  const leftContentRender = (
    <ExportExcelButton
      searchData={searchData}
      isLoading={isLoading}
      hasExportPermission={hasPermission('mp:tradeblotter:export')}
    />
  );

  // 判断是否可以加载下一页或上一页
  const canNext = hasNext;
  const canPrev = hasPrev;

  return (
    <BaseContent isPermission={pagePermission.page}>
      {contextHolder}
      <BaseCard>
        <BaseSearch
          list={searchList(locationOptions)}
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

        <CursorPagination
          disabled={isLoading}
          current={currentPage}
          pageSize={pageSize}
          canNext={canNext}
          canPrev={canPrev}
          onChange={onChangePagination}
          pageSizeOptions={['15', '20', '30']}
        />
      </BaseCard>
    </BaseContent>
  );
}

export default Page;
