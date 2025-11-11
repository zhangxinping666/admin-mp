import { BaseSearchList } from "#/form";
import { Image } from "antd";

export interface GetListQueryParams {
  /**
   * 城市id
   */
  city_id?: number;
  /**
   * 订单号
   */
  order_item_no?: string;
  /**
   * 第几页
   */
  page?: number;
  /**
   * 页数大小
   */
  page_size?: number;
  /**
   * 商品名称
   */
  product_name?: string;
  province_id?: number;
  /**
   * 评分(0~5，最多一位小数，如0.5)
   */
  rating?: number;
  /**
   * 学校id
   */
  school_id?: number;
  /**
   * 状态：正常/隐藏
   */
  status?: number;
  /**
   * 店铺id
   */
  store_name?: string;
  /**
   * 用户姓名
   */
  user_name?: string;
}

export interface List {
  /**
   * 所属子集，其下的所有评论ID
   */
  child_id: number[];
  /**
   * 城市ID
   */
  city_id?: number;
  /**
   * 城市名
   */
  city_name?: string;
  /**
   * 评论
   */
  comment: string;
  /**
   * 踩踏
   */
  dislike: number;
  /**
   * 图片链接
   */
  images: string[];
  /**
   * 点赞
   */
  like: number;
  /**
   * 订单ID
   */
  order_item_id?: number;
  /**
   * 订单号
   */
  order_item_no: string;
  /**
   * 商品名
   */
  product_name?: string;
  /**
   * 省份ID
   */
  province_id?: number;
  /**
   * 省份名
   */
  province_name?: string;
  /**
   * 评分
   */
  rating?: number;
  /**
   * 学校ID
   */
  school_id?: number;
  /**
   * 学校名
   */
  school_name?: string;
  /**
   * 状态
   */
  status?: number;
  /**
   * 店铺名
   */
  store_name?: string;
  /**
   * 用户名
   */
  user_name?: string;
  /**
   * 评论ID
   */
  id: number;
}

export interface GetListResponse {
  list: List[];
  /**
   * 第几页
   */
  page: number;
  /**
   * 大小
   */
  page_size: number;
  /**
   * 总页数
   */
  pages: number;
  /**
   * 总条数
   */
  total: number;
}

export interface UpdateRequest {
  /**
   * main / child 只有这两种状态，
   * 当为main时，切换的是comment的状态，
   * 当为child时，切换的是comment的状态
   */
  choose: string;
  /**
   * 主评论ID
   */
  id: number;
}
export interface UpdateResponse {
  code: number;
  data: null;
  messages: string;
}

export interface GetChildCommentRequest {
  ids?: number[];
}

export interface ChildComment {
  city_id?: number;
  city_name?: string;
  /**
   * 评论内容
   */
  comment?: string;
  /**
   * 主评论ID
   */
  comment_id?: number;
  /**
   * 图片url
   */
  images?: string[];
  /**
   * 所属订单ID
   */
  order_item_id?: number;
  /**
   * 父评论ID
   */
  parent_id?: number;
  province_id?: number;
  province_name?: string;
  /**
   * 回复对象ID
   */
  replied_user_id?: number;
  /**
   * 回复对象姓名
   */
  replied_user_name?: string;
  /**
   * 回复类型，1-用户回复，2-商家回复
   */
  replier_type?: number;
  /**
   * 回复状态，1-正常，2-隐藏
   */
  reply_status?: number;
  school_id?: number;
  school_name?: string;
  /**
   * 评论者ID
   */
  user_id?: number;
  /**
   * 评论者姓名
   */
  user_name?: string;
}

export interface GetChildCommentResponse {
  code: string;
  data: ChildComment[];
  messages: string;
}

/**
 * 评论管理表格列配置
 * 基于List接口的数据结构生成
 */
export const tableColumns: TableColumn[] = [
  {
    title: '用户名',
    dataIndex: 'user_name',
    key: 'user_name',
    width: 120,
  },
  {
    title: '评论内容',
    dataIndex: 'comment',
    key: 'comment',
    width: 300,
    ellipsis: true,
    render: (text: string) => <Ellipsis lines={2}>{text}</Ellipsis>,
  },
  {
    title: '图片',
    dataIndex: 'images',
    key: 'images',
    width: 150,
    render: (images: string[]) => {
      if (!images || images.length === 0) return '-';
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          {images.slice(0, 3).map((img, index) => (
            <Image
              key={index}
              src={img}
              alt={`评论图片 ${index + 1}`}
              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
            />
          ))}
          {images.length > 3 && <span>+{images.length - 3}</span>}
        </div>
      );
    },
  },
  {
    title: '商品名',
    dataIndex: 'product_name',
    key: 'product_name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '订单号',
    dataIndex: 'order_item_no',
    key: 'order_item_no',
    width: 180,
    ellipsis: true,
  },
  {
    title: '评分',
    dataIndex: 'rating',
    key: 'rating',
    width: 80,
    render: (rating?: number) => {
      if (rating === undefined || rating === null) return '-';
      return `${rating}分`;
    },
  },
  {
    title: '点赞数',
    dataIndex: 'like',
    key: 'like',
    width: 80,
  },
  {
    title: '踩',
    dataIndex: 'dislike',
    key: 'dislike',
    width: 60,
  },
  {
    title: '省份',
    dataIndex: 'province_name',
    key: 'province_name',
    width: 100,
  },
  {
    title: '城市',
    dataIndex: 'city_name',
    key: 'city_name',
    width: 100,
  },
  {
    title: '学校',
    dataIndex: 'school_name',
    key: 'school_name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '店铺',
    dataIndex: 'store_name',
    key: 'store_name',
    width: 150,
    ellipsis: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 80,
    render: (status?: number) => {
      switch (status) {
        case 1:
          return <span style={{ color: '#52c41a' }}>正常</span>;
        case 2:
          return <span style={{ color: '#faad14' }}>隐藏</span>;
        default:
          return '-';
      }
    },
  },
  {
    title: '子评论数',
    dataIndex: 'child_id',
    key: 'childCount',
    width: 100,
    render: (childIds: number[]) => {
      if (!childIds || !Array.isArray(childIds)) return 0;
      return childIds.length;
    },
  },
]

export const SearchConfig = (): BaseSearchList[] => [
  {
    label: "订单号",
    name: "order_item_no",
    component: "Input",
    componentProps: {
      placeholder: '请输入订单号',
    }
  },
  {
    label: '评分',
    name: 'rating',
    component: 'Select',
    componentProps: {
      placeholder: '请选择评分',
      options: [
        {
          label: '1分',
          value: 1,
        },
        {
          label: '1.5分',
          value: 1.5,
        },
        {
          label: '2分',
          value: 2,
        },
        {
          label: '2.5分',
          value: 2.5,
        },
        {
          label: '3分',
          value: 3,
        },
        {
          label: '3.5分',
          value: 3.5,
        },
        {
          label: '4分',
          value: 4,
        },
        {
          label: '4.5分',
          value: 4.5,
        },
        {
          label: '5分',
          value: 5,
        },
      ]
    }
  },
  {
    label: '商品名称',
    name: 'product_name',
    component: 'Input',
    componentProps: {
      placeholder: '请输入商品名称',
    }
  },
  {
    label: '用户姓名',
    name: 'user_name',
    component: 'Input',
    componentProps: {
      placeholder: '请输入用户姓名',
    }
  },
  {
    label: '店铺',
    name: 'store_name',
    component: 'Input',
    componentProps: {
      placeholder: '请输入店铺名称',
    }
  },
  {
    label: '状态',
    name: 'status',
    component: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      options: [
        {
          label: '正常',
          value: 1,
        },
        {
          label: '隐藏',
          value: 2,
        },
      ]
    }
  },
]

export const updateFormList = (): BaseFormList[] => [
  {
    label: "主评论ID",
    name: "id",
    component: "Select",
    rules: FORM_REQUIRED,
    componentProps: {
      placeholder: "请选择状态",
      disabled: true,
    },
  },
  {
    label: "评论类型",
    name: "choose",
    rules: FORM_REQUIRED,
    component: "Select",
    componentProps: {
      placeholder: "请选择状态",
      options: [
        {
          label: '主评论',
          value: 'main',
        },
        {
          label: '子评论',
          value: 'child',
        },
      ],
    },
  },
]