const {updateChildren} = require('../utils/frameOperate');
const {addListener, parseObj, getPromise, getComputedStyle, removeListener} = require('../utils/polyfill');
const {create} = require('../utils/request');
const {generateSymbol, getDomRect, getSubSelector} = require('../utils/util');

const _ = require('underscore');
const promise = getPromise();
const post = require('../utils/postMessage');

const agent = require('./agent');
const changeProgram = require('./program');

const communicateFramework = require('../framework/browserWindow');

module.exports = function BrowserWindow() {
    this.agentId = null;
    this.browserWindowId = null;

    this.frameTree = null;

    this.container = null;

    this.watcher = null;
    this.keepAliveWatcher = null;

    this.domMapping = {};

    this.init = () => {
        const agent = document.createElement('iframe');
        this.container = agent;
        
        agent.src = '/api/agent/fetch';
        
        agent.width = 0;
        agent.height = 0;
        agent.style.display = 'none';

        if (document.body) {
            document.body.appendChild(agent);
        } else {
            addListener(window, 'load', function () {
                document.body.appendChild(agent);
            });
        }
    }

    this.setFrameTree = ({symbol, children}) => {
        if (!this.frameTree) {
            this.frameTree = {};
        }

        this.frameTree[symbol] = {
            parent: this.browserWindowId, children
        };

        if (this.watcher) {
            clearInterval(this.watcher);
        }

        this.watcher = updateChildren(this.frameTree, this.removeChild, this);
    }

    this.removeChild = ({symbol}) => {
        if (this.frameTree) {
            delete this.frameTree[symbol];
        }
    }

    this.setAgentId = (argv) => {
        document.body.removeChild(this.container);
        
        this.agentId = argv[0];

        agent.request = create('/api/agent/' + argv[0]);
        
        this.setBrowserWindowId();
    }

    // 设置来源windowId
    this.setBrowserWindowId = () => {
        const meta = {
            title: this.lang.getTitle,
            href: this.lang.getHref,
            opener: this.lang.getOpener
        };
        
        agent.request.post('/window', JSON.stringify(meta)).then((res) => {
            const {id} = parseObj(res);
            this.browserWindowId = id;
            
            this.keepBrowserWindowAlive();
        }).catch(() => {
            console.log(1);
        });
    }

    this.keepBrowserWindowAlive = (delay = 50) => {
        if (this.keepAliveWatcher) {
            clearTimeout(this.keepAliveWatcher);
        }

        this.keepAliveWatcher = setTimeout(() => {
            agent.request.get(`/window/${this.browserWindowId}?timestamp=${new Date().getTime()}`).then((res) => {
                const {program} = parseObj(res);
    
                if (program) {
                    changeProgram(program, this);
                }

                this.keepBrowserWindowAlive(res.timeout);
            }, this.init);
        }, delay);
    }

    this.destroy = () => {
        agent.request.delete(`/window/${this.browserWindowId}`);
    }

    this.computedFrameList = (list, arr = []) =>{
        const keys = _.keys(list);

        arr = arr.concat(keys);
        
        _.each(arr, (item) => {
            if (list[item] && list[item].children) {
                arr = this.computedFrameList(list[item].children, arr);
            }
        });

        return arr;
    }

    this.lang = {
        eval: (content) => {
            try {
                eval(content);
            } catch (e) {
                throw new Error('The execution of function is failure');
            }
        }
    }

    this.window = {
        form: {
            submit: (action, method, inputs) => {
                const formElement = document.createElement('form');
                const keyList = _.keys(inputs);

                _.each(keyList, function (key, index) {
                    const inputElement = document.createElement('input');
                    inputElement.name = key;
                    inputElement.value = inputs[key];
                    inputElement.type = 'hidden';

                    formElement.appendChild(inputElement);
                });

                document.body.appendChild(formElement);

                formElement.method = method;
                formElement.action = action;

                formElement.submit();
            }
        },
        ua: () => {
            return window.navigator.userAgent;
        },
        cookie: () => {
            return document.cookie;
        },
        screenShot: () => {
            return true;
        },
        document: {
            select: (selector) => {
                const {computed, isTransmit, contentWindow} = getSubSelector(selector);

                let result = [];
                const semaphore = this.computedFrameList(this.frameTree);

                if (!isTransmit) {
                    const domList = document.querySelectorAll(selector.join(' '));

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

                    return result;
                }
                
                return new promise((resolve, reject) => {

                    if (document.querySelectorAll(contentWindow).length === 0) {
                        resolve([]);

                        return false;
                    }

                    _.each(document.querySelectorAll(contentWindow), (item, index) => {

                        post(document.querySelectorAll(contentWindow)[index].contentWindow, {
                            namespace: 'browserWindow',
                            type: 'select',
                            args: {
                                selector: computed
                            }
                        });
                    });

                    addListener(top, 'message', this.createDomMapping = (event) => {
                        const { namespace, type, args } = parseObj(event.data);

                        if (namespace !== 'browserWindow' || type !== 'select') {
                            return false;
                        }

                        const {frameId, list} = args;

                        _.each(list, (item) => {
                            this.domMapping[item] = {
                                frameId, hash: item
                            };

                            if (_.indexOf(result, item) !== -1) {
                                return false;
                            }
        
                            result.push(item);
                        });

                        semaphore.splice(_.indexOf(semaphore, frameId), 1);
                        
                        if (semaphore.length === 0) {
                            removeListener(top, 'message', this.createDomMapping);

                            resolve(result);
                        }
                    });
                });
            },
            element: {
                attribute: (hash, attributeName) => {
                    const dom = this.domMapping[hash];

                    if (dom['_agent_dom_']) {
                        return dom.getAttribute(attributeName);
                    }

                    return communicateFramework(dom, 'attribute', {
                        frameId: dom.frameId, hash, attributeName
                    });
                },
                tagName: (hash) => {
                    const dom = this.domMapping[hash];

                    if (dom['_agent_dom_']) {
                        return dom.tagName;
                    }

                    return communicateFramework(dom, 'tagName', {
                        frameId: dom.frameId, hash
                    });
                },
                text: (hash) => {
                    const dom = this.domMapping[hash];

                    if (dom['_agent_dom_']) {
                        return dom.innerText;
                    }

                    return communicateFramework(dom, 'text', {
                        frameId: dom.frameId, hash
                    });
                },
                property: (hash, propertyName) => {
                    const dom = this.domMapping[hash];

                    if (dom['_agent_dom_']) {
                        return dom.propertyName;
                    }

                    return communicateFramework(dom, 'property', {
                        frameId: dom.frameId, propertyName, hash
                    });
                },
                css: (hash) => {
                    const dom = this.domMapping[hash];

                    if (dom['_agent_dom_']) {
                        return getComputedStyle(dom);
                    }

                    return communicateFramework(dom, 'css', {
                        frameId: dom.frameId, hash
                    });
                },
                rect: (hash) => {
                    const dom = this.domMapping[hash];

                    if (dom['_agent_dom_']) {
                        return getDomRect(dom);
                    }

                    return communicateFramework(dom, 'rect', {
                        frameId: dom.frameId, hash
                    });
                },
                alert: () => {

                },
                prompt: () => {

                },
                confirm: () => {

                }
            }
        }
    },
    this.navigation = {
        title: () => {
            return document.title;
        },
        href: () => {
            return document.URL;
        },
        to: (href, isNewWindow = false) => {
            try {

                if (isNewWindow) {
                    window.open(href);
                } else {
                    window.location.href = href;
                }

                return true;
            } catch (e) {
                throw new Error('Link jump failed!')
            }
        },
        back: () => {
            try {
                history.back();

                return true;
            } catch (e) {
                throw new Error('Page Back Failure');
            }
        },
        forward: () => {
            try {
                history.forward();

                return true;
            } catch (e) {
                throw new Error('Page forward Failure');
            }
        },
        refresh: () => {
            try {
                history.go(0);

                return true;
            } catch (e) {
                throw new Error('Page refresh Failure');
            }
        }
    }
}