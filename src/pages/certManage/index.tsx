import { useEffect, useState, useRef, useCallback, Key } from 'react';
import {
  Button,
  message,
  type FormInstance,
  TableColumnsType,
  Space,
  Modal,
  Descriptions,
} from 'antd';
import BaseContent from '@/components/Content/BaseContent';
import BaseCard from '@/components/Card/BaseCard';
import BaseSearch from '@/components/Search/BaseSearch';
import BaseTable from '@/components/Table/BaseTable';
import BaseModal from '@/components/Modal/BaseModal';
import BaseForm from '@/components/Form/BaseForm';
import BasePagination from '@/components/Pagination/BasePagination';
import TableNavigation from '@/components/Navigation/TableNavigation';
import { ImagePreview } from '@/components/Upload';
import { searchList, tableColumns, formList, type Cert, type CertItem } from './model';
import { getCertList, updateCert } from '@/servers/cert';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import { INIT_PAGINATION } from '@/utils/config';
import type { BaseFormData } from '#/form';
import { RightOutlined } from '@ant-design/icons';

// 初始化新增数据
const initCreate: Partial<Cert> = {
  id: 0,
  name: '',
  card_id: 0,
  front: [],
  back: [],
  status: 0, // 默认状态
};

const CertPage = () => {
  const { permissions } = useUserStore();

  // 表单引用
  const createFormRef = useRef<FormInstance>(null);

  // 状态管理
  const [isFetch, setFetch] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [isCreateLoading, setCreateLoading] = useState(false);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState('新增');
  const [createId, setCreateId] = useState(-1);
  const [createData, setCreateData] = useState<Partial<Cert>>(initCreate);
  const [searchData, setSearchData] = useState<BaseFormData>({});
  
  // 审核信息弹窗状态
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState<CertItem | null>(null);

  // 分页状态
  const [page, setPage] = useState(INIT_PAGINATION.page);
  const [pageSize, setPageSize] = useState(INIT_PAGINATION.pageSize);
  const [total, setTotal] = useState(0);
  const [tableData, setTableData] = useState<CertItem[]>([]);

  // 权限检查
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  // 获取表格数据
  const fetchTableData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize,
        ...searchData,
      };

      const response = await getCertList(params);
      if (response?.data) {
        setTableData(response.data.list || []);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error('获取数据失败');
    } finally {
      setLoading(false);
      setFetch(false);
    }
  }, [page, pageSize, searchData]);

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

  // 审核处理
  const handleAudit = (record: CertItem) => {
    setCreateTitle('审核实名认证');
    setCreateId(record.id);
    setCreateData(record);
    setCreateOpen(true);
  };
  
  // 查看审核信息详情
  const handleViewDetail = (record: CertItem) => {
    setDetailData(record);
    setDetailModalOpen(true);
  };


  // 表单提交处理
  const handleModalSubmit = async (values: BaseFormData) => {
    setCreateLoading(true);
    try {
      // 实名认证只有审核功能
      const { id, status } = values;
      await updateCert({ id: createId, status });
      message.success('审核成功');
      setCreateOpen(false);
      setFetch(true);
    } catch (error) {
      message.error('审核失败');
      console.error('审核操作失败:', error);
    } finally {
      setCreateLoading(false);
    }
  };


  // 操作列渲染
  const optionRender = (record: CertItem) => {
    const canAudit = hasPermission('mp:cert:update');
    // 只有审核中(status === 1)的记录才显示审核按钮
    const showAuditButton = record.status === 1;
    
    return (
      <Space size="small">
        <Button 
          type="primary" 
          size="small"
          onClick={() => handleViewDetail(record)}
        >
          审核信息
        </Button>
        {showAuditButton && (
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleAudit(record)}
            disabled={!canAudit}
          >
            审核
          </Button>
        )}
      </Space>
    );
  };

  // 处理表格列，添加操作列
  const finalColumns = [
    ...tableColumns.filter((col: any) => col.dataIndex !== 'action'),
    {
      title: '操作',
      dataIndex: 'action',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: CertItem) => optionRender(record),
    },
  ];

  // 初始化加载数据
  useEffect(() => {
    setFetch(true);
  }, []);

  useEffect(() => {
    if (isFetch) {
      fetchTableData();
    }
  }, [isFetch, fetchTableData]);

  return (
    <>
      <BaseContent isPermission={true}>
        <Space direction="vertical" size={'large'} className="w-full overflow-x-auto">
          {/* 导航区域 */}
          <TableNavigation title="实名认证" customActions={null} breadcrumbItems={undefined} />

          {/* 搜索区域 */}
          <BaseCard>
            <BaseSearch data={{}} list={searchList()} handleFinish={handleSearch} />
          </BaseCard>

          {/* 表格区域 */}
          <BaseCard>

            {/* 表格 */}
            <BaseTable
              isLoading={isLoading}
              columns={finalColumns as TableColumnsType}
              dataSource={tableData}
              rowKey={(record: any) => record.id}
              pagination={false}
              getPage={() => {
                fetchTableData();
              }}
              expandable={{
                rowExpandable: (record: any) => record.children && record.children.length > 0,
                expandIcon: ({ expanded, onExpand, record }) => {
                  const hasChildren = record.children && record.children.length > 0;
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

            {/* 分页 */}
            <BasePagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={handlePageChange}
            />
          </BaseCard>
        </Space>
      </BaseContent>

      {/* 审核模态框 */}
      <BaseModal
        title={createTitle}
        open={isCreateOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => {
          createFormRef.current?.submit();
        }}
        confirmLoading={isCreateLoading}
        okText="确认审核"
        cancelText="取消"
      >
        <BaseForm
          ref={createFormRef}
          list={formList()}
          data={createData}
          handleFinish={(values) => handleModalSubmit(values)}
        />
      </BaseModal>
      
      {/* 审核信息详情弹窗 */}
      <Modal
        title="审核信息详情"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {detailData && (
          <div>
            {/* 基本信息 */}
            <Descriptions bordered column={2} style={{ marginBottom: 20 }}>
              <Descriptions.Item label="用户名称" span={1}>
                {detailData.name}
              </Descriptions.Item>
              <Descriptions.Item label="用户电话" span={1}>
                {detailData.phone || '暂无'}
              </Descriptions.Item>
              <Descriptions.Item label="身份证号" span={1}>
                {detailData.card_id}
              </Descriptions.Item>
              <Descriptions.Item label="审核状态" span={1}>
                <span style={{ 
                  color: detailData.status === 1 ? '#faad14' : 
                         detailData.status === 2 ? '#1890ff' : '#ff4d4f' 
                }}>
                  {detailData.status === 1 ? '审核中' : 
                   detailData.status === 2 ? '审核成功' : '审核失败'}
                </span>
              </Descriptions.Item>
            </Descriptions>
            
            {/* 身份证图片 */}
            <div>
              <h4 style={{ marginBottom: 15 }}>身份证照片</h4>
              <Space size={20} align="start">
                <div>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>身份证正面</div>
                  <ImagePreview 
                    imageUrl={detailData.front ? [{ 
                      uid: '1', 
                      name: 'front', 
                      status: 'done', 
                      url: detailData.front 
                    }] : []}
                    alt="身份证正面" 
                    baseUrl="http://192.168.10.7:8082"
                    width={300}
                    height={200}
                  />
                </div>
                <div>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>身份证反面</div>
                  <ImagePreview 
                    imageUrl={detailData.back ? [{ 
                      uid: '2', 
                      name: 'back', 
                      status: 'done', 
                      url: detailData.back 
                    }] : []}
                    alt="身份证反面" 
                    baseUrl="http://192.168.10.7:8082"
                    width={300}
                    height={200}
                  />
                </div>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CertPage;
