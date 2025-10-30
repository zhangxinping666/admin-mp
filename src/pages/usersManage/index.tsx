import { useState, useEffect } from 'react';
import {
  searchList,
  tableColumns,
  detailTableColumns,
  pointsDetailTableColumns,
  formList,
  searchDetailList,
  searchPointsDetailList,
  useLocationOptions,
  type User,
} from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { getUserList, updateUser, deleteUser } from '@/servers/user';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import { Key } from 'react';
import { message, Modal, Table, Card, Statistic, Row, Col, Divider } from 'antd';
import styles from './index.module.less';
import * as apis from '@/servers/balance';
import * as pointsApis from '@/servers/point';
import BaseCard from '@/components/Card/BaseCard';
import BaseSearch from '@/components/Search/BaseSearch';

// 初始化新增数据
const initCreate: Partial<User> = {
  id: 0,
  avatar: '',
  nickname: '',
  phone: '',
  school: '',
  wechat: '',
  alipay: '',
  last_time: '',
  status: 0, // 默认状态
};
const userApis = {
  fetch: getUserList,
  update: updateUser,
  delete: deleteUser,
};

const ColleaguesPage = () => {
  // 余额明细弹窗
  const [visible, setVisible] = useState(false);
  const [detailData, setDetailData] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<any>();
  const [currentUserInfo, setCurrentUserInfo] = useState<any>(null);
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 金豆明细弹窗
  const [pointsVisible, setPointsVisible] = useState(false);
  const [pointsDetailData, setPointsDetailData] = useState<any[]>([]);
  const [currentPointsUserId, setCurrentPointsUserId] = useState<any>();
  const [currentPointsUserInfo, setCurrentPointsUserInfo] = useState<any>(null);
  // 金豆明细分页状态
  const [pointsCurrentPage, setPointsCurrentPage] = useState(1);
  const [pointsPageSize, setPointsPageSize] = useState(10);
  const [pointsTotal, setPointsTotal] = useState(0);

  const { permissions, userInfo } = useUserStore();

  // 城市选项
  const locationOptions = useLocationOptions();

  // 为城市运营商自动加载所属城市的学校
  useEffect(() => {
    if (userInfo?.role_id === 5 && userInfo?.city_id) {
      locationOptions.loadSchools(userInfo.city_id);
    }
  }, [userInfo, locationOptions.loadSchools]);

  // 余额明细搜索
  const handleSearch = (values: any) => {
    const params = {
      page: 1,
      page_size: 10,
      start_date: values.time_range?.[0],
      end_date: values.time_range?.[1],
      ...values,
    };
    delete params.time_range;
    apis
      .getBalanceDetailInfo({ user_id: currentUserId, params })
      .then((res: any) => {
        setDetailData(res.data.list || []);
        setTotal(res.data.total || 0);
      })
      .catch((err) => {
        message.error('获取余额明细失败' + err);
      });
  };

  // 处理查看详情
  const handleViewDetails = (record: any, event?: React.MouseEvent) => {
    event?.stopPropagation();
    // 重置分页状态
    setCurrentPage(1);
    setPageSize(10);
    apis
      .getBalanceDetailInfo({ user_id: record.id })
      .then((res: any) => {
        setDetailData(res.data.list || []);
        setTotal(res.data.total || 0);
        setCurrentUserInfo(record);
        setVisible(true);
        setCurrentUserId(record.id);
      })
      .catch((err) => {
        message.error('获取余额明细失败' + err);
      });
  };

  // 金豆明细搜索
  const handlePointsSearch = (values: any) => {
    const params = {
      page: 1,
      page_size: 10,
      start_date: values.time_range?.[0],
      end_date: values.time_range?.[1],
      ...values,
    };
    delete params.time_range;
    pointsApis
      .getPointDetailList(currentPointsUserId, params)
      .then((res: any) => {
        setPointsDetailData(res.data.list || []);
        setPointsTotal(res.data.total || 0);
      })
      .catch((err) => {
        message.error('获取金豆明细失败: ' + err);
      });
  };

  // 处理查看金豆详情
  const handleViewPointsDetails = (record: any, event?: React.MouseEvent) => {
    event?.stopPropagation();
    // 重置分页状态
    setPointsCurrentPage(1);
    setPointsPageSize(10);

    const params = {
      page: 1,
      page_size: 10,
    };

    pointsApis
      .getPointDetailList(record.id, params)
      .then((res: any) => {
        setPointsDetailData(res.data.list || []);
        setPointsTotal(res.data.total || 0);
        setCurrentPointsUserInfo(record);
        setPointsVisible(true);
        setCurrentPointsUserId(record.id);
      })
      .catch((err) => {
        message.error('获取金豆明细失败: ' + err);
      });
  };
  /**
   * 处理分页变化
   * @param page 当前页码
   * @param pageSize 每页显示条数
   */
  const handlePaginationChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);

    const params = {
      page,
      page_size: pageSize,
    };

    apis
      .getBalanceDetailInfo({ user_id: currentUserId, params })
      .then((res: any) => {
        setDetailData(res.data.list || []);
      })
      .catch((err) => {
        message.error('获取余额明细失败' + err);
      });
  };

  /**
   * 处理金豆明细分页变化
   * @param page 当前页码
   * @param pageSize 每页显示条数
   */
  const handlePointsPaginationChange = (page: number, pageSize: number) => {
    setPointsCurrentPage(page);
    setPointsPageSize(pageSize);

    const params = {
      page,
      page_size: pageSize,
    };

    pointsApis
      .getPointDetailList(currentPointsUserId, params)
      .then((res: any) => {
        setPointsDetailData(res.data.list || []);
      })
      .catch((err) => {
        message.error('获取金豆明细失败: ' + err);
      });
  };
  /**
   * 根据总记录数动态生成合适的分页大小选项
   * @param total 总记录数
   * @returns 分页大小选项数组
   */
  const getDynamicPageSizeOptions = (total: number): string[] => {
    // 当total为0或小于10时，使用默认选项
    if (total <= 0) {
      return ['10', '20', '50'];
    }

    // 计算基础分页大小（总记录数的1/5）
    const baseSize = Math.max(10, Math.floor(total / 5));

    // 生成三个选项：基础大小、2倍基础大小、3倍基础大小，但不超过总记录数
    const option1 = Math.min(baseSize, total).toString();
    const option2 = Math.min(baseSize * 2, total).toString();
    const option3 = Math.min(baseSize * 3, total).toString();

    // 确保选项唯一且有序
    const uniqueOptions = Array.from(new Set([option1, option2, option3])).sort(
      (a, b) => parseInt(a) - parseInt(b),
    );

    // 如果选项不足三个，补充默认值
    while (uniqueOptions.length < 3) {
      const lastOption = parseInt(uniqueOptions[uniqueOptions.length - 1]);
      const nextOption = Math.min(lastOption * 2, total).toString();
      if (!uniqueOptions.includes(nextOption)) {
        uniqueOptions.push(nextOption);
      } else {
        break;
      }
    }

    return uniqueOptions;
  };

  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  // 编辑时的数据转换
  const handleEditOpen = (record: User) => {
    // 将 avatar 字段映射到 image 字段，因为表单期望的是 image 字段
    return {
      ...record,
      image: record.avatar,
    };
  };

  // 操作列渲染
  const optionRender = (
    record: User,
    actions: {
      handleEdit: (record: User) => void;
      handleDelete?: (id: Key[]) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:user:update');
    const canDelete = hasPermission('mp:user:delete');

    return (
      <TableActions
        record={record}
        onEdit={actions.handleEdit}
        onDelete={() => actions.handleDelete?.([record.id])}
        disableEdit={!canEdit}
        disableDelete={!canDelete}
      />
    );
  };

  return (
    <>
      <CRUDPageTemplate
        title="用户管理"
        isDelete={true}
        searchConfig={searchList(locationOptions, userInfo || undefined)}
        columns={tableColumns(handleViewDetails, handleViewPointsDetails).filter((col: any) => col.dataIndex !== 'action')}
        formConfig={formList()}
        initCreate={initCreate}
        onEditOpen={handleEditOpen}
        isAddOpen={false}
        disableCreate={true}
        disableBatchDelete={!hasPermission('mp:user:delete')}
        apis={{
          fetchApi: (params: any) => {
            return userApis.fetch(params);
          },
          updateApi: (data: any) => {
            return userApis.update(data);
          },
          deleteApi: (id: number[]) => userApis.delete(id),
        }}
        optionRender={optionRender}
      />
      <Modal
        title={
          <div className={styles.modalTitle}>
            用户 <span className={styles.userName}>{currentUserInfo?.nickname}</span> 的余额明细
          </div>
        }
        open={visible}
        width={'90%'}
        onCancel={() => setVisible(false)}
        footer={null}
        className={styles.detailModal}
      >
        {/* 交易统计卡片 */}
        <Card className={styles.statisticsCard} title="交易统计">
          <Row gutter={24}>
            <Col span={8}>
              <Statistic
                title="总交易笔数"
                value={detailData.length}
                valueStyle={{ color: '#1890ff', fontSize: '20px', fontWeight: 600 }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="收入笔数"
                value={detailData.filter((item) => item.transaction_type === 1).length}
                valueStyle={{ color: '#52c41a', fontSize: '20px', fontWeight: 600 }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="支出笔数"
                value={detailData.filter((item) => item.transaction_type === 2).length}
                valueStyle={{ color: '#ff4d4f', fontSize: '20px', fontWeight: 600 }}
              />
            </Col>
          </Row>
        </Card>

        <Divider className={styles.divider} />
        {/* 搜索区域 */}
        <BaseCard>
          <BaseSearch data={{}} list={searchDetailList()} handleFinish={handleSearch} />
        </BaseCard>
        {/* 详情表格 */}
        <Table
          className={styles.detailTable}
          columns={detailTableColumns}
          dataSource={detailData}
          rowKey="id"
          scroll={{ x: 1200 }}
          size="small"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            onChange: handlePaginationChange,
            showSizeChanger: true,
            pageSizeOptions: getDynamicPageSizeOptions(total),
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          locale={{
            emptyText: (
              <div className={styles.emptyState}>
                <div className={styles.emptyText}>暂无交易记录</div>
              </div>
            ),
          }}
          rowClassName={(record: any, index) => {
            if (record.category === 'withdraw_failed') {
              return 'error-row';
            }
            return index % 2 === 0 ? 'even-row' : 'odd-row';
          }}
        />
      </Modal>

      {/* 金豆明细弹窗 */}
      <Modal
        title={
          <div className={styles.modalTitle}>
            用户 <span className={styles.userName}>{currentPointsUserInfo?.nickname}</span> 的金豆明细
          </div>
        }
        open={pointsVisible}
        width={'90%'}
        onCancel={() => setPointsVisible(false)}
        footer={null}
        className={styles.detailModal}
      >
        {/* 金豆统计卡片 */}
        <Card className={styles.statisticsCard} title="金豆统计">
          <Row gutter={24}>
            <Col span={8}>
              <Statistic
                title="总变动笔数"
                value={pointsDetailData.length}
                valueStyle={{ color: '#faad14', fontSize: '20px', fontWeight: 600 }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="获得笔数"
                value={pointsDetailData.filter((item) => item.operation === 'earn').length}
                valueStyle={{ color: '#52c41a', fontSize: '20px', fontWeight: 600 }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="消费笔数"
                value={pointsDetailData.filter((item) => item.operation === 'spend').length}
                valueStyle={{ color: '#ff4d4f', fontSize: '20px', fontWeight: 600 }}
              />
            </Col>
          </Row>
        </Card>

        <Divider className={styles.divider} />
        {/* 搜索区域 */}
        <BaseCard>
          <BaseSearch data={{}} list={searchPointsDetailList()} handleFinish={handlePointsSearch} />
        </BaseCard>
        {/* 详情表格 */}
        <Table
          className={styles.detailTable}
          columns={pointsDetailTableColumns}
          dataSource={pointsDetailData}
          rowKey="id"
          scroll={{ x: 1500 }}
          size="small"
          pagination={{
            current: pointsCurrentPage,
            pageSize: pointsPageSize,
            total: pointsTotal,
            onChange: handlePointsPaginationChange,
            showSizeChanger: true,
            pageSizeOptions: getDynamicPageSizeOptions(pointsTotal),
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          locale={{
            emptyText: (
              <div className={styles.emptyState}>
                <div className={styles.emptyText}>暂无金豆明细记录</div>
              </div>
            ),
          }}
          rowClassName={(record: any, index) => {
            if (record.status === 4) {
              return 'error-row';
            }
            return index % 2 === 0 ? 'even-row' : 'odd-row';
          }}
        />
      </Modal>
    </>
  );
};

export default ColleaguesPage;
