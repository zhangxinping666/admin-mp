import { DeleteBtn, BaseBtn } from '@/components/Buttons';
import { Button, Space, Tooltip } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import type { Role } from '../model';

interface RoleTableActionsProps {
  record: Role;
  onEdit: (record: Role) => void;
  onDelete: (id: number) => void;
  onEditPermissions: (record: Role) => void;
  editText?: string;
  deleteText?: string;
  disableEdit?: boolean;
  disableDelete?: boolean;
  disablePermissionEdit?: boolean;
}

export const RoleTableActions = ({
  record,
  onEdit,
  onDelete,
  onEditPermissions,
  editText = '编辑',
  deleteText,
  disableEdit = false,
  disableDelete = false,
  disablePermissionEdit = false,
}: RoleTableActionsProps) => (
  <Space direction="horizontal" size={8}>
    <Tooltip title={disablePermissionEdit ? '无权限操作' : ''}>
      <Button
        type="link"
        size="small"
        icon={<SettingOutlined />}
        onClick={() => !disablePermissionEdit && onEditPermissions(record)}
        disabled={disablePermissionEdit}
      >
        修改权限
      </Button>
    </Tooltip>
    <Tooltip title={disableEdit ? '无权限操作' : ''}>
      <BaseBtn onClick={() => !disableEdit && onEdit(record)} disabled={disableEdit}>
        {editText}
      </BaseBtn>
    </Tooltip>
    <Tooltip title={disableDelete ? '无权限操作' : ''}>
      <DeleteBtn 
        handleDelete={() => !disableDelete && onDelete(record.id)} 
        name={deleteText} 
        disabled={disableDelete}
      />
    </Tooltip>
  </Space>
);
