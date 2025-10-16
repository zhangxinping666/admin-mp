import request from '@/utils/request';

const apis = {
  createSchoolCarousel: '/schoolCarousel/create',
  updateSchoolCarousel: '/schoolCarousel/update',
  deleteSchoolCarousel: '/schoolCarousel/delete',
  applySchoolCarousel: '/schoolCarousel/apply',
  cancelApplySchoolCarousel: '/schoolCarousel/cancelApply',
  getSchoolCarouselList: '/schoolCarousel/list',
  toggleSchoolCarousel: '/schoolCarousel/toggle',
  getCityCarousel: '/cityCarousel/list',
  toggleCityCarousel: '/cityCarousel/toggle',
  reviewCityCarousel: '/cityCarousel/review',
  updateSystemCarousel: '/systemCarousel/updateStatus',
}

// 创建学校轮播图草稿
export const createSchoolCarousel = (data: any) => {
  return request.post(apis.createSchoolCarousel, data);
}

// 更新学校轮播图草稿
export const updateSchoolCarousel = (data: any) => {
  return request.put(apis.updateSchoolCarousel, data);
}

// 删除学校轮播图草稿
export const deleteSchoolCarousel = (data: any) => {
  return request.delete(apis.deleteSchoolCarousel, data);
}

// 轮播图申请
export const applySchoolCarousel = (data: any) => {
  return request.post(apis.applySchoolCarousel, data);
}

// 轮播图取消申请
export const cancelApplySchoolCarousel = (data: any) => {
  return request.post(apis.cancelApplySchoolCarousel, data);
}

// 团长获取轮播图列表
export const getSchoolCarouselList = (params: any) => {
  return request.get(apis.getSchoolCarouselList, params);
}

// 团长切换轮播图优先级
export const toggleSchoolCarousel = (data: any) => {
  return request.put(apis.toggleSchoolCarousel, data);
}

// 城市运营商获取轮播图列表
export const getCityCarousel = (params: any) => {
  return request.get(apis.getCityCarousel, params);
}

// 城市运营商切换轮播图优先级
export const toggleCityCarousel = (data: any) => {
  return request.put(apis.toggleCityCarousel, data);
}

// 城市运营商审核轮播图
export const reviewCityCarousel = (data: any) => {
  return request.post(apis.reviewCityCarousel, data);
}

// 超级管理员/平台更新轮播图状态
export const updateSystemCarousel = (data: any) => {
  return request.post(apis.updateSystemCarousel, data);
}