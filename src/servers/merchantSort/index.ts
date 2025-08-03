import request from '@/utils/request';

const apis = {
  getCategory: '/category/getCategory',
};

// 获取商家分类列表
export function getCategoryList(params: any) {
  console.log('params', params);
  return request.get(apis.getCategory, {
    params: {
      school_id: params,
    },
  });
}
