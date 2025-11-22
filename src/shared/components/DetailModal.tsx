import React, { useMemo } from 'react';
import { Descriptions, Modal } from 'antd';
import type { DescriptionsProps } from 'antd';

export type RenderFn = (value: any) => React.ReactNode;

export interface FieldConfig {
  key: string; // 对应数据 key
  label: string; // 显示名称
  group?: string; // 分组名称（不传则归到默认组）
  render?: RenderFn; // 自定义渲染
  isImage?: boolean; // 是否图片（自动使用 ImagePreview）
}

export interface UniversalDetailProps {
  data: Record<string, any>;
  open: boolean;
  onClose: () => void;
  title?: string;
  config: FieldConfig[];
}

const defaultRender: RenderFn = (v) => (v == null ? '-' : String(v));

const DetailModal: React.FC<UniversalDetailProps> = ({
  data,
  open,
  onClose,
  title = '详情',
  config,
}) => {
  // 按 group 聚合
  const groups = useMemo(() => {
    const map: Record<string, DescriptionsProps['items']> = {};
    config.forEach(({ key, label, group = 'default', render = defaultRender, isImage }) => {
      const value = key.split('.').reduce((o, k) => o?.[k], data);
      if (!value) return;

      (map[group] ||= []).push({
        label,
        key,
        children: isImage ? <ImagePreview width={100} imageUrl={value as any} /> : render(value),
      });
    });
    return map;
  }, [data, config]);

  return (
    <Modal open={open} title={title} onCancel={onClose} footer={null} width={720} >
      {Object.entries(groups).map(([groupName, items]) => (
        <Descriptions
          key={groupName}
          bordered
          column={1}
          size="small"
          labelStyle={{ width: 140 }}
          title={groupName === 'default' ? undefined : groupName}
          items={items}
          style={{ marginBottom: 24 }}
        />
      ))}
    </Modal>
  );
};

export default DetailModal;
