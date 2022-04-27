'use strict';

const Service = require('egg').Service;

class HomeService extends Service {
  // 用户列表
  async user() {
    const { app } = this;
    const QUERY_STY = 'id, name';
    const sql = `select ${QUERY_STY} from list`;
    try {
      const result = await app.mysql.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  // 添加用户
  async addUser(name) {
    const { app } = this;
    try {
      const result = await app.mysql.insert('list', { name });
      return result;
    } catch (err) {
      console.log(err);
      return null;
    }
  }
  // 编辑用户
  async editUser(id, name) {
    const { app } = this;
    try {
      const result = await app.mysql.update('list', { name }, {
        where: {
          id,
        },
      });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 删除用户
  async deleteUser(id) {
    const { app } = this;
    try {
      const result = await app.mysql.delete('list', { id });
      return result;
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}

module.exports = HomeService;
