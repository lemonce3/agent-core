const {updateChildren} = require('../utils/frameOperate');
const {addListener, dispatch, parseObj} = require('../utils/polyfill');
const create = require('../utils/ajax');

const agent = require('./agent');

const changeProgram = require('./program');

module.exports = function BrowserWindow(windowObj) {
    this.agentId = null;
    this.browserWindowId = null;

    this.frameTree = null;

    this.container = null;
    this.windowObj = windowObj;

    this.watcher = null;
    this.keepAliveWatcher = null;

    this.init = function () {
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

    this.setFrameTree = function ({symbol, children}) {
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

    this.removeChild = function ({symbol}) {
        if (this.frameTree) {
            delete this.frameTree[symbol];
        }
    }

    this.setAgentId = function (argv) {
        document.body.removeChild(this.container);
        
        this.agentId = argv[0];

        agent.ajax = create({
            baseURL: '/api/agent/' + argv[0]
        });

        this.setBrowserWindowId();
    }

    this.setBrowserWindowId = function () {
        const that = this;
        const meta = {
            title: this.windowObj.document.title,
            href: this.windowObj.document.URL,
            opener: this.windowObj.opener
        };

        // 传meta {title, href, opener}
        agent.ajax({
            method: 'post',
            url: '/window',
            success: function (res) {
                const {id} = parseObj(res);

                this.browserWindowId = id;

                this.keepBrowserWindowAlive();
            },
            error: function () {
                console.log(1);
            },
            context: that,
            send: JSON.stringify(meta)
        })
    }

    this.keepBrowserWindowAlive = function () {
        const that = this;

        if (this.keepAliveWatcher) {
            clearTimeout(this.keepAliveWatcher);
        }

        this.keepAliveWatcher = setTimeout(function () {
            agent.ajax({
                method: 'get',
                url: `/window/${that.browserWindowId}?timestamp=${new Date().getTime()}`,
                success: function (res) {
                    const {program} = parseObj(res);
    
                    if (program) {
                        changeProgram(program, that);
                    }
    
                    this.keepBrowserWindowAlive();
                },
                error: that.init,
                context: that
            })
        }, 50);

        // 让我们把这个参数抽出来
    }

    this.destroy = function () {
        const that = this;

        agent.ajax({
            method: 'delete',
            url: `/window/${that.browserWindowId}`,
            context: that
        })
    }

    this.lang = {
        object: {
            get: function(propKey) {
                return this[propKey];
            },
            set: function(propKey, value) {
                try {
    
                    this[propKey] = value;
                } catch (e) {
                    throw new Error('The operate to set prop fail.');
                }
    
                return true;
            },
            call: function(func) {
                func();
            },
            getAndCall: function(propKey) {
                const func = this[propKey];
    
                if (typeof func !== 'function') {
                    throw new Error('The prop is not a function.');
                }
    
                return func();
            }
        }
    }
}