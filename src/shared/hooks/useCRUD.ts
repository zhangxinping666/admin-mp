import { useState, useRef, useCallback, Key } from 'react';
import { message, type FormInstance } from 'antd';
import type { BaseFormData } from '#/form';
import { INIT_PAGINATION } from '@/utils/config';

interface UseCRUDOptions<T> {
  initCreate: Partial<T>;
  fetchApi?: (params: any) => Promise<any>;
  createApi?: (data: any) => Promise<any>;
  updateApi?: (id: Key, data: any) => Promise<any>;
  deleteApi?: (id: Key | Key[]) => Promise<any>;
  pagination?: boolean;
}

export const useCRUD = <T extends { id: number }>(options: UseCRUDOptions<T>) => {
  const { initCreate, fetchApi, createApi, updateApi, deleteApi } = options;

  // 表单引用
  const createFormRef = useRef<FormInstance>(null);
  const [messageApi, contextHolder] = message.useMessage();

  // 状态管理
  const [isFetch, setFetch] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isCreateLoading, setCreateLoading] = useState(false);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('新增');
  const [createId, setCreateId] = useState(0);
  const [createData, setCreateData] = useState<Partial<T>>(initCreate);
  const [searchData, setSearchData] = useState<BaseFormData>({});
  const { pagination = true } = options; // 设置默认值为true
  // 分页状态
  const [page, setPage] = useState(INIT_PAGINATION.page);
  const [pageSize, setPageSize] = useState(INIT_PAGINATION.pageSize);
  const [total, setTotal] = useState(0);
  const [tableData, setTableData] = useState<T[]>([]);

  // 获取下一个可用的 ID
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
    console.log('搜索参数:', values);
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
    setCreateTitle(title);
    setCreateId(record.id);
    setCreateData(record);
    setCreateOpen(true);

    // 【新增】在设置完所有状态后，如果传入了回调函数，就执行它
    if (onOpen) {
      onOpen(record);
    }
  };

  // 在 useCRUD.ts 文件中

  // 删除处理
  const handleDelete = async (id: Key[]) => {
    try {
      // 确保 deleteApi 存在
      if (deleteApi) {
        // 1. 调用后端的删除接口
        await deleteApi(id);
        // 2. 提示用户操作成功
        messageApi.success('删除成功');
        // 3. 【核心改动 1】检查并处理分页，提升用户体验
        if (tableData.length === 1 && page > 1) {
          setPage(page - 1);
        }
        // 4. 【核心改动 2】触发列表重新获取
        setFetch(true);
      }
    } catch (error) {
      // 5. 如果接口调用失败，提示错误
      messageApi.error('删除失败');
      console.error('[CRUD] 删除操作失败:', error);
    }
  };
  // 在 useCRUD.ts 文件中

  const handleModalSubmit = async (values: BaseFormData) => {
    setCreateLoading(true);
    const isEditing = createId && createId > 0;
    const operationType = isEditing ? '编辑' : '新增';

    console.log(`[CRUD] ${operationType}操作开始`, {
      data: values,
      id: isEditing ? createId : undefined,
      timestamp: new Date().toISOString(),
    });
    console.log('createId', createId);
    try {
      if (isEditing) {
        // --- 编辑逻辑 ---
        if (!updateApi) {
          console.warn('[CRUD] 未提供 updateApi，无法执行编辑操作。');
          throw new Error('Update API not configured.');
        }
        const result = await updateApi(createId, values);
        console.log(`[CRUD] 编辑API调用成功`, { result });
        messageApi.success('编辑成功');

        // 【核心】触发列表重新获取
        setFetch(true);
      } else {
        // --- 新增逻辑 ---
        if (!createApi) {
          // 这是在没有提供 createApi 时的本地模拟回退逻辑，可以保留
          console.warn('[CRUD] 未提供 createApi，执行本地模拟新增。');
          const newId = getNextId();
          const newItem = { ...values, id: newId } as T;
          setTableData((prev) => [...prev, newItem]);
          setTotal((prev) => prev + 1);
        } else {
          const result = await createApi(values);
          console.log(`[CRUD] 新增API调用成功`, { result });
          messageApi.success('新增成功');
          // 【核心】重置到第一页，并触发列表重新获取
          setPage(1);
          setFetch(true);
        }
      }
      setCreateOpen(false); // 操作成功，关闭弹窗
    } catch (error) {
      console.error(`[CRUD] ${operationType}操作失败`, {
        error,
        submittedData: values,
        timestamp: new Date().toISOString(),
      });
      messageApi.error(`${operationType}失败`);
    } finally {
      setCreateLoading(false);
    }
  };
  // 获取数据
  const fetchTableData = async (mockData?: T[]) => {
    setLoading(true);
    try {
      console.log('触发fetchTableData');
      if (fetchApi) {
        const params: any = { ...searchData };
        if (pagination) {
          // 根据选项决定是否添加分页参数
          params.page = page;
          params.pageSize = pageSize;
        }
        const { data } = await fetchApi(params);
        console.log('fetch了', data);
        setTableData(data.list || data.data || data || []);
        setTotal(data.total || 0);
      } else if (mockData) {
        // 使用模拟数据
        setTableData(mockData);
        setTotal(mockData.length);
      }
    } catch (error) {
      messageApi.error('获取数据失败');
    } finally {
      setLoading(false);
      setFetch(false);
    }
  };

  return {
    // 状态
    contextHolder,
    createFormRef,
    isFetch,
    setFetch,
    isLoading,
    isCreateLoading,
    isCreateOpen,
    setCreateOpen,
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
    // 方法
    handlePageChange,
    handleSearch,
    handleCreate,
    handleEdit,
    handleDelete,
    handleModalSubmit,
    fetchTableData,
    getNextId,
  };
};
