import {
  CertListResult,
  PaginationParams,
  CertDetailResult,
  UpdateCert,
} from '../../pages/certManage/model';
import request from '@/utils/request';
// 获取列表
export function getCertList(params: PaginationParams) {
  return request.get<CertListResult>('/backAuth/get', { params });
}
// 获取详情
export function getCertDetail(id: number) {
  return request.get<CertDetailResult>(`/backAuth/get/${id}`);
}
//更新
export function updateCert(data: UpdateCert) {
  return request.post(`/backAuth/update`, data);
}
//删除
export function deleteCert(id: Array<number>) {
  return request.delete(`/backAuth/delete`, { data: { list_id: id } });
}
