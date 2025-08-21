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
import TableNavigation from '@/components/Navigation/TableNavigation';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { useCRUD } from '../hooks/useCRUD';
import { RightOutlined } from '@ant-design/icons';
import HistoryModal, { AuditRecord } from './HistoryModal';
import DetailModal, { FieldConfig } from './DetailModal';
import { merchantOrderConfig } from '@/pages/merchantManage/merchantApplication/model';

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
      handleDetail?: (id: number) => void;
    },
  ) => React.ReactNode;
  onCreateClick?: () => void; // 新增按钮点击时的自定义处理函数
  onFormValuesChange?: (changedValues: any, allValues: any) => void; // 表单值变化回调
  // 导航相关配置
  showNavigation?: boolean; // 是否显示导航
  customNavActions?: React.ReactNode; // 自定义导航操作按钮
  breadcrumbItems?: Array<{
    title: string;
    path?: string;
    icon?: React.ReactNode;
  }>; // 自定义面包屑
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
  optionRender,
  onCreateClick,
  onFormValuesChange,
  hideCreate,
  disableCreate = false,
  disableBatchDelete = false,
  disableBatchUpdate = false,
  // 导航相关配置
  showNavigation = true,
  customNavActions,
  breadcrumbItems,
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
  console.log('isDelete', isDelete);
  return (
    <>
      {contextHolder && contextHolder}
      <BaseContent isPermission={true}>
        <Space direction="vertical" size={'large'} className="w-full overflow-x-auto">
          {/* 导航区域 */}
          {showNavigation && (
            <TableNavigation
              title={title}
              customActions={customNavActions}
              breadcrumbItems={breadcrumbItems}
            />
          )}

          {/* 搜索区域 */}
          <BaseCard>
            <BaseSearch data={{}} list={searchConfig} handleFinish={handleSearch} />
          </BaseCard>

          {/* 表格区域 */}
          <BaseCard>
            <Tooltip title={disableBatchDelete || disableBatchUpdate ? '无权限操作' : ''}>
              <Space size={20}>
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
                // 添加以下className属性
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
                        // 如果有自定义的新增点击处理函数，先调用它
                        if (onCreateClick) {
                          onCreateClick();
                        }
                        // 然后调用默认的新增处理
                        handleCreate(`新增${title}`);
                      }}
                    >
                      新增{title}
                    </Button>
                  </Tooltip>
                ) : null
              }
              expandable={{
                // 明确地告诉表格哪一行是可展开的，这是最佳实践
                rowExpandable: (record: any) => record.children && record.children.length > 0,
                expandIcon: ({ expanded, onExpand, record }) => {
                  // 再次确认该行是否有可展开的子项
                  const hasChildren = record.children && record.children.length > 0;
                  // 如果没有子项，渲染一个占位符来保证该列的对齐
                  if (!hasChildren) {
                    // 这个span的宽度和内联样式是为了和有图标的行在视觉上对齐
                    return (
                      <span style={{ display: 'inline-block', width: '20px', marginLeft: '6px' }} />
                    );
                  }

                  // 如果有子项，则渲染我们自定义的图标
                  return (
                    <RightOutlined
                      onClick={(e) => {
                        // 阻止事件冒泡，防止点击图标时触发了 onRow 的 onClick 事件
                        e.stopPropagation();
                        onExpand(record, e);
                      }}
                      style={{
                        cursor: 'pointer',
                        // 调整图标大小
                        fontSize: '12px',
                        // 添加右边距
                        marginRight: '14px',
                        // 平滑的旋转动画
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
      {/* 新增/编辑模态框 */}
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
