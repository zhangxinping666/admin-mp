import { Menu, PaginationParams } from '../../pages/menuManage/model';
import request from '@/utils/request';
// 获取菜单列表
export function getMenuList(params: PaginationParams) {
  return request.get<MenuListResult>('/school/getSchool', { params });
}