import { useState, useEffect } from 'react';
import { querySchool } from './apis';
import type { School } from './model';

interface SchoolOption {
  label: string;
  value: number;
  address?: string;
  province?: string;
  city_name?: string;
}

const useSelectSchoolOptions = () => {
  const [schoolOptions, setSchoolOptions] = useState<SchoolOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSchoolOptions = async () => {
      try {
        setLoading(true);
        const res = await querySchool();
        const list: School[] = res.data.list;
        
        // 处理学校数据，转换为下拉选项格式
        const options = list
          .filter((item: School) => item.status === 1) // 只显示启用的学校
          .map((item: School) => ({
            label: `${item.name}${item.address ? ` (${item.address})` : ''}`,
            value: item.id,
            address: item.address,
            province: item.province,
            city_name: item.city_name,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)); // 按名称排序
        
        setSchoolOptions(options);
      } catch (error) {
        console.error('获取学校列表失败:', error);
        setSchoolOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolOptions();
  }, []);

  return { schoolOptions, setSchoolOptions, loading };
};

export default useSelectSchoolOptions;
