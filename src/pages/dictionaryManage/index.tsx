// import { CRUDPageTemplate, TableActions } from '@/shared';
import {
  // searchList,
  // tableColumns,
  // formList,
  itemTableColumns,
  itemFormList,
  type Dictionary,
  type DictionaryItem,
} from './model';
import { Button, Modal, Form, Table, message, Space, Row, Col, Card } from 'antd';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getComponent } from '@/components/Form/utils/componentMap';
import BaseContent from '@/components/Content/BaseContent';

// 初始化新增字典数据
// const initCreate: Partial<Dictionary> = {
//   name: '',
//   code: '',
//   description: '',
//   status: 1,
//   items: [],
// };

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
  const [selectedDictionary, setSelectedDictionary] = useState<Dictionary | null>(null);
  const [itemForm] = Form.useForm();
  const [currentItem, setCurrentItem] = useState<DictionaryItem | null>(null);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [dictionaryData, setDictionaryData] = useState<Dictionary[]>([]);

  // 加载字典数据
  useEffect(() => {
    // 实际项目中这里应该是API请求
    setDictionaryData(mockData);
    // 默认选中第一个字典
    if (mockData.length > 0) {
      setSelectedDictionary(mockData[0]);
    }
  }, []);

  // 选择字典
  const handleDictionarySelect = (dictionary: Dictionary) => {
    setSelectedDictionary(dictionary);
  };

  // 打开字典项管理弹窗
  // const openItemModal = (dictionary: Dictionary, item?: DictionaryItem) => {
  //   setSelectedDictionary(dictionary);
  //   setCurrentItem(item || null);
  //   itemForm.setFieldsValue(item || initItemCreate);
  //   setItemModalVisible(true);
  // };

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
  // const optionRender = (
  //   record: Dictionary,
  //   actions: {
  //     handleEdit: (record: Dictionary) => void;
  //     handleDelete: (id: number) => void;
  //   },
  // ) => (
  //   <div style={{ display: 'flex', gap: '8px' }}>
  //     <Button size="small" onClick={() => actions.handleEdit(record)}>
  //       编辑
  //     </Button>
  //     <Button size="small" onClick={() => actions.handleDelete(record.id)}>
  //       删除
  //     </Button>
  //     <Button size="small" onClick={() => openItemModal(record)}>
  //       管理字典项
  //     </Button>
  //   </div>
  // );

  // 字典项操作列渲染
  // const itemOptionRender = (
  //   record: DictionaryItem,
  //   actions: {
  //     handleEdit: (record: DictionaryItem) => void;
  //     handleDelete: (id: number) => void;
  //   },
  // ) => <TableActions record={record} onEdit={actions.handleEdit} onDelete={actions.handleDelete} />;

  // 字典列表渲染
  const renderDictionaryList = () => (
    <Card title="字典列表" bordered={true} style={{ height: '100%' }}>
      <Table
        columns={[
          { title: '名称', dataIndex: 'name', key: 'name' },
          { title: '编码', dataIndex: 'code', key: 'code' },
          { title: '描述', dataIndex: 'description', key: 'description' },
          { title: '状态', dataIndex: 'status', key: 'status', render: status => status === 1 ? '启用' : '禁用' },
        ]}
        dataSource={dictionaryData}
        rowKey="id"
        pagination={false}
        onRow={(record) => ({
          onClick: () => handleDictionarySelect(record),
          style: {
            backgroundColor: selectedDictionary?.id === record.id ? '#f5f5f5' : 'inherit',
            cursor: 'pointer'
          }
        })}
      />
      <Button type="primary" style={{ width: '100%', marginTop: 16 }}>
        新增字典
      </Button>
    </Card>
  );

  // 字典项管理区域渲染
  const renderDictionaryItems = () => (
    <Card
      title={selectedDictionary ? `字典项管理: ${selectedDictionary.name}` : '请选择字典'}
      bordered={true}
      style={{ height: '100%' }}
      extra={selectedDictionary && (
        <Button onClick={() => {
          setCurrentItem(null);
          itemForm.setFieldsValue(initItemCreate);
          setItemModalVisible(true);
        }}>
          新增字典项
        </Button>
      )}
    >
      {selectedDictionary ? (
        <Table
          columns={itemTableColumns}
          dataSource={selectedDictionary.items}
          rowKey="id"
          pagination={false}
        />
      ) : (
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#999' }}>
          请从左侧选择一个字典
        </div>
      )}
    </Card>
  );

  return (
    <BaseContent isPermission={true}>
      <Space size={'small'} direction="vertical" style={{ width: '100%' }}>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ color: '#66b1ff', margin: 0 }}>字典管理</h2>
        </div>

        <Row gutter={[16, 16]} style={{ height: 'calc(100vh - 180px)' }}>
          {/* 左侧字典列表 - 在小屏幕上占满宽度，大屏幕占1/3 */}
          <Col xs={24} lg={8} style={{ height: '100%' }}>
            {renderDictionaryList()}
          </Col>

          {/* 右侧字典项表格 - 在小屏幕上占满宽度，大屏幕占2/3 */}
          <Col xs={24} lg={16} style={{ height: '100%' }}>
            {renderDictionaryItems()}
          </Col>
        </Row>
      </Space>

      {/* 字典项编辑弹窗 - 保留原有弹窗逻辑 */}
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
              {itemFormList().map((item, index) => (
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
    </BaseContent>
  );
};

export default DictionaryManagePage;
