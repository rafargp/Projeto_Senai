$(document).ready(function () {

    log.info(`MQTT -> Conectado ao Broker`)
    MQTT.connect("brware.com.br", 9001, "brware", "SQRT(pi)!=314", "frontEnd");

    var trySubscribe = setInterval(function () {
        if (mqttClient.isConnected()) {
            log.info(`MQTT -> Subscrever ao tópico "/stations/beacons/get"`)
            MQTT.subscribe("/stations/beacons/get", 0);
            clearInterval(trySubscribe);
        }
    }, 500);

    shapes.push({id: "Server", x:10,y:10,width:40,height:40,fill:"#00FF00",isDragging:false});

    $(document).on("click", "#btnGetBeacons", function () {
        log.info("MQTT -> Publicando mensagem e aguardando retorno")
        MQTT.sendMessage("/stations/command", "findAndSendJSON", false, 0);
    });

});