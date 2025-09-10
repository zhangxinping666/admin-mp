import { useCallback, useState, useRef, useEffect } from 'react';
import { message, Tooltip } from 'antd';
import { useTranslation } from 'react-i18next';
import { FileExcelOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { BaseBtn } from '@/components/Buttons';
import ExportProgressModal from './ExportProgressModal';
import {
  createExportTaskServe,
  getExportTaskStatusServe,
  downloadExportFileServe,
  exportExcelDirectServe,
} from '@/servers/trade-blotter';
import type { ExportTaskStatus } from '#/trade-blotter';

interface ExportExcelButtonProps {
  searchData: Record<string, any>;
  isLoading: boolean;
  hasExportPermission?: boolean;
}

const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({
  searchData,
  isLoading,
  hasExportPermission = true,
}) => {
  const { t } = useTranslation();
  const [messageApi, contextHolder] = message.useMessage();

  // 导出相关状态
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportStatus, setExportStatus] = useState<ExportTaskStatus>('pending');
  const [exportProgress, setExportProgress] = useState(0);
  const [exportTaskId, setExportTaskId] = useState<number | null>(null);

  // 使用useRef存储轮询定时器，而不是useState
  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  // 添加下载状态标志，防止重复下载
  const isDownloadingRef = useRef(false);
  // 添加是否已取消标志
  const isCancelledRef = useRef(false);
  // 添加是否已经处理过状态的标志（不管成功还是失败）
  const isHandledRef = useRef(false);
  // 添加正在导出的标志，避免重复点击
  const [isExporting, setIsExporting] = useState(false);

  // 清除轮询定时器
  const clearPollingTimer = useCallback(() => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  // 组件卸载时清除定时器
  useEffect(() => {
    return () => {
      clearPollingTimer();
      // 重置所有状态引用
      isDownloadingRef.current = false;
      isCancelledRef.current = false;
      isHandledRef.current = false;
    };
  }, [clearPollingTimer]);

  // 关闭导出进度弹窗
  const handleCloseExportModal = useCallback(() => {
    // 先停止所有轮询
    clearPollingTimer();
    // 重置所有状态
    setExportModalVisible(false);
    setExportTaskId(null);
    setExportProgress(0);
    setExportStatus('pending');
    setIsExporting(false);
    // 重置下载状态
    isDownloadingRef.current = false;
    // 重置取消状态
    isCancelledRef.current = false;
    // 重置处理状态
    isHandledRef.current = false;
  }, [clearPollingTimer]);

  // 处理文件下载
  const handleFileDownload = useCallback(
    async (filePath: string) => {
      try {
        // 如果已经在下载中，不重复下载
        if (isDownloadingRef.current) {
          return;
        }

        console.log('开始下载文件，原始路径:', filePath);

        // 设置下载状态为true，防止重复下载
        isDownloadingRef.current = true;

        const fileResponse = await downloadExportFileServe(filePath);

        // 创建Blob对象并下载
        const blob = fileResponse instanceof Blob ? fileResponse : new Blob([fileResponse]);

        // 检查blob是否为空或非预期格式（可能是错误响应）
        if (blob.size === 0) {
          throw new Error('Downloaded file is empty');
        }

        // 检查是否是Excel文件格式（简单检查）
        const firstBytes = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
        const excelSignatures = [
          [0x50, 0x4b, 0x03, 0x04], // .xlsx (ZIP format)
          [0xd0, 0xcf, 0x11, 0xe0], // .xls (OLE2 format)
        ];

        const isExcelFile = excelSignatures.some((signature) =>
          signature.every((byte, i) => byte === firstBytes[i]),
        );

        if (!isExcelFile) {
          console.error('Downloaded file is not an Excel file');
          throw new Error('Invalid file format');
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = '交易流水.xlsx';
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(url);
        document.body.removeChild(link);

        // 下载完成后，自动关闭弹窗（延迟2秒，让用户看到成功状态）
        setTimeout(() => {
          handleCloseExportModal();
        }, 2000);
      } catch (error) {
        console.error('文件下载失败:', error);
        console.error('文件路径:', filePath);

        // 根据错误类型显示不同的错误消息
        if (error instanceof Error && error.message === 'Invalid file format') {
          messageApi.error(t('tradeBlotter.exportInvalidFormat'));
        } else {
          messageApi.error(t('tradeBlotter.exportDownloadFailed'));
        }

        // 下载失败时更新状态为失败
        setExportStatus('failed');
        // 下载失败时重置下载状态
        isDownloadingRef.current = false;
      }
    },
    [messageApi, t, handleCloseExportModal],
  );

  // 取消导出任务
  const handleCancelExport = useCallback(() => {
    // 标记任务已取消
    isCancelledRef.current = true;
    // 清除轮询定时器
    clearPollingTimer();
    // 显示取消消息
    messageApi.info(t('tradeBlotter.exportCancelled'));
    // 关闭弹窗
    handleCloseExportModal();
  }, [clearPollingTimer, messageApi, t, handleCloseExportModal]);

  // 轮询任务状态
  const pollTaskStatus = useCallback(
    (taskId: number) => {
      // 清除之前的定时器
      clearPollingTimer();

      // 重置处理状态，确保新的轮询可以正常工作
      isHandledRef.current = false;

      // 设置最大轮询次数，避免无限轮询
      let pollCount = 0;
      const MAX_POLL_COUNT = 600; // 最多轮询10分钟 (600 * 1秒)

      // 立即执行一次查询，不用等待1秒
      const checkStatus = async () => {
        // 如果已取消或已处理状态，立即停止轮询
        if (isCancelledRef.current || isHandledRef.current) {
          clearPollingTimer();
          return;
        }

        try {
          // 超过最大轮询次数，停止轮询
          if (pollCount >= MAX_POLL_COUNT) {
            clearPollingTimer();
            setIsExporting(false);
            messageApi.warning(t('tradeBlotter.exportTimeout'));
            handleCloseExportModal();
            return;
          }

          pollCount++;

          const res = await getExportTaskStatusServe(taskId);

          if (res.code === 2000 && res.data) {
            const { status, progress = 0, file } = res.data;

            // 更新状态和进度（确保进度值在0-100之间）
            const validProgress = Math.min(100, Math.max(0, progress));
            setExportStatus(status);
            setExportProgress(validProgress);

            // 处理成功状态
            if (status === 'success' && file && !isHandledRef.current) {
              // 立即标记为已处理，防止重复处理
              isHandledRef.current = true;
              // 立即清除轮询定时器
              clearPollingTimer();
              // 重置导出状态
              setIsExporting(false);

              console.log('导出任务完成，文件路径:', file);
              // 触发文件下载
              handleFileDownload(file);
              return;
            }
            // 处理失败状态
            else if (status === 'failed' && !isHandledRef.current) {
              // 立即标记为已处理，防止重复处理
              isHandledRef.current = true;
              // 立即清除轮询定时器
              clearPollingTimer();
              // 重置导出状态
              setIsExporting(false);

              // 显示错误消息
              messageApi.error(t('tradeBlotter.exportFailed'));

              // 2秒后自动关闭弹窗
              setTimeout(() => {
                handleCloseExportModal();
              }, 2000);
              return;
            }
          }
        } catch (error) {
          console.error('Poll task status error:', error);
          // 发生错误时也增加计数
          pollCount++;

          // 如果轮询出错次数过多，停止轮询并重置状态
          if (pollCount > 5) {
            clearPollingTimer();
            setIsExporting(false);
            messageApi.error(t('tradeBlotter.exportFailed'));
            handleCloseExportModal();
          }
        }
      };

      // 立即执行一次
      checkStatus();

      // 然后设置定时器
      const timer = setInterval(checkStatus, 100); // 每1秒轮询一次，更频繁地更新进度

      // 保存定时器引用到ref中
      pollingTimerRef.current = timer;
    },
    [t, messageApi, clearPollingTimer, handleFileDownload, handleCloseExportModal],
  );

  // 判断是否有筛选条件
  const hasSearchParams = () => {
    // 检查searchData是否有实际的筛选条件
    const keys = Object.keys(searchData);
    if (keys.length === 0) return false;

    // 检查是否有非空的值
    // 注意：0 可能是有效的筛选值（比如状态为0表示全部），所以不应该排除
    // 只排除 undefined, null 和空字符串
    const hasValidParams = keys.some((key) => {
      const value = searchData[key];
      // 排除分页参数，它们不算筛选条件
      if (key === 'page' || key === 'page_size' || key === 'pageSize') {
        return false;
      }
      // 值不为 undefined、null、空字符串即为有效
      return value !== undefined && value !== null && value !== '';
    });
    
    console.log('筛选参数检查:', {
      searchData,
      hasValidParams,
      keys: keys.filter(k => !['page', 'page_size', 'pageSize'].includes(k))
    });
    
    return hasValidParams;
  };

  // 处理直接导出的文件
  const handleDirectExport = async (blob: Blob) => {
    try {
      // 检查blob是否为空
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().getTime();
      link.download = `交易流水_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(link);

      // 更新状态为成功
      setExportStatus('success');
      setExportProgress(100);

      // 延迟2秒后关闭弹窗
      setTimeout(() => {
        handleCloseExportModal();
      }, 2000);
    } catch (error) {
      console.error('Direct export error:', error);
      setExportStatus('failed');
      messageApi.error(t('tradeBlotter.exportDownloadFailed'));

      // 延迟2秒后关闭弹窗
      setTimeout(() => {
        handleCloseExportModal();
      }, 2000);
    }
  };

  // 处理导出 Excel 逻辑
  const handleExportExcel = async () => {
    // 如果正在导出，直接返回
    if (isExporting) {
      messageApi.warning(t('tradeBlotter.exportInProgress'));
      return;
    }

    const params = { ...searchData };
    setIsExporting(true);

    try {
      // 重置状态
      isHandledRef.current = false;
      isDownloadingRef.current = false;
      isCancelledRef.current = false;

      // 判断是否有筛选条件
      if (hasSearchParams()) {
        // 有筛选条件：同步导出（直接返回文件）
        console.log('同步导出模式：有筛选条件', params);

        // 显示导出进度弹窗
        setExportModalVisible(true);
        setExportStatus('processing');
        setExportProgress(0);

        // 模拟进度增长
        let progressRef = 0;
        const progressTimer = setInterval(() => {
          progressRef += 15;
          if (progressRef >= 90) {
            progressRef = 90;
            clearInterval(progressTimer);
          }
          setExportProgress(progressRef);
        }, 300);

        try {
          const blob = await exportExcelDirectServe(params);

          // 清除进度定时器
          clearInterval(progressTimer);
          setExportProgress(100);

          // 检查是否是Blob对象
          if (blob instanceof Blob) {
            console.log('导出成功，收到Blob对象，大小:', blob.size, 'bytes');
            await handleDirectExport(blob);
          } else {
            // 如果不是Blob，可能返回了JSON错误
            console.error('导出失败：响应不是Blob类型');
            console.error('响应类型:', typeof blob);
            console.error('响应内容:', blob);
            
            // 尝试解析错误信息
            let errorMsg = '导出失败';
            if (blob && typeof blob === 'object') {
              if (blob.message) errorMsg = blob.message;
              else if (blob.error) errorMsg = blob.error;
              else if (blob.msg) errorMsg = blob.msg;
            }
            
            setExportStatus('failed');
            messageApi.error(errorMsg);
            setTimeout(() => {
              handleCloseExportModal();
            }, 2000);
          }
        } catch (error: any) {
          console.error('同步导出出错:', error);
          console.error('错误详情:', {
            message: error.message,
            response: error.response,
            stack: error.stack
          });
          
          clearInterval(progressTimer);
          setExportStatus('failed');
          
          // 显示具体的错误信息
          let errorMsg = '导出失败';
          if (error.response?.data?.message) {
            errorMsg = error.response.data.message;
          } else if (error.message) {
            errorMsg = error.message;
          }
          
          messageApi.error(errorMsg);
          setTimeout(() => {
            handleCloseExportModal();
          }, 2000);
        } finally {
          setIsExporting(false);
        }
      } else {
        // 无筛选条件：异步导出（创建任务、轮询状态）
        console.log('异步导出模式：无筛选条件，需要轮询');
        console.log('导出参数:', params);

        const res = await createExportTaskServe(params);
        console.log('创建导出任务响应:', res);

        // 检查响应类型
        if (res.code === 2000 && res.data && res.data.task_id) {
          // 异步任务，需要轮询状态
          console.log('创建导出任务成功，task_id:', res.data.task_id);
          setExportTaskId(res.data.task_id);
          setExportModalVisible(true);
          setExportStatus('pending');
          setExportProgress(0);
          pollTaskStatus(res.data.task_id);
        } else {
          // 没有返回task_id的情况，重置导出状态
          console.error('创建导出任务失败，响应:', res);
          setIsExporting(false);
          
          // 显示具体错误信息
          let errorMsg = '创建导出任务失败';
          if (res.message) errorMsg = res.message;
          else if (res.error) errorMsg = res.error;
          
          messageApi.error(errorMsg);
        }
      }
    } catch (err: any) {
      console.error('导出异常:', err);
      console.error('异常详情:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      
      // 显示具体的错误信息
      let errorMsg = '导出失败';
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      messageApi.error(errorMsg);
      setIsExporting(false);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="flex items-center">
        <BaseBtn
          isLoading={isLoading || isExporting}
          onClick={handleExportExcel}
          icon={<FileExcelOutlined />}
          disabled={!hasExportPermission || isExporting}
        >
          {t('tradeBlotter.exportExcel')}
        </BaseBtn>
        <Tooltip title={t('tradeBlotter.exportExcelTip')}>
          <QuestionCircleOutlined className="ml-2 text-gray-400 cursor-pointer" />
        </Tooltip>
        <span className="ml-2 text-xs text-gray-400">{t('tradeBlotter.exportExcelTip')}</span>
      </div>

      {/* 导出进度弹窗 */}
      <ExportProgressModal
        visible={exportModalVisible}
        status={exportStatus}
        progress={exportProgress}
        onCancel={handleCloseExportModal}
        isDownloading={isDownloadingRef.current}
        onCancelExport={handleCancelExport}
      />
    </>
  );
};

export default ExportExcelButton;
