import { useState, useRef, useCallback, Key } from 'react';
import { message, type FormInstance } from 'antd';
import type { BaseFormData } from '#/form';
import { INIT_PAGINATION } from '@/utils/config';
import { create } from 'lodash';

interface UseCRUDOptions<T> {
  initCreate: Partial<T>;
  fetchApi?: (params: any) => Promise<any>;
  createApi?: (data: any) => Promise<any>;
  updateApi?: (id: Key, data: any) => Promise<any>;
  deleteApi?: (id: Key | Key[]) => Promise<any>;
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

  // 编辑处理
  const handleEdit = (title: string, record: T) => {
    setCreateTitle(title);
    setCreateId(record.id);
    setCreateData(record);
    setCreateOpen(true);
  };

  // 删除处理
  const handleDelete = async (id: Key[]) => {
    try {
      if (deleteApi) {
        await deleteApi(id);
      }

      // 处理单个ID或多个ID的情况
      const idsToDelete = Array.isArray(id) ? id : [id];

      setTableData((prevData) => {
        const newData = prevData.filter((item) => !idsToDelete.includes(item.id));
        return newData;
      });

      setTotal((prev) => prev - idsToDelete.length);
      messageApi.success(`成功删除${idsToDelete.length}条数据`);
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
        handleDelete: (id: Key[]) => void;
      },
    ) => React.ReactNode | undefined,
  ) => {
    setCreateLoading(true);
    console.log(' 表单提交开始:', {
      操作类型: createId !== -1 ? '编辑' : '新增',
      表单数据: values,
      时间戳: new Date().toLocaleString(),
    });
    console.log('createId', createId);
    try {
      if (createId !== -1) {
        // 编辑
        let updateResult;
        if (updateApi) {
          updateResult = await updateApi(createId, values);
          console.log('编辑API调用结果:', updateResult);
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
        console.log('编辑操作完成:', {
          编辑ID: createId,
          更新数据: values,
          API结果: updateResult,
        });
        messageApi.success('编辑成功');
        // setFetch(true);
      } else {
        // 新增
        let createResult;
        if (createApi) {
          createResult = await createApi(values);
          console.log('新增API调用结果:', createResult);
        } else {
          // 本地新增
          const newId = getNextId();
          const newItem = { ...values, id: newId } as T;
          console.log('本地新增项目:', newItem);
          if (optionRender) {
            (newItem as any).action = optionRender(newItem, {
              handleEdit: (record) => handleEdit('编辑', record),
              handleDelete: (id) => handleDelete(id),
            });
          }
          setTableData((prev) => [...prev, newItem]);
          setTotal((prev) => prev + 1);
          createResult = { success: true, data: newItem };
        }
        console.log('新增操作完成:', {
          新增数据: values,
          生成ID: createResult?.data?.id || '本地生成',
          API结果: createResult,
        });
        messageApi.success('新增成功');
      }

      console.log(' 表单提交成功完成:', {
        操作类型: createId && createId > 0 ? '编辑' : '新增',
        最终状态: '成功',
        完成时间: new Date().toLocaleString(),
      });

      setCreateOpen(false);
    } catch (error) {
      console.error(' 表单提交失败:', {
        操作类型: createId && createId > 0 ? '编辑' : '新增',
        错误信息: error,
        提交数据: values,
        失败时间: new Date().toLocaleString(),
      });
      messageApi.error(createId ? '编辑失败' : '新增失败');
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
        const response = await fetchApi({ ...searchData, page, pageSize });
        console.log('response', response);
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
