import { useEffect, Key } from 'react';
import { Button, message, Popconfirm, Space, TableColumnsType } from 'antd';
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

interface CRUDPageTemplateProps<T> {
  title: string;
  isAddOpen: boolean;
  searchConfig: BaseSearchList[];
  columns: TableColumn[];
  formConfig: BaseFormList[];
  initCreate: Partial<T>;
  mockData?: T[];
  apis?: {
    fetchApi?: (params: any) => Promise<any>;
    createApi?: (params: any) => Promise<any>;
    updateApi?: (params: any) => Promise<any>;
    deleteApi?: (params: any) => Promise<any>;
  };
  optionRender?: (
    record: T,
    actions: {
      handleEdit: (record: T) => void;
      handleDelete: (id: Key[]) => void;
    },
  ) => React.ReactNode;
  onCreateClick?: () => void; // 新增按钮点击时的自定义处理函数
  onFormValuesChange?: (changedValues: any, allValues: any) => void; // 表单值变化回调
}
export const CRUDPageTemplate = <T extends { id: number }>({
  isAddOpen = true,
  title,
  searchConfig,
  columns,
  formConfig,
  initCreate,
  mockData,
  apis,
  optionRender,
  onCreateClick,
  onFormValuesChange,
}: CRUDPageTemplateProps<T>) => {
  // 添加选中行的状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  const {
    contextHolder,
    createFormRef,
    isFetch,
    setFetch,
    isLoading,
    isCreateLoading,
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
  } = useCRUD({ initCreate, ...apis });

  // 数据获取副作用
  useEffect(() => {
    if (isFetch) {
      fetchTableData(mockData);
    }
  }, [isFetch, page, pageSize]);
  // 👇 在调用 useCRUD 之前，打印一下最终的参数
  console.log('传递给 useCRUD Hook 的参数是:', { initCreate, ...apis });
  // 初始化数据
  useEffect(() => {
    setFetch(true);
  }, []);

  // 处理选中行变化
  const handleSelectionChange = (selectedRowKeys: Key[]) => {
    setSelectedRowKeys(selectedRowKeys);
    console.log('selectedRowKeys', selectedRowKeys);
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
      fetchTableData();
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
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: T) =>
        optionRender
          ? optionRender(record, {
              handleEdit: (rec: T) => handleEdit(`编辑${title}`, rec),
              handleDelete: (id: Key[]) => {
                // 调用原始的删除函数
                handleDelete(id);
                // 更新选中状态，移除已删除的项
                setSelectedRowKeys((prev) => prev.filter((key) => !id.includes(key)));
              },
            })
          : null,
    },
  ];

  return (
    <>
      {contextHolder}
      <BaseContent isPermission={true}>
        <Space direction="vertical" size={'large'} className="w-full overflow-x-auto">
          {/* 搜索区域 */}
          <BaseCard>
            <BaseSearch data={{}} list={searchConfig} handleFinish={handleSearch} />
          </BaseCard>

          {/* 表格区域 */}
          <BaseCard>
            <Popconfirm
              title="确定要删除选中的项吗？"
              onConfirm={handleBatchDelete}
              okText="确定"
              cancelText="取消"
              disabled={selectedRowKeys.length === 0}
            >
              <BaseBtn type="primary" danger disabled={selectedRowKeys.length === 0}>
                批量删除 ({selectedRowKeys.length})
              </BaseBtn>
            </Popconfirm>
            <BaseTable
              isLoading={isLoading}
              columns={finalColumns as TableColumnsType}
              getPage={() => {
                fetchTableData();
              }}
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
                  <Button
                    type="primary"
                    onClick={() => {
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
          list={formConfig}
          data={createData}
          handleFinish={(values) => handleModalSubmit(values, optionRender)}
          onValuesChange={onFormValuesChange}
        />
      </BaseModal>
    </>
  );
};
