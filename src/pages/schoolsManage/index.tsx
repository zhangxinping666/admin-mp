import { useState, useEffect } from 'react';
import { searchList, tableColumns, formList, type School } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { getSchoolList, addSchool, updateSchool, deleteSchool } from '@/servers/school';
import type { UploadFile } from 'antd';

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
  // 将字符串URL转换为UploadFile格式
  const convertImageUrlToFileList = (imageUrl: string): UploadFile[] => {
    if (!imageUrl) return [];
    return [
      {
        uid: '-1',
        name: 'image.jpg',
        status: 'done',
        url: imageUrl,
      },
    ];
  };

  // 将UploadFile数组转换为字符串URL
  const convertFileListToImageUrl = (fileList: UploadFile[]): string => {
    if (!fileList || fileList.length === 0) return '';
    const file = fileList[0];
    return file.url || file.response?.url || '';
  };

  // 编辑时的数据转换
  const handleEditOpen = (record: School) => {
    // 转换图片字段格式
    const convertedRecord = {
      ...record,
      logo_image_url: convertImageUrlToFileList(record.logo_image_url),
    };
    return convertedRecord;
  };

  // 操作列渲染
  const optionRender = (
    record: School,
    actions: {
      handleEdit: (record: School) => void;
      handleDelete: (id: number) => void;
    },
  ) => <TableActions record={record} onEdit={actions.handleEdit} onDelete={actions.handleDelete} />;

  return (
    <CRUDPageTemplate
      title="学校管理"
      searchConfig={searchList()}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      onEditOpen={handleEditOpen}
      apis={{
        fetchApi: schoolApis.fetch,
        createApi: (data: any) => {
          // 转换图片字段格式
          const convertedData = {
            ...data,
            logo_image_url: convertFileListToImageUrl(data.logo_image_url),
          };
          return schoolApis.create(convertedData);
        },
        updateApi: (data: any) => {
          // 转换图片字段格式
          const convertedData = {
            ...data,
            logo_image_url: convertFileListToImageUrl(data.logo_image_url),
          };
          return schoolApis.update(convertedData);
        },
        deleteApi: (id: number) => schoolApis.delete([id]),
      }}
      optionRender={optionRender}
    />
  );
};

export default SchoolsPage;
