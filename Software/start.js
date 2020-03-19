drawStations();
drawTableHeader();
addBeacon(beacon1);
MQTT.connect("brware.com.br",9001,"brware","SQRT(pi)!=314","frontEnd");

var trySubscribe = setInterval(function(){
    if(mqttClient.isConnected()) {
        MQTT.subscribe("/stations/beacons/get",0);
        clearInterval(trySubscribe);
    }
},500);