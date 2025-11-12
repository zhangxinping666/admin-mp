//错误处理器
import type { AxiosError } from 'axios'

const ERROR_CODE_MAP: Record<number, { message: string; action?: () => void }> = {
  4000: {
    message: '请求参数错误,请检查输入',
  },
  4010: {
    message: 'Token 已过期',
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
    errorConfig.action?.();
  } else {
  }
}

export function handleHttpError(error: AxiosError): void {
  if (!error.response) {
    return;
  }
}