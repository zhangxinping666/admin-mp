//内存变量存储accesstoken 优先读取
let memoryAccessToken: string = '';
// 内存变量存储access-token
export const getAccessToken = (): string => {
  // 优先从内存读取
  if (memoryAccessToken) {
    return memoryAccessToken;
  }

  // 从 sessionStorage 恢复（页面刷新后）
  const sessionToken = sessionStorage.getItem('access_token');
  if (sessionToken) {
    memoryAccessToken = sessionToken;
    return sessionToken;
  }
  return '';
};

// 设置 Access Token
export const setAccessToken = (token: string): void => {
  memoryAccessToken = token;
  if (token) {
    sessionStorage.setItem('access_token', token);
  } else {
    sessionStorage.removeItem('access_token');
  }
};

// 清除 Access Token
export const clearAccessToken = (): void => {
  memoryAccessToken = '';
  sessionStorage.removeItem('access_token');
};

//清除token
export const clearAllTokens = (): void => {
  clearAccessToken();
};