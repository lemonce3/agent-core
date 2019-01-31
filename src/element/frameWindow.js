const post = require('../utils/postMessage');
const {frameListLength} = require('../constants');
const {updateChildren} = require('../utils/frameOperate');
const {generateSymbol, getDomRect, getSubSelector, isExist} = require('../utils/util');

const {getComputedStyle} = require('../utils/polyfill');

const communicateFramework = require('../framework/frameWindow');
const _ = require('underscore');

module.exports = function FrameWindow() {
    this.symbol = generateSymbol();

    this.children = null;
    this.watcher = null;
    
    this.domMapping = {};

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

    this.execute = ({callerArr, args}) => {
        const result = isExist(callerArr, this);
        
        const arg = {
            result: null, error: null, isError: false
        };

        if (result.isExist) {
            arg.result = result.executeObj(args);
        } else {
            arg.isError = true;
            arg.error = 'The function is not exist.';
        }

        communicateFramework('executeMethod', arg);
    }

    this.test = (args) => {
        console.log(args, this.symbol);
    }

    this.document = {
        select: ({selector}) => {
            const {computed, isTransmit, contentWindow} = getSubSelector(selector);

            if (isTransmit) {
            } else {
                let result = [];
                const domList = document.querySelectorAll(computed.join(' '));

                _.each(domList, (dom) => {
                    if (_.indexOf(result, dom['_agent_dom_']) !== -1) {
                        return false;
                    }

                    if (dom['_agent_dom_']) {
                        result.push(dom['_agent_dom_']);
    
                        return false;
                    }
    
                    const symbol = generateSymbol();
                    this.domMapping[symbol] = dom;
    
                    dom['_agent_dom_'] = symbol;
    
                    result.push(symbol);
                });

                post(top, {
                    namespace: 'browserWindow',
                    type: 'select',
                    args: {
                        frameId: this.symbol,
                        list: result
                    }
                });
            }

        },
        element: {
            attribute: ({hash, attributeName}) => {
                const {dom, arg} = generateResult.call(this, hash);

                if (dom) {
                    arg.result = dom.getAttribute(attributeName);
                }

                communicateFramework('attribute', arg);
            },
            tagName: ({hash}) => {
                const {dom, arg} = generateResult.call(this, hash);

                if (dom) {
                    arg.result = dom.tagName;
                }

                communicateFramework(isSelected, 'tagName', args);
            },
            text: ({frameId, hash}) => {
                const {dom, arg} = generateResult.call(this, hash);

                if (dom) {
                    arg.result = dom.innerText;
                }

                communicateFramework(isSelected, 'text', args);
            },
            property: ({hash, propertyName}) => {
                const {dom, arg} = generateResult.call(this, hash);

                if (dom) {
                    arg.result = dom[propertyName];
                }

                communicateFramework(isSelected, 'property', args);
            },
            css: ({hash}) => {
                const {dom, arg} = generateResult.call(this, hash);

                if (dom) {
                    arg.result = getComputedStyle(dom);
                }

                communicateFramework(isSelected, 'css', args);
            },
            rect: (hash) => {
                const {dom, arg} = generateResult.call(this, hash);

                if (dom) {
                    arg.result = getDomRect(dom);
                }

                communicateFramework(isSelected, 'rect', args);
            },
            alert: () => {

            },
            prompt: () => {

            },
            confirm: () => {

            }
        }
    }
}

function generateResult(hash) {
    const arg = {
        result: null, error: null, isError: false
    };
    const dom = this.domMapping[hash];

    if (!dom) {
        arg.error = 'The element is not exist';
        arg.isError = true;
    }

    return {dom, arg};
}