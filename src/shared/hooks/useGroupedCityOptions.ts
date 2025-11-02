import { useState, useEffect, useCallback } from 'react';
import { Colonel } from '@/pages/colonelManage/model';
import {
  getProvinces,
  getCitiesByProvince,
  getSchoolsByCityId,
} from '@/servers/trade-blotter/location';

export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface ColonelListResult {
  code: number;
  message: string; // 注意：根据您的JSON数据，这里是 message (单数)
  data: {
    list: Colonel[];
    page: number;
    page_size: number;
    pages: number;
    total: number;
  };
}

type OptionType = { label: string; value: string | number };

// 默认"全部"选项
const DEFAULT_ALL_OPTION = (label = '全部', value: string | number = '全部'): OptionType => ({
  label,
  value,
});

/**
 * 获取地区选项的钩子函数
 * 提供省份、城市和学校的选项数据及加载方法
 * @returns 包含省份选项、城市选项、学校选项及加载方法的对象
 */
const useGroupCitySchoolOptions = () => {
  const [provinceOptions, setProvinceOptions] = useState<OptionType[]>([DEFAULT_ALL_OPTION()]);
  const [cityOptions, setCityOptions] = useState<OptionType[]>([]);
  const [schoolOptions, setSchoolOptions] = useState<OptionType[]>([]);

  // 加载省份
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const { data } = await getProvinces(0);
        if (Array.isArray(data) && data.length > 0) {
          setProvinceOptions([
            DEFAULT_ALL_OPTION(),
            ...data.map((p) => ({ label: p.name, value: p.city_id })),
          ]);
        }
      } catch (error) {
        console.error('加载省份失败', error);
      }
    };
    loadProvinces();
  }, []);

  // 加载城市
  const loadCities = useCallback(async (province: string) => {
    if (!province || province === '全部') {
      setCityOptions([]);
      setSchoolOptions([]); // 清空学校选项
      return;
    }
    try {
      const { data } = await getCitiesByProvince(Number(province));
      setCityOptions([
        DEFAULT_ALL_OPTION('全部', 0),
        ...(Array.isArray(data) ? data.map((c) => ({ label: c.name, value: c.city_id })) : []),
      ]);
      // 重置学校选项
      setSchoolOptions([]);
    } catch (error) {
      console.error('加载城市失败', error);
      setCityOptions([DEFAULT_ALL_OPTION('全部', 0)]);
      setSchoolOptions([]);
    }
  }, []);

  // 加载学校
  const loadSchools = useCallback(async (city: string | number) => {
    if (!city || city === '全部' || city === 0) {
      setSchoolOptions([]);
      return;
    }
    try {
      const { data } = await getSchoolsByCityId(Number(city));
      setSchoolOptions([
        DEFAULT_ALL_OPTION('全部', 0),
        ...(Array.isArray(data) ? data.map((s) => ({ label: s.name, value: s.id })) : []),
      ]);
    } catch (error) {
      console.error('加载学校失败', error);
      setSchoolOptions([DEFAULT_ALL_OPTION('全部', 0)]);
    }
  }, []);

  return {
    provinceOptions,
    cityOptions,
    schoolOptions,
    loadCities,
    loadSchools,
  };
};

export default useGroupCitySchoolOptions;
