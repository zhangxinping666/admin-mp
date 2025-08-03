import { DeleteBtn, BaseBtn } from '@/components/Buttons';
import type { BaseEntity } from '../types/common';
import { Key } from 'react';
import { Space, Tooltip } from 'antd';

interface TableActionsProps<T extends BaseEntity> {
  record: T;
  onEdit: (record: T) => void;
  onDelete: (id: Key[]) => void;
  editText?: string;
  deleteText?: string;
  disableEdit?: boolean;
  disableDelete?: boolean;
}

export const TableActions = <T extends BaseEntity>({
  record,
  onEdit,
  onDelete,
  editText = '编辑',
  deleteText,
  disableEdit = false,
  disableDelete = false,
}: TableActionsProps<T>) => (
  <Space direction="horizontal" size={20}>
    <Tooltip title={disableEdit ? '无权限操作' : ''}>
      <BaseBtn onClick={() => !disableEdit && onEdit(record)} disabled={disableEdit}>
        {editText}
      </BaseBtn>
    </Tooltip>
    <Tooltip title={disableDelete ? '无权限操作' : ''}>
      <DeleteBtn
        handleDelete={() =>
          !disableDelete && onDelete(Array.isArray(record.id) ? record.id : [record.id as Key])
        }
        name={deleteText}
        disabled={disableDelete}
      />
    </Tooltip>
  </Space>
);
