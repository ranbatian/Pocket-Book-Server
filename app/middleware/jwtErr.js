'use strict';

module.exports = secret => {
  return async function(ctx, next) {
    const token = ctx.request.header.authorization;
    // eslint-disable-next-line no-unused-vars
    let decode;
    if (token !== 'null' && token) {
      try {
        decode = ctx.app.jwt.verify(token, secret);
        await next();
      } catch (error) {
        console.log('error:' + error);
        ctx.status = 200;
        ctx.body = {
          msg: 'token 已经过期',
          code: 401,
        };
        return;
      }
    } else {
      ctx.status = 200;
      ctx.body = {
        code: 401,
        msg: 'token 不存在',
      };
      return;
    }
  };
};
