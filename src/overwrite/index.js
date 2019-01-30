const alert = require('./alert');
const prompt = require('./prompt');
const confirm = require('./confirm');

window.alert = alert;
window.prompt = prompt;
window.confirm = confirm;