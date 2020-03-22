var drawGrid = function (w, h, id) {
    var canvas = document.getElementById(id);
    var ctx = canvas.getContext('2d');
    ctx.canvas.width = w;
    ctx.canvas.height = h;


    for (x = 0; x <= w; x += 20) {
        for (y = 0; y <= h; y += 20) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
    }
};
var log = {
    info: function (text){
        var old = $("#txtLog").val();
        $("#txtLog").val(`${old}[${new Date(Date.now()).toLocaleString()}][INFO] ${text}\n`);
    },
    warn: function (text){
        var old = $("#txtLog").val();
        $("#txtLog").val(`${old}[${new Date(Date.now()).toLocaleString()}][WARN] ${text}\n`);
    },
    erro: function (text){
        var old = $("#txtLog").val();
        $("#txtLog").val(`${old}[${new Date(Date.now()).toLocaleString()}][ERRO] ${text}\n`);
    }
}