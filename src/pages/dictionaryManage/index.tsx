import {
  formList as DictionaryStyleCol,
  itemTableColumns,
  itemEditFormList,
  itemAddFormList,
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
  Popover,
  Pagination,
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
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import { set } from 'nprogress';
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
  const { permissions } = useUserStore();
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
  const [isEditDictionary, setIsEditDictionary] = useState(false);
  // 添加选中行的状态
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  // 添加加载状态避免重复点击
  const [isLoading, setIsLoading] = useState(false);

  // 添加分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchTableData();
  }, [currentPage, pageSize]);

  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  // 增加字典项列操作
  const itemsClo = [
    ...itemTableColumns,
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      fixed: 'right',
      width: 100,
      render: (value: any, record: DictionaryItem, index: number) => (
        <TableActions
          record={record}
          onEdit={() => {
            // 重置表单
            itemForm.resetFields();
            // 设置当前字典项数据
            itemForm.setFieldsValue({
              id: record.id,
              dict_type_code: selectedDictionary?.code,
              label: record.label,
              value: record.value,
              sort: record.sort,
              status: record.status,
              description: record.description,
              extend_value: record.extend_value,
            });
            setCurrentItem(record);
            setItemModalVisible(true);
            setIsEditMode(true);
          }}
          onDelete={handleDeleteItem}
          deleteText="删除"
          disableEdit={!hasPermission('mp:dict:updateItem')}
          disableDelete={!hasPermission('mp:dict:deleteItem')}
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
      const res = await apis.queryDictionary({
        page: currentPage,
        page_size: pageSize,
      });
      setDictionaryData(res.data.list);
      setTotalCount(res.data.total || 0);

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
      message.error('获取字典数据失败:' + error);
    }
  };
  const onClick: MenuProps['onClick'] = (e) => {
    setSelectedKey(e.key);
    dictionaryData.forEach((item) => {
      if (item.id === Number(e.key)) {
        setSelectedDictionary(item as Dictionary);
      }
    });
    // 使用find代替forEach提高查找效率
    const selectedItem = dictionaryData.find((item) => `${item.id}` === e.key);
    if (selectedItem) {
      handleDictionarySelect(selectedItem);
    }
  };
  // 选择字典
  // 修改handleDictionarySelect函数
  const handleDictionarySelect = (dictionary: any) => {
    setSelectedDictionary(dictionary);
    setSelectedKey(dictionary.id || dictionary.code);

    // 重置表单数据
    itemForm.resetFields();

    // 加载新字典的字典项
    apis
      .queryDictionaryItem({
        dict_type_code: dictionary.code,
      })
      .then((res) => {
        setSelectedDictionary((prev) => ({
          ...prev!,
          items: res.data.list,
        }));
      })
      .catch((error) => {
        message.error('加载字典项失败:' + error);
      });
  };

  // 处理选中行变化
  const handleSelectionChange = (selectedRowKeys: Key[]) => {
    setSelectedRowKeys(selectedRowKeys);
  };

  // 删除函数
  const handleDeleteType = async (keys: Key[]) => {
    // 新增：确保selectedDictionary和code存在
    if (!selectedDictionary || !selectedDictionary.code) {
      message.error('请先选择字典');
      return;
    }

    const idList = Array.isArray(keys) ? keys : [keys];

    try {
      // 第一步：获取当前字典类型下的所有字典项
      const itemRes = await apis.queryDictionaryItem({
        dict_type_code: selectedDictionary.code,
      });

      // 如果有字典项，先删除这些字典项
      const items = itemRes.data?.list || [];
      if (items.length > 0) {
        // 收集所有字典项的ID
        const itemIds = items.map((item: any) => item.id);

        // 批量删除字典项
        await apis.deleteDictionaryItem({
          id_list: itemIds,
        });
      }

      // 第二步：删除字典类型
      await apis.deleteDictionary({ id_list: idList });
      message.success('删除成功');

      // 重置选中状态
      setSelectedRowKeys([]);
      setSelectedDictionary(dictionaryData[0] as Dictionary);
      setSelectedKey(String(dictionaryData[0].id));

      // 刷新选中字典项
      const selectedItem = dictionaryData.find((item) => `${item.id}` === String(dictionaryData[0].id));
      if (selectedItem) {
        handleDictionarySelect(selectedItem);
      }

      // 刷新字典列表
      fetchTableData();
    } catch (error) {
      message.error('删除失败' + error);
    }
  };

  // 删除字典项
  const handleDeleteItem = async (id: any) => {
    try {
      const id_list = Array.isArray(id) ? id : [id];
      await apis.deleteDictionaryItem({
        id_list: id_list,
      });
      message.success('删除成功');
      setSelectedRowKeys(selectedRowKeys.filter((key) => key !== id));
      // 只刷新当前字典的项数据，而非整个字典列表
      const itemRes = await apis.queryDictionaryItem({
        dict_type_code: selectedDictionary?.code,
      });
      setSelectedDictionary((prev) => (prev ? { ...prev, items: itemRes.data.list } : prev));
    } catch (error: any) {
      message.error('删除失败:', error);
    }
  };

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
        id_list: selectedRowKeys as number[], // 确保id_list是number[]类型
      });
      message.success('删除成功');
      setSelectedRowKeys([]);
      // 只刷新当前字典的项数据，而非整个字典列表
      const itemRes = await apis.queryDictionaryItem({
        dict_type_code: selectedDictionary.code,
      });
      setSelectedDictionary((prev) => (prev ? { ...prev, items: itemRes.data.list } : prev));
    } catch (error: any) {
      message.error('删除失败:' + error);
    }
  };

  // 保存字典项
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

            setIsEditMode(false);
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
          // 新增：如果有选中的字典，重新加载其字典项
          if (selectedDictionary) {
            handleDictionarySelect(selectedDictionary);
          }
          setItemModalVisible(false);
        } catch (error) {
          message.error('操作失败' + error);
        }
      })
      .catch((error) => {
        console.error('保存失败:', error);
      });
  };

  // const fetchDictionariesData: MenuProps['onSelect'] = (e) => {
  //   dictionaryData.map((item) => {
  //     if (`${item.id}` === e.key) handleDictionarySelect(item);
  //   });
  //   message.success('更改字典成功');
  // };

  // 添加renderDictionaryList函数实现
  const renderDictionaryList = () => {
    const menuItems = dictionaryData.map((item, index) => ({
      ...item,
      type: 'item',
      key: item.id || item.code || `dict-item-${index}`,
      label: (
        <div className="flex justify-between items-center w-full">
          <Popover placement="left" content={item.name}>
            <span className="flex-1 truncate">{item.name || ''}</span>
          </Popover>
          <Space className="ml-4">
            <BaseBtn
              size="small"
              type="primary"
              onClick={(e) => {
                e.stopPropagation();
                dictionaryForm.setFieldsValue(item);

                setEditModalVisible(true);
                setIsEditDictionary(true);
              }}
              disabled={!hasPermission('mp:dict:updateType')}
            >
              编辑
            </BaseBtn>
            <BaseBtn
              size="small"
              danger
              onClick={(e) => {
                e.stopPropagation();
                if (!item.id) {
                  message.error('字典类型ID不存在,不能删除');
                  return;
                }
                handleDeleteType([item.id]);
              }}
              disabled={!hasPermission('mp:dict:deleteType')}
            >
              删除
            </BaseBtn>
          </Space>
        </div>
      ),
    }));

    return (

      <Card
        title="字典列表"
        extra={
          <Button
            type="primary"
            onClick={openCreateModal}
            icon={<PlusOutlined />}
            disabled={!hasPermission('mp:dict:addType')}
          >
            新增字典
          </Button>
        }
        style={{ height: '100%', overflow: 'auto', position: 'relative' }}
      >
        <div style={{ height: '100%', overflow: 'auto' }}>
          <Menu
            items={menuItems as ItemType<MenuItemType>[]}
            selectedKeys={selectedKey ? [String(selectedKey)] : []}
            defaultOpenKeys={selectedKey ? [String(selectedKey)] : []}
            mode="inline"
            onClick={onClick}
            style={{ height: '%', overflow: 'auto' }}
          />
        </div>
        {/* 添加分页组件 */}
        <div style={{ marginTop: '1rem', position: 'absolute', bottom: '1rem', left: '1rem' }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalCount}
            onChange={(page, size) => {
              console.log(page)
              setCurrentPage(page);
              setPageSize(size);
            }}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `共 ${total} 条`}
          />
        </div>
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
    setIsEditDictionary(false);
  };

  // 保存新字典
  const saveDictionary = () => {
    dictionaryForm
      .validateFields()
      .then(async (values) => {
        try {
          if (isEditDictionary) {
            // 编辑模式
            await apis.updateDictionary({
              id: values.id,
              name: values.name,
              code: values.code,
              description: values.description,
              status: values.status,
            });
            fetchTableData();
            setEditModalVisible(false);
            setIsEditDictionary(false);
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
          // 刷新选中字典项
          setSelectedKey(String(values.id));
          setSelectedDictionary(values);
          setSelectedRowKeys([]);
          const selectedItem = dictionaryData.find((item) => `${item.id}` === String(values.id));
          if (selectedItem) {
            handleDictionarySelect(selectedItem);
          }
        } catch (error) {
          message.error('操作失败:' + error);
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
      style={{ height: '100%' }}
      className="h-full flex flex-col  flex-col overflow-auto p-0"
      extra={
        selectedDictionary && (
          <Button
            onClick={() => {
              setIsEditMode(false);
              itemForm.setFieldsValue(initItemCreate);
              setItemModalVisible(true);
              itemForm.setFieldValue('dict_type_code', selectedDictionary.code);
            }}
            className="ml-2"
            disabled={!hasPermission('mp:dict:addItem')}
          >
            新增字典项
          </Button>
        )
      }
    >
      <Card.Grid style={{ height: '100%', width: '100%' }} hoverable={false}>
        {selectedDictionary ? (
          <div className="flex flex-col h-full overflow-auto">
            <div className=" p-4 border-b border-gray-200">
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
            <div className="overflow-auto h-[100%]">
              <Table
                className="w-full h-full"
                columns={itemsClo as any}
                dataSource={selectedDictionary.items}
                scroll={{ x: 'max-content' }}
                rowKey="id"
                pagination={{ position: ['bottomLeft'], showSizeChanger: true, showQuickJumper: true, pageSizeOptions: ['4', '10', '20', '50'], }}

                rowSelection={{
                  selectedRowKeys,
                  onChange: handleSelectionChange,
                }}
              />
            </div>
          </div>
        ) : (<div className="flex-1 flex items-center justify-center text-gray-500 h-ful">
          请从左侧选择一个字典
        </div>
        )}
      </Card.Grid>

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
          <Col xs={24} lg={8} style={{ height: '95%' }}>
            {renderDictionaryList()}
          </Col>

          {/* 右侧字典项表格 - 在小屏幕上占满宽度，大屏幕占2/3 */}
          <Col xs={24} lg={15} style={{ height: '95%' }}>
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
              {(
                isEditMode ? itemEditFormList() :
                  itemAddFormList().map(item => ({
                    ...item,
                    // 为新增模式下的字典类型编码字段设置初始值
                    ...(item.label === '字典类型编码' && {
                      componentProps: {
                        ...item.componentProps,
                        // 直接设置disabled属性，确保字段不可编辑
                        disabled: true,
                      },
                    })
                  }))
              ).map((item) => (
                <Form.Item
                  key={item.name + item.label} // 使用name作为唯一key
                  label={item.label}
                  name={item.name}
                  rules={item.rules}
                  // 为新增模式下的字典类型编码字段设置初始值
                  {...(item.label === '字典类型编码' && !isEditMode && {
                    initialValue: selectedDictionary?.code
                  })}
                >
                  {getComponent(t, item, () => { })}
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
              {getComponent(t, item as BaseFormList, () => { })}
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
              {getComponent(t, item as BaseFormList, () => { })}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </BaseContent>
  );
};

export default DictionaryManagePage;
