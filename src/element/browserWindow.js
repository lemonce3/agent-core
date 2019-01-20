const {updateChildren} = require('../utils/frameOperate');

module.exports = function BrowserWindow() {
    this.agentId = null;
    this.browserWindowId = null;

    this.frameTree = null;

    this.watcher = null;

    this.init = function () {
        const agent = document.createElement('iframe');
    
        window.onload = function () {
            agent.src = 'http://192.168.31.107:8080/api/agent/fetch'; //改
            
            agent.width = 0;
            agent.height = 0;
            agent.style.display = 'none';
            document.body.appendChild(agent);
        
        }
    }

    this.setId = function (id) {
        this.agentId = id;
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

    this.destroy = function () {

    }
}