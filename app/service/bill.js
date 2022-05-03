'use strict';

const Service = require('egg').Service;

class BillService extends Service {

  async add(params) {
    const { app } = this;
    try {
      // 往 bill 表中，插入一条账单数据;
      const result = await app.mysql.insert('bill', params);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async list(id) {
    const { app } = this;
    const QUERY_STR = 'id, pay_type, date, type_id, type_name, amount, remark';
    const sql = `select ${QUERY_STR} from bill where user_id = ${id}`;
    try {
      const result = await app.mysql.query(sql);
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  async detail(id, user_id) {
    const { app } = this;
    try {
      const result = await app.mysql.get('bill', { id, user_id });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  // 更新账单数据
  async update(params) {
    const { app } = this;
    try {
      const result = await app.mysql.update('bill', {
        ...params,
      }, {
        id: params.id,
        user_id: params.user_id,
      });
      return result;
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  // 删除账单
  async delete(id, user_id) {
    const { app } = this;
    try {
      const result = await app.mysql.delete('bill', {
        id, user_id,
      });
      return result;
    } catch (error) {
      console.log(error);
      return error;
    }
  }
}

module.exports = BillService;
