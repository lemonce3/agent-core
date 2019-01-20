const {updateChildren} = require('../utils/frameOperate');
const {addListener, dispatch, parseObj} = require('../utils/polyfill');

const agent = require('./agent');

const create = require('../utils/ajax');

module.exports = function BrowserWindow() {
    this.agentId = null;
    this.browserWindowId = null;
    this.program = null;

    this.frameTree = null;

    this.container = null;

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
        delete this.frameTree[symbol];
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

        agent.ajax({
            method: 'post',
            url: '/window',
            success: function (res) {
                const {id, program} = parseObj(res);

                this.browserWindowId = id;
                this.program = program;

                this.keepBrowserWindowAlive();
            },
            error: function () {
                console.log(1);
            },
            context: that
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
                success: that.keepBrowserWindowAlive,
                error: that.init,
                context: that
            })
        }, 9000);

    }

    this.destroy = function () {
        const that = this;

        agent.ajax({
            method: 'delete',
            url: `/window/${that.browserWindowId}`,
            context: that
        })
    }
}