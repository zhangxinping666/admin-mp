import request from '@/utils/request';
import { Key } from 'react';

const apis = {
  addDictionary: '/dict/addType',
  queryDictionary: '/dict/getType',
  updateDictionary: '/dict/updateType',
  deleteDictionary: '/dict/deleteType',
  queryDictionaryItem: '/dict/getItem',
  addDictionaryItem: '/dict/addItem',
  updateDictionaryItem: '/dict/updateItem',
  deleteDictionaryItem: '/dict/deleteItem',
};

// // 增加字典类型
// export interface addDictionaryRequest {
//   /**
//    * 字典类型码
//    */
//   code: string;
//   /**
//    * 字典类型描述
//    */
//   description: string;
//   /**
//    * 字典类型名
//    */
//   name: string;
//   /**
//    * 字典类型状态
//    */
//   status: number;
//   [property: string]: any;
// }
// // 增加字典类型响应
// export interface addDictionaryResponse {
//   code: number;
//   data: addDictionaryData;
//   [property: string]: any;
// }

// export interface addDictionaryData {
//   /**
//    * 字典类型码
//    */
//   code: string;
//   /**
//    * 字典类型描述
//    */
//   description: string;
//   /**
//    * 字典类型ID
//    */
//   id: number;
//   /**
//    * 字典类型名称
//    */
//   name: string;
//   /**
//    * 字典类型状态
//    */
//   status: number;
//   [property: string]: any;
// }
// // 查询字典类型响应
// export interface queryDictionaryResponse {
//   code: number;
//   data: queryDictionaryData;
//   [property: string]: any;
// }

// export interface queryDictionaryData {
//   list: queryDictionaryList[];
//   page: number;
//   page_size: number;
//   pages: number;
//   total: number;
//   [property: string]: any;
// }

// export interface queryDictionaryList {
//   code?: string;
//   description?: string;
//   id?: number;
//   name?: string;
//   status?: number;
//   [property: string]: any;
// }

// // 更新字典类型

/**
 * 添加字典类型
 * @param data 字典类型数据
 */
export function addDictionary(data: {
  code: string;
  description: string;
  name: string;
  status: number;
}) {
  return request.post(apis.addDictionary, data);
}

// 查询字典类型
export function queryDictionary() {
  return request.get(apis.queryDictionary);
}

// 更新字典类型
export function updateDictionary(data: {
  id: number;
  name: string;
  code: string;
  status: number;
  description: string;
}) {
  return request.put(apis.updateDictionary, data);
}

// 批量删除字典类型
export function deleteDictionary(param: any) {
  return request.delete(apis.deleteDictionary, param);
}

// 查询字典项
export function queryDictionaryItem(data: any) {
  return request.get(apis.queryDictionaryItem, data);
}

// 添加字典项
export function addDictionaryItem(data: {
  dict_type_code: string;
  label: string;
  value: string | number;
  sort: number;
  status: number;
  description: string;
  extend_value: string;
}) {
  return request.post(apis.addDictionaryItem, data);
}

// 更新字典项
export function updateDictionaryItem(data: {
  id: number;
  dict_type_code: string;
  label: string;
  value: string | number;
  sort: number;
  status: number;
  description: string;
  extend_value: string;
}) {
  return request.put(apis.updateDictionaryItem, data);
}

// 批量删除字典项
export function deleteDictionaryItem(param: any) {
  return request.delete(apis.deleteDictionaryItem, param);
}
