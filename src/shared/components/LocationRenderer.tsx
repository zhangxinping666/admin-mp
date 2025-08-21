import { EnvironmentOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';

// 1. 首先定义一个LocationRenderer组件
const LocationRenderer = ({
  value,
}: {
  value: { address: string; longitude: number; latitude: number };
}) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Space>
        <span>{value?.address || '暂无'}</span>
        <Button
          type="link"
          size="small"
          icon={<EnvironmentOutlined />}
          onClick={() => setOpen(!open)}
          style={{
            padding: '0 4px',
            height: 'auto',
            color: '#1890ff',
          }}
          title="查看位置"
        />
      </Space>

      {open && <MapViewer center={[value.longitude, value.latitude]} height={150} zoom={15} />}
    </>
  );
};
export default LocationRenderer;
