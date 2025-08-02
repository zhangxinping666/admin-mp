import { getBuildsList } from '@/servers/buildsManage';
import request from '@/utils/request';
import { NumericDictionary } from 'lodash';
import { Key } from 'react';

const apis = {
  getBuildsList: '/school/getBuilding',
  getFloorList: '/school/getFloor',
  addBuilding: '/school/addBuilding',
  updateBuilding: '/school/updateBuilding',
  deleteBuilding: '/school/deleteBuilding',
  addFloor: '/school/addFloor',
  updateFloor: '/school/updateFloor',
  deleteFloor: '/school/deleteFloor',
  getSchoolsList: '/school/getSchool',
  addSchool: '/school/addSchool',
  updateSchool: '/school/updateSchool',
  deleteSchool: '/school/deleteSchool',
};

/**
 * 添加楼栋
 * @param data 楼栋数据
 */
export function addBuilding(data: {
  name: string;
  school_id: number;
  address: string;
  longitude: number;
  latitude: number;
  status?: number;
}) {
  return request.post(apis.addBuilding, data);
}

// 查询楼栋
export function queryBuilding(params?: any) {
  return request.get(apis.getBuildsList, { params });
}

// 更新楼栋
export function updateBuilding(data: {
  id: number;
  name: string;
  school_id?: number;
  address?: string;
  longitude?: number;
  latitude?: number;
  status?: number;
}) {
  return request.put(apis.updateBuilding, data);
}

/**
 * 批量删除楼栋
 * @param param id_list
 *  */
export function deleteBuilding(data: any) {
  return request.delete(apis.deleteBuilding, {
    data: {
      id_list: data,
    },
  });
}

/**
 *查询楼层
 * @param data
 * school_building_id
 * @returns
 */
export function queryFloorItem(params?: any) {
  return request.get(apis.getFloorList, { params });
}

// 添加楼层
export function addFloorItem(data: { school_building_id: number; layer: number; status?: number }) {
  return request.post(apis.addFloor, data);
}

// 更新楼层
export function updateFloor(data: {
  id: number;
  layer?: number;
  school_building_id?: number;
  status?: number;
}) {
  return request.put(apis.updateFloor, { data: data });
}

/**
 * 批量删除楼层
 * @param param id_list
 * @returns
 */
export function deleteFloor(data: any) {
  return request.delete(apis.deleteFloor, { data: { id_list: data } });
}

/**
 * 查询学校
 * @param param id 学校id
 * @returns
 */
export function querySchool(params?: any) {
  return request.get(apis.getSchoolsList, { params });
}

/**
 * 添加学校
 * @param data 学校数据
 */
export function addSchool(data: {
  name: string;
  address: string;
  city_id: number;
  school_logo: string;
  status?: number;
}) {
  return request.post(apis.addSchool, data);
}

/**
 * 更新学校
 * @param data 学校数据
 */
export function updateSchool(data: {
  id: number;
  name?: string;
  address?: string;
  city_id?: number;
  school_logo?: string;
  status?: number;
}) {
  return request.put(apis.updateSchool, { data: data });
}

/**
 * 删除学校
 * @param param id_list 学校id列表
 */
export function deleteSchool(data: any) {
  return request.delete(apis.deleteSchool, { data: { id_list: data } });
}
