import { CRUDPageTemplate } from "@/shared";

import { tableColumns, SearchConfig, updateFormList, GetListQueryParams, List as Comment } from "./model";

import * as commentApis from './api'
import { Space } from "antd";


export default function CommentManage() {
  // 操作列渲染
  const optionRender = (record: Comment, actions: { handleEdit: (record: Comment) => void; }) => {
    return (
      <>
        <Space>
          <BaseBtn onClick={() => actions.handleEdit(record)}>
            评论隐藏/显示
          </BaseBtn>
        </Space>
      </>
    );
  };
  return (
    <CRUDPageTemplate<Comment>
      searchConfig={SearchConfig()}
      optionRender={optionRender}
      isAddOpen={false}
      title="评论管理"
      isDelete={false}
      disableBatchDelete={true}
      initCreate={{}}
      formConfig={updateFormList()}
      columns={tableColumns}
      apis={{
        fetchApi: async (params: GetListQueryParams) => {
          const { data } = await commentApis.getCommentList(params)
          const { list } = data
          const formatList = list?.map((item, index) => ({
            ...item,
            id: `item.order_item_no-${index}`,
          })) || [];
          return { data: formatList }
        },
        updateApi: async (params: any) => {
          return commentApis.updateComment(params)
        }
      }}
    />
  );
}