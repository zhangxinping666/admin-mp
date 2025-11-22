import { Card, Statistic, Row, Col } from 'antd';
import type { CSSProperties } from 'react';
import {
  WalletOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';

interface StatisticCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  color?: string;
  subItems?: Array<{
    label: string;
    value: number;
    prefix?: string;
    suffix?: string;
  }>;
}

export const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  prefix = '¥',
  suffix,
  icon,
  color = '#1890ff',
  subItems,
}) => {
  const iconStyle: CSSProperties = {
    fontSize: 48,
    color,
    opacity: 0.15,
    position: 'absolute',
    right: 24,
    top: 24,
  };

  return (
    <Card
      bordered={false}
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
      }}
      styles={{
        body: { padding: '24px' },
      }}
    >
      <div style={iconStyle}>{icon || <WalletOutlined />}</div>

      <Statistic
        title={
          <span style={{ fontSize: 14, color: '#666' }}>{title}</span>
        }
        value={value}
        precision={2}
        prefix={prefix}
        suffix={suffix}
        valueStyle={{
          fontSize: 28,
          fontWeight: 600,
          color: color
        }}
      />

      {subItems && subItems.length > 0 && (
        <Row gutter={16} style={{ marginTop: 24 }}>
          {subItems.map((item, index) => (
            <Col span={12} key={index}>
              <Statistic
                title={
                  <span style={{ fontSize: 12, color: '#999' }}>
                    {item.label}
                  </span>
                }
                value={item.value}
                precision={2}
                prefix={item.prefix}
                suffix={item.suffix}
                valueStyle={{ fontSize: 16 }}
              />
            </Col>
          ))}
        </Row>
      )}
    </Card>
  );
};

interface CountCardProps {
  title: string;
  count: number;
  amount: number;
  icon?: React.ReactNode;
  color?: string;
}

export const CountCard: React.FC<CountCardProps> = ({
  title,
  count,
  amount,
  icon,
  color = '#52c41a',
}) => {
  const iconStyle: CSSProperties = {
    fontSize: 48,
    color,
    opacity: 0.15,
    position: 'absolute',
    right: 24,
    top: 24,
  };

  return (
    <Card
      bordered={false}
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
      }}
      styles={{
        body: { padding: '24px' },
      }}
    >
      <div style={iconStyle}>{icon || <DollarOutlined />}</div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
          {title}
        </div>
        <div style={{ fontSize: 28, fontWeight: 600, color }}>
          {count} <span style={{ fontSize: 16, color: '#999' }}>笔</span>
        </div>
      </div>

      <Statistic
        title={<span style={{ fontSize: 12, color: '#999' }}>总金额</span>}
        value={amount}
        precision={2}
        prefix="¥"
        valueStyle={{ fontSize: 16 }}
      />
    </Card>
  );
};

interface BeansCardProps {
  title: string;
  production: number;
  consumption: number;
  netIncrease: number;
  color?: string;
}

export const BeansCard: React.FC<BeansCardProps> = ({
  title,
  production,
  consumption,
  netIncrease,
  color = '#faad14',
}) => {
  const iconStyle: CSSProperties = {
    fontSize: 48,
    color,
    opacity: 0.15,
    position: 'absolute',
    right: 24,
    top: 24,
  };

  const isPositive = netIncrease >= 0;

  return (
    <Card
      bordered={false}
      style={{
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
      }}
      styles={{
        body: { padding: '24px' },
      }}
    >
      <div style={iconStyle}>
        {isPositive ? <RiseOutlined /> : <FallOutlined />}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
          {title}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: isPositive ? '#52c41a' : '#ff4d4f',
          }}
        >
          {isPositive ? '+' : ''}
          {netIncrease.toFixed(2)}
          <span style={{ fontSize: 16, color: '#999', marginLeft: 4 }}>
            金豆
          </span>
        </div>
      </div>

      <Row gutter={16}>
        <Col span={12}>
          <Statistic
            title={<span style={{ fontSize: 12, color: '#999' }}>产出</span>}
            value={production}
            precision={2}
            valueStyle={{ fontSize: 16, color: '#52c41a' }}
            prefix={<RiseOutlined />}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title={<span style={{ fontSize: 12, color: '#999' }}>消耗</span>}
            value={consumption}
            precision={2}
            valueStyle={{ fontSize: 16, color: '#ff4d4f' }}
            prefix={<FallOutlined />}
          />
        </Col>
      </Row>
    </Card>
  );
};
