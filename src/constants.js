const constObj = {
    TAGLIST: ['frame', 'iframe'],
    frameListLength: function () {
        return document.querySelectorAll(constObj.TAGLIST.join(',')).length;
    }
};

module.exports = constObj;