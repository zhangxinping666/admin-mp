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
    console.log('进来了', params);
    getCategoryList(params).then((res) => {
      console.log('成功了', res);
      const list = res?.data?.list;
      console.log('cateList', list);
      setCategoryOptions(
        list.map((item: any) => ({
          label: item.name,
          value: item.name,
        })),
      );
    });
  }, []);

  return [categoryOptions, setCategoryOptions];
}

export default useCategoryOptions;
