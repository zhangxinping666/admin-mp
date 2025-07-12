import { Button } from 'antd';
import { DeleteBtn } from '@/components/Buttons';
import type { BaseEntity } from '../types/common';

interface TableActionsProps<T extends BaseEntity> {
  record: T;
  onEdit: (record: T) => void;
  onDelete: (id: number) => void;
  editText?: string;
  deleteText?: string;
}

export const TableActions = <T extends BaseEntity>({
  record,
  onEdit,
  onDelete,
  editText = '编辑',
  deleteText,
}: TableActionsProps<T>) => (
  <>
    <Button type="link" onClick={() => onEdit(record)}>
      {editText}
    </Button>
    <DeleteBtn handleDelete={() => onDelete(record.id)} name={deleteText} />
  </>
);
