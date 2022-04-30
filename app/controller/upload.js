'use strict';
const fs = require('fs');
const moment = require('moment');
const mkdirp = require('mkdirp');
const path = require('path');

const Control = require('egg').Controller;

class UploadControl extends Control {
  async upload() {
    const { ctx } = this;
    // 获取上传的第一个文件
    const file = ctx.request.files[0];
    // 声明存放资源的路径;
    let uploadDir = '';

    try {
      const f = fs.readFileSync(file.filepath);
      // 1. 获取当前时间
      const day = moment(new Date()).format('YYYYMMDD');
      // 2. 创建图片的保存路径
      const dir = path.join(this.config.uploadDir, day);
      const data = Date.now(); // 毫秒数
      await mkdirp(dir); // 不存在就创建目录
      // 返回图片保存的路径
      uploadDir = path.join(dir, data + path.extname(file.filename));
      // 写入文件夹
      fs.writeFileSync(uploadDir, f);
    } finally {
      // 清楚临时文件
      ctx.cleanupRequestFiles();
    }

    ctx.body = {
      code: 200,
      msg: '上传成功',
      data: uploadDir.replace(/app/, ''),
    };
  }
}

module.exports = UploadControl;
