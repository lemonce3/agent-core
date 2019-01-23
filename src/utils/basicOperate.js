module.exports = {
    get: function(propKey) {
        return this[propKey] ? this[propKey] : false;
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

// 改改？