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

  // 获取用户息信
  async getUserInfo() {
    const { ctx, app } = this;
    const token = ctx.request.header.authorization;
    // 通过 app.jwt.verify 解析 token 内的用户信息；
    const decode = await app.jwt.verify(token, app.config.jwt.secret);
    // 通过 username 获取用户的全部信息；
    const userInfo = await ctx.service.user.getUserNyName(decode.username);
    // 获取密码信息，设置返回信息；
    const { username, id, signature, avatar } = userInfo;
    ctx.body = {
      code: 200,
      msg: '请求成功',
      data: {
        id,
        username,
        signature,
        avatar,
      },
    };
  }

  // 修改用户信息；
  async editUserInfo() {
    const { ctx, app } = this;
    const { signature = '', avatar = '' } = ctx.request.body;
    try {
      const token = ctx.request.header.authorization;
      // 解码 token 中的用户名称;
      const decode = await app.jwt.verify(token, app.config.jwt.secret);
      if (!decode) return;
      const user_id = decode.id;
      // 通过 username 查找用户信息;
      const userInfo = await ctx.service.user.getUserNyName(decode.username);
      console.log({
        ...userInfo,
        signature,
      });
      await ctx.service.user.editUserInfo({
        ...userInfo,
        signature,
        avatar,
      });
      ctx.body = {
        code: 200,
        msg: '修改成功',
        data: {
          id: user_id,
          signature,
          username: userInfo.username,
          avatar,
        },
      };
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}

module.exports = UserControl;
