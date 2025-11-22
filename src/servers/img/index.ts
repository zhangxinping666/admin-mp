import request from '@/utils/request';
export function getImage(data: File) {
  return request.post('/image/upload', data);
}
