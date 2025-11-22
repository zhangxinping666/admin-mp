import { useEffect } from 'react';
import { Row, Col, Spin, Alert, Typography, Space } from 'antd';
import {
  WalletOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  GoldOutlined,
} from '@ant-design/icons';
import { useDashboardStore } from './model';
import { StatisticCard, CountCard, BeansCard, BeansChart } from './components';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const { data, loading, error, fetchData } = useDashboardStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div style={{ padding: '24px', background: '#f7f8f8ff', minHeight: '100vh' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {error && (
          <Alert
            message="数据加载失败"
            description={`${error}，当前显示为默认数据`}
            type="warning"
            showIcon
            closable
          />
        )}

        <Spin spinning={loading} tip="加载中...">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <StatisticCard
                title="平台总余额"
                value={data.funds.platformTotalBalance}
                icon={<WalletOutlined />}
                color="#1890ff"
              />
            </Col>

            <Col xs={24} sm={24} md={12} lg={8} xl={8}>
              <CountCard
                title="今日待处理提现"
                count={data.funds.todayPendingWithdrawal.count}
                amount={data.funds.todayPendingWithdrawal.totalAmount}
                icon={<ClockCircleOutlined />}
                color="#faad14"
              />
            </Col>

            <Col xs={24} sm={24} md={12} lg={8} xl={8}>
              <CountCard
                title="累计成功提现"
                count={data.funds.cumulativeWithdrawal.count}
                amount={data.funds.cumulativeWithdrawal.totalAmount}
                icon={<CheckCircleOutlined />}
                color="#52c41a"
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} sm={24} md={12} lg={8} xl={8}>
              <StatisticCard
                title="金豆总存量"
                value={data.beans.platformTotalStock}
                prefix=""
                suffix="金豆"
                icon={<GoldOutlined />}
                color="#faad14"
              />
            </Col>

            <Col xs={24} sm={24} md={12} lg={8} xl={8}>
              <BeansCard
                title="今日金豆净增"
                production={data.beans.today.production}
                consumption={data.beans.today.consumption}
                netIncrease={data.beans.today.netIncrease}
              />
            </Col>

            <Col xs={24} sm={24} md={24} lg={8} xl={8}>
              <StatisticCard
                title="今日金豆明细"
                value={data.beans.today.production}
                prefix=""
                suffix="金豆"
                icon={<DollarOutlined />}
                color="#52c41a"
                subItems={[
                  {
                    label: '产出',
                    value: data.beans.today.production,
                    prefix: '',
                    suffix: '金豆',
                  },
                  {
                    label: '消耗',
                    value: data.beans.today.consumption,
                    prefix: '',
                    suffix: '金豆',
                  },
                ]}
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} sm={24} md={24} lg={24} xl={24}>
              <BeansChart data={data.beans.today} />
            </Col>
          </Row>
        </Spin>
      </Space>
    </div>
  );
};

export default Dashboard;
