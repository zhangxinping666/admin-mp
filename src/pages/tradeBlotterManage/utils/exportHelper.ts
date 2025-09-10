/**
 * 导出数据转换辅助函数
 * 用于将数字代码转换为用户可读的文字
 */

import { PAY_TYPE_OPTIONS, TRADE_STATUS_OPTIONS, CATEGORY_OPTIONS } from '../model';

/**
 * 转换支付类型
 */
export const formatPayType = (value: number): string => {
  const option = PAY_TYPE_OPTIONS.find(opt => opt.value === value);
  return option && option.value !== 0 ? option.label : '-';
};

/**
 * 转换交易状态
 */
export const formatTradeStatus = (value: number): string => {
  const option = TRADE_STATUS_OPTIONS.find(opt => opt.value === value);
  return option && option.value !== 0 ? option.label : '-';
};

/**
 * 转换分类
 */
export const formatCategory = (value: number): string => {
  const option = CATEGORY_OPTIONS.find(opt => opt.value === value);
  return option && option.value !== 0 ? option.label : '-';
};

/**
 * 格式化学校名称（未知学校显示为'-'）
 */
export const formatSchoolName = (name?: string | null): string => {
  if (!name || name === '未知' || name === '未知学校' || name === 'unknown') {
    return '-';
  }
  return name;
};

/**
 * 格式化金额（保留两位小数）
 */
export const formatAmount = (amount?: number | string): string => {
  if (amount === undefined || amount === null) {
    return '0.00';
  }
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return isNaN(numAmount) ? '0.00' : numAmount.toFixed(2);
};

/**
 * 格式化时间
 */
export const formatDateTime = (dateTime?: string | null): string => {
  if (!dateTime) {
    return '-';
  }
  try {
    const date = new Date(dateTime);
    if (isNaN(date.getTime())) {
      return '-';
    }
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '-';
  }
};

/**
 * 转换整条记录用于导出
 */
export interface ExportRecord {
  用户名: string;
  电话: string;
  省份: string;
  城市: string;
  学校: string;
  支付类型: string;
  交易状态: string;
  订单号: string;
  交易流水号: string;
  分类: string;
  金额: string;
  交易时间: string;
}

export const transformRecordForExport = (record: any): ExportRecord => {
  return {
    用户名: record.user_name || '-',
    电话: record.phone || '-',
    省份: record.province || '-',
    城市: record.city_name || '-',
    学校: formatSchoolName(record.school_name),
    支付类型: formatPayType(record.pay_type),
    交易状态: formatTradeStatus(record.pay_status),
    订单号: record.pay_order_num || '-',
    交易流水号: record.serial_number || '-',
    分类: formatCategory(record.category),
    金额: formatAmount(record.pay_amount),
    交易时间: formatDateTime(record.pay_time),
  };
};

/**
 * 批量转换记录用于导出
 */
export const transformRecordsForExport = (records: any[]): ExportRecord[] => {
  return records.map(transformRecordForExport);
};