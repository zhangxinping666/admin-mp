/**
 * 防抖函数 - 用于优化频繁触发的操作
 * @param func 要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null;
  let lastResolve: ((value: any) => void) | null = null;
  let lastReject: ((reason?: any) => void) | null = null;

  return function (...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise((resolve, reject) => {
      // 如果有待处理的 promise，先拒绝它
      if (lastReject) {
        lastReject(new Error('Cancelled due to new request'));
      }

      // 清除之前的定时器
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // 保存新的 resolve 和 reject
      lastResolve = resolve;
      lastReject = reject;

      // 设置新的定时器
      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args);
          if (lastResolve === resolve) {
            resolve(result);
            lastResolve = null;
            lastReject = null;
          }
        } catch (error) {
          if (lastReject === reject) {
            reject(error);
            lastResolve = null;
            lastReject = null;
          }
        }
      }, delay);
    });
  };
}