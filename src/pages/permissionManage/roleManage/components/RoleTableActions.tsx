import { DeleteBtn, BaseBtn } from '@/components/Buttons';
import { Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import type { Role } from '../model';

interface RoleTableActionsProps {
  record: Role;
  onEdit: (record: Role) => void;
  onDelete: (id: number) => void;
  onEditPermissions: (record: Role) => void;
  editText?: string;
  deleteText?: string;
}

export const RoleTableActions = ({
  record,
  onEdit,
  onDelete,
  onEditPermissions,
  editText = '编辑',
  deleteText,
}: RoleTableActionsProps) => (
  <>
    <Button
      type="link"
      size="small"
      icon={<SettingOutlined />}
      onClick={() => onEditPermissions(record)}
      className="mr-2"
    >
      修改权限
    </Button>
    <BaseBtn onClick={() => onEdit(record)}>{editText}</BaseBtn>
    <DeleteBtn handleDelete={() => onDelete(record.id)} name={deleteText} />
  </>
);
