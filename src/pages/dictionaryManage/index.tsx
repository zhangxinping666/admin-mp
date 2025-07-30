import {
  formList as DictionaryStyleCol,
  itemTableColumns,
  itemFormList,
  type Dictionary,
  type DictionaryItem,
} from './model';
import {
  Button,
  Modal,
  Form,
  Table,
  message,
  Space,
  Row,
  Col,
  Card,
  Menu,
  MenuProps,
  Popconfirm,
} from 'antd';
import { useState, useEffect, Key } from 'react';
import { useTranslation } from 'react-i18next';
import { getComponent } from '@/components/Form/utils/componentMap';
import BaseContent from '@/components/Content/BaseContent';
import { PlusOutlined } from '@ant-design/icons';
import { BaseBtn } from '@/components/Buttons'; // 导入BaseBtn组件
import * as apis from './apis';
import { ItemType, MenuItemType } from 'antd/es/menu/interface';
import { TableActions } from '@/shared/components';
// 初始化新增字典数据
const initCreate: Partial<Dictionary> = {
  name: '',
  code: '',
  description: '',
  status: 1,
};

// 初始化新增字典项数据
const initItemCreate: Partial<DictionaryItem> = {
  label: '',
  value: '',
  sort: 0,
  status: 1,
  description: '',
  extend_value: '',
};

const DictionaryManagePage = () => {
  const { t } = useTranslation();
  const [selectedDictionary, setSelectedDictionary] = useState<Dictionary | null>(null);
  const [itemForm] = Form.useForm();
  const [currentItem, setCurrentItem] = useState<DictionaryItem | null>(null);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [dictionaryData, setDictionaryData] = useState<Partial<Dictionary>[]>([]);
  // 新增状态变量
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [dictionaryForm] = Form.useForm();
  const [selectedKey, setSelectedKey] = useState<string>('1');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  // 添加选中行的状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  // 增加字典项列操作
  const itemsClo = [
    ...itemTableColumns,
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      fixed: 'right' as const,
      width: 100,
      render: (value: any, record: DictionaryItem, index: number) => (
        <TableActions
          record={record}
          onEdit={() => {
            setCurrentItem(record);
            setItemModalVisible(true);
            setIsEditMode(true);
          }}
          onDelete={handleDelete}
          deleteText="删除"
        />
      ),
    },
  ];

  // 加载字典数据
  useEffect(() => {
    fetchTableData();
  }, []);

  // 在获取数据后设置默认选中的key
  useEffect(() => {
    if (dictionaryData.length > 0 && !selectedKey) {
      setSelectedKey(String(dictionaryData[0].id)); // 确保转换为字符串
    }
  }, [dictionaryData]);

  // 获取字典数据
  const fetchTableData = async () => {
    try {
      const res = await apis.queryDictionary();
      setDictionaryData(res.data.list);

      // 如果有数据
      if (res.data.list && res.data.list.length > 0) {
        // 首次加载且没有选中字典时，默认选择第一个字典
        if (!selectedDictionary) {
          const firstDictionary = res.data.list[0];
          setSelectedDictionary(firstDictionary as Dictionary);
          // 统一key生成逻辑，与菜单项保持一致
          const key = firstDictionary.id || firstDictionary.code || `dict-item-0`;
          setSelectedKey(key);
          // 加载第一个字典的项
          handleDictionarySelect(firstDictionary);
        } else if (selectedKey) {
          // 如果已有选中的字典，更新选中字典的数据
          const selected = res.data.list.find(
            (item: any) =>
              item.key === selectedKey ||
              item.id === selectedKey ||
              item.code === selectedKey ||
              `dict-item-${res.data.list.indexOf(item)}` === selectedKey,
          );
          if (selected) {
            setSelectedDictionary(selected as Dictionary);
          }
        }
      }
    } catch (error) {
      message.error('获取字典数据失败');
    }
  };
  const onClick: MenuProps['onClick'] = (e) => {
    setSelectedKey(e.key);
    dictionaryData.forEach((item) => {
      if (`${item.id}` === e.key) {
        handleDictionarySelect(item);
      }
    });
  };
  // 选择字典
  // 修改函数定义
  const handleDictionarySelect = async (dictionary: Partial<Dictionary>) => {
    // 确保dictionary不为null或undefined
    if (!dictionary) return;

    // 将Partial<Dictionary>转换为Dictionary类型
    const completeDictionary = dictionary as Dictionary;
    setSelectedDictionary(completeDictionary);

    // 后续代码保持不变
    try {
      const itemRes = await apis.queryDictionaryItem({ code: dictionary.code });
      setSelectedDictionary((prev) =>
        prev
          ? {
              ...prev,
              items: itemRes.data.list,
            }
          : completeDictionary,
      );
      console.log('selectedDictionary', selectedDictionary);
    } catch (error) {
      message.error('获取字典项失败');
    }
  };

  // 处理选中行变化
  const handleSelectionChange = (selectedRowKeys: Key[]) => {
    setSelectedRowKeys(selectedRowKeys);
    console.log('selectedRowKeys', selectedRowKeys);
  };

  // 删除函数
  function handleDelete(keys: Key[]) {
    apis
      .deleteDictionary({ ids: keys })
      .then((res) => {
        message.success('删除成功');
        fetchTableData(); // 删除后刷新数据
        // 重置选中状态
        setSelectedRowKeys([]);
        setSelectedDictionary(null);
      })
      .catch((error) => {
        message.error('删除失败');
      });
  }

  // 批量删除处理
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请至少选择一条数据');
      return;
    }

    // 新增：确保selectedDictionary和code存在
    if (!selectedDictionary || !selectedDictionary.code) {
      message.error('请先选择字典');
      return;
    }

    try {
      await apis.deleteDictionaryItem({
        code: selectedDictionary.code, // 这里不再使用可选链
        ids: selectedRowKeys as number[], // 确保ids是number[]类型
      });
      message.success('删除成功');
      setSelectedRowKeys([]);
      fetchTableData(); // 删除后刷新数据
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 保存字典项
  const saveItem = () => {
    itemForm
      .validateFields()
      .then(async (values) => {
        try {
          if (isEditMode) {
            // 编辑字典项
            await apis.updateDictionaryItem({
              id: values.id,
              dict_type_code: values.dict_type_code,
              label: values.label,
              value: values.value,
              sort: values.sort,
              status: values.status,
              description: values.description,
              extend_value: values.extend_value,
            });
            message.success('字典项更新成功');
          } else {
            // 新增字典项
            await apis.addDictionaryItem({
              dict_type_code: values.dict_type_code,
              label: values.label,
              value: values.value,
              sort: values.sort,
              status: values.status,
              description: values.description,
              extend_value: values.extend_value,
            });
            message.success('字典项保存成功');
          }

          // 保存成功后刷新数据
          fetchTableData();
          setItemModalVisible(false);
        } catch (error) {
          message.error('操作失败');
        }
      })
      .catch((error) => {
        console.error('保存失败:', error);
      });
  };

  const fetchDictionariesData: MenuProps['onSelect'] = (e) => {
    dictionaryData.map((item) => {
      if (`${item.id}` === e.key) handleDictionarySelect(item);
    });
    message.success('更改字典成功');
  };

  // 添加renderDictionaryList函数实现
  const renderDictionaryList = () => {
    const menuItems = dictionaryData.map((item, index) => ({
      ...item,
      type: 'item',
      key: item.id || item.code || `dict-item-${index}`,
      label: (
        <div className="flex justify-between items-center">
          <span>{item.name || ''}</span>
          <BaseBtn
            size="small"
            type="primary"
            onClick={(e) => {
              e.stopPropagation();
              dictionaryForm.setFieldsValue(item);
              setEditModalVisible(true);
            }}
          >
            编辑
          </BaseBtn>
        </div>
      ),
    }));

    return (
      <Card
        title="字典列表"
        extra={
          <Button type="primary" onClick={openCreateModal} icon={<PlusOutlined />}>
            新增字典
          </Button>
        }
      >
        <Menu
          items={menuItems as ItemType<MenuItemType>[]}
          selectedKeys={selectedKey ? [String(selectedKey)] : []}
          defaultOpenKeys={selectedKey ? [String(selectedKey)] : []}
          mode="inline"
          onClick={onClick}
        />
      </Card>
    );
  };

  // 添加formList函数实现
  const formList = () => [
    {
      name: 'name',
      label: '字典名称',
      component: 'Input',
      rules: [{ required: true, message: '请输入字典名称' }],
    },
    {
      name: 'code',
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

  // 打开新增字典模态框
  const openCreateModal = () => {
    dictionaryForm.setFieldsValue(initCreate);
    setCreateModalVisible(true);
  };

  // 保存新字典
  const saveDictionary = () => {
    dictionaryForm
      .validateFields()
      .then(async (values) => {
        try {
          if (values.id) {
            // 编辑模式
            await apis.updateDictionary({
              id: values.id,
              name: values.name,
              code: values.code,
              description: values.description,
              status: values.status,
            });
            fetchTableData();
            setCreateModalVisible(false);
            message.success('字典更新成功');
          } else {
            // 新增模式
            await apis.addDictionary({
              name: values.name,
              code: values.code,
              description: values.description,
              status: values.status,
            });
            message.success('字典创建成功');
          }
          fetchTableData();
          setCreateModalVisible(false);
        } catch (error) {
          message.error('操作失败');
        }
      })
      .catch((error) => {
        console.error('保存失败:', error);
      });
  };

  // 字典项管理区域渲染
  const renderDictionaryItems = () => (
    <Card
      title={selectedDictionary ? `字典项管理: ${selectedDictionary.name}` : '请选择字典'}
      className="h-full flex flex-col overflow-hidden flex-1 flex flex-col overflow-hidden p-0"
      extra={
        selectedDictionary && (
          <Button
            onClick={() => {
              setIsEditMode(false);
              itemForm.setFieldsValue(initItemCreate);
              setItemModalVisible(true);
            }}
            className="ml-2"
          >
            新增字典项
          </Button>
        )
      }
    >
      {selectedDictionary ? (
        <div className="flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-gray-200">
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
          </div>
          <div className="flex-1 overflow-auto">
            <Table
              className="w-full"
              columns={itemsClo as any}
              dataSource={selectedDictionary.items}
              scroll={{ x: 'max-content' }}
              rowKey="id"
              pagination={false}
              rowSelection={{
                selectedRowKeys,
                onChange: handleSelectionChange,
              }}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
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
        title={isEditMode ? `编辑字典项 (ID: ${currentItem?.id})` : '新增字典项'}
        open={itemModalVisible}
        onCancel={() => setItemModalVisible(false)}
        onOk={saveItem}
        width={800}
      >
        {selectedDictionary && (
          <>
            <div style={{ marginBottom: '20px', fontWeight: 'bold' }}>
              字典: {selectedDictionary.code} ({selectedDictionary.name})
            </div>

            <Form form={itemForm} layout="vertical" initialValues={currentItem || initItemCreate}>
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
      {/* 字典编辑弹窗  */}
      <Modal
        title="编辑字典"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={saveDictionary}
        width={600}
      >
        <Form form={dictionaryForm} layout="vertical" initialValues={initCreate}>
          {DictionaryStyleCol().map((item, index) => (
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
