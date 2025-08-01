import type { BaseFormData } from '#/form';
import type { PagePermission } from '#/public';
import type { OperationLogRecord } from '#/operation-log';
import { useCallback, useEffect, useState } from 'react';
import { message, Modal, Typography, Tabs } from 'antd';
import { useTranslation } from 'react-i18next';
import { searchList, tableColumns } from './model';
import { getOperationLogServe } from '@/servers/operation-log';
import { INIT_PAGINATION } from '@/utils/config';
import BaseContent from '@/components/Content/BaseContent';
import BaseCard from '@/components/Card/BaseCard';
import BaseSearch from '@/components/Search/BaseSearch';
import BaseTable from '@/components/Table/BaseTable';
import BasePagination from '@/components/Pagination/BasePagination';

const { Text } = Typography;
const { TabPane } = Tabs;

// 在文件顶部添加导入
import { BaseBtn } from '@/components/Buttons';

function Page() {
  const { t } = useTranslation();

  // 处理查看详情
  const handleViewDetail = (record: OperationLogRecord) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  // 将handleViewDetail函数传递给tableColumns
  const columns = tableColumns(t, handleViewDetail);
  const [isFetch, setFetch] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState<BaseFormData>({});
  const [pagination, setPagination] = useState(INIT_PAGINATION);
  const [tableData, setTableData] = useState<OperationLogRecord[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<OperationLogRecord | null>(null);

  // 权限 - 临时设置为true用于开发调试
  const pagePermission: PagePermission = {
    page: true,
    create: false, // 操作日志管理页面不需要新增功能
    update: false, // 操作日志管理页面不需要编辑功能
    delete: false, // 操作日志管理页面不需要删除功能
  };

  /** 获取表格数据 */
  const getPage = useCallback(async () => {
    try {
      setLoading(true);
      // 处理时间范围
      const params = { ...searchData };
      if (params.time_range && Array.isArray(params.time_range)) {
        const [startTime, endTime] = params.time_range;
        delete params.time_range;
        if (startTime) params.start_time = startTime;
        if (endTime) params.end_time = endTime;
      }

      const { page, pageSize } = pagination;
      const requestParams = {
        ...params,
        page,
        page_size: pageSize,
      };

      const res = await getOperationLogServe(requestParams);
      console.log(res);
      const { list, total, page: currentPage, pages } = res.data;
      setTableData(list || []);
      setPagination({
        ...pagination,
        page: currentPage,
        total,
        pages,
      });
    } catch (error) {
      console.error('获取操作日志失败', error);
      messageApi.error('获取操作日志失败');
    } finally {
      setFetch(false);
      setLoading(false);
    }
  }, [pagination, searchData, messageApi]);

  useEffect(() => {
    if (isFetch) getPage();
  }, [getPage, isFetch]);

  /**
   * 点击搜索
   * @param values - 表单返回数据
   */
  const onSearch = (values: BaseFormData) => {
    setPagination({ ...pagination, page: 1 });
    setSearchData(values);
    setLoading(true);
    setFetch(true);
  };

  // 首次进入自动加载接口数据
  useEffect(() => {
    if (pagePermission.page) {
      setFetch(true);
    }
  }, [pagePermission.page]);

  /**
   * 处理分页
   * @param page - 当前页数
   * @param pageSize - 每页条数
   */
  const onChangePagination = useCallback(
    (page: number, pageSize: number) => {
      setPagination({ ...pagination, page, pageSize });
      setLoading(true);
      setFetch(true);
    },
    [pagination],
  );
  // 关闭详情弹窗
  const handleCloseDetail = () => {
    setDetailVisible(false);
    setCurrentRecord(null);
  };

  // 格式化JSON字符串
  const formatJSON = (jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      return jsonString;
    }
  };

  // 绑定表格行点击事件
  useEffect(() => {
    const handleTableClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('view-detail')) {
        const recordId = target.getAttribute('data-record-id');
        if (recordId) {
          const record = tableData.find((item) => item.id === parseInt(recordId, 10));
          if (record) {
            handleViewDetail(record);
          }
        }
      }
    };

    document.addEventListener('click', handleTableClick);
    return () => {
      document.removeEventListener('click', handleTableClick);
    };
  }, [tableData]);

  return (
    <BaseContent isPermission={pagePermission.page}>
      {contextHolder}
      <BaseCard>
        <BaseSearch
          list={searchList(t)}
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
        />

        <BasePagination
          disabled={isLoading}
          current={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total || 0}
          onChange={onChangePagination}
          pageSizeOptions={['15', '20', '30']}
        />
      </BaseCard>

      {/* 详情弹窗 */}
      <Modal
        title={t('operationLog.detail')}
        open={detailVisible}
        onCancel={handleCloseDetail}
        footer={[
          <BaseBtn key="close" onClick={handleCloseDetail}>
            {t('operationLog.closeDetail')}
          </BaseBtn>,
        ]}
        width={800}
      >
        {currentRecord && (
          <Tabs defaultActiveKey="request">
            <TabPane tab={t('operationLog.requestDetail')} key="request">
              <div className="mb-4">
                <Text strong>{t('operationLog.requestMethod')}:</Text>
                <Text code>{currentRecord.request_method}</Text>
              </div>
              <div className="mb-4">
                <Text strong>{t('operationLog.requestUrl')}:</Text>
                <Text code>{currentRecord.request_url}</Text>
              </div>
              <div>
                <Text strong>{t('operationLog.requestParams')}:</Text>
                <pre className="bg-gray-50 p-4 rounded mt-2 overflow-auto max-h-60">
                  {formatJSON(currentRecord.request_params || '{}')}
                </pre>
              </div>
            </TabPane>
            <TabPane tab={t('operationLog.responseDetail')} key="response">
              <pre className="bg-gray-50 p-4 rounded mt-2 overflow-auto max-h-80">
                {formatJSON(currentRecord.response_data || '{}')}
              </pre>
            </TabPane>
          </Tabs>
        )}
      </Modal>
    </BaseContent>
  );
}

export default Page;
