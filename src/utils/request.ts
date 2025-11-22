import axios from "axios";
import { setupRequestInterceptor, setupResponseInterceptor } from './request/interceptors';
// 创建主请求实例
const request = axios.create({
  baseURL: import.meta.env.VITE_APP_ENV === 'localhost' ? '/api' : import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// 配置拦截器
setupRequestInterceptor(request);
setupResponseInterceptor(request);
export default request;