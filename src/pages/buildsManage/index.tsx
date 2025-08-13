import { searchList, tableColumns, formList, type Building, School, Floor } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { Key, useState } from 'react';
import { useUserStore } from '@/stores/user';
import { checkPermission } from '@/utils/permissions';
import * as apis from './apis';
import { Form, Input, InputNumber, message, Modal, Select, Skeleton, Space } from 'antd';
import { BaseBtn } from '@/components/Buttons';
import useSelectSchoolOptions from './useSelectSchoolOptions';

// 初始化新增数据

const BuildingsPage = () => {
  const userStore = useUserStore();
  const userInfo = userStore.userInfo;
  const initCreate: Partial<Building> = {
    school_id: userInfo?.school_id,
    name: '',
    address: '',
    longitude: 0,
    latitude: 0,
    status: 1,
  };
  // 集中管理当前数据状态
  const [currentData, setCurrentData] = useState<{
    school: School | null;
    floor: Floor | null;
    building: Building | null;
    schoolModalVisible: boolean;
    floorModalVisible: boolean;
    editSchoolMode: boolean;
    editFloorMode: boolean;
  }>({
    school: null,
    floor: null,
    building: null,
    schoolModalVisible: false,
    floorModalVisible: false,
    editSchoolMode: false,
    editFloorMode: false,
  });

  const [form] = Form.useForm();
  const [schoolOptions] = useSelectSchoolOptions();

  // 查看学校信息
  const handleShowSchool = async (record: Building) => {
    setCurrentData((prev) => ({ ...prev, building: record }));

    try {
      await getSchoolInfo(record.school_id);
    } catch (error) {
      console.error('Failed to get school info:', error);
    }
  };

  // 查看楼层信息
  const handleShowFloor = async (record: Building) => {
    setCurrentData((prev) => ({ ...prev, building: record }));
    try {
      await getFloorInfo(record.id);
    } catch (error) {
      console.error('Failed to get floor info:', error);
    }
  };

  // 获取学校信息
  // 优化数据获取函数
  const getSchoolInfo = async (id: number) => {
    try {
      const res = await apis.querySchool();
      const school = res.data.list.find((item: School) => item.id === id);

      if (!school) {
        message.error('暂无学校信息，请联系管理员添加');
        setCurrentData({
          ...currentData,
          school: null,
          editSchoolMode: false,
          schoolModalVisible: false,
        });
      } else {
        setCurrentData({
          ...currentData,
          school,
          schoolModalVisible: true,
          editSchoolMode: false,
        });
        // 重置表单并设置初始值
        form.resetFields();
        form.setFieldsValue(school);
      }
    } catch (error) {
      message.error('获取学校信息失败');
      setCurrentData((prev) => ({
        ...prev,
        school: null,
        schoolModalVisible: false,
      }));
    }
  };
  const { permissions } = useUserStore();
  // 检查权限的辅助函数
  const hasPermission = (permission: string) => {
    return checkPermission(permission, permissions);
  };

  // 获取楼层信息
  const getFloorInfo = async (id: number) => {
    try {
      const res = await apis.queryFloorItem();
      const floor = res.data.list.find((item: Floor) => item.school_building_id === id);

      if (!floor) {
        message.error('暂无楼层信息，请联系管理员添加');
        setCurrentData((prev) => ({
          ...prev,
          floor: null,
          editFloorMode: false,
          floorModalVisible: false,
        }));
      } else {
        setCurrentData((prev) => ({
          ...prev,
          floor,
          floorModalVisible: true,
          editFloorMode: false,
        }));
        // 确保表单正确绑定数据
        form.resetFields();
        // 使用setTimeout确保状态更新后再设置表单值
        setTimeout(() => {
          form.setFieldsValue(floor);
        }, 0);
      }
    } catch (error) {
      message.error('获取楼层信息失败');
      console.error('获取楼层信息错误:', error);
      setCurrentData((prev) => ({
        ...prev,
        floor: null,
        floorModalVisible: false,
      }));
    }
  };

  // 修改学校信息函数
  const handleUpdateSchool = async (values: School) => {
    try {
      await apis.updateSchool({
        id: currentData.school?.id || 1,
        name: values.name,
        address: values.address,
        school_logo: values.logo_image_url,
        status: values.status,
      });
      message.success('学校信息更新成功');
      setCurrentData((prev) => ({
        ...prev,
        schoolModalVisible: false,
        editSchoolMode: false,
      }));
      // 重新获取学校信息以更新数据
      if (currentData.school?.id) {
        await getSchoolInfo(currentData.school.id);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw error;
      }
      message.error('学校信息更新失败');
    }
  };

  // 修改楼层信息函数
  const handleUpdateFloor = async (values: Floor) => {
    try {
      await apis.updateFloor({
        id: currentData.floor?.id || 1,
        school_building_id: currentData.building?.id || 1,
        status: values.status,
        layer: values.layer,
      });
      message.success('楼层信息更新成功');
      setCurrentData((prev) => ({
        ...prev,
        floorModalVisible: false,
        editFloorMode: false,
      }));
      // 重新获取楼层信息以更新数据
      if (currentData.floor?.id) {
        await getFloorInfo(currentData.floor.id);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw error;
      }
      message.error('楼层信息更新失败');
    }
  };

  // 操作列渲染
  const optionRender = (
    record: Building,
    actions: {
      handleEdit: (record: Building) => void;
      handleDelete: (id: Key[]) => void;
      handleShowSchool: (record: Building) => void;
      handleShowFloor: (record: Building) => void;
    },
  ) => {
    const canEdit = hasPermission('mp:build:update');
    const canDelete = hasPermission('mp:build:delete');
    const canViewFloor =
      hasPermission('mp:floor:add') ||
      hasPermission('mp:floor:update') ||
      hasPermission('mp:floor:delete');

    return (
      <Space size="middle" direction="vertical">
        <TableActions
          record={record}
          onEdit={actions.handleEdit}
          onDelete={actions.handleDelete}
          disableEdit={!canEdit}
          disableDelete={!canDelete}
        />
        <Space direction="horizontal" size={20}>
          <BaseBtn size="small" type="primary" onClick={() => actions.handleShowSchool(record)}>
            学校信息
          </BaseBtn>
          {canViewFloor && (
            <BaseBtn size="small" type="primary" onClick={() => actions.handleShowFloor(record)}>
              楼层信息
            </BaseBtn>
          )}
        </Space>
      </Space>
    );
  };

  // 封装表单配置项
  const newFormList = formList().map((item: any) => {
    if (item.name === 'school_id') {
      return {
        ...item,
        componentProps: {
          options: schoolOptions,
          placeholder: '请选择学校',
        },
      };
    }
    return item;
  });

  return (
    <>
      <CRUDPageTemplate
        isAddOpen={true}
        isDelete={true}
        disableBatchUpdate={true}
        title="楼栋楼层管理"
        searchConfig={searchList()}
        columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
        formConfig={newFormList}
        initCreate={initCreate}
        disableCreate={!hasPermission('mp:build:add')}
        disableBatchDelete={!hasPermission('mp:build:delete')}
        optionRender={(record, actions) =>
          optionRender(record, {
            ...actions,
            handleShowSchool,
            handleShowFloor,
          })
        }
        apis={{
          createApi: (params) => {
            params.longitude = params.location[0];
            params.latitude = params.location[1];
            delete params.location;
            return apis.addBuilding(params);
          },
          fetchApi: apis.queryBuilding,
          updateApi: (params) => {
            params.longitude = params.location[0];
            params.latitude = params.location[1];
            delete params.location;
            return apis.updateBuilding(params);
          },
          deleteApi: apis.deleteBuilding,
        }}
      />
      {/* 添加模态框 */}
      <Modal
        title="学校信息"
        open={currentData.schoolModalVisible}
        onCancel={() => {
          setCurrentData((prev) => ({
            ...prev,
            school: null,
            schoolModalVisible: false,
            editSchoolMode: false,
          }));
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        {currentData.school ? (
          <Form form={form} initialValues={currentData.school} layout="vertical">
            {/* 学校信息表单内容 */}
            <Form.Item label="学校名称" name="name">
              {currentData.editSchoolMode ? (
                <Select options={schoolOptions as any}></Select>
              ) : (
                <span className="inline-block px-3 py-1 bg-gray-100 rounded text-sm text-gray-800">
                  {currentData.school?.name || '暂无数据'}
                </span>
              )}
            </Form.Item>
          </Form>
        ) : (
          <div style={{ padding: 24 }}>
            <Skeleton active paragraph={{ rows: 6 }} title={{ width: '50%' }} />
          </div>
        )}
      </Modal>

      {/* 楼层信息模态框类似修改 */}
      <Modal
        title="楼层信息"
        open={currentData.floorModalVisible}
        onCancel={() => {
          setCurrentData((prev) => ({
            ...prev,
            floor: null,
            floorModalVisible: false,
            editFloorMode: false,
          }));
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        {currentData.floor ? (
          <Form form={form} onFinish={handleUpdateFloor} initialValues={currentData.floor}>
            <Form.Item label="所属楼栋" name="building_name">
              <span className="inline-block px-2 py-1 bg-gray-100 rounded text-sm text-gray-800">
                {currentData.building?.name || '暂无数据'}
              </span>
            </Form.Item>
            <Form.Item label="楼层状态" name="status">
              {currentData.editFloorMode ? (
                <Select>
                  <Select.Option value={1}>启用</Select.Option>
                  <Select.Option value={2}>禁用</Select.Option>
                </Select>
              ) : (
                <span
                  className={[
                    'inline-block',
                    'px-2',
                    'py-1',
                    'rounded-full',
                    'text-xs',
                    'font-medium',
                    currentData.floor.status === 1
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-red-50 text-red-600 border border-red-200',
                  ].join(' ')}
                >
                  {currentData.floor.status === 1 ? '启用' : '禁用'}
                </span>
              )}
            </Form.Item>
            <Form.Item label="楼层数量" name="layer">
              {currentData.editFloorMode ? (
                <InputNumber min={1} />
              ) : (
                <span className="inline-block px-2 py-1 bg-gray-100 rounded text-sm text-gray-800">
                  {currentData.floor.layer || '暂无数据'}
                </span>
              )}
            </Form.Item>

            {/* 操作按钮 */}
            <Form.Item>
              <Space>
                {currentData.editFloorMode ? (
                  <>
                    <Space size={20}>
                      <BaseBtn
                        type="primary"
                        onClick={() => {
                          handleUpdateFloor(form.getFieldsValue());
                        }}
                        disabled={!hasPermission('mp:floor:update')}
                      >
                        保存
                      </BaseBtn>
                      <BaseBtn
                        onClick={() => {
                          setCurrentData((prev) => ({
                            ...prev,
                            editFloorMode: false,
                          }));
                          form.setFieldsValue(currentData.floor);
                        }}
                      >
                        取消
                      </BaseBtn>
                    </Space>
                  </>
                ) : (
                  <>
                    {hasPermission('mp:floor:update') && (
                      <BaseBtn
                        type="primary"
                        onClick={() => {
                          setCurrentData((prev) => ({
                            ...prev,
                            editFloorMode: true,
                          }));
                        }}
                      >
                        编辑
                      </BaseBtn>
                    )}
                    {hasPermission('mp:floor:delete') && (
                      <BaseBtn
                        danger
                        onClick={() => {
                          Modal.confirm({
                            title: '确认删除',
                            content: '确定要删除这个楼层吗？',
                            onOk: async () => {
                              try {
                                await apis.deleteFloor([currentData.floor?.id]);
                                message.success('删除成功');
                                setCurrentData((prev) => ({
                                  ...prev,
                                  floor: null,
                                  floorModalVisible: false,
                                }));
                              } catch (error) {
                                message.error('删除失败');
                              }
                            },
                          });
                        }}
                      >
                        删除
                      </BaseBtn>
                    )}
                  </>
                )}
              </Space>
            </Form.Item>
          </Form>
        ) : // 新增楼层表单
        hasPermission('mp:floor:add') ? (
          <Form
            form={form}
            onFinish={async (values) => {
              try {
                await apis.addFloorItem({
                  school_building_id: currentData.building?.id || 1,
                  status: values.status,
                  layer: values.layer,
                });
                message.success('楼层信息添加成功');
                setCurrentData((prev) => ({
                  ...prev,
                  floorModalVisible: false,
                }));
                // 重新获取楼层信息
                if (currentData.building?.id) {
                  await getFloorInfo(currentData.building.id);
                }
              } catch (error: any) {
                message.error('楼层信息添加失败');
              }
            }}
            initialValues={{
              status: 1,
              layer: 1,
            }}
            layout="vertical"
          >
            <Form.Item label="所属楼栋">
              <span className="inline-block px-2 py-1 bg-gray-100 rounded text-sm text-gray-800">
                {currentData.building?.name || '暂无数据'}
              </span>
            </Form.Item>
            <Form.Item
              label="楼层状态"
              name="status"
              rules={[{ required: true, message: '请选择楼层状态' }]}
            >
              <Select>
                <Select.Option value={1}>启用</Select.Option>
                <Select.Option value={2}>禁用</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="楼层数量"
              name="layer"
              rules={[{ required: true, message: '请输入楼层数量' }]}
            >
              <InputNumber min={1} placeholder="请输入楼层数量" />
            </Form.Item>

            <Form.Item>
              <Space>
                <BaseBtn type="primary" htmlType="submit">
                  添加楼层
                </BaseBtn>
                <BaseBtn
                  onClick={() => {
                    setCurrentData((prev) => ({
                      ...prev,
                      floorModalVisible: false,
                    }));
                    form.resetFields();
                  }}
                >
                  取消
                </BaseBtn>
              </Space>
            </Form.Item>
          </Form>
        ) : (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <p>暂无楼层信息，且您没有添加楼层的权限</p>
          </div>
        )}
      </Modal>
    </>
  );
};

export default BuildingsPage;
