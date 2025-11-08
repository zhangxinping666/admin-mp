import { useEffect, useState, Key } from 'react';
import { Button, message, Popconfirm, Space, TableColumnsType, Tooltip } from 'antd';
import BaseContent from '@/components/Content/BaseContent';
import BaseCard from '@/components/Card/BaseCard';
import BaseSearch from '@/components/Search/BaseSearch';
import BaseTable from '@/components/Table/BaseTable';
import BaseModal from '@/components/Modal/BaseModal';
import BaseForm from '@/components/Form/BaseForm';
import BasePagination from '@/components/Pagination/BasePagination';
import { BaseBtn } from '@/components/Buttons';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { useCRUD } from '../hooks/useCRUD';
import { RightOutlined } from '@ant-design/icons';
import HistoryModal, { AuditRecord } from './HistoryModal';
import DetailModal, { FieldConfig } from './DetailModal';

interface CRUDPageTemplateProps<T extends { id: number }> {
  title: string;
  isAddOpen?: boolean;
  isDelete: boolean;
  isApplication?: boolean;
  addFormConfig?: BaseFormList[];
  detailConfig?: FieldConfig[];
  formatHistoryData?: (data: any) => any;

  pagination?: boolean;
  hideCreate?: boolean;
  disableCreate?: boolean;
  disableBatchDelete?: boolean;
  disableBatchUpdate?: boolean;
  scrollX?: number; // 表格横向滚动最小宽度,用于固定列生效
  onEditOpen?: (record: T) => T | void;
  searchConfig: BaseSearchList[];
  columns: TableColumn[];
  formConfig: BaseFormList[];
  initCreate: Partial<T>;
  mockData?: T[];
  onRow?: any;
  handleFormValue?: (value: any) => any;
  apis?: {
    fetchApi?: (params: any) => Promise<any>;
    createApi?: (params: any) => Promise<any>;
    updateApi?: (params: any) => Promise<any>;
    deleteApi?: (params: any) => Promise<any>;
    fetchHistoryApi?: (params: any) => Promise<any>;
  };
  optionRender?: (
    record: T,
    actions: {
      handleEdit: (record: T) => void;
      handleDelete?: (id: Key[]) => void;
      handleHistory?: (id: number) => void;
      handleDetail?: (record: T) => void;
    },
  ) => React.ReactNode;
  onCreateClick?: () => void; // 新增按钮点击时的自定义处理函数
  onFormValuesChange?: (changedValues: any, allValues: any) => void; // 表单值变化回调
}
export const CRUDPageTemplate = <T extends { id: number }>({
  isAddOpen = true,
  isDelete,
  addFormConfig,
  title,
  searchConfig,
  detailConfig,
  isApplication,
  columns,
  formConfig,
  initCreate,
  formatHistoryData,
  mockData,
  onEditOpen,
  handleFormValue,
  apis,
  onRow,
  pagination,
  scrollX = 1200,
  optionRender,
  onCreateClick,
  onFormValuesChange,
  hideCreate,
  disableCreate = false,
  disableBatchDelete = false,
  disableBatchUpdate = false,

}: CRUDPageTemplateProps<T>) => {
  const crudOptions = {
    isApplication,
    initCreate,
    pagination,
    fetchApi: apis?.fetchApi,
    createApi: apis?.createApi,
    updateApi: apis?.updateApi,
    deleteApi: apis?.deleteApi,
    fetchHistoryApi: apis?.fetchHistoryApi,
    handleFormValue,
    formatHistoryData,
  };
  // 添加选中行的状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const {
    contextHolder,
    createFormRef,
    isFetch,
    setFetch,
    isLoading,
    isCreateLoading,
    isDetailOpen,
    setDetailOpen,
    detailData,
    isHistoryOpen,
    setHistoryOpen,
    historyData,
    isCreateOpen,
    setCreateOpen,
    createTitle,
    createData,
    page,
    pageSize,
    total,
    tableData,
    handlePageChange,
    handleSearch,
    handleCreate,
    handleEdit,
    handleDelete,
    handleModalSubmit,
    fetchTableData,
    handleHistory,
    handleDetail,
  } = useCRUD(crudOptions);
  useEffect(() => {
    setFetch(true);
  }, []);

  useEffect(() => {
    if (isFetch) {
      fetchTableData();
    }
  }, [isFetch, fetchTableData]); // fetchTableData现在已经用useCallback优化，可以安全作为依赖

  // 处理选中行变化
  const handleSelectionChange = (selectedRowKeys: Key[]) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  // 批量删除处理
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请至少选择一条数据');
      return;
    }
    try {
      // await apis?.delete?.(selectedRowKeys);
      handleDelete(selectedRowKeys);
      setSelectedRowKeys([]);
      // 移除重复的fetchTableData调用，handleDelete内部已经通过setFetch(true)触发刷新
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 处理表格列，添加操作列
  const finalColumns = [
    ...columns,
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 130,
      fixed: 'right' as const,
      render: (_: any, record: T) =>
        optionRender
          ? optionRender(record, {
            handleEdit: (rec: T) => {
              // 如果有onEditOpen回调，先调用它进行数据转换
              const processedRecord = onEditOpen ? onEditOpen(rec) || rec : rec;
              handleEdit(`编辑${title}`, processedRecord);
            },
            handleDelete: (id: Key[]) => {
              // 调用原始的删除函数
              Array.isArray(id) ? handleDelete(id) : handleDelete([id]);
              // 更新选中状态，移除已删除的项
              setSelectedRowKeys((prev) => prev.filter((key) => !id.includes(key)));
            },
            handleHistory: (id: number) => {
              handleHistory(id);
            },
            handleDetail: (record: any) => {
              handleDetail(record);
            },
          })
          : null,
    },
  ];
  return (
    <>
      {contextHolder && contextHolder}
      <BaseContent isPermission={true}>
        <Space direction="vertical" size={'large'} className="w-full overflow-x-auto">


          <BaseCard style={{ marginBottom: '-10px' }}>
            <BaseSearch data={{}} list={searchConfig} handleFinish={handleSearch} />
          </BaseCard>

          <BaseCard >
            <Tooltip title={disableBatchDelete || disableBatchUpdate ? '无权限操作' : ''}>
              <Space size={10}>
                <Popconfirm
                  title="确定要删除选中的项吗？"
                  onConfirm={handleBatchDelete}
                  okText="确定"
                  cancelText="取消"
                  disabled={selectedRowKeys.length === 0 || disableBatchDelete}
                >
                  <BaseBtn
                    type="primary"
                    danger
                    disabled={selectedRowKeys.length === 0 || disableBatchDelete}
                  >
                    批量删除 ({selectedRowKeys.length})
                  </BaseBtn>
                </Popconfirm>
              </Space>
            </Tooltip>
            <BaseTable
              isLoading={isLoading}
              isAuthHeight={false}
              scrollX={scrollX}
              columns={(optionRender ? finalColumns : columns) as TableColumnsType}
              getPage={() => {
                fetchTableData();
              }}
              onRow={onRow}
              dataSource={tableData}
              rowKey={(record: any) => record.id}
              pagination={false}
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys,
                onChange: handleSelectionChange,
                columnWidth: 60,
                renderCell: (checked, record, index, originNode) => {
                  return <div className="ant-table-selection-cell">{originNode}</div>;
                },
              }}
              rightContent={
                isAddOpen ? (
                  <Tooltip title={disableCreate ? '无权限操作' : ''}>
                    <Button
                      type="primary"
                      disabled={disableCreate}
                      onClick={() => {
                        if (disableCreate) return;
                        if (onCreateClick) {
                          onCreateClick();
                        }
                        handleCreate(`新增${title}`);
                      }}
                    >
                      新增{title}
                    </Button>
                  </Tooltip>
                ) : null
              }
              expandable={{
                rowExpandable: (record: any) => record.children && record.children.length > 0,
                expandIcon: ({ expanded, onExpand, record }) => {
                  const hasChildren = (record as any).children
                    && (record as any).children.length > 0;

                  if (!hasChildren) {
                    return (
                      <span style={{ display: 'inline-block', width: '20px', marginLeft: '6px' }} />
                    );
                  }
                  return (
                    <RightOutlined
                      onClick={(e) => {
                        e.stopPropagation();
                        onExpand(record, e);
                      }}
                      style={{
                        cursor: 'pointer',
                        fontSize: '12px',
                        marginRight: '14px',
                        transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s',
                      }}
                    />
                  );
                },
              }}
            />

            <BasePagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
            />
          </BaseCard>
        </Space>
      </BaseContent>
      <BaseModal
        title={createTitle}
        open={isCreateOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => {
          createFormRef.current?.submit();
        }}
        confirmLoading={isCreateLoading}
        okText={createTitle.includes('编辑') ? '更新' : '新增'}
        cancelText="取消"
      >
        <BaseForm
          ref={createFormRef}
          list={!createTitle.includes('编辑') && addFormConfig ? addFormConfig : formConfig}
          data={createData}
          handleFinish={(values) => handleModalSubmit(values)}
          onValuesChange={onFormValuesChange}
        />
      </BaseModal>
      {/* 弹窗渲染 */}
      {detailData && detailConfig && (
        <DetailModal
          open={isDetailOpen}
          data={detailData as any}
          config={detailConfig}
          onClose={() => setDetailOpen(false)}
          title={'详情'}
        />
      )}
      {historyData && (
        <HistoryModal
          open={isHistoryOpen}
          data={historyData as AuditRecord[]}
          onClose={() => setHistoryOpen(false)}
          title="历史记录"
        />
      )}
    </>
  );
};
