const {updateChildren} = require('../utils/frameOperate');
const {addListener, dispatch, parseObj} = require('../utils/polyfill');
const {create} = require('../utils/request')

const agent = require('../agent');

const changeProgram = require('./program');

module.exports = function BrowserWindow(windowObj) {
    this.agentId = null;
    this.browserWindowId = null;

    this.frameTree = null;

    this.container = null;
    this.windowObj = windowObj;

    this.watcher = null;
    this.keepAliveWatcher = null;

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

    this.lang = {
        getTitle: () => {
            return this.windowObj.document.title;
        },
        getHref: () => {
            return this.windowObj.document.URL;
        },
        getOpener: () => {
            return this.windowObj.opener;
        },
        getUA: () => {
            return this.windowObj.navigator.userAgent;
        },
        getCookie: () => {

        },
        eval: (content) => {
            try {
                eval(content)
            } catch (e) {
                throw new Error('The execution of function is failure');
            }
        }
    }

    this.window = {
        form: {
            submit: () => {
                //添加假表单并提交；
            }
        }
    }
}