const log = {
    info: function (text) {
        var old = $("#txtLog").val();
        $("#txtLog").val(`[${new Date(Date.now()).toLocaleString()}][INFO] ${text}\n${old}`);
    },
    warn: function (text) {
        var old = $("#txtLog").val();
        $("#txtLog").val(`[${new Date(Date.now()).toLocaleString()}][WARN] ${text}\n${old}`);
    },
    erro: function (text) {
        var old = $("#txtLog").val();
        $("#txtLog").val(`[${new Date(Date.now()).toLocaleString()}][ERRO] ${text}\n${old}`);
    }
}
const Helper = {
    getRandomInt: function (min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}