// 通用 CRUD 接口
export interface BaseEntity {
  id: number;
  createdAt?: string;
  updatedAt?: string;
  action?: React.ReactNode;
}

// 通用列表响应接口
export interface BaseListResponse<T> {
  items: T[];
  total: number;
}

// 通用查询参数接口
export interface BaseQuery {
  page?: number;
  pageSize?: number;
  [key: string]: any;
}

// CRUD API 接口
export interface CRUDApis<T, CreateData = Partial<T>, UpdateData = Partial<T>> {
  fetch?: (params: BaseQuery) => Promise<BaseListResponse<T>>;
  create?: (data: CreateData) => Promise<T>;
  update?: (id: number, data: UpdateData) => Promise<T>;
  delete?: (id: number) => Promise<void>;
}