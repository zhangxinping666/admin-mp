import request from '@/utils/request';

export function getDictionaryList(params: any) {
  return request.get<any>('/dict/getItem', { params });
}
