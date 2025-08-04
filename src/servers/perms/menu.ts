import {
  MenuListResult,
  PaginationParams,
  MenuSearchParams,
  MenuAddForm,
  MenuUpdateForm,
  MenuDetailResult,
} from '../../pages/permissionManage/menuManage/model';
import request from '@/utils/request';

// 获取菜单列表（支持筛选参数）
export function getMenuList(data: MenuSearchParams) {
  return request.get<MenuListResult>('/menu/get', { params: data });
}

//详情
export function getMenuDetail(id: number) {
  return request.get<MenuDetailResult>(`/menu/detail?id=${id}`);
}

//添加
export function addMenu(data: MenuAddForm) {
  return request.post('/menu/add', data);
}

//更新
export function updateMenu(data: MenuUpdateForm) {
  return request.post('/menu/update', data);
}

//删除
export function deleteMenu(id: Array<number>) {
  return request.delete('/menu/delete', { data: { id_list: id } });
}

//获取菜单下拉列表
export function getMenuSelectList(params?: { type?: string[] }) {
  // 将数组参数转换为逗号分隔的字符串
  const processedParams = params?.type
    ? {
        ...params,
        type: params.type.join(','),
      }
    : params;

  return request.get(`/menu/list`, { params: processedParams });
}
