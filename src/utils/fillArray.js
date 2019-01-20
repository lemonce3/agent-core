module.exports = function (arr, content) {
    const length = arr.length;

    for (let i = 0; i < length; i++) {
        arr[i] = content;
    }

    return arr;
}