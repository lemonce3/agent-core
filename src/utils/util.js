function fillArray (arr, content) {
    const length = arr.length;

    for (let i = 0; i < length; i++) {
        arr[i] = content;
    }

    return arr;
}

function generateSymbol() {
    return Math.random().toString(36).substr(2);
}

module.exports = {
    fillArray, generateSymbol
}