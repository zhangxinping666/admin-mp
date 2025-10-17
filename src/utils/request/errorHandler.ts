//错误处理器

import { message } from 'antd'
import type { AxiosError } from 'axios'

const ERROR_CODE_MAP: Record<number, { message: string; action?: () => void }> = {
  4000: {
    message: 'Token 已过期',
  },
  4010: {
    message: '请求参数错误,请检查输入',
  },
  4230: {
    message: '无权限访问此资源',
    action: () => {
      window.location.href = '/403';
    },
  },
}

export function handleBusinessError(code: number, msg?: string): void {
  const errorConfig = ERROR_CODE_MAP[code];
  if (errorConfig) {
    message.error(msg || errorConfig.message);
    errorConfig.action?.();
  } else {
    // 未定义的业务码
    message.error(msg || `请求失败(错误码: ${code})`);
  }
}

export function handleHttpError(error: AxiosError): void {
  if (!error.response) {
    // 网络错误或请求被取消
    if (error.message.includes('已被取消')) {
      console.warn('[Request] Cancelled:', error.config?.url);
      return; // 静默处理
    }
    message.error('网络连接失败,请检查网络');
    return;
  }

  const { status } = error.response;
  const statusMessages: Record<number, string> = {
    400: '请求参数错误',
    401: '未授权,请重新登录',
    403: '无权限访问',
    404: '请求资源不存在',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务不可用',
  };

  message.error(statusMessages[status] || `请求失败(HTTP ${status})`);

}