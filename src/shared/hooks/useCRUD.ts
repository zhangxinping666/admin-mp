import { useState, useEffect, useRef, useCallback } from 'react';
import { message, type FormInstance } from 'antd';
import type { BaseFormData } from '#/form';
import { INIT_PAGINATION } from '@/utils/config';
import Item from 'antd/es/list/Item';

interface UseCRUDOptions<T> {
  initCreate: Partial<T>;
  fetchApi?: (params: any) => Promise<any>;
  createApi?: (data: any) => Promise<any>;
  updateApi?: (id: number, data: any) => Promise<any>;
  deleteApi?: (id: number) => Promise<any>;
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
    setPage(1);
    setSearchData(values);
    setFetch(true);
  };

  // 新增处理
  const handleCreate = (title: string = '新增') => {
    setCreateTitle(title);
    setCreateId(0);
    setCreateData(initCreate);
    setCreateOpen(true);
  };

  // 编辑处理
  const handleEdit = (title: string, record: T) => {
    setCreateTitle(title);
    setCreateId(record.id);
    setCreateData(record);
    setCreateOpen(true);
  };

  // 删除处理
  const handleDelete = async (id: number) => {
    try {
      if (deleteApi) {
        await deleteApi(id);
      }

      setTableData((prevData) => {
        const newData = prevData.filter((item) => item.id !== id);
        return newData;
      });
      setTotal((prev) => prev - 1);
      messageApi.success('删除成功');
    } catch (error) {
      messageApi.error('删除失败');
    }
  };

  // 模态框提交处理
  const handleModalSubmit = async (
    values: BaseFormData,
    optionRender?: (
      record: T,
      actions: {
        handleEdit: (record: T) => void;
        handleDelete: (id: number) => void;
      },
    ) => React.ReactNode | undefined,
  ) => {
    setCreateLoading(true);
    try {
      if (createId && createId > 0) {
        // 编辑
        if (updateApi) {
          await updateApi(createId, values);
        }
        setTableData((prev) => {
          prev = prev.map((item) => {
            if (item.id === createId) {
              return { ...item, ...values } as T;
            }
            return item;
          });
          return prev;
        });
        messageApi.success('编辑成功');
        // setFetch(true);
      } else {
        // 新增
        if (createApi) {
          await createApi(values);
        } else {
          // 本地新增
          const newId = getNextId();
          const newItem = { ...values, id: newId } as T;
          if (optionRender) {
            (newItem as any).action = optionRender(newItem, {
              handleEdit: (record) => handleEdit('编辑', record),
              handleDelete: (id) => handleDelete(id),
            });
          }
          setTableData((prev) => [...prev, newItem]);
          setTotal((prev) => prev + 1);
        }
        messageApi.success('新增成功');
      }
      setCreateOpen(false);
    } catch (error) {
      messageApi.error(createId ? '编辑失败' : '新增失败');
    } finally {
      setCreateLoading(false);
    }
  };

  // 获取数据
  const fetchTableData = async (mockData?: T[]) => {
    setLoading(true);
    try {
      if (fetchApi) {
        const response = await fetchApi({ ...searchData, page, pageSize });
        setTableData(response.items || response.data || []);
        setTotal(response.total || 0);
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
