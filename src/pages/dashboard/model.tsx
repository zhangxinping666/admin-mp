import { create } from 'zustand';
import { getDashboardStatistics } from '@/servers/dashboard';

/**
 * 提现统计 (今日待处理 / 累计成功)
 */
export interface WithdrawalStats {
  // 笔数
  count: number;
  // 总金额
  totalAmount: number;
}

/**
 * 资金（余额）相关统计
 */
export interface FundsStats {
  // 平台总余额
  platformTotalBalance: number;
  // 今日待处理的提现统计
  todayPendingWithdrawal: WithdrawalStats;
  // 累计已成功的提现统计
  cumulativeWithdrawal: WithdrawalStats;
}

/**
 * 今日金豆变动统计
 */
export interface BeansDailyStats {
  // 今日产出总量
  production: number;
  // 今日消耗总量
  consumption: number;
  // 今日净增量
  netIncrease: number;
}

/**
 * 金豆（虚拟货币）相关统计
 */
export interface BeansStats {
  // 金豆总存量
  platformTotalStock: number;
  // 今日的金豆变动统计
  today: BeansDailyStats;
}

/**
 * 仪表盘 data 字段的结构
 */
export interface DashboardData {
  // 资金（余额）相关统计
  funds: FundsStats;
  // 金豆（虚拟货币）相关统计
  beans: BeansStats;
}

/**
 * 顶层 API 响应结构
 */
export interface DashboardStatisticsResponse {
  code: number;
  message: string;
  data: DashboardData;
}

/**
 * Mock 数据 - 当接口请求失败时使用
 */
export const mockDashboardData: DashboardData = {
  funds: {
    platformTotalBalance: 0,
    todayPendingWithdrawal: {
      count: 0,
      totalAmount: 0,
    },
    cumulativeWithdrawal: {
      count: 0,
      totalAmount: 0,
    },
  },
  beans: {
    platformTotalStock: 0,
    today: {
      production: 0,
      consumption: 0,
      netIncrease: 0,
    },
  },
};

/**
 * Dashboard Store
 */
interface DashboardStore {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  data: mockDashboardData,
  loading: false,
  error: null,

  fetchData: async () => {
    set({ loading: true, error: null });

    try {
      // request 拦截器会直接返回 data 对象
      const response: DashboardStatisticsResponse = await getDashboardStatistics();

      // 拦截器已经处理了 code !== 2000 的情况，这里能到达说明 code === 2000
      if (response && response.data) {
        set({ data: response.data, loading: false });
      } else {
        // 数据格式不正确，使用 mock 数据
        console.warn('数据格式异常，使用 mock 数据');
        set({ data: mockDashboardData, loading: false, error: '数据格式异常' });
      }
    } catch (error) {
      // 请求失败（网络错误、业务错误等），使用 mock 数据
      console.error('获取仪表盘数据失败，使用 mock 数据:', error);
      set({
        data: mockDashboardData,
        loading: false,
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  },
}));