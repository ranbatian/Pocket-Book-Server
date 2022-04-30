/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1650806214706_6744';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
    uploadDir: 'app/public/upload',
  };

  config.multipart = {
    mode: 'file',
  };

  config.mysql = {
    client: {
      host: 'localhost',
      port: '3306',
      user: 'root',
      password: 'zhr990410',
      database: 'simon-cost',
    },
    app: true,
    agent: false,
  };
  config.jwt = {
    secret: 'Nick',
  };
  // 关闭 csrf
  config.security = {
    csrf: {
      enable: false,
    },
  };

  config.cors = {
    origin: '*', // 允许所有跨域访问
    credentials: true,
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
  };

  return {
    ...userConfig,
    ...config,
  };
};
