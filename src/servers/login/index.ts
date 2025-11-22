import type {
  LoginData,
  LoginResult,
  UserInfoResponse,
  PermissionsResponse,
  CaptchaApiResponse
} from '@/pages/login/model';
import request from '@/utils/request';

// 登录
export function login(data: LoginData) {
  return request.post<LoginResult>('/backstage/login', data);
}


// 获取用户基本信息
export function getUserInfoServe() {
  return request.get<UserInfoResponse>('/backstage/userInfo');
}

// 获取用户权限
export function getPermissions(data: object) {
  return request.get<PermissionsResponse>('/backstage/menu', { params: data });
}

//获取验证码
export function getCode() {
  return request.get<CaptchaApiResponse>('/backstage/captcha');
}

// 登出接口
export const logout = () => {
  return request.post('/backstage/logout');
};