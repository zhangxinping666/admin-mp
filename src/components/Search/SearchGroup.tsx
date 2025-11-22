/**
 * 搜索框分组组件
 * 用于将多个相关的搜索框组合在一起，确保它们始终在同一行显示
 */

import React from 'react';
import { Form, Select, Input } from 'antd';
import type { BaseSearchList } from '#/form';
import { filterFormItem, handleValuePropName } from '@/components/Form/utils/helper';
import { BaseSelect } from '@/components/Selects';
import './searchGroup.css';

interface SearchGroupProps {
  items: BaseSearchList[];
  form?: any;
  onPressEnter?: () => void;
}

/**
 * 搜索框分组组件
 * 使用flex布局确保组内项目不换行
 * 支持缩放时自动调整宽度
 */
export const SearchGroup: React.FC<SearchGroupProps> = ({ items, form, onPressEnter }) => {
  // 简单的组件映射
  const getComponentByType = (type: string) => {
    switch (type) {
      case 'Select':
        return BaseSelect;
      case 'Input':
        return Input;
      default:
        return Input;
    }
  };

  const firstLabelItem = items.find(item => item.label);
  const label = firstLabelItem?.label || '';

  return (
    <div className="search-group-wrapper">
      {label && (
        <span style={{ fontSize: '15px', marginTop: '-2px' }} className="search-group-label">{label}：</span>
      )}
      <div className="search-group-items">
        {items.map((item) => {
          const Component = getComponentByType(item.component);
          const componentProps = typeof item.componentProps === 'function'
            ? item.componentProps(form)
            : item.componentProps;
          // 固定宽度120px
          return (
            <div
              key={`${item.name}`}
              className="search-group-item"
              style={{
                width: '120px',
                minWidth: '120px',
                maxWidth: '120px',
                flex: '0 0 120px'
              }}
            >
              <Form.Item
                {...(() => {
                  const { groupId, ...rest } = filterFormItem(item);
                  return rest;
                })()}
                label=""
                style={{
                  marginBottom: 0,
                  width: '120px',
                }}
                wrapperCol={{ style: { width: '120px' } }}
                valuePropName={handleValuePropName(item.component)}
              >
                <Component
                  {...componentProps}
                  style={{
                    width: '120px',
                    minWidth: '120px',
                    maxWidth: '120px',
                    ...componentProps?.style,
                  }}
                  size="middle"
                  {...(item.component === 'Input' ? { onPressEnter } : {})}
                  {...(item.component === 'Select' ? {
                    dropdownMatchSelectWidth: 120,
                    dropdownClassName: 'search-group-dropdown',
                    popupMatchSelectWidth: true,
                    dropdownStyle: {
                      zIndex: 2000
                    }
                  } : {})}
                />
              </Form.Item>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SearchGroup;