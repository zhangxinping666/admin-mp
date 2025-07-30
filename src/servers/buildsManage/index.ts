import request from '@/utils/request';

/**
 * 楼栋列表
 * @param data - 请求数据
 * @returns - 响应数据
 */
export function getBuildsList(data?: object) {
  return request.get('/school/getBuilding', { params: data });
}

/**
 * 新增楼栋
 * @param data - 请求数据
 * @returns - 响应数据
 */
export function createBuild(data?: object) {
  return request.post('/school/addBuilding', { params: data });
}
