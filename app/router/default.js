'use strict';

module.exports = app => {
  const { router, controller, middleware } = app;
  const _jwt = middleware.jwtErr(app.config.jwt.secret);
  //  查看所用用户
  // router.get('/user', controller.home.user);
  // 新增用户
  // router.post('/add_user', controller.home.addUser);
  // 编辑用户
  // router.post('/edit_user', controller.home.editUser);
  // 删除用户
  // router.post('/delete_user', controller.home.deleteUser);
  // 添加用户
  router.post('/api/user/register', controller.user.register);
  // 用户登陆
  router.post('/api/user/login', controller.user.login);
  // 获取用户信息
  router.post('/api/user/get_userInfo', _jwt, controller.user.getUserInfo);
  // 修改用户信息
  router.post('/api/user/edit_userInfo', _jwt, controller.user.editUserInfo);
  // 登陆测试
  router.get('/api/user/test', _jwt, controller.user.test);
  // 上传头像
  router.post('/api/upload', controller.upload.upload);
  // 插入账单信息
  router.post('/api/bill/add', _jwt, controller.bill.add);
  // 查找账单列表
  router.get('/api/bill/list', _jwt, controller.bill.list);
  // 查询账单详情
  router.get('/api/bill/detail', _jwt, controller.bill.detail);
  // 编辑账单
  router.post('/api/bill/update', _jwt, controller.bill.update);
  // 删除账单
  router.post('/api/bill/delete', _jwt, controller.bill.delete);
  // 查询月度消费
  router.get('/api/bill/data', _jwt, controller.bill.data);
};
