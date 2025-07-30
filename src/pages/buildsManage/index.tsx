import { getBuildsList, createBuild } from '@/servers/buildsManage';
import { searchList, tableColumns, formList, type Building, School, Floor } from './model';
import { CRUDPageTemplate } from '@/shared/components/CRUDPageTemplate';
import { TableActions } from '@/shared/components/TableActions';
import { Key } from 'react';
import * as apis from './apis';
import {
  Descriptions,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Space,
  Upload,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { ImageUploader } from '@/shared/components/ImageUploader';

// 初始化新增数据
const initCreate: Partial<Building> = {
  school_id: 0,
  name: '',
  address: '',
  longitude: 0,
  latitude: 0,
  status: 1,
};

// 模拟数据
// const mockData: Building[] = [
//   {
//     id: 1,
//     name: '1号宿舍楼',
//     floorCount: 12,
//     longitude: 116.326204,
//     latitude: 40.003304,
//     createdAt: '2024-01-15 09:30:00',
//   },
//   {
//     id: 2,
//     name: '2号教学楼',
//     floorCount: 5,
//     longitude: 116.310003,
//     latitude: 39.992806,
//     createdAt: '2024-01-20 14:20:00',
//   },
//   {
//     id: 3,
//     name: '行政办公楼',
//     floorCount: 8,
//     longitude: 116.338567,
//     latitude: 40.006789,
//     createdAt: '2024-02-05 10:15:00',
//   },
// ];

const BuildingsPage = () => {
  // 在BuildingsPage组件中添加状态和方法
  const [schoolModalVisible, setSchoolModalVisible] = useState(false);
  const [floorModalVisible, setFloorModalVisible] = useState(false);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [currentFloor, setCurrentFloor] = useState<Floor | null>(null);
  const [currentBuilding, setCurrentBuilding] = useState<Building | null>(null);
  // 添加状态控制
  const [editSchoolMode, setEditSchoolMode] = useState(false);
  const [editFloorMode, setEditFloorMode] = useState(false);
  const [form] = Form.useForm();

  const handleShowSchool = (record: Building) => {
    setCurrentBuilding(record);
    getSchoolInfo(record.school_id);
    setSchoolModalVisible(true);
  };

  const handleShowFloor = (record: Building) => {
    setCurrentBuilding(record);
    getFloorInfo(record.id);
    setFloorModalVisible(true);
  };

  // 获取学校信息
  const getSchoolInfo = async (id: number) => {
    try {
      const res = await apis.querySchool({ id: id });
      setCurrentSchool(res.data.list[0]);
    } catch (error) {
      message.error('获取学校信息失败');
    }
  };

  // 获取楼层信息
  const getFloorInfo = async (id: number) => {
    try {
      const res = await apis.queryFloorItem({ school_building_id: id });
      setCurrentFloor(res.data.list[0]);
    } catch (error) {
      message.error('获取楼层信息失败');
    }
  };

  // 修改学校信息函数
  const handleUpdateSchool = async (values: School) => {
    try {
      await apis.updateSchool({
        id: currentSchool?.id || 1,
        name: values.name,
        address: values.address,
        school_logo: values.logo_image_url,
        status: values.status,
      });
      message.success('学校信息更新成功');
      setSchoolModalVisible(false);
      getSchoolInfo(currentSchool?.id || 1);
    } catch (error) {
      message.error('学校信息更新失败');
    }
  };

  // 修改楼层信息函数
  const handleUpdateFloor = async (values: Floor) => {
    try {
      await apis.updateFloor({
        id: currentFloor?.id || 1,
        school_building_id: currentBuilding?.id || 1,
        status: values.status,
        layer: values.layer,
      });
      message.success('楼层信息更新成功');
      setFloorModalVisible(false);
      getFloorInfo(currentFloor?.id || 1);
    } catch (error) {
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
  ) => (
    <Space size="middle" direction="vertical">
      <TableActions record={record} onEdit={actions.handleEdit} onDelete={actions.handleDelete} />
      <Space direction="horizontal" size={20}>
        <BaseBtn size="small" type="primary" onClick={() => actions.handleShowSchool(record)}>
          学校信息
        </BaseBtn>
        <BaseBtn size="small" type="primary" onClick={() => actions.handleShowFloor(record)}>
          楼层信息
        </BaseBtn>
      </Space>
    </Space>
  );

  // 异步请求楼栋列表
  async function getBuildsFn(param?: object) {
    try {
      const res = await apis.queryBuilding();
    } catch (error) {
      console.error('获取楼栋列表失败:', error);
      message.error('获取楼栋列表失败');
    }
  }

  // 异步新增楼栋学校楼层列表
  async function createBuildFn(param: any) {
    try {
      const res = await apis.addBuilding({
        name: param.name,
        school_id: param.school_id,
        address: param.address,
        longitude: param.longitude,
        latitude: param.latitude,
        status: param.status,
      });
      // 创建成功后刷新列表
      await getBuildsFn();
      return res;
    } catch (error) {
      console.error('创建记录失败:', error);
      message.error('创建记录失败');
      throw error;
    }
  }

  // 数据获取副作用
  useEffect(() => {
    // 请求楼栋信息
    getBuildsFn();
  }, []);

  return (
    <>
      <CRUDPageTemplate
        isAddOpen={true}
        title="楼栋楼层管理"
        searchConfig={searchList()}
        columns={tableColumns.filter((col: any) => col.dataIndex !== 'action')}
        formConfig={formList()}
        initCreate={initCreate}
        optionRender={(record, actions) =>
          optionRender(record, {
            ...actions,
            handleShowSchool,
            handleShowFloor,
          })
        }
        apis={{
          createApi: apis.addBuilding,
          fetchApi: apis.queryBuilding,
          updateApi: apis.updateBuilding,
          deleteApi: apis.deleteBuilding,
        }}
      />
      {/* 添加模态框 */}
      <Modal
        title="学校信息"
        open={schoolModalVisible}
        onCancel={() => setSchoolModalVisible(false)}
        footer={null}
        width={800}
      >
        {currentSchool && (
          <Form form={form} initialValues={currentSchool} layout="vertical">
            <Form.Item label="学校名称" name="name">
              {editSchoolMode ? (
                <Input />
              ) : (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    color: '#333',
                    fontSize: '14px',
                  }}
                >
                  {currentSchool?.name || '暂无数据'}
                </span>
              )}
            </Form.Item>
            <Form.Item label="学校地址" name="address">
              {editSchoolMode ? (
                <Input />
              ) : (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    color: '#333',
                    fontSize: '14px',
                  }}
                >
                  {currentSchool?.address || '暂无数据'}
                </span>
              )}
            </Form.Item>
            {!editSchoolMode ? (
              <Form.Item label="城市" name="city_name">
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    color: '#333',
                    fontSize: '14px',
                  }}
                >
                  {currentSchool?.city_name || '暂无数据'}
                </span>
              </Form.Item>
            ) : (
              ''
            )}
            {!editSchoolMode ? (
              <Form.Item label="省份" name="province">
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    color: '#333',
                    fontSize: '14px',
                  }}
                >
                  {currentSchool?.province || '暂无数据'}
                </span>
              </Form.Item>
            ) : (
              ''
            )}
            <Form.Item label="学校logo">
              {editSchoolMode ? (
                <ImageUploader
                  value={form.getFieldValue('school_logo')}
                  onChange={(url) => form.setFieldsValue({ school_logo: url })}
                />
              ) : (
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    color: '#333',
                    fontSize: '14px',
                  }}
                >
                  暂无数据
                </span>
              )}
            </Form.Item>
            <Space>
              {editSchoolMode ? (
                <>
                  <BaseBtn
                    type="primary"
                    onClick={(e) => {
                      handleUpdateSchool(form.getFieldsValue());
                      setEditSchoolMode(false);
                    }}
                  >
                    保存
                  </BaseBtn>
                  <BaseBtn onClick={() => setEditSchoolMode(false)}>取消</BaseBtn>
                </>
              ) : (
                <BaseBtn type="primary" onClick={() => setEditSchoolMode(true)}>
                  编辑
                </BaseBtn>
              )}
            </Space>
          </Form>
        )}
      </Modal>
      <Modal
        title="楼层信息"
        open={floorModalVisible}
        onCancel={() => setFloorModalVisible(false)}
        footer={null}
        width={800}
      >
        {currentFloor && (
          <Form
            form={form}
            onFinish={handleUpdateFloor}
            initialValues={{
              school: currentSchool?.name,
              building: currentBuilding?.name,
              status: currentFloor.status,
              layer: currentFloor.layer,
            }}
          >
            <Form.Item label="所属学校" name="school">
              {editFloorMode ? (
                <Input />
              ) : (
                <span className="inline-block px-2 py-1 bg-gray-100 rounded text-sm text-gray-800">
                  {currentSchool?.name || '暂无数据'}
                </span>
              )}
            </Form.Item>
            <Form.Item label="所属楼栋" name="building">
              {editFloorMode ? (
                <Input />
              ) : (
                <span className="inline-block px-2 py-1 bg-gray-100 rounded text-sm text-gray-800">
                  {currentBuilding?.name || '暂无数据'}
                </span>
              )}
            </Form.Item>
            <Form.Item label="楼层状态" name="status">
              {editFloorMode ? (
                <Select>
                  <Select.Option value={1}>启用</Select.Option>
                  <Select.Option value={0}>禁用</Select.Option>
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
                    currentFloor.status === 1
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-red-50 text-red-600 border border-red-200',
                  ].join(' ')}
                >
                  {currentFloor.status === 1 ? '启用' : '禁用'}
                </span>
              )}
            </Form.Item>
            <Form.Item label="楼层数量" name="layer">
              {editFloorMode ? (
                <InputNumber min={1} />
              ) : (
                <span className="inline-block px-2 py-1 bg-gray-100 rounded text-sm text-gray-800">
                  {currentFloor.layer || '暂无数据'}
                </span>
              )}
            </Form.Item>
            <Form.Item>
              {editFloorMode ? (
                <>
                  <BaseBtn
                    type="primary"
                    onClick={async () => {
                      await handleUpdateFloor(form.getFieldsValue());
                      setEditFloorMode(false);
                    }}
                  >
                    保存
                  </BaseBtn>
                  <BaseBtn onClick={() => setEditFloorMode(false)}>取消</BaseBtn>
                </>
              ) : (
                <BaseBtn onClick={() => setEditFloorMode(true)}>编辑</BaseBtn>
              )}
            </Form.Item>
          </Form>
        )}
      </Modal>
    </>
  );
};

export default BuildingsPage;
