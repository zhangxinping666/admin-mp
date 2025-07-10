import { MockMethod } from 'vite-plugin-mock';
import Mock from 'mockjs';

import { resultSuccess, resultPageSuccess } from './_utils';

export default [
  {
    url: '/api/user/list', // 请求地址
    method: 'get', // 请求方式
    response: ({ query }) => {
      // 从请求参数中解析分页参数，转成数字，默认页码1，默认每页10条
      const page = Number(query.page) || 1;
      const pageSize = Number(query.pageSize) || 10;
      const total = 53; // 假设总条数固定为53条

      // 使用 Mock.js 动态生成模拟数据列表
      const data = Mock.mock({
        [`list|${pageSize}`]: [
          {
            id: '@id',
            name: '@cname',
            age: '@integer(18,45)',
            email: '@email',
          },
        ],
      }).list;

      // 返回分页结构的模拟数据
      return resultPageSuccess(data, total, page, pageSize);
    },
  },
  {
    url: '/api/user/info',
    method: 'get',
    response: () => {
      // 返回单条用户信息模拟数据
      const data = Mock.mock({
        id: '@id',
        name: '@cname',
        age: '@integer(20,50)',
        email: '@email',
      });
      return resultSuccess(data, '获取用户信息成功');
    },
  },
  {
    url: '/api/user/login',
    method: 'post',
    response: ({ body }) => {
      const { username, password } = body;
      if (!username || !password) return { code: 400, message: '用户名或密码不能为空' };

      if (username === 'admin' && password === 'admin123456') {
        const token = Mock.Random.guid();
        return resultSuccess(
          {
            token,
            userInfo: {
              id: '@id',
              username: 'admin',
              role: 'admin',
            },
          },
          '登录成功',
        );
      } else {
        return {
          code: 401,
          message: '用户名或密码错误',
        };
      }
    },
  },
] as MockMethod[];
