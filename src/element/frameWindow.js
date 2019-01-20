const post = require('../utils/postMessage');
const {frameListLength} = require('../constants');
const {updateChildren} = require('../utils/frameOperate');

const _ = require('underscore');

module.exports = function FrameWindow() {
    this.symbol = generateSymbol();
    this.children = null;
    this.watcher = null;
    
    this.signIn = function () {
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

    this.setChildren = function ({symbol, children}) {
        if (this.symbol === symbol) {
            return;
        }

        if (!this.children) {
            this.children = {};
        }
        
        this.children[symbol] = {
            parent: this.symbol, children
        }

        if (frameListLength() === _.keys(this.children).length) {
            this.signIn();
        }
    }

    this.removeChild = function ({symbol}) {
        
        if (this.children && this.children[symbol]) {
            delete this.children[symbol];

            this.signIn();
        }
    }
}

function generateSymbol() {
    return Math.random().toString(36).substr(2);
}