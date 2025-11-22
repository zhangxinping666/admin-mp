import { useState, useRef, useCallback, Key } from 'react';
import { type FormInstance } from 'antd';
import { message } from '@manpao/message';
import type { BaseFormData } from '#/form';
import { INIT_PAGINATION } from '@/utils/config';

interface UseCRUDOptions<T> {
  initCreate: Partial<T>;
  fetchApi?: (params: any) => Promise<any>;
  createApi?: (data: any) => Promise<any>;
  updateApi?: (params: any) => Promise<any>;
  deleteApi?: (id: Key | Key[]) => Promise<any>;
  // 【新增】历史审核记录API
  fetchHistoryApi?: (id: number) => Promise<any>;
  pagination?: boolean;
  isApplication?: boolean;
  handleFormValue?: (value: any) => any;
  // 【新增】格式化历史审核记录数据
  formatHistoryData?: (data: any) => any;
}

export const useCRUD = <T extends { id: number }>(options: UseCRUDOptions<T>) => {
  const {
    initCreate,
    fetchApi,
    createApi,
    updateApi,
    deleteApi,
    handleFormValue,
    fetchHistoryApi,
    formatHistoryData,
  } = options;

  // 表单引用
  const createFormRef = useRef<FormInstance>(null);
  // 使用全局message，无需contextHolder
  const messageApi = message;

  // 状态管理
  const [isFetch, setFetch] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isCreateLoading, setCreateLoading] = useState(false);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('新增');
  const [createId, setCreateId] = useState(-1);
  const [createData, setCreateData] = useState<Partial<T>>(initCreate);
  const [searchData, setSearchData] = useState<BaseFormData>({});
  const { pagination = true } = options; // 设置默认值为true
  // 分页状态
  const [page, setPage] = useState(INIT_PAGINATION.page);
  const [pageSize, setPageSize] = useState(INIT_PAGINATION.pageSize);
  const [total, setTotal] = useState(0);
  const [tableData, setTableData] = useState<T[]>([]);
  const [isDetailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<T>({} as T);

  const [isHistoryOpen, setHistoryOpen] = useState(false);
  const [historyId, setHistoryId] = useState(-1);
  const [historyData, setHistoryData] = useState<Record<string, any>[]>([]);
  const getNextId = useCallback(() => {
    if (tableData.length === 0) return 1;
    const maxId = Math.max(...tableData.map((item) => item.id));
    return maxId + 1;
  }, [tableData]);

  // 分页处理
  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    setPageSize(newPageSize);
    setFetch(true);
  };

  // 搜索处理
  const handleSearch = (values: BaseFormData) => {
    setPage(1);
    setSearchData(values);
    setFetch(true);
  };

  // 新增处理
  const handleCreate = (title: string = '新增') => {
    setCreateTitle(title);
    setCreateId(-1);
    setCreateData(initCreate);
    setCreateOpen(true);
  };

  const handleEdit = (
    title: string,
    record: T,
    // 【新增】第三个参数：一个可选的回调函数
    onOpen?: (record: T) => void,
  ) => {
    if (!record || record.id === undefined) {
      console.error('handleEdit: record is undefined or missing id property');
      messageApi.error({ content: '编辑失败：数据异常', duration: 3 });
      return;
    }
    const processedRecord =
      Object.entries(record).reduce((acc, [key,
        value]) => {
        return {
          ...acc,
          [key]: typeof value === 'boolean' ? (value
            ? 1 : 0) : value
        };
      }, {} as Partial<T>);

    setCreateTitle(title);
    setCreateId(record.id);
    if (handleFormValue) {
      setCreateData(handleFormValue(processedRecord));
    } else {
      setCreateData(processedRecord);
    }
    setCreateOpen(true);

    // 【新增】在设置完所有状态后，如果传入了回调函数，就执行它
    if (onOpen) {
      onOpen(record);
    }
  };
  // 【新增】打开审批详情
  const handleDetail = async (record: any) => {
    setLoading(true);
    setDetailOpen(true);
    setDetailData(record);
    setLoading(false);
  };
  // 【新增】打开历史审核记录
  const handleHistory = async (id: number) => {
    if (!fetchHistoryApi) {
      console.warn('[CRUD] 未提供 fetchHistoryApi，无法查看历史审核记录。');
      messageApi.error({ content: '无法查看历史审核记录：未配置API', duration: 3 });
      return;
    }

    setLoading(true);
    setHistoryId(id as number);
    const result = await fetchHistoryApi(id);

    // 【新增】格式化历史数据
    if (formatHistoryData) {
      setHistoryData(formatHistoryData(result.data?.list || result.data || []));
    } else {
      setHistoryData(result.data?.list || result.data || []);
    }

    setHistoryOpen(true);
    setLoading(false);
  };

  // 在 useCRUD.ts 文件中

  // 删除处理
  const handleDelete = async (id: Key[]) => {
    // 确保 deleteApi 存在
    if (deleteApi) {
      // 1. 调用后端的删除接口
      await deleteApi(id);
      // 2. 提示用户操作成功
      messageApi.success({ content: '删除成功', duration: 3 });
      // 3. 【核心改动 1】检查并处理分页，提升用户体验
      if (tableData.length === 1 && page > 1) {
        setPage(page - 1);
      }
      // 4. 【核心改动 2】触发列表重新获取
      setFetch(true);
    }
  };
  // 在 useCRUD.ts 文件中
  const handleModalSubmit = async (values: BaseFormData) => {
    setCreateLoading(true);
    const isEditing = createId != -1;

    // --- 辅助函数：处理 API 响应和错误 ---
    const handleApiResponse = (response: any, successMessage: string) => {
      // ... (保持 handleApiResponse 逻辑不变，它已经处理了 code != 2000 的情况)
      if (response && response.code === 2000) {
        messageApi.success(successMessage);
        return true;
      } else {
        const errorMessage = response?.message || '操作失败，请重试。';
        messageApi.error(errorMessage);
        return false;
      }
    };

    let operationSuccess = false;

    try {
      if (isEditing) {
        // --- 编辑逻辑 ---
        if (!updateApi) {
          messageApi.error('系统配置错误：未提供编辑接口 (updateApi)。');
          return; // 直接返回
        }

        const idToPass = options.isApplication && !Array.isArray(createId) ? [createId] : createId;
        const res = await updateApi({ id: idToPass, ...values });

        operationSuccess = handleApiResponse(res, '编辑成功');
        if (operationSuccess) {
          setFetch(true);
        }

      } else {
        // --- 新增逻辑 ---
        if (!createApi) {
          // 🚀 修正点 2: 使用 messageApi.error 提醒用户
          messageApi.error('系统配置警告：未提供新增接口 (createApi)，执行本地模拟。');

          // 执行本地模拟新增
          const newId = getNextId();
          const newItem = { ...values, id: newId } as T;
          setTableData((prev) => [...prev, newItem]);
          setTotal((prev) => prev + 1);

          operationSuccess = true; // 本地操作视为成功
        } else {
          const res = await createApi(values);
          operationSuccess = handleApiResponse(res, '新增成功');

          if (operationSuccess) {
            setPage(1);
            setFetch(true);
          }
        }
      }
    } catch (error) {
      // 捕获网络错误、JSON解析错误等 Promise 抛出的异常 (保持不变)
      console.error('API请求发生异常:', error);
      messageApi.error(`系统错误或网络中断：${(error as Error).message || '未知错误'}`);
      operationSuccess = false;

    } finally {
      if (operationSuccess) {
        setCreateOpen(false);
      }

      setCreateLoading(false); // 无论成功失败都关闭加载状态
    }
  };
  // 获取数据
  const fetchTableData = useCallback(
    async (mockData?: T[]) => {
      setLoading(true);
      if (fetchApi) {
        const params: any = { ...searchData };
        if (pagination) {
          // 根据选项决定是否添加分页参数
          params.page = page;
          params.page_size = pageSize;
        }
        const { data } = await fetchApi(params);
        setTableData(data.list || data.data || data || []);
        setTotal(data.total || 0);
      } else if (mockData) {
        // 使用模拟数据
        setTableData(mockData);
        setTotal(mockData.length);
      }
      setLoading(false);
      setFetch(false);
    },
    [fetchApi, searchData, pagination, page, pageSize, messageApi],
  );

  return {
    contextHolder: null,
    createFormRef,
    isFetch,
    setFetch,
    isLoading,
    isCreateLoading,
    isCreateOpen,
    setCreateOpen,
    isDetailOpen,
    setDetailOpen,
    detailData,
    isHistoryOpen,
    setHistoryOpen,
    historyId,
    historyData,
    createTitle,
    createId,
    createData,
    searchData,
    page,
    pageSize,
    total,
    tableData,
    setTableData,
    pagination,
    handlePageChange,
    handleSearch,
    handleCreate,
    handleEdit,
    handleDelete,
    handleDetail,
    handleHistory,
    handleModalSubmit,
    fetchTableData,
    getNextId,
  };
};
