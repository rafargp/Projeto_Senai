//Objeto responsavel por gerenciar o Log
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
    },
    clear: function () {
        $("#txtLog").val(``);
    }
}
//Objeto responsavel por conter funções de apoio
const Helper = {
    //Método gerador de número randomico
    getRandomInt: function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    //Calculo de distancia usando o teorema de pitagoras
    pythagoras: function(x1,y1,x2,y2){
        var a = x1 - x2;
        var b = y1 - y2;
        return Math.sqrt( a*a + b*b );
    },
    //Método agrupador de objetos em um array
    groupBy: function(collection, property) {
        var i = 0, val, index,
            values = [], result = [];
        for (; i < collection.length; i++) {
            val = collection[i][property];
            index = values.indexOf(val);
            if (index > -1)
                result[index].push(collection[i]);
            else {
                values.push(val);
                result.push([collection[i]]);
            }
        }
        return result;
    }
    
}
