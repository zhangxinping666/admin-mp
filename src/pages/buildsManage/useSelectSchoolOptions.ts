import { querySchool } from './apis';

const useSelectSchoolOptions = () => {
  const [schoolOptions, setSchoolOptions] = useState([]);
  useEffect(() => {
    querySchool().then((res) => {
      const list = res.data.list;
      setSchoolOptions(
        list.map((item: any) => {
          return {
            label: item.name,
            value: item.id,
          };
        }),
      );
      console.log('school', res);
      console.log('newList', schoolOptions);
    });
  }, []);

  return [schoolOptions, setSchoolOptions];
};

export default useSelectSchoolOptions;
