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

interface CRUDPageTemplateProps<T> {
  title: string;
  searchConfig: BaseSearchList[];
  columns: TableColumn[];
  formConfig: BaseFormList[];
  initCreate: Partial<T>;
  mockData?: T[];
  apis?: {
    fetch?: (params: any) => Promise<any>;
    create?: (data: any) => Promise<any>;
    update?: (id: number, data: any) => Promise<any>;
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
  apis,
  optionRender,
  onCreateClick,
  onFormValuesChange,
}: CRUDPageTemplateProps<T>) => {
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
