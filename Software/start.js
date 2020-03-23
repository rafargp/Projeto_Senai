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

    $(document).on("click", "#btnGetBeacons", function () {
        log.info("MQTT -> Publicando mensagem e aguardando retorno")
        MQTT.sendMessage("/stations/command", "findAndSendJSON", false, 0);
    });

});