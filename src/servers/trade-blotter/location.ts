import request from '@/utils/request';

/**
 * 获取省份列表
 */
export const getProvinces = () => {
  return request.get('/citySchool/getAllProvinces');
};

/**
 * 根据省份ID获取城市列表
 * @param province - 省份名称
 */
export const getCitiesByProvince = (province: string) => {
  return request.get('/citySchool/getCitiesByProvince', {
    params: {
      province,
    },
  });
};

/**
 * 根据城市ID获取学校列表
 * @param cityId - 城市ID
 */
export const getSchoolsByCityId = (cityId: string | number) => {
  return request.get('/citySchool/getSchoolsByCity', {
    params: {
      cityID: cityId,
    },
  });
};
