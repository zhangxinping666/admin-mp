import { querySchool } from './apis';

const SelectSchoolOptions = () => {
  const [allSchool, setAllSchool] = useState([]);
  useEffect(() => {
    querySchool().then((res) => {
      const list = res.data.list;
      const newList = list.map((item: any) => {
        return {
          label: item.name,
          value: item.id,
        };
      });
      setAllSchool(newList);
    });
  }, []);

  return allSchool;
};

export default SelectSchoolOptions;
