import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../stores/token'; // Assuming these are your token utility functions

let refreshTokenPromise: Promise<string | null> | null = null;

const request: AxiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_APP_ENV === 'localhost' ? '/api' : import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

request.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    console.log('Request interceptor:', {
      url: config.url,
      method: config.method,
      hasToken: !!accessToken,
      tokenPreview: accessToken ? accessToken.substring(0, 20) + '...' : 'none',
    });

    if (accessToken) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
      console.log('No access token found, request without Authorization header');
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

request.interceptors.response.use(
  (response: AxiosResponse) => {
    const { data } = response;
    if (data && data.code === 4010) {
      console.log('Token expired code (4010) detected in a successful response. Rejecting...');
      return Promise.reject(createError(response.config, data.code, 'Token expired'));
    }
    return data;
  },
  async (error: AxiosError) => {
    if (!error.isAxiosError || !error.response) {
      console.error('An unexpected error occurred:', error);
      return Promise.reject(error);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig;
    const { status, data } = error.response;
    const errorCode = (data as any)?.code;

    if (status === 401 || errorCode === 4010) {
      console.log(`Authentication error detected (Status: ${status}, Code: ${errorCode}).`);

      if (originalRequest.url?.includes('/token/refresh')) {
        console.error('Refresh token is invalid or expired. Redirecting to login.');
        clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (!refreshTokenPromise) {
        console.log('Starting new token refresh process.');
        refreshTokenPromise = new Promise(async (resolve, reject) => {
          try {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available.');
            }

            const refreshInstance = axios.create({
              baseURL:
                import.meta.env.VITE_APP_ENV === 'localhost'
                  ? '/api'
                  : import.meta.env.VITE_API_BASE_URL,
              timeout: 10000,
            });

            const response = await refreshInstance.post('/token/refresh', {
              refresh_token: refreshToken,
            });

            const responseData = response.data;
            if (responseData.code !== 2000 || !responseData.data) {
              throw new Error('Failed to refresh token, server returned an error.');
            }

            const { access_token: newAccessToken, refresh_token: newRefreshToken } =
              responseData.data;

            if (!newAccessToken || !newRefreshToken) {
              throw new Error('Invalid token structure in refresh response.');
            }

            console.log('Token refresh successful.');
            setTokens(newAccessToken, newRefreshToken);
            resolve(newAccessToken);
          } catch (refreshError) {
            console.error('Critical error during token refresh:', refreshError);
            clearTokens();
            window.location.href = '/login';
            reject(refreshError);
          } finally {
            refreshTokenPromise = null;
          }
        });
      } else {
        console.log('A token refresh is already in progress. Waiting for it to complete.');
      }

      try {
        const newAccessToken = await refreshTokenPromise;

        if (newAccessToken && originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          console.log(`Retrying original request to: ${originalRequest.url}`);
          return request(originalRequest);
        } else {
          return Promise.reject(new Error('Failed to obtain new token for retry.'));
        }
      } catch (retryError) {
        console.error('The token refresh process failed. The original request cannot be retried.');
        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  },
);

function createError(
  config: InternalAxiosRequestConfig,
  code: number | undefined,
  message: string,
): AxiosError {
  const error = new Error(message) as AxiosError;
  error.config = config;
  error.isAxiosError = true;
  error.response = {
    data: { code, message },
    status: code === 4010 ? 401 : 500,
    statusText: message,
    headers: {},
    config: config,
  };
  return error;
}

export default request;
