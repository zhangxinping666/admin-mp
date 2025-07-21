import { CRUDPageTemplate, TableActions } from '@/shared';
import {
  searchList,
  tableColumns,
  formList,
  itemTableColumns,
  itemFormList,
  type Dictionary,
  type DictionaryItem,
} from './model';
import { Button, Modal, Form, Table, message } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getComponent } from '@/components/Form/utils/componentMap';

// 初始化新增字典数据
const initCreate: Partial<Dictionary> = {
  name: '',
  code: '',
  description: '',
  status: 1,
  items: [],
};

// 初始化新增字典项数据
const initItemCreate: Partial<DictionaryItem> = {
  label: '',
  value: '',
  sort: 0,
  status: 1,
  imageUrl: [], // 初始化为空数组
  remark: '',
};

// 模拟数据
const mockData: Dictionary[] = [
  {
    id: 1,
    name: '用户类型',
    code: 'USER_TYPE',
    description: '系统用户类型定义',
    status: 1,
    items: [
      {
        id: 101,
        label: '管理员',
        value: 'admin',
        sort: 1,
        status: 1,
        imageUrl: [
          {
            uid: '101',
            name: 'admin.png',
            status: 'done',
            url: 'https://ts4.tc.mm.bing.net/th/id/OIP-C.CFev6LAEXxvcqAH9BkJvMwHaNK?rs=1&pid=ImgDetMain&o=7&rm=3',
          },
        ],
        remark: '系统管理员',
      },
      {
        id: 102,
        label: '普通用户',
        value: 'user',
        sort: 2,
        status: 1,
        imageUrl: [],
        remark: '普通系统用户',
      },
    ],
    createdAt: '2024-05-15 10:30:00',
    updatedAt: '2024-05-15 10:30:00',
  },
  {
    id: 2,
    name: '订单状态',
    code: 'ORDER_STATUS',
    description: '订单状态定义',
    status: 1,
    items: [
      {
        id: 201,
        label: '待支付',
        value: 1,
        sort: 1,
        status: 1,
        imageUrl: [],
        remark: '订单创建后待支付',
      },
      {
        id: 202,
        label: '已支付',
        value: 2,
        sort: 2,
        status: 1,
        imageUrl: [],
        remark: '订单已支付',
      },
      {
        id: 203,
        label: '已完成',
        value: 3,
        sort: 3,
        status: 1,
        imageUrl: [],
        remark: '订单已完成',
      },
      {
        id: 204,
        label: '已取消',
        value: 4,
        sort: 4,
        status: 1,
        imageUrl: [],
        remark: '订单已取消',
      },
    ],
    createdAt: '2024-05-16 14:20:00',
    updatedAt: '2024-05-16 14:20:00',
  },
];

const DictionaryManagePage = () => {
  const { t } = useTranslation();
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [selectedDictionary, setSelectedDictionary] = useState<Dictionary | null>(null);
  const [itemForm] = Form.useForm();
  const [currentItem, setCurrentItem] = useState<DictionaryItem | null>(null);

  // 打开字典项管理弹窗
  const openItemModal = (dictionary: Dictionary, item?: DictionaryItem) => {
    setSelectedDictionary(dictionary);
    setCurrentItem(item || null);
    itemForm.setFieldsValue(item || initItemCreate);
    setItemModalVisible(true);
  };

  // 保存字典项
  const saveItem = () => {
    itemForm
      .validateFields()
      .then((values) => {
        // 这里实现保存逻辑
        message.success('字典项保存成功');
        setItemModalVisible(false);
        // 实际应用中需要刷新数据
      })
      .catch((error) => {
        console.error('保存失败:', error);
      });
  };

  // 字典操作列渲染
  const optionRender = (
    record: Dictionary,
    actions: {
      handleEdit: (record: Dictionary) => void;
      handleDelete: (id: number) => void;
    },
  ) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button size="small" onClick={() => actions.handleEdit(record)}>
        编辑
      </Button>
      <Button size="small" onClick={() => actions.handleDelete(record.id)}>
        删除
      </Button>
      <Button size="small" onClick={() => openItemModal(record)}>
        管理字典项
      </Button>
    </div>
  );

  // 字典项操作列渲染
  const itemOptionRender = (
    record: DictionaryItem,
    actions: {
      handleEdit: (record: DictionaryItem) => void;
      handleDelete: (id: number) => void;
    },
  ) => <TableActions record={record} onEdit={actions.handleEdit} onDelete={actions.handleDelete} />;

  return (
    <>
      <CRUDPageTemplate
        title={ '字典管理'}
        searchConfig={searchList()}
        columns={tableColumns.filter((col) => col.dataIndex !== 'action')}
        formConfig={formList()}
        initCreate={initCreate}
        mockData={mockData}
        optionRender={optionRender}
      />

      {/* 字典项管理弹窗 */}
      <Modal
        title={currentItem ? '编辑字典项' : '新增字典项'}
        open={itemModalVisible}
        onCancel={() => setItemModalVisible(false)}
        onOk={saveItem}
        width={800}
      >
        {selectedDictionary && (
          <>
            <div style={{ marginBottom: '20px', fontWeight: 'bold' }}>
              字典: {selectedDictionary.name} ({selectedDictionary.code})
            </div>

            <Form form={itemForm} layout="vertical" initialValues={initItemCreate}>
              {itemFormList().map((item,index) => (
                <Form.Item key={index} label={item.label} name={item.name} rules={item.rules}>
                  {getComponent(t, item, () => saveItem())}
                </Form.Item>
              ))}
            </Form>

            <div style={{ marginTop: '30px' }}>
              <h3 style={{ marginBottom: '10px' }}>字典项列表</h3>
              <Table
                columns={itemTableColumns.filter((col) => col.dataIndex !== 'action')}
                dataSource={selectedDictionary.items}
                rowKey="id"
                pagination={false}
              />
            </div>
          </>
        )}
      </Modal>
    </>
  );
};

export default DictionaryManagePage;
