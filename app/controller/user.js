'use strict';

const Controller = require('egg').Controller;

class UserControl extends Controller {
  async register() {
    const { ctx } = this;
    const { username, password } = ctx.request.body;
    if (!username || !password) {
      ctx.body = {
        code: 200,
        msg: '必须添加账号和密码',
        data: null,
      };
      return;
    }
    const userInfo = await ctx.service.user.getUserNyName(username);
    if (userInfo && userInfo.id) {
      ctx.body = {
        code: 500,
        msg: '用户名已被注册',
        data: null,
      };
      return;
    }
    // 默认头像地址
    const defaultAvatar = 'http://s.yezgea02.com/1615973940679/WeChat77d6d2ac093e247c361f0b8a7aeb6c2a.png';
    // 创建用户数据；
    const now = new Date().getTime();
    const result = await ctx.service.user.register({
      username,
      password,
      signature: '世界和平',
      avatar: defaultAvatar,
      ctime: now,
    });

    if (result) {
      ctx.body = {
        code: 200,
        msg: '注册成功',
        data: null,
      };
    } else {
      ctx.body = {
        code: 500,
        msg: '注册失败',
        data: null,
      };
    }
  }

  // 登陆
  async login() {
    const { app, ctx } = this;
    const { username, password } = ctx.request.body;
    console.log(username, password);
    const userInfo = await ctx.service.user.getUserNyName(username);
    // 账号不存在
    if (!userInfo || !userInfo.id) {
      ctx.body = {
        code: 500,
        msg: '账号不存在',
        data: null,
      };
      return;
    }
    // 密码错误
    if (userInfo && password !== userInfo.password) {
      ctx.body = {
        code: 500,
        msg: '密码错误',
        data: null,
      };
      return;
    }

    const token = app.jwt.sign({
      id: userInfo.id,
      username: userInfo.username,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60),
    }, app.config.jwt.secret);

    ctx.body = {
      code: 200,
      msg: '登陆成功',
      data: {
        token,
      },
    };
  }

  async test() {
    const { ctx, app } = this;
    const token = ctx.request.header.authorization;
    const decode = await app.jwt.verify(token, app.config.jwt.secret);
    ctx.body = {
      code: 200,
      msg: '获取成功',
      data: {
        ...decode,
      },
    };
    return null;
  }
}

module.exports = UserControl;
