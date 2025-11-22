import type { ReactNode } from 'react';
import Forbidden from '@/pages/403';

interface Props {
  isPermission?: boolean;
  children: ReactNode;
}

function BaseContent(props: Props) {
  const { isPermission, children } = props;

  return (
    <>
      {isPermission === true && (
        <div id="content" className="p-10px  h-full ">
          <div className="whitespace-nowrap">{children}</div>
        </div>
      )}
      {isPermission === false && (
        <div className="h-full p-10px box-border overflow-auto">
          <Forbidden />
        </div>
      )}
    </>
  );
}

export default BaseContent;
