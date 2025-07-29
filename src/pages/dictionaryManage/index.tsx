import { itemTableColumns, itemFormList, type Dictionary, type DictionaryItem } from './model';
import { Button, Modal, Form, Table, message, Space, Row, Col, Card, Menu, MenuProps } from 'antd';
import { useState, useEffect, Key } from 'react';
import { useTranslation } from 'react-i18next';
import { getComponent } from '@/components/Form/utils/componentMap';
import BaseContent from '@/components/Content/BaseContent';
import { PlusOutlined } from '@ant-design/icons';
import { useCRUD } from '@/shared';

// type MenuItem = Required<MenuProps>['items'][number];

// 初始化新增字典数据
const initCreate: Partial<Dictionary> = {
  key: '',
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
    key: '1',
    label: '用户类型',
    status: 1,
    items: [
      {
        key: '101',
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
        key: '102',
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
    key: '2',
    label: '订单状态',
    status: 1,
    items: [
      {
        key: '201',
        label: '待支付',
        value: 1,
        sort: 1,
        status: 1,
        imageUrl: [],
        remark: '订单创建后待支付',
      },
      {
        key: '202',
        label: '已支付',
        value: 2,
        sort: 2,
        status: 1,
        imageUrl: [],
        remark: '订单已支付',
      },
      {
        key: '203',
        label: '已完成',
        value: 3,
        sort: 3,
        status: 1,
        imageUrl: [],
        remark: '订单已完成',
      },
      {
        key: '204',
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
  // 新增状态变量
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [dictionaryForm] = Form.useForm();
  const [selectedKey, setSelectedKey] = useState<string>('1');
  // 添加选中行的状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

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

  const { handleDelete } = useCRUD<Partial<Dictionary>>({ initCreate: mockData });

  // 处理选中行变化
  const handleSelectionChange = (selectedRowKeys: Key[]) => {
    setSelectedRowKeys(selectedRowKeys);
    console.log('selectedRowKeys', selectedRowKeys);
  };

  // 批量删除处理
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请至少选择一条数据');
      return;
    }
    try {
      // await apis?.delete?.(selectedRowKeys);
      handleDelete(selectedRowKeys);
      setSelectedRowKeys([]);
      fetchTableData();
    } catch (error) {
      message.error('删除失败');
    }
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
        // 正确的状态更新方式：创建新对象
        const newValues = { ...values, key: new Date().getTime().toString() };
        if (selectedDictionary) {
          const updatedDictionary = {
            ...selectedDictionary,
            items: [...selectedDictionary.items, newValues],
          };
          setSelectedDictionary(updatedDictionary);
          message.success('字典项保存成功');
          setItemModalVisible(false);
        }
      })
      .catch((error) => {
        console.error('保存失败:', error);
      });
  };

  const fetchDictionariesData: MenuProps['onSelect'] = (e) => {
    dictionaryData.map((item) => {
      if (item.key === e.key) handleDictionarySelect(item);
    });
    message.success('更改字典成功');
  };
  // 添加renderDictionaryList函数实现
  const renderDictionaryList = () => (
    <Card
      title="字典列表"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      extra={
        <Button type="primary" onClick={openCreateModal} icon={<PlusOutlined />}>
          新增字典
        </Button>
      }
    >
      <Menu
        items={dictionaryData}
        style={{ width: '100%' }}
        defaultOpenKeys={['1']}
        selectedKeys={[selectedKey]}
        mode="inline"
        onSelect={(e) => {
          setSelectedKey(e.key);
          fetchDictionariesData(e);
        }}
      />
    </Card>
  );

  // 添加formList函数实现
  const formList = () => [
    {
      name: 'label',
      label: '字典名称',
      component: 'Input',
      rules: [{ required: true, message: '请输入字典名称' }],
    },
    {
      name: 'key',
      label: '字典编码',
      component: 'Input',
      rules: [{ required: true, message: '请输入字典编码' }],
    },
    {
      name: 'description',
      label: '字典描述',
      component: 'Input.TextArea',
    },
    {
      name: 'status',
      label: '状态',
      component: 'Select',
      componentProps: {
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
      },
      rules: [{ required: true, message: '请选择状态' }],
    },
  ];

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

  // 打开新增字典模态框
  const openCreateModal = () => {
    dictionaryForm.setFieldsValue(initCreate);
    setCreateModalVisible(true);
  };

  // 保存新字典
  const saveDictionary = () => {
    dictionaryForm
      .validateFields()
      .then((values) => {
        // 模拟API请求成功后的数据处理
        const newDictionary: Dictionary = {
          ...values,
          items: [],
          createdAt: new Date().toLocaleString(),
          updatedAt: new Date().toLocaleString(),
        };

        // 更新字典列表
        setDictionaryData([...dictionaryData, newDictionary]);
        // 自动选中新增的字典
        setSelectedDictionary(newDictionary);
        setSelectedKey(newDictionary.key);
        // 关闭模态框
        setCreateModalVisible(false);
        message.success('字典创建成功');
      })
      .catch((error) => {
        console.error('保存失败:', error);
      });
  };

  // 字典项管理区域渲染
  const renderDictionaryItems = () => (
    <Card
      title={selectedDictionary ? `字典项管理: ${selectedDictionary.label}` : '请选择字典'}
      style={{ height: '100%' }}
      extra={
        selectedDictionary && (
          <Button
            onClick={() => {
              setCurrentItem(null);
              itemForm.setFieldsValue(initItemCreate);
              setItemModalVisible(true);
            }}
          >
            新增字典项
          </Button>
        )
      }
    >
      {selectedDictionary ? (
        <>
          <Popconfirm
            title="确定要删除选中的项吗？"
            onConfirm={handleBatchDelete}
            okText="确定"
            cancelText="取消"
            disabled={selectedRowKeys.length === 0}
          >
            <BaseBtn type="primary" danger disabled={selectedRowKeys.length === 0}>
              批量删除 ({selectedRowKeys.length})
            </BaseBtn>
          </Popconfirm>
          <Table
            columns={itemTableColumns}
            dataSource={selectedDictionary.items}
            rowKey="id"
            pagination={false}
          />
        </>
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
          <Col xs={24} lg={5} style={{ height: '100%' }}>
            {renderDictionaryList()}
          </Col>

          {/* 右侧字典项表格 - 在小屏幕上占满宽度，大屏幕占2/3 */}
          <Col xs={24} lg={19} style={{ height: '100%' }}>
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
              字典: {selectedDictionary.key} ({selectedDictionary.label})
            </div>

            <Form form={itemForm} layout="vertical" initialValues={initItemCreate}>
              {itemFormList().map((item, index) => (
                <Form.Item key={index} label={item.label} name={item.name} rules={item.rules}>
                  {getComponent(t, item, () => {})}
                </Form.Item>
              ))}
            </Form>
          </>
        )}
      </Modal>

      {/* 新增字典模态框 */}
      <Modal
        title="新增字典"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={saveDictionary}
        width={600}
      >
        <Form form={dictionaryForm} layout="vertical" initialValues={initCreate}>
          {formList().map((item, index) => (
            <Form.Item key={index} label={item.label} name={item.name} rules={item.rules}>
              {getComponent(t, item as BaseFormList, () => {})}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </BaseContent>
  );
};

export default DictionaryManagePage;
