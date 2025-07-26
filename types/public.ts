import type { ReactNode } from 'react';
import type { TableProps } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { ItemType } from 'antd/es/menu/interface';

// 数组
export type ArrayData = string[] | number[] | boolean[];

// 空值
export type EmptyData = null | undefined;

// 分页接口响应数据
export interface PageServerResult<T = unknown> {
  items: T;
  total: number;
}

// 分页表格响应数据
export interface PaginationData {
  page?: number;
  pageSize?: number;
}

// 侧边菜单
export interface SideMenu extends Omit<ItemType, 'children' | 'label' | 'icon'> {
  key: number;
  pid: number;
  label: string;
  route_name: string;
  icon?: string | React.ReactNode;
  sort: number;
  type: number;
  route_path: string;
  component_path: string;
  children?: SideMenu[];
}

export interface MenuResult {
  menu: SideMenu[];
}

// 页面权限
export interface PagePermission {
  page?: boolean;
  create?: boolean;
  update?: boolean;
  delete?: boolean;
  [key: string]: boolean | undefined;
}

// 表格列表枚举
export interface ColumnsEnum {
  label: string;
  value: unknown;
  color?: string;
}

// 表格列数据
export interface TableColumn<T = object> extends ColumnType<T> {
  enum?: ColumnsEnum[] | Record<string, unknown>;
  children?: TableColumn<T>[];
  isKeepFixed?: boolean; // 手机端默认关闭fixed，该属性开启fixed
}

// 表格参数
export interface BaseTableProps<T = object> extends Omit<TableProps<T>, 'columns' | 'rowKey'> {
  rowKey?: string;
  columns: TableColumn<T>[];
}

// 表格操作
export type TableOptions<T = object> = (value: unknown, record: T, index?: number) => ReactNode;
