import request from '@/utils/request';

const apis = {
  createCarousel: '/carousel/create',
  updateCarousel: '/carousel/update',
  deleteCarousel: '/carousel/delete',
  applySchoolCarousel: '/carousel/school/apply',
  cancelApplySchoolCarousel: '/carousel/school/cancelApply',
  getCarouselList: '/carousel/list',
  toggleCityCarousel: '/carousel/city/toggle',
  reviewCityCarousel: '/carousel/city/review',
  updateSystemCarousel: '/systemCarousel/updateStatus',
}

// 创建轮播图草稿
export const createCarousel = (data: any) => {
  return request.post(apis.createCarousel, data);
}

// 更新轮播图草稿
export const updateCarousel = (data: any) => {
  return request.put(apis.updateCarousel, data);
}

// 删除轮播图草稿
export const deleteCarousel = (data: any) => {
  return request.delete(apis.deleteCarousel, data);
}

// 轮播图申请
export const applySchoolCarousel = (data: any) => {
  return request.post(apis.applySchoolCarousel, data);
}

// 轮播图取消申请
export const cancelApplySchoolCarousel = (data: any) => {
  return request.post(apis.cancelApplySchoolCarousel, data);
}

// 获取轮播图列表
export const getCarouselList = (params: any) => {
  return request.get(apis.getCarouselList, { params });
}

// 团长切换轮播图优先级
export const toggleCarousel = (data: any) => {
  return request.put(apis.toggleCityCarousel, data);
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