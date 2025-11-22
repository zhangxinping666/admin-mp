//请求去重机制
import type { AxiosRequestConfig } from "axios";
const pendingRequests = new Map<string, AbortController>();

//生成请求的唯一标识
function generateRequestKey(config: AxiosRequestConfig): string {
  const { method, url, params, data } = config;
  return [method, url, JSON.stringify(params), JSON.stringify(data)].join('&');
}

//添加请求到pending队列 如果有相同的请求则取消新请求
export function addPendingRequest(config: AxiosRequestConfig): void {
  const requestKey = generateRequestKey(config)
  if (pendingRequests.has(requestKey)) {
    //取消重复请求
    const controller = new AbortController()
    config.signal = controller.signal;
    controller.abort(`请求已经被取消: ${config.url}`)
    return
  }

  //添加新的AbortController
  const controller = new AbortController();
  config.signal = controller.signal
  pendingRequests.set(requestKey, controller)
}

//从队列中移除请求
export function removePendingRequest(config: AxiosRequestConfig): void {
  const requestKey = generateRequestKey(config);
  pendingRequests.delete(requestKey)
}

export function clearPedingRequests(): void {
  pendingRequests.forEach((controller) => {
    controller.abort('用户登出,取消所有请求')
  })
  pendingRequests.clear()
}
