import request from '@/utils/request';
export function getImage(data: File) {
  console.log(data);
  return request.post('/image/upload', data);
}
