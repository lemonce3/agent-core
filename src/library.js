const _ = require('underscore');
const {getPromise} = require('./utils/polyfill');

module.exports = {
    ajax: null,
    underscore: _,
    promise: getPromise()
};