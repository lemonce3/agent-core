const _ = require('underscore');

const agent = {
    ajax: null,
    underscore: _
};

//读，写，等各种操作 全局
// master通讯 
// 什么对象

// 库 + 其他注册 ok?
// ajax 通讯 ok
// 访问出错的话，404，重新注册一下agent和browser ok
//browserWindow 一直轮询observer保证在线 ok
// get   维持链接，获取program信息 ok



// 监听出的错误，然后传给服务器错误日志
// mock单元测试

// DOCTYPE html 标签会影响部分方法（JSON querySelectorAll）的使用

module.exports = agent;