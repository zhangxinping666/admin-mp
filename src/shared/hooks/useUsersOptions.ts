import { getUsers } from '@/servers/merchantApplication';

const useUsersOptions = (params?: any) => {
  const [usersOptions, setUsersOptions] = useState<any[]>([]);
  const userStore = useUserStore();
  const schoolName = userStore?.userInfo?.school_name;
  console.log('userParams', params);
  useEffect(() => {
    getUsers({
      page: 1,
      pageSize: 1000,
      school_name: params,
    }).then((res) => {
      const { data } = res;
      const options = data.list
        .map((item: any) => {
          if (!params || item.school === schoolName) {
            return {
              label: item.nickname,
              value: item.id,
            };
          }
          return null;
        })
        .filter((item: any) => item !== null);
      setUsersOptions(options);
    });
  }, [params]);
  return [usersOptions, setUsersOptions];
};

export default useUsersOptions;
