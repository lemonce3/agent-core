const post = require('../utils/postMessage');
const {frameListLength} = require('../constants');
const {updateChildren} = require('../utils/frameOperate');
const {generateSymbol} = require('../utils/util');

const _ = require('underscore');

module.exports = function FrameWindow() {
    this.symbol = generateSymbol();

    this.children = null;
    this.watcher = null;
    
    this.signIn = () => {
        post(parent, {
            namespace: 'frameWindow',
            type: 'setChildren',
            args: {
                symbol: this.symbol,
                children: this.children
            }
        });

        if (this.watcher) {
            clearInterval(this.watcher);
        }

        this.watcher = updateChildren(this.children, this.removeChild, this);
    }

    this.setChildren = ({symbol, children}) => {
        if (this.symbol === symbol) {
            return;
        }

        if (!this.children) {
            this.children = {};
        }
        
        this.children[symbol] = {
            parent: this.symbol, children
        }

        if (frameListLength() === _.keys(this.children).length) { //可能出异常，所以可能要去掉判断！！
            this.signIn();
        }
    }

    this.removeChild = ({symbol}) => {
        
        if (this.children && this.children[symbol]) {
            delete this.children[symbol];

            this.signIn();
        }
    }
}