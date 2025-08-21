import React from 'react';
import { Modal, Progress, Typography, Result, Button } from 'antd';
import { ExportTaskStatus } from '../../../../types/trade-blotter';

const { Text } = Typography;

interface ExportProgressModalProps {
  visible: boolean;
  status: ExportTaskStatus;
  progress: number;
  onCancel: () => void;
  // 添加一个属性表示是否正在下载文件
  isDownloading?: boolean;
  // 添加取消导出的回调函数
  onCancelExport?: () => void;
}

const ExportProgressModal: React.FC<ExportProgressModalProps> = ({
  visible,
  status,
  progress,
  onCancel,
  isDownloading = false,
  onCancelExport,
}) => {
  // 渲染底部按钮
  const renderFooter = () => {
    // 只有在处理中或等待中状态才显示取消按钮
    if ((status === 'pending' || status === 'processing') && onCancelExport) {
      return (
        <Button type="default" onClick={onCancelExport}>
          取消导出
        </Button>
      );
    }

    // 成功状态下，只有在不是下载中时才显示关闭按钮
    if (status === 'success' && !isDownloading) {
      return (
        <Button type="primary" onClick={onCancel}>
          关闭
        </Button>
      );
    }

    // 失败状态下，始终显示关闭按钮
    if (status === 'failed') {
      return (
        <Button type="primary" onClick={onCancel}>
          关闭
        </Button>
      );
    }

    return null;
  };

  // 根据状态渲染不同内容
  const renderContent = () => {
    switch (status) {
      case 'pending':
        return (
          <div className="text-center py-6">
            <div className="mb-4">
              <div
                className="text-3xl font-bold mb-3"
                style={{ color: progress < 30 ? '#1890ff' : progress < 70 ? '#52c41a' : '#87d068' }}
              >
                {progress}%
              </div>
              <Progress
                percent={progress}
                status="active"
                showInfo={false}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                trailColor="#f0f0f0"
                strokeWidth={10}
                style={{ transition: 'all 0.3s ease' }}
              />
            </div>
            <Text className="text-gray-600">
              {progress === 0 ? '准备导出...' : progress < 30 ? '正在初始化...' : '等待处理中...'}
            </Text>
          </div>
        );
      case 'processing':
        return (
          <div className="text-center py-6">
            <div className="mb-4">
              <div
                className="text-3xl font-bold mb-3"
                style={{ color: progress < 30 ? '#1890ff' : progress < 70 ? '#52c41a' : '#87d068' }}
              >
                {progress}%
              </div>
              <Progress
                percent={progress}
                status="active"
                showInfo={false}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
                trailColor="#f0f0f0"
                strokeWidth={10}
                style={{ transition: 'all 0.3s ease' }}
              />
            </div>
            <Text className="text-gray-600">
              {progress === 0
                ? '正在准备导出...'
                : progress < 30
                  ? '正在收集数据...'
                  : progress < 60
                    ? '正在生成文件...'
                    : progress < 90
                      ? '即将完成...'
                      : '正在完成最后处理...'}
            </Text>
          </div>
        );
      case 'success':
        return (
          <Result
            status="success"
            title="导出成功"
            subTitle={isDownloading ? '正在下载文件...' : '您的文件已准备好下载'}
          />
        );
      case 'failed':
        return <Result status="error" title="导出失败" subTitle="请稍后重试" />;
      default:
        return null;
    }
  };

  return (
    <Modal
      title="导出进度"
      open={visible}
      onCancel={
        status === 'failed' || (status === 'success' && !isDownloading) ? onCancel : undefined
      }
      footer={renderFooter()}
      maskClosable={status === 'failed' || (status === 'success' && !isDownloading)}
      closable={status === 'failed' || (status === 'success' && !isDownloading)}
      width={400}
      centered
    >
      {renderContent()}
    </Modal>
  );
};

export default ExportProgressModal;
