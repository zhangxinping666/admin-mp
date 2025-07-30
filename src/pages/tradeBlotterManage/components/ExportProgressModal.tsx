import React from 'react';
import { Modal, Progress, Typography, Result, Button } from 'antd';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  // 渲染底部按钮
  const renderFooter = () => {
    // 只有在处理中或等待中状态才显示取消按钮
    if ((status === 'pending' || status === 'processing') && onCancelExport) {
      return (
        <Button type="default" onClick={onCancelExport}>
          {t('tradeBlotter.cancelExport')}
        </Button>
      );
    }
    
    // 成功状态下，只有在不是下载中时才显示关闭按钮
    if (status === 'success' && !isDownloading) {
      return (
        <Button type="primary" onClick={onCancel}>
          {t('public.close')}
        </Button>
      );
    }
    
    // 失败状态下，始终显示关闭按钮
    if (status === 'failed') {
      return (
        <Button type="primary" onClick={onCancel}>
          {t('public.close')}
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
          <div className="text-center">
            <Progress percent={0} status="active" />
            <Text>{t('tradeBlotter.exportPending')}</Text>
          </div>
        );
      case 'processing':
        return (
          <div className="text-center">
            <Progress percent={progress} status="active" />
            <Text>{t('tradeBlotter.exportProcessing')}</Text>
          </div>
        );
      case 'success':
        return (
          <Result
            status="success"
            title={t('tradeBlotter.exportSuccess')}
            subTitle={isDownloading 
              ? t('tradeBlotter.exportDownloading') 
              : t('tradeBlotter.exportSuccessDesc')}
          />
        );
      case 'failed':
        return (
          <Result
            status="error"
            title={t('tradeBlotter.exportFailed')}
            subTitle={t('tradeBlotter.exportFailedDesc')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      title={t('tradeBlotter.exportProgress')}
      open={visible}
      onCancel={status === 'failed' || ((status === 'success') && !isDownloading) ? onCancel : undefined}
      footer={renderFooter()}
      maskClosable={status === 'failed' || ((status === 'success') && !isDownloading)}
      closable={status === 'failed' || ((status === 'success') && !isDownloading)}
    >
      {renderContent()}
    </Modal>
  );
};

export default ExportProgressModal;