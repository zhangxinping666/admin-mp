import { Button, Select } from 'antd';
import { useTranslation } from 'react-i18next';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import './index.less';

interface CursorPaginationProps {
  current: number; // 当前页码（仅用于显示）
  pageSize: number; // 每页条数
  disabled?: boolean; // 是否禁用
  canPrev: boolean; // 是否可以加载上一页
  canNext: boolean; // 是否可以加载下一页
  onChange: (page: number, pageSize: number) => void; // 切换页码回调
  pageSizeOptions?: string[]; // 每页条数选项
}

function CursorPagination(props: CursorPaginationProps) {
  const { t } = useTranslation();
  const {
    current = 1,
    pageSize = 10,
    disabled = false,
    canPrev = false,
    canNext = false,
    onChange,
    pageSizeOptions = ['10', '20', '50', '100'],
  } = props;

  // 处理上一页点击
  const handlePrevClick = () => {
    if (disabled || !canPrev) return;
    onChange(current - 1, pageSize);
  };

  // 处理下一页点击
  const handleNextClick = () => {
    if (disabled || !canNext) return;
    onChange(current + 1, pageSize);
  };

  // 处理每页条数变化
  const handlePageSizeChange = (value: number) => {
    onChange(1, value); // 切换每页条数时重置为第一页
  };

  return (
    <div className="w-full flex items-center justify-end min-h-40px box-border z-999">
      <div className="flex items-center">
        <Button
          className="mr-2"
          disabled={disabled || !canPrev}
          onClick={handlePrevClick}
          icon={<LeftOutlined />}
        />
        <span className="mx-3 text-sm">{current}</span>
        <Button
          className="ml-2"
          disabled={disabled || !canNext}
          onClick={handleNextClick}
          icon={<RightOutlined />}
        />
        
        <div className="ml-6 flex items-center">
          <span className="mr-2 text-sm">{t('public.pageSize')}</span>
          <Select
            className="w-20"
            disabled={disabled}
            value={pageSize}
            onChange={handlePageSizeChange}
            options={pageSizeOptions.map((size) => ({
              value: Number(size),
              label: `${size} ${t('public.pageUnit')}`,
            }))}
          />
        </div>
      </div>
    </div>
  );
}

export default CursorPagination;