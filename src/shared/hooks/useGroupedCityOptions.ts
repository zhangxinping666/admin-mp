import { useState, useEffect } from 'react';
// 假设API函数来自city服务
import { getProvinceList, getCityName } from '@/servers/city';

/**
 * 自定义钩子，用于获取分组的省市选项数据
 * @returns {{ groupedCityOptions: any[], isLoadingOptions: boolean, error: string | null }}
 */
const useGroupedCityOptions = () => {
  const [groupedCityOptions, setGroupedCityOptions] = useState<any[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndGroupData = async () => {
      setIsLoadingOptions(true);
      setError(null);
      try {
        const provinceResponse = await getProvinceList();
        const provinces = provinceResponse.data || [];

        // 根据每个省份获取城市数据
        const cityPromises = provinces.map((province: any) => getCityName(province.province));
        const cityResponses = await Promise.all(cityPromises);

        // 构建分组选项
        const finalOptions = provinces.map((province: any, index: number) => {
          const cities = cityResponses[index].data || [];
          return {
            label: province.province,
            options: cities.map((city: any) => ({
              label: city.city_name,
              value: city.id,
            })),
          };
        });

        setGroupedCityOptions(finalOptions);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '加载省市选项失败';
        setError(errorMessage);
        console.error('加载省市选项失败:', error);
      } finally {
        setIsLoadingOptions(false);
      }
    };

    fetchAndGroupData();
  }, []);

  return {
    groupedCityOptions,
    isLoadingOptions,
    error,
  };
};

export default useGroupedCityOptions;
