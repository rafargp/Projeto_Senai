var mqttClient;

const MQTT = {
    connect: function (host,port,user,pass,clientId) {
        let mqtt = new Paho.MQTT.Client(host, port, clientId);
        mqtt.onConnectionLost = this.onConnectionLost;
        mqtt.onMessageArrived = this.onMessageArrived;
        mqtt.onConnected = this.onConnected;
        var options = {
            timeout: 10,
            cleanSession: false,
            onSuccess: this.onConnect,
            onFailure: this.onFailure,
            userName: user,
            password: pass,
        };
        mqtt.connect(options);
        mqttClient = mqtt;
    },
    onConnectionLost: function (responseObject) {
        if (responseObject.errorCode !== 0) {
            console.log("onConnectionLost:" + responseObject.errorMessage);
        }
    },
    onMessageArrived: function (message) {
        console.log("onMessageArrived:" + message.payloadString);
    },
    onFailure: function (message) {
        console.log("onFailure: Failed");
        setTimeout(MQTTconnect, 2000);
    },    
    onConnected: function (recon, url) {
        console.log("onConnected: " + reconn);
    },
    onConnect: function () {
        console.log("onConnect: " + mqttClient.isConnected());
    },
    subscribe: function (stopic, sqos) {
    
        if (!mqttClient.isConnected()) {
            console.log("Not Connected so can't subscribe");
            return;
        }
    
        if (sqos > 2) sqos = 0;
        var soptions = { qos: sqos };
        mqttClient.subscribe(stopic, soptions);
    },
    disconnect: function () {
        if (mqttClient.isConnected()) mqttClient.disconnect();
    },    
    sendMessage: function (topic, msg, retain_flag, pqos) {
        if (!mqttClient.isConnected()) {
            console.log("Not Connected so can't send");
            return;
        }
    
        if (pqos > 2) pqos = 0;
        message = new Paho.MQTT.Message(msg);
        message.destinationName = topic;
        message.qos = pqos;
        message.retained = retain_flag;
        mqttClient.send(message);
    }
}

// MQTT.connect("brware.com.br",9001,"brware","SQRT(pi)!=314","frontEnd");

// var trySubscribe = setInterval(function(){
//     if(mqttClient.isConnected()) {
//         MQTT.subscribe("/stations/beacons/get",0);
//         clearInterval(trySubscribe);
//     }
// },500);