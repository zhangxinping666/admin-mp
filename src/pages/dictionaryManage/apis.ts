import request from "@/utils/request";

const apis = {
  addDictionary: "/dict/addType",
  queryDictionary: "/dict/getType",
  updateDictionary: "/dict/updateType",
  deleteDictionary: "/dict/deleteType",
  queryDictionaryItem: "/dict/getItem",
  addDictionaryItem: "/dict/addItem",
  updateDictionaryItem: "/dict/updateItem",
  deleteDictionaryItem: "/dict/deleteItem",
};

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
export function queryDictionary(params?: any) {
  return request.get(apis.queryDictionary, { params: params });
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
export function deleteDictionary(params: any) {
  return request.delete(apis.deleteDictionary, {
    data: { id_list: params.id_list },
  });
}

// 查询字典项
export function queryDictionaryItem(params: any) {
  return request.get(apis.queryDictionaryItem, { params: params });
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
export function deleteDictionaryItem(params: any) {
  return request.delete(apis.deleteDictionaryItem, {
    data: { id_list: params.id_list },
  });
}
