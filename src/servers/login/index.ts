import type {
  LoginData,
  LoginResult,
  UserInfoResponse,
  PermissionsResponse,
  CaptchaApiResponse
} from '@/pages/login/model';
import request from '@/utils/request';

/**
 * 登录
 * @param data - 请求数据
 */
export function login(data: LoginData) {
  return request.post<LoginResult>('/backstage/login', data);
}

/**
 * 忘记密码
 * @param data - 请求数据
 */
export function forgetPassword(data: object) {
  return request.post('/forget-password', data);
}

/**
 * 获取用户基本信息
 */
export function getUserInfoServe() {
  return request.get<UserInfoResponse>('/backstage/userInfo');
}

// 获取用户权限
export function getPermissions(data: object) {
  return request.get<PermissionsResponse>('/backstage/menu', { params: data });
}

//刷新token
export function refreshToken(refresh_token: string) {
  return request.post('/token/refresh', { refresh_token });
}

//获取验证码
export function getCode() {
  return request.get<CaptchaApiResponse>('/backstage/captcha');
}
