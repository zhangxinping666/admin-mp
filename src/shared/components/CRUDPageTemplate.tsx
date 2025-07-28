import { useEffect } from 'react';
import { Button, TableColumnsType } from 'antd';
import BaseContent from '@/components/Content/BaseContent';
import BaseCard from '@/components/Card/BaseCard';
import BaseSearch from '@/components/Search/BaseSearch';
import BaseTable from '@/components/Table/BaseTable';
import BaseModal from '@/components/Modal/BaseModal';
import BaseForm from '@/components/Form/BaseForm';
import BasePagination from '@/components/Pagination/BasePagination';
import type { BaseSearchList, BaseFormList } from '#/form';
import type { TableColumn } from '#/public';
import { useCRUD } from '../hooks/useCRUD';
import { RightOutlined } from '@ant-design/icons';

interface CRUDPageTemplateProps<T extends { id: number }> {
  title: string;
  hideCreate?: boolean;
  searchConfig: BaseSearchList[];
  columns: TableColumn[];
  formConfig: BaseFormList[];
  initCreate: Partial<T>;
  mockData?: T[];
  onEditOpen?: (record: T) => void;
  apis: {
    fetch?: (params?: any) => Promise<any>;
    create?: (data: Partial<T>) => Promise<any>;
    update?: (data: Partial<T>) => Promise<any>;
    delete?: (id: number) => Promise<any>;
  };
  optionRender?: (
    record: T,
    actions: {
      handleEdit: (record: T) => void;
      handleDelete: (id: number) => void;
    },
  ) => React.ReactNode;
  onCreateClick?: () => void; // 新增按钮点击时的自定义处理函数
  onFormValuesChange?: (changedValues: any, allValues: any) => void; // 表单值变化回调
}

export const CRUDPageTemplate = <T extends { id: number }>({
  title,
  searchConfig,
  columns,
  formConfig,
  initCreate,
  mockData,
  onEditOpen,
  apis,
  optionRender,
  onCreateClick,
  onFormValuesChange,
  hideCreate,
}: CRUDPageTemplateProps<T>) => {
  const crudOptions = {
    initCreate,
    fetchApi: apis?.fetch,
    createApi: apis?.create,
    updateApi: apis?.update,
    deleteApi: apis?.delete,
  };
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
  } = useCRUD(crudOptions);

  // 👇 确保有这个 useEffect 来触发初次加载
  useEffect(() => {
    setFetch(true);
  }, []); // 空依赖数组 [] 确保这个 effect 只在组件首次渲染后运行一次

  // 这个 useEffect 监听 isFetch 的变化，并实际调用 API
  useEffect(() => {
    if (isFetch) {
      fetchTableData();
    }
  }, [isFetch, page, pageSize]); // (假设依赖项还包括 page 和 pageSize)

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
              // 【修改】在调用 handleEdit 时，将 onEditOpen 作为第三个参数传入
              handleEdit: (rec: T) => handleEdit(`编辑${title}`, rec, onEditOpen),
              handleDelete,
            })
          : null,
    },
  ];

  return (
    <>
      {contextHolder}
      <BaseContent isPermission={true}>
        {/* 搜索区域 */}
        <BaseCard>
          <BaseSearch data={{}} list={searchConfig} handleFinish={handleSearch} />
        </BaseCard>

        {/* 表格区域 */}
        <BaseCard>
          <BaseTable
            isLoading={isLoading}
            columns={finalColumns as TableColumnsType}
            getPage={() => {
              console.log('getPage called');
            }}
            dataSource={tableData}
            rowKey={(record: any) => record.id}
            pagination={false}
            rightContent={
              !hideCreate && (
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
              )
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
                  return <span />;
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
          handleFinish={(values) => handleModalSubmit(values)}
          onValuesChange={onFormValuesChange}
        />
      </BaseModal>
    </>
  );
};
