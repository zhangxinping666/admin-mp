import { DeleteBtn, BaseBtn } from '@/components/Buttons';
import type { BaseEntity } from '../types/common';
import { Key } from 'react';
import { Space } from 'antd';

interface TableActionsProps<T extends BaseEntity> {
  record: T;
  onEdit: (record: T) => void;
  onDelete: (id: Key[]) => void;
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
  <Space direction="horizontal" size={20}>
    <BaseBtn onClick={() => onEdit(record)}>{editText}</BaseBtn>
    <DeleteBtn
      handleDelete={() => onDelete(Array.isArray(record.id) ? record.id : [record.id as Key])}
      name={deleteText}
    />
  </Space>
);
