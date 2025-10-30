/**
 * 防抖函数 - 用于优化频繁触发的操作
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
      if (lastReject) {
        lastReject(new Error('Cancelled due to new request'));
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      lastResolve = resolve;
      lastReject = reject;
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