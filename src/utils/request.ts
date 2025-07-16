import { TOKEN } from '@/utils/config';
import { createRequest } from '@manpao/request';
import { getLocalInfo, removeLocalInfo } from '@manpao/utils';
import axios from 'axios';
import { message } from '@manpao/message';
import { StatusCode } from '@manpao/status-codes';

// 生成环境所用的接口
const baseUrl = import.meta.env.VITE_API_BASE_URL as string;
/**
 * 异常处理
 * @param error - 错误信息
 * @param content - 自定义内容
 */
const handleError = (error: string, content?: string) => {
  console.error('错误信息:', error);
  message.error({
    content: content || error || '服务器错误!',
    key: 'error',
  });
};

// 请求配置
export const request = createRequest(
  baseUrl,
  {
    // 接口请求拦截
    requestInterceptors(res) {
      const tokenLocal = getLocalInfo(TOKEN) || '';
      if (res?.headers && tokenLocal) {
        res.headers.Authorization = tokenLocal as string;
      }
      return res;
    },
    // 请求拦截超时
    requestInterceptorsCatch(err) {
      message.error('请求超时！');
      return err;
    },
    // 接口响应拦截
    responseInterceptors(res) {
      const { data } = res;
      // 权限不足
      if (data?.code === StatusCode.UNAUTHORIZED) {
        const lang = localStorage.getItem('lang');
        const enMsg = 'Insufficient permissions, please log in again!';
        const zhMsg = '权限不足，请重新登录！';
        const msg = lang === 'en' ? enMsg : zhMsg;
        removeLocalInfo(TOKEN);
        message.error({
          content: msg,
          key: 'error',
        });
        console.error('错误信息:', data?.message || msg);

        // 跳转登录页
        const url = window.location.href;
        if (url.includes('#')) {
          window.location.hash = '/login';
        } else {
          // window.location.href跳转会出现message无法显示情况，所以需要延时
          setTimeout(() => {
            window.location.href = '/login';
          }, 500);
        }
        return res;
      }

      // 错误处理
      if (data?.code !== StatusCode.SUCCESS) {
        console.log(data?.code);
        handleError(data?.message);
        return res;
      }

      return res;
    },
    responseInterceptorsCatch(err) {
      // 取消重复请求则不报错
      if (axios.isCancel(err)) {
        err.data = err.data || {};
        return err;
      }

      handleError('服务器错误！');
      return err;
    },
  },
  180 * 1000,
);

/**
 * 取消请求
 * @param url - 链接
 */
export const cancelRequest = (url: string | string[]) => {
  return request.cancelRequest(url);
};

/** 取消全部请求 */
export const cancelAllRequest = () => {
  return request.cancelAllRequest();
};
