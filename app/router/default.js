'use strict';

module.exports = app => {
  const { router, controller } = app;
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
};
