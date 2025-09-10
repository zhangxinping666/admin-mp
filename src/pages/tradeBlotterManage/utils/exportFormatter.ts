/**
 * 交易流水导出数据格式化工具
 * 将数字代码转换为用户可读的文字
 */

import { PAY_TYPE_OPTIONS, TRADE_STATUS_OPTIONS, CATEGORY_OPTIONS } from '../model';
import dayjs from 'dayjs';

// 支付类型映射
const PAY_TYPE_MAP: Record<number, string> = {
  1: '微信',
  2: '支付宝',
};

// 交易状态映射
const TRADE_STATUS_MAP: Record<number, string> = {
  1: '失败',
  2: '成功',
};

// 类别映射
const CATEGORY_MAP: Record<number, string> = {
  1: '商家入驻',
  2: '推广',
  3: '退款',
};

/**
 * 格式化单条交易流水数据
 * @param record 原始数据记录
 * @returns 格式化后的数据
 */
export const formatTradeRecord = (record: any) => {
  // 处理学校字段的特殊值
  const formatSchool = (school: any) => {
    if (!school || school === 'null' || school === 'undefined' || 
        (typeof school === 'string' && school.trim() === '')) {
      return '-';
    }
    if (school === '未知学校' || school.toLowerCase() === 'unknown') {
      return '-';
    }
    return school;
  };

  // 处理金额格式化
  const formatAmount = (amount: any) => {
    if (amount === null || amount === undefined || amount === '') {
      return '-';
    }
    const num = Number(amount);
    if (isNaN(num)) {
      return '-';
    }
    return `¥${num.toFixed(2)}`;
  };

  // 处理日期格式化
  const formatDate = (date: any) => {
    if (!date) {
      return '-';
    }
    try {
      return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
    } catch {
      return '-';
    }
  };
  
  return {
    // 保留原始ID用于识别
    id: record.id,
    // 用户名
    user_name: record.user_name || '-',
    // 流水号
    flow_no: record.flow_no || '-',
    // 第三方流水号
    third_flow_no: record.third_flow_no || '-',
    // 类别 - 转换数字为文字
    category: CATEGORY_MAP[record.category] || 
              (record.category === 0 ? '全部' : record.category) || '-',
    // 金额（保留两位小数）
    amount: formatAmount(record.amount),
    // 订单号
    order_no: record.order_no || '-',
    // 省份
    province: record.province || '-',
    // 城市
    city: record.city || '-',
    // 学校 - 特殊处理
    school: formatSchool(record.school),
    // 支付类型 - 转换数字为文字
    pay_type: PAY_TYPE_MAP[record.pay_type] || 
              (record.pay_type === 0 ? '全部' : 
               record.pay_type ? `支付类型${record.pay_type}` : '-'),
    // 交易状态 - 转换数字为文字
    status: TRADE_STATUS_MAP[record.status] || 
            (record.status === 0 ? '全部' : 
             record.status ? `状态${record.status}` : '-'),
    // 创建时间
    created_time: formatDate(record.created_time),
    // 更新时间（如果有）
    updated_time: record.updated_time ? formatDate(record.updated_time) : '-',
  };
};

/**
 * 批量格式化交易流水数据
 * @param records 原始数据数组
 * @returns 格式化后的数据数组
 */
export const formatTradeRecords = (records: any[]): any[] => {
  // TODO(human): 实现批量格式化
  // 1. 验证输入数据
  // 2. 使用 map 批量转换
  // 3. 处理异常数据
  
  if (!Array.isArray(records)) {
    console.error('formatTradeRecords: 输入数据不是数组');
    return [];
  }
  
  return records.map(record => {
    try {
      return formatTradeRecord(record);
    } catch (error) {
      console.error('格式化记录失败:', error, record);
      // 如果格式化失败，返回原始数据
      return record;
    }
  });
};

/**
 * 获取导出的Excel列配置
 * @returns Excel列配置数组
 */
export const getExportColumns = () => {
  // TODO(human): 定义导出的列配置
  // 1. 指定导出的字段顺序
  // 2. 设置列标题
  // 3. 设置列宽度
  
  return [
    { field: 'user_name', title: '用户名', width: 100 },
    { field: 'flow_no', title: '流水号', width: 160 },
    { field: 'third_flow_no', title: '第三方流水号', width: 160 },
    { field: 'category', title: '类别', width: 100 },
    { field: 'amount', title: '金额', width: 100 },
    { field: 'order_no', title: '订单号', width: 160 },
    { field: 'province', title: '省份', width: 100 },
    { field: 'city', title: '城市', width: 100 },
    { field: 'school', title: '学校', width: 120 },
    { field: 'pay_type', title: '支付类型', width: 100 },
    { field: 'status', title: '交易状态', width: 100 },
    { field: 'created_time', title: '创建时间', width: 180 },
  ];
};