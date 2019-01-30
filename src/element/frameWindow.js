const post = require('../utils/postMessage');
const {frameListLength} = require('../constants');
const {updateChildren} = require('../utils/frameOperate');
const {generateSymbol, getDomRect, getSubSelector} = require('../utils/util');

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

    this.document = {
        select: ({selector}) => {
            const {computed, isTransmit, contentWindow} = getSubSelector(selector);

            if (isTransmit) {

                _.each(document.querySelectorAll(contentWindow.join(' ')), (item, index) => {
    
                    post(document.querySelectorAll(contentWindow.join(' '))[index].contentWindow, {
                        namespace: 'browserWindow',
                        type: 'select',
                        args: {
                            selector: computed
                        }
                    });
                });
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
            attribute: ({frameId, hash, attributeName}) => {
                const isSelected = frameId === this.symbol;

                const args = isSelected ? {
                    result: this.domMapping[hash].getAttribute(attributeName)
                } : {
                    frameId, hash, attributeName
                }

                communicateFramework(isSelected, 'attribute', args);
            },
            tagName: ({frameId, hash}) => {
                const isSelected = frameId === this.symbol;

                const args = isSelected ? {
                    result: this.domMapping[hash].tagName
                } : {
                    frameId, hash
                };

                communicateFramework(isSelected, 'tagName', args);
            },
            text: ({frameId, hash}) => {
                const isSelected = frameId === this.symbol;

                const args = isSelected ? {
                    result: this.domMapping[hash].innerText
                } : {
                    frameId, hash
                }

                communicateFramework(isSelected, 'text', args);
            },
            property: ({frameId, hash, propertyName}) => {
                const isSelected = frameId === this.symbol;

                const args = isSelected ? {
                    result: this.domMapping[hash][propertyName]
                } : {
                    frameId, hash, propertyName
                }

                communicateFramework(isSelected, 'property', args);
            },
            css: ({frameId, hash}) => {
                const isSelected = frameId === this.symbol;

                const args = isSelected ? {
                    result: getComputedStyle(this.domMapping[hash])
                } : {
                    frameId, hash
                }

                communicateFramework(isSelected, 'css', args);
            },
            rect: (hash) => {
                const isSelected = frameId === this.symbol;

                const args = isSelected ? {
                    result: getDomRect(this.domMapping[hash])
                } : {
                    frameId, hash
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