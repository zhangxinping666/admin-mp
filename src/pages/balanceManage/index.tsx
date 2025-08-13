import { CRUDPageTemplate } from '@/shared';
import { searchList, tableColumns, detailTableColumns, formList, type Balance } from './model';
import * as apis from './apis';
import { isNumber, isString } from 'lodash';
import { message, Modal, Table, Card, Statistic, Row, Col, Divider } from 'antd';
import { useState } from 'react';
import styles from './index.module.less';

// 初始化新增数据
const initCreate: Partial<Balance> = {
  user_id: 1,
  category: '',
  amount: 0,
  transaction_no: '',
  order_no: '',
  transaction_type: '',
  transaction_type_name: '',
  opening_balance: 0,
  closing_balance: 0,
  created_at: '',
};

// 获取数据
const getBalanceInfo = async (params?: any) => {
  const res = await apis.getBalanceInfo(params);
  return res;
};

// 余额明细管理
const BalanceRecordsPage = () => {
  // const optionRender = (
  //   record: BalanceRecord,
  //   actions: {
  //     handleEdit: (record: BalanceRecord) => void;
  //     handleDelete: (id: Key[]) => void;
  //   },
  // ) => <TableActions record={record} onEdit={actions.handleEdit} onDelete={actions.handleDelete} />;
  const [visible, setVisible] = useState(false);
  const [detailData, setDetailData] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<any>();
  const [currentUserInfo, setCurrentUserInfo] = useState<any>(null);

  return (
    <>
      <CRUDPageTemplate
        isAddOpen={false}
        isDelete={false}
        disableBatchUpdate={true}
        disableBatchDelete={true}
        title="余额明细管理"
        searchConfig={searchList()}
        columns={tableColumns.filter((col) => col.dataIndex !== 'action')}
        formConfig={formList()}
        initCreate={initCreate}
        onRow={(record: any) => {
          return {
            onClick: (event: any) => {
              event.stopPropagation();
              apis
                .getBalanceDetailInfo({ user_id: record.user_id })
                .then((res: any) => {
                  setDetailData(res.data.list || []);
                  setCurrentUserInfo(record);
                  setVisible(true);
                  setCurrentUserId(record.user_id);
                })
                .catch((err) => {
                  message.error('获取余额明细失败' + err);
                });
            },
          };
        }}
        // mockData={mockData}
        // optionRender={optionRender}
        apis={{
          fetchApi: getBalanceInfo,
        }}
      />
      <Modal
        title={<div className={styles.modalTitle}>用户 {currentUserId} 的余额明细</div>}
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

        {/* 详情表格 */}
        <Table
          className={styles.detailTable}
          columns={detailTableColumns}
          dataSource={detailData}
          rowKey="id"
          scroll={{ x: 1200 }}
          size="small"
          pagination={false}
          locale={{
            emptyText: (
              <div className={styles.emptyState}>
                <div className={styles.emptyText}>暂无交易记录</div>
              </div>
            ),
          }}
          rowClassName={(record, index) => {
            if (record.category === 'withdraw_failed') {
              return 'error-row';
            }
            return index % 2 === 0 ? 'even-row' : 'odd-row';
          }}
        />
      </Modal>
    </>
  );
};

export default BalanceRecordsPage;
