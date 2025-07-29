import { searchList, tableColumns, formList, type Cert } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { getCertList, updateCert, deleteCert } from '@/servers/cert';

// 初始化新增数据
const initCreate: Partial<Cert> = {
  id: 0,
  name: '',
  card_id: 0,
  front: [],
  back: [],
  status: 0, // 默认状态
};
const certApis = {
  fetch: getCertList,
  update: updateCert,
  delete: deleteCert,
};
const CertPage = () => {
  const optionRender = (
    record: Cert,
    actions: {
      handleEdit: (record: Cert) => void;
      handleDelete: (id: number) => void;
    },
  ) => <TableActions record={record} onEdit={actions.handleEdit} onDelete={actions.handleDelete} />;

  return (
    <CRUDPageTemplate
      title="实名认证"
      searchConfig={searchList()}
      columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
      formConfig={formList()}
      initCreate={initCreate}
      optionRender={optionRender}
      apis={{
        fetch: certApis.fetch,
        update: (id: number, data: any) => {
          // 正确的做法：将 id 和表单数据 data 合并成一个完整的对象
          // 然后再调用您的 certApis.update 函数
          return certApis.update({ ...data, id });
        },
        delete: (id: number) => certApis.delete([id]),
      }}
      hideCreate={true}
    />
  );
};

export default CertPage;
