import { useState, useEffect } from 'react';
import { getSchoolList } from '@/servers/school';
import { School } from '@/pages/schoolsManage/model';

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
        const res = await getSchoolList({
          page: 1,
          page_size: 1000,
        });
        console.log('getSchoolList', res);
        const list: School[] = (res.data as any).list;

        // 处理学校数据，转换为下拉选项格式
        const options = list
          .filter((item: School) => item.status === 1) // 只显示启用的学校
          .map((item: School) => ({
            label: `${item.name}${item.address ? ` (${item.address})` : ''}`,
            value: item.id,
          }))
          .sort((a, b) => a.label.localeCompare(b.label)); // 按名称排序
        console.log('options', options);

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
