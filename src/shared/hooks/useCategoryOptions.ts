import { getCategoryList } from '@/servers/merchantSort';

/**
 *
 * @param params 分类列表查询参数:用户对应的学校id
 *
 * @returns 分类列表
 */
function useCategoryOptions(params: any) {
  // if (!params) {
  //   return [];
  // }
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);

  useEffect(() => {
    getCategoryList(params).then((res) => {
      const list = res?.data?.list;
      setCategoryOptions(
        list.map((item: any) => ({
          label: item.name,
          value: item.id,
        })),
      );
    });
  }, []);

  return [categoryOptions, setCategoryOptions];
}

export default useCategoryOptions;
