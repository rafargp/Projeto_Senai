$(document).ready(function(){
    drawStations();
    drawTableHeader();
    addBeacon(beacon1);
    
    MQTT.connect("brware.com.br",9001,"brware","SQRT(pi)!=314","frontEnd");
    
    var trySubscribe = setInterval(function(){
        if(mqttClient.isConnected()) {
            log.info(`MQTT -> Subscribe to "/stations/beacons/get"`)
            MQTT.subscribe("/stations/beacons/get",0);
            clearInterval(trySubscribe);
        }
    },500);

    $(document).on("click","#btnGetBeacons",function(){
        log.info("MQTT -> Publicando mensagem")
        MQTT.sendMessage("/stations/command","findAndSendJSON",false,0);
    });

});