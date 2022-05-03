'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  require('./router/default')(app);
};


// should to do;
// 1. 账单列表  2.添加账单  3.修改账单 4.删除账单 5.账单详情;
