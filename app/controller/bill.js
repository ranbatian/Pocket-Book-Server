/* eslint-disable array-callback-return */
'use strict';

const Control = require('egg').Controller;
const moment = require('moment');
class BillControl extends Control {
  async add() {
    const { app, ctx } = this;
    //  获取请求携带的参数；
    const { amount, type_id, type_name, date, pay_type, remark = '' } = ctx.request.body;

    // 判空处理
    if (!amount || !type_id || !type_name || !date || !pay_type) {
      ctx.body = {
        code: 400,
        msg: '参数错误',
        data: null,
      };
    }

    try {
      const token = ctx.request.header.authorization;
      // 拿到 token 获取用户信息
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      // user_id 默认添加到每个账单项，作为后续获取制定用户账单的标识；
      // 可以理解为， 我登陆 A 账户，那么所做的操作都需要加上 A 账户的 id, 后续获取的时候， 就过滤出 A 账户 id 的账单信息；
      await ctx.service.bill.add({
        amount,
        type_id,
        type_name,
        date,
        pay_type,
        remark,
        user_id,
      });
      ctx.body = {
        code: 200,
        msg: '添加成功',
        data: null,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null,
      };
    }
  }
  // 账单列表
  async list() {
    const { ctx, app } = this;
    const { date, page = 1, page_size = 5, type_id = 'all' } = ctx.query;
    try {
      // 解析token
      const token = ctx.request.header.authorization;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      // 拿到当前用户的账单列表
      const list = await ctx.service.bill.list(user_id);
      // 过滤月份和类型所对应的账单列表
      const _list = list.filter(item => {
        if (type_id !== 'all') {
          return moment(Number(item.date)).format('YYYY-MM-DD') === date && type_id === item.type_id;
        }
        return moment(Number(item.date)).format('YYYY-MM-DD') === date;
      });
      // 格式化数据，将其变成我们之前设置好的对象格式
      const listMap = _list.reduce((curr, item) => {
        // curr 默认初始值是一个空数组 []
        // 把第一个账单项的时间格式化为 YYYY-MM-DD
        const date = moment(Number(item.date)).format('YYYY-MM-DD');
        // 如果能在累加的数组中找到当前项日期 date，那么在数组中的加入当前项到 bills 数组。
        if (curr && curr.length && curr.findIndex(item => item.date === date) > -1) {
          const index = curr.findIndex(item => item.date === date);
          curr[index].bills.push(item);
        }
        // 如果在累加的数组中找不到当前项日期的，那么再新建一项。
        if (curr && curr.length && curr.findIndex(item => item.date === date) === -1) {
          curr.push({
            date,
            bills: [ item ],
          });
        }
        // 如果 curr 为空数组，则默认添加第一个账单项 item ，格式化为下列模式
        if (!curr.length) {
          curr.push({
            date,
            bills: [ item ],
          });
        }
        return curr;
      }, []).sort((a, b) => moment(b.date) - moment(a.date)); // 时间顺序为倒叙，时间约新的，在越上面
      // 分页处理
      const filterListMap = listMap.slice((page - 1) * page_size, page * page_size);
      //  计算当月总收入和支出
      //  首先获取当月多有账单列表
      const __list = list.filter(item => moment(Number(item.date)).format('YYYY-MM-DD') === date);
      // 计算累计支出
      const totalExpense = __list.reduce((curr, item) => {
        if (item.pay_type === 1) {
          console.log(item);
          curr += Number(item.amount);
          return curr;
        }
        return curr;
      }, 0);
      // 计算累计收入
      const totalIncome = __list.reduce((curr, item) => {
        if (item.pay_type === 2) {
          curr += Number(item.amount);
          return curr;
        }
        return curr;
      }, 0);

      ctx.body = {
        code: 200,
        msg: '请求成功',
        data: {
          totalExpense, // 总支出
          totalIncome, // 总收入
          totalPage: Math.ceil(listMap.length / page_size), // 总分页
          list: filterListMap || [], // 格式化后，并且经过分页处理的数据
        },
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '系统错误',
        data: null,
      };
    }
  }
  // 获取账单详情
  async detail() {
    const { app, ctx } = this;
    // 获取账单id
    const { id = '' } = ctx.query;
    const token = ctx.request.header.authorization;
    const decode = app.jwt.verify(token, app.config.jwt.secret);
    if (!decode) return;
    // 用户 id
    const user_id = decode.id;
    if (!id) {
      ctx.body = {
        code: 400,
        msg: '请填写订单 id',
        data: null,
      };
      return;
    }
    try {
      const result = await ctx.service.bill.detail(id, user_id);
      ctx.body = {
        code: 200,
        msg: '查询成功',
        data: result,
      };
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: '查询错误',
        data: null,
      };
    }
  }

  // 更新账单
  async update() {
    const { ctx, app } = this;
    // 获取账单的相关参数
    const { id, amount, type_id, type_name, date, pay_type, remark = '' } = ctx.request.body;
    // 判空处理
    if (!amount || !type_id || !type_name || !date || !pay_type) {
      ctx.body = {
        code: 400,
        msg: '参数错误，请检查必填参数',
        data: null,
      };
      return;
    }

    try {
      const token = ctx.request.header.authorization;
      const decode = app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      // 用户 id
      const user_id = decode.id;
      // 根据账单 id 和 user_id， 修改账单数据
      await ctx.service.bill.update({
        id, // 账单 id
        amount, // 金额
        type_id, // 消费类型 id
        type_name, // 消费类型名称
        date, // 日期
        pay_type, // 消费类型
        remark, // 备注
        user_id, // 用户 id
      });
      ctx.body = {
        code: 200,
        msg: '编辑成功',
        data: null,
      };
    } catch (error) {
      console.log(error);
      ctx.body = {
        code: 500,
        msg: '编辑失败',
        data: null,
      };
    }
  }

  // 删除账单
  async delete() {
    const { app, ctx } = this;
    const { id } = ctx.request.body;
    if (!id) {
      ctx.body = {
        code: 500,
        msg: '填写需要删除的账单id',
        data: null,
      };
      return;
    }
    try {
      const token = ctx.request.header.authorization;
      const decode = app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      // 用户 id
      const user_id = decode.id;
      await ctx.service.bill.delete(id, user_id);
      ctx.body = {
        code: 500,
        data: null,
        msg: '删除成功',
      };
    } catch (error) {
      console.log(error);
      ctx.body = {
        code: 500,
        msg: '删除失败',
        data: null,
      };
    }
  }

  async data() {
    const { ctx, app } = this;
    const { mouth, year } = ctx.query;
    if (!mouth || !year) {
      ctx.body = {
        code: 500,
        msg: '请填写参数',
        data: null,
      };
    }
    try {
      const token = ctx.request.header.authorization;
      const decode = app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      const result = await ctx.service.bill.list(user_id);
      console.log(`${year}-${mouth}`);
      const mouth_list = result.filter(item => moment(Number(item.date)).format('YYYY-MM') === `${year}-${mouth}`);
      // 计算累计支出
      const total_expense = mouth_list.reduce((curr, item) => {
        if (item.pay_type === 1) {
          console.log(item);
          curr += Number(item.amount);
          return curr;
        }
        return curr;
      }, 0);
      // 计算累计收入
      const total_income = mouth_list.reduce((curr, item) => {
        if (item.pay_type === 2) {
          curr += Number(item.amount);
          return curr;
        }
        return curr;
      }, 0);
      const total_data = mouth_list.reduce((curr, item) => {
        const { pay_type, type_id, type_name, amount } = item;
        const flag = curr.findIndex(item => item.pay_type === pay_type);
        if (flag === -1) {
          const data = [ ...curr, {
            number: Number(amount), // 支出或收入数量
            pay_type, // 支出或消费类型值
            type_id, // 消费类型id
            type_name, // 消费类型名称
          }];
          return data;
        }
        curr[flag].number += Number(amount);
        return curr;
      }, []);
      ctx.body = {
        code: 200,
        msg: '查询成功',
        data: {
          total_expense,
          total_income,
          total_data,
        },
      };
    } catch (error) {
      console.log(error);
      ctx.body = {
        code: 500,
        msg: '查询失败',
        data: null,
      };
    }
  }
}

module.exports = BillControl;
