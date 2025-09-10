// 登录接口传入数据
export interface LoginData {
  account: string;
  password: string;
  captcha_code: string;
  captcha_id?: string;
}

// 登录接口返回数据
export interface LoginResult {
  code: number;
  data: LoginData;
  messages: string;
}

export interface LoginData{
    id: number;
    account_id: string;
    name: string;
    access_token: string;
    refresh_token: string;
    status: number;
  };

/**
 * @description 用户基础信息结构
 */
export interface UserInfo {
  id: number;
  account_id: string;
  name: string;
  phone: string;
  school_id: number;
  school_name: string;
  city_id: number;
  role_id: number;
  role_name: string;
  status: number;
}

/**
 * @description 【独立的】获取用户信息API的响应结构
 */
export interface UserInfoResponse {
  code: number;
  message: string;
  // data 字段直接就是 UserInfo 对象
  data: UserInfo;
}
/**
 * @description 菜单项的结构 (支持递归)
 */
export interface MenuItem {
  component_path: string;
  icon: string;
  key: number;
  label: string;
  permission: string;
  pid: number;
  route_path: string;
  sort: number;
  type: number;
}

/**
 * @description 权限数据的结构 (包含权限点和菜单)
 */
export interface PermissionsData {
  perms: string[];
  menus: MenuItem[];
}

/**
 * @description 【独立的】获取用户权限与菜单API的响应结构
 */
export interface PermissionsResponse {
  code: number;
  message: string;
  data: PermissionsData;
}

export interface CaptchaData {
  captcha_id: string;
  captcha_image: string;
}

export interface CaptchaApiResponse {
  code: number;
  data: CaptchaData;
  messages: string;
}