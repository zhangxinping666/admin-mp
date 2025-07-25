import { useEffect } from 'react';
import { Button, Space, TableColumnsType } from 'antd';
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
        <Space direction="vertical" size={'large'}>
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
                console.log('点击了刷新按钮');
              }}
              dataSource={tableData}
              rowKey="id"
              pagination={false}
              rightContent={
                <Button type="primary" onClick={() => handleCreate(`新增${title}`)}>
                  新增{title}
                </Button>
              }
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
        />
      </BaseModal>
    </>
  );
};
