import { isArray } from 'lodash';
import { useState } from 'react'

const useRequireMap = (formConfig: BaseFormList[]) => {
  const requireMap: any = {};
  useMemo(() => {
    formConfig.forEach(item => {
      if (isArray(item.name)) {
        item.name.forEach(name => {
          requireMap[name] = false
        })
      } else {
        requireMap[item.name] = false
      }
    })
  }, [formConfig])
  const [isRequired, setIsRequired] = useState(requireMap);
  return [isRequired, setIsRequired];
}

export default useRequireMap;