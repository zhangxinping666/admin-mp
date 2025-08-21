import { useEffect, useState, useRef, useCallback, Key } from 'react';
import {
  Button,
  message,
  type FormInstance,
  TableColumnsType,
  Space,
  Modal,
  Descriptions,
  Input,
  Form,
  Tag,
} from 'antd';
import BaseContent from '@/components/Content/BaseContent';
import BaseCard from '@/components/Card/BaseCard';
import BaseSearch from '@/components/Search/BaseSearch';
import BaseTable from '@/components/Table/BaseTable';
import BasePagination from '@/components/Pagination/BasePagination';
import TableNavigation from '@/components/Navigation/TableNavigation';
import { ImagePreview } from '@/components/Upload';
import { searchList, tableColumns, type Cert, type CertItem } from './model';
import { getCertList, updateCert, getAuditRecord } from '@/servers/cert';
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

//审批历史记录
interface record {
  reviewer: string;
  reviewTime: string;
  status: number;
  reason: string;
}

const CertPage = () => {
  const { permissions } = useUserStore();

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
  // 审批弹窗状态
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [auditData, setAuditData] = useState<CertItem | null>(null);
  // 拒绝原因
  const [rejectReason, setRejectReason] = useState('');
  // 审批历史记录
  const [auditHistory, setAuditHistory] = useState<record[]>([]);

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
    console.log(record.id);
    setCreateId(record.id);
    setCreateData(record);
    setRejectReason(''); // 清空拒绝原因
    setCreateOpen(true);
  };

  // 审批处理
  const handleAuditAction = (record: CertItem) => {
    setAuditData(record);
    setCreateId(record.id); // 设置当前审核ID
    setRejectReason(''); // 清空拒绝原因
    setAuditModalOpen(true);
  };

  // 查看审核信息详情
  const handleViewDetail = async (record: CertItem) => {
    setDetailData(record);

    // 获取审批历史记录
    try {
      const response = await getAuditRecord(record.user_id);
      if (response?.data?.list) {
        setAuditHistory(response.data.list);
      } else {
        setAuditHistory([]);
      }
    } catch (error) {
      console.error('获取审批历史失败:', error);
      setAuditHistory([]);
    }

    setDetailModalOpen(true);
  };

  // 审核通过处理
  const handleApprove = async () => {
    if (!createId || createId === -1) {
      message.error('审核ID无效');
      return;
    }
    setCreateLoading(true);
    try {
      await updateCert({ id: createId, status: 2 });
      message.success('审核通过');
      // 关闭审批弹窗
      setAuditModalOpen(false);
      setCreateOpen(false);
      setRejectReason('');
      setCreateId(-1);
      setFetch(true);
    } catch (error) {
      message.error('审核失败');
      console.error('审核操作失败:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  // 审核拒绝处理
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.warning('请输入拒绝原因');
      return;
    }
    if (!createId || createId === -1) {
      message.error('审核ID无效');
      return;
    }
    setCreateLoading(true);
    try {
      await updateCert({ id: createId, status: 3, reason: rejectReason });
      message.success('审核拒绝');
      // 关闭审批弹窗
      setAuditModalOpen(false);
      setCreateOpen(false);
      setRejectReason('');
      setCreateId(-1);
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
    // 只有审核中(status === 1)的记录才显示审批按钮
    const showAuditButton = record.status === 1 && canAudit;

    return (
      <Space size="small">
        {showAuditButton && (
          <Button type="primary" size="small" onClick={() => handleAuditAction(record)}>
            审批
          </Button>
        )}
        <Button type="primary" size="small" onClick={() => handleViewDetail(record)}>
          查看详情
        </Button>
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
      <Modal
        title={createTitle}
        open={isCreateOpen}
        onCancel={() => {
          setCreateOpen(false);
          setRejectReason('');
        }}
        width={600}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 用户信息 */}
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="用户姓名">{createData?.name}</Descriptions.Item>
            <Descriptions.Item label="身份证号">{createData?.card_id}</Descriptions.Item>
            <Descriptions.Item label="用户电话">{createData?.user_phone}</Descriptions.Item>
          </Descriptions>
        </div>
      </Modal>

      {/* 审批弹窗 */}
      <Modal
        title="审批实名认证"
        open={auditModalOpen}
        onCancel={() => {
          setAuditModalOpen(false);
          setRejectReason('');
          setCreateId(-1);
        }}
        footer={null}
        width={600}
      >
        {auditData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* 用户基本信息 */}
            <div>
              <div style={{ marginBottom: 12, fontSize: 16, fontWeight: 500 }}>用户基本信息</div>
              <Descriptions bordered column={1} size="small">
                <Descriptions.Item label="真实姓名">{auditData.name}</Descriptions.Item>
                <Descriptions.Item label="身份证号">{auditData.card_id}</Descriptions.Item>
                <Descriptions.Item label="用户电话">{auditData.user_phone}</Descriptions.Item>
                <Descriptions.Item label="申请时间">{auditData.created_time}</Descriptions.Item>
              </Descriptions>
            </div>
            {/* 身份证图片 */}
            <div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ marginBottom: 8, fontSize: 14, color: '#666' }}>身份证正面</div>
                  <ImagePreview
                    imageUrl={
                      auditData.front
                        ? [
                            {
                              uid: '1',
                              name: 'front',
                              status: 'done',
                              url: auditData.front,
                            },
                          ]
                        : []
                    }
                    alt="身份证正面"
                    baseUrl="http://192.168.10.7:8082"
                    width={280}
                    height={180}
                  />
                </div>
                <div>
                  <div style={{ marginBottom: 8, fontSize: 14, color: '#666' }}>身份证反面</div>
                  <ImagePreview
                    imageUrl={
                      auditData.back
                        ? [
                            {
                              uid: '2',
                              name: 'back',
                              status: 'done',
                              url: auditData.back,
                            },
                          ]
                        : []
                    }
                    alt="身份证反面"
                    baseUrl="http://192.168.10.7:8082"
                    width={280}
                    height={180}
                  />
                </div>
              </div>
            </div>
            {/* 审批操作 */}
            <div style={{ marginTop: 20, borderTop: '1px solid #f0f0f0', paddingTop: 20 }}>
              <div>
                <div style={{ marginBottom: 8, fontWeight: 500 }}>
                  <span style={{ color: 'red' }}>*</span> 审批意见（拒绝时必填）
                </div>
                <Input.TextArea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="请输入拒绝原因，便于用户了解并重新提交"
                  rows={4}
                  maxLength={200}
                  showCount
                />
              </div>
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Button
                  key="cancel"
                  onClick={() => {
                    setAuditModalOpen(false);
                    setRejectReason('');
                    setCreateId(-1);
                  }}
                  style={{ marginRight: 10 }}
                >
                  取消
                </Button>
                <Button
                  key="reject"
                  danger
                  loading={isCreateLoading}
                  onClick={handleReject}
                  style={{ marginRight: 10 }}
                >
                  拒绝
                </Button>
                <Button
                  key="approve"
                  type="primary"
                  loading={isCreateLoading}
                  onClick={handleApprove}
                >
                  通过
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 审核信息详情弹窗 */}
      <Modal
        title="审核详情"
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setAuditHistory([]);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setDetailModalOpen(false);
              setAuditHistory([]);
            }}
          >
            关闭
          </Button>,
        ]}
        width={700}
      >
        {detailData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              {auditHistory.length > 0 ? (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {auditHistory.map((record, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '12px',
                        border: '1px solid #f0f0f0',
                        borderRadius: '6px',
                        marginBottom: '8px',
                        backgroundColor: '#fafafa',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>审核人：{record.reviewer || '系统'}</span>
                        <span style={{ color: '#666', fontSize: '12px' }}>
                          {record.review_time || record.reviewTime}
                        </span>
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <span>状态：</span>
                        <span
                          style={{
                            color:
                              record.status === 2
                                ? '#52c41a'
                                : record.status === 3
                                  ? '#ff4d4f'
                                  : '#1890ff',
                          }}
                        >
                          {record.status === 1
                            ? '审核中'
                            : record.status === 2
                              ? '审核成功'
                              : '审核失败'}
                        </span>
                      </div>
                      {record.reason && (
                        <div style={{ color: '#666' }}>
                          <span>原因：</span>
                          <span>{record.reason}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                  暂无审批记录
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default CertPage;
