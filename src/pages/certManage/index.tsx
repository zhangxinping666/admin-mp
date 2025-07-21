import { searchList, tableColumns, formList, type Cert } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
// import { getCityList } from '@/servers/city';

// 初始化新增数据
const initCreate: Partial<Cert> = {
  id: 0,
  name: '',
  card_id: 0,
  front_img: [],
  back_img: [],
  status: 0, // 默认状态
};

const CertPage = () => {
  const mockData: Cert[] = [
    {
      id: 1,
      name: '张伟',
      card_id: 18598585686,
      front_img: [
        {
          uid: '1',
          name: 'image.jpg',
          status: 'done',
          url: 'https://img.imgdb.cn/item/6018ea3a3ffa7d37b352b7cd.jpg',
        },
      ],
      back_img: [
        {
          uid: '1',
          name: 'image.jpg',
          status: 'done',
          url: 'https://exp-picture.cdn.bcebos.com/bf6e59704618dfda69ec293289214f579256776f.jpg?x-bce-process=image%2Fresize%2Cm_lfit%2Cw_640%2Climit_1%2Fformat%2Cf_auto%2Fquality%2Cq_80',
        },
      ],
      status: 1,
    },
    {
      id: 2,
      name: '李娜',
      card_id: 2889956985,
      front_img: [
        {
          uid: '1',
          name: 'image.jpg',
          status: 'done',
          url: 'https://img.imgdb.cn/item/6018ea3a3ffa7d37b352b7cd.jpg',
        },
      ],
      back_img: [
        {
          uid: '1',
          name: 'image.jpg',
          status: 'done',
          url: 'https://exp-picture.cdn.bcebos.com/bf6e59704618dfda69ec293289214f579256776f.jpg?x-bce-process=image%2Fresize%2Cm_lfit%2Cw_640%2Climit_1%2Fformat%2Cf_auto%2Fquality%2Cq_80',
        },
      ],
      status: 1,
    },
    {
      id: 3,
      name: '王强',
      card_id: 3958695889,
      front_img: [
        {
          uid: '1',
          name: 'image.jpg',
          status: 'done',
          url: 'https://img.imgdb.cn/item/6018ea3a3ffa7d37b352b7cd.jpg',
        },
      ],
      back_img: [
        {
          uid: '1',
          name: 'image.jpg',
          status: 'done',
          url: 'https://exp-picture.cdn.bcebos.com/bf6e59704618dfda69ec293289214f579256776f.jpg?x-bce-process=image%2Fresize%2Cm_lfit%2Cw_640%2Climit_1%2Fformat%2Cf_auto%2Fquality%2Cq_80',
        },
      ],
      status: 0,
    },
    {
      id: 4,
      name: 'Jessica',
      card_id: 446363636,
      front_img: [
        {
          uid: '1',
          name: 'image.jpg',
          status: 'done',
          url: 'https://img.imgdb.cn/item/6018ea3a3ffa7d37b352b7cd.jpg',
        },
      ],
      back_img: [
        {
          uid: '1',
          name: 'image.jpg',
          status: 'done',
          url: 'https://exp-picture.cdn.bcebos.com/bf6e59704618dfda69ec293289214f579256776f.jpg?x-bce-process=image%2Fresize%2Cm_lfit%2Cw_640%2Climit_1%2Fformat%2Cf_auto%2Fquality%2Cq_80',
        },
      ],
      status: 1,
    },
    {
      id: 5,
      name: '陈浩',
      card_id: 5463463463,
      front_img: [
        {
          uid: '1',
          name: 'image.jpg',
          status: 'done',
          url: 'https://img.imgdb.cn/item/6018ea3a3ffa7d37b352b7cd.jpg',
        },
      ],
      back_img: [
        {
          uid: '1',
          name: 'image.jpg',
          status: 'done',
          url: 'https://exp-picture.cdn.bcebos.com/bf6e59704618dfda69ec293289214f579256776f.jpg?x-bce-process=image%2Fresize%2Cm_lfit%2Cw_640%2Climit_1%2Fformat%2Cf_auto%2Fquality%2Cq_80',
        },
      ],
      status: 1,
    },
    {
      id: 6,
      name: 'Michael',
      card_id: 66364364646,
      front_img: [
        {
          uid: '1',
          name: 'image.jpg',
          status: 'done',
          url: 'https://img.imgdb.cn/item/6018ea3a3ffa7d37b352b7cd.jpg',
        },
      ],
      back_img: [
        {
          uid: '1',
          name: 'image.jpg',
          status: 'done',
          url: 'https://exp-picture.cdn.bcebos.com/bf6e59704618dfda69ec293289214f579256776f.jpg?x-bce-process=image%2Fresize%2Cm_lfit%2Cw_640%2Climit_1%2Fformat%2Cf_auto%2Fquality%2Cq_80',
        },
      ],
      status: 0,
    },
  ];

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
      mockData={mockData}
      optionRender={optionRender}
    />
  );
};

export default CertPage;
