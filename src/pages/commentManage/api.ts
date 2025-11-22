import request from '@/utils/request';
import { GetListQueryParams, UpdateRequest, GetChildCommentRequest, GetChildCommentResponse, GetListResponse, UpdateResponse } from './model';
const api = {
  commentList: '/order/back/comment/list',
  updateComment: '/order/back/comment/convert',
  childComment: '/order/back/comment-reply'
}

export function getCommentList(params?: GetListQueryParams) {
  return request.get<GetListResponse>(api.commentList, { params: params });
}

export function updateComment(params: UpdateRequest) {
  return request.put<UpdateResponse>(api.updateComment, params);
}

export function getChildComment(params: GetChildCommentRequest) {
  return request.get<GetChildCommentResponse>(api.childComment, { params: params });
}
