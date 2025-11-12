import { getMerchantList } from "@/servers/merchantManage";

export default function useMerchantOptions(params?: object) {
  const userStore = useUserStore();
  const schoolId = userStore?.userInfo?.school_id;
  const [merchantOptions, setMerchantOptions] = useState([]);
  try {
    useEffect(() => {
      getMerchantList({
        ...params,
      }).then((res: any) => {
        if (String(res.code) === '2000') {
          setMerchantOptions(res.data?.list.map((item: any) => ({
            label: item.store_name || '-',
            value: item.id,
          })) || []);
          console.log('merchantOptions', merchantOptions);
        }
      })
    }, [params]);
  } catch (error) {
    console.log('error', error);
    setMerchantOptions([]);
  }

  return [merchantOptions, setMerchantOptions];
}