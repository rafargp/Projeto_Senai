$(document).ready(function () {

    //Configuração de Setup do site
    log.info(`MQTT -> Conectado ao Broker`);
    MQTT.connect("brware.com.br", 9001, "brware", "SQRT(pi)!=314", "frontEnd");

    //Tenta subscrever ao tópico
    var trySubscribe = setInterval(function () {
        if (mqttClient.isConnected()) {
            log.info(`MQTT -> Subscrever ao tópico "/stations/beacons/get"`)
            MQTT.subscribe("/stations/beacons/get", 0);
            clearInterval(trySubscribe);
        }
    }, 500);

    //Inclui um shape que simulará o data center mais proximo
    shapes.push({id: "Server", x:10,y:10,width:40,height:40,fill:"#00FF00",isDragging:false});

    //
    $(document).on("click", "#btnGetBeacons", function () {
        log.info("MQTT -> Publicando mensagem e aguardando retorno")
        MQTT.sendMessage("/stations/command", "findAndSendJSON", false, 0);
    });
    $(document).on("click", "#btnClearLog", function () {
        log.clear();
    });
    $(document).on("click", "#btnGetNearBeacon", function () {
        var server = shapes.find(x => x.id == "Server");
        var b = Application.getNearestBeacon(server);
        shapes.find(x => x.id === b.beacon.id()).fill = "#0000FF";
        Canvas.draw();
        alert(`Beacon mais Proximo: ${b.beacon.name} [${b.beacon.mac}]: ~ ${b.distance} Metros`)
    });
    

});