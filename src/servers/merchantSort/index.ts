import request from '@/utils/request';

const apis = {
  getCategory: '/store_category_manage/query',
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
