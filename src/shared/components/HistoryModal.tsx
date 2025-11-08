import React, { useMemo } from 'react';
import { Modal, Timeline, Card, Spin, Button, Typography } from 'antd';
import type { ReactNode } from 'react';

const { Text } = Typography;

/* ============================ 类型定义 ============================ */
export type AuditStatus = '3' | '1' | '2' | '待审核' | '已通过' | '已拒绝';

export interface AuditRecord {
  /** 审核状态 */
  status: AuditStatus;
  /** 操作人 */
  operatorName?: string;
  /** 审核意见 */
  remark?: string;
  /** 创建/发生时间 */
  createTime?: string | number | Date;
  /** 更新时间（可选） */
  updateTime?: string | number | Date;
  /** 其余业务字段 */
  [key: string]: unknown;
}

interface Props {
  open: boolean;
  onClose: () => void;
  data: AuditRecord[];
  loading?: boolean;
  title?: string;
  formatMap?: Record<string, (value: unknown) => string>;
}

/* ============================ 常量映射 ============================ */
const STATUS_META: Record<AuditStatus, { color: string; title: string }> = {
  '3': { color: 'blue', title: '待审核' },
  '1': { color: 'green', title: '审核通过' },
  '2': { color: 'red', title: '审核拒绝' },
  待审核: { color: 'blue', title: '待审核' },
  已通过: { color: 'green', title: '审核通过' },
  已拒绝: { color: 'red', title: '审核拒绝' },
};

const IGNORE_KEYS = new Set(['status', 'operatorName', 'remark', 'createTime', 'updateTime']);

/* ============================ 工具函数 ============================ */
const formatTime = (time?: string | number | Date): string => {
  if (!time) return '-';
  try {
    return new Date(time).toLocaleString('zh-CN');
  } catch {
    return String(time);
  }
};

const formatLabel = (key: string): string => {
  const map: Record<string, string> = {
    from_status: '原状态',
    to_status: '新状态',
    operator_name: '操作人',
    remark: '审核意见',
    storefront_image: '门店照片',
    business_license_image: '营业执照',
    food_license_image: '食品经营许可证',
    medical_certificate_image: '健康证',
    student_id_card_image: '学生证',
    identity_card_image: '身份证',
    amount: '订单金额',
    order_number: '订单号',
    pay_channel: '支付渠道',
    open_hour: '营业开始时间',
    close_hour: '营业结束时间',
    create_time: '创建时间',
    update_time: '更新时间',
    approval_time: '审核耗时',
  };
  return map[key] || key;
};

const formatValue = (key: string, value: unknown, formatMap?: Record<string, (value: unknown) => string>): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (formatMap && formatMap[key]) return formatMap[key](value);
  if (STATUS_META[value as AuditStatus]) return STATUS_META[value as AuditStatus].title;
  return String(value);
};

/* ============================ 组件实现 ============================ */
const HistoryModal: React.FC<Props> = ({
  open,
  onClose,
  data = [],
  loading = false,
  title = '历史审核记录',
  formatMap,
}) => {
  const timelineItems = useMemo(() => {
    if (!data.length) return null;
    return data.map((item, idx) => {
      const meta = STATUS_META[item.status] || STATUS_META['3'];
      const time = formatTime(item.createTime || item.updateTime);

      // 其余需要展示的字段
      const extraNodes: ReactNode[] = [];
      Object.entries(item).forEach(([k, v]) => {
        if (IGNORE_KEYS.has(k)) return;
        const isImage = k.endsWith('_image');
        extraNodes.push(
          <p key={k}>
            <Text strong>{formatLabel(k)}：</Text>
            {isImage ? (
              v ? (
                <ImagePreview
                  imageUrl={v as string}
                  alt={formatLabel(k)}
                  style={{ width: 100, height: 100 }}
                />
              ) : (
                '无数据'
              )
            ) : (
              formatValue(k, v, formatMap)
            )}
          </p>,
        );
      });

      return (
        <Timeline.Item key={idx} label={time} color={meta.color}>
          <Card size="small" title={meta.title}>
            <p>
              <Text strong>审核人：</Text>
              {item.operatorName || '-'}
            </p>
            <p>
              <Text strong>审核意见：</Text>
              {item.remark || '无'}
            </p>
            <p>
              <Text strong>创建时间：</Text>
              {formatTime(item.createTime) || '-'}
            </p>
            <p>
              <Text strong>更新时间：</Text>
              {formatTime(item.updateTime) || '-'}
            </p>
            {extraNodes}
          </Card>
        </Timeline.Item>
      );
    });
  }, [data]);

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      footer={<Button onClick={onClose}>关闭</Button>}
      width={800}
      centered
    >
      <Spin spinning={loading} tip="加载中...">
        {timelineItems ? (
          <Timeline mode="left">{timelineItems}</Timeline>
        ) : (
          <div style={{ textAlign: 'center', padding: 48 }}>暂无审核记录</div>
        )}
      </Spin>
    </Modal>
  );
};

export default HistoryModal;
