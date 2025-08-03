import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type School } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { getSchoolList, addSchool, updateSchool, deleteSchool } from '@/servers/school';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';

// 初始化新增数据
const initCreate: Partial<School> = {
  id: 0,
  name: '',
  address: '',
  city_id: 1, // 默认城市ID
  logo_image_url: '',
  city_name: '',
  province: '',
  status: 0, // 默认状态
};
const schoolApis = {
  fetch: getSchoolList,
  create: addSchool,
  update: updateSchool,
  delete: deleteSchool,
};

const SchoolsPage = () => {
  const { permissions } = useUserStore();

  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  // 编辑时的数据转换
  const handleEditOpen = (record: School) => {
    // 将 logo_image_url 字段映射到 school_logo 字段，因为表单期望的是 school_logo 字段
    return {
      ...record,
      school_logo: record.logo_image_url,
    };
  };

  // 操作列渲染
  const optionRender = (
    record: School,
    actions: {
      handleEdit: (record: School) => void;
      handleDelete: (id: number) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:school:update');
    const canDelete = hasPermission('mp:school:delete');

    return (
      <TableActions
        record={record}
        onEdit={actions.handleEdit}
        onDelete={actions.handleDelete}
        disableEdit={!canEdit}
        disableDelete={!canDelete}
      />
    );
  };

  return (
    <CRUDPageTemplate
      title="学校管理"
      searchConfig={searchList()}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      onEditOpen={handleEditOpen}
      isAddOpen={true}
      disableCreate={!hasPermission('mp:school:add')}
      disableBatchDelete={!hasPermission('mp:school:delete')}
      apis={{
        createApi: schoolApis.create,
        fetchApi: schoolApis.fetch,
        updateApi: (id: number, data: any) => {
          // 正确的做法：将 id 和表单数据 data 合并成一个完整的对象
          // 然后再调用您的 userApis.update 函数
          return schoolApis.update({ ...data, id });
        },
        deleteApi: (id: number[]) => schoolApis.delete(id),
      }}
      optionRender={optionRender}
    />
  );
};

export default SchoolsPage;
