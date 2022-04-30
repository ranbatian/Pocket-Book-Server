'use strict';

const Service = require('egg').Service;

class UserService extends Service {
  // * 查找是有户名是否被注册
  async getUserNyName(username) {
    const { app } = this;
    try {
      const result = await app.mysql.get('user', { username });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // * 注册用户
  async register(params) {
    const { app } = this;
    try {
      const result = await app.mysql.insert('user', params);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // * 修改用户信息
  async editUserInfo(params) {
    const { app } = this;
    try {
      // 通过 app.mysql.update 方法，指定 user 表；
      const result = await app.mysql.update('user', {
        ...params,
      }, {
        id: params.id, // 更新条件 为 ID === params.id;
      });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}


module.exports = UserService;
