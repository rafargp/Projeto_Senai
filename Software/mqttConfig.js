//Cliente MQTT para gereciamento do protocolo
var mqttClient;

//Objeto MQTT com funções pertinentes ao protocolo
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
            console.log(responseObject)
            log.erro("MQTT -> onConnectionLost:" + responseObject.errorMessage);
        }
    },
    onMessageArrived: function (message) {
        var msg = message.payloadString;
        log.info(`MQTT -> onMessageArrived: ${msg}`)
        log.info(`MQTT -> processando mensagem`)
        var json = JSON.parse(msg);
        Station.processMessage(json);
    },
    onFailure: function (message) {
        log.erro("MQTT -> onFailure: Falha");
        setTimeout(MQTTconnect, 2000);
    },    
    onConnected: function (recon, url) {
        log.info("MQTT -> onConnected: " + reconn);
    },
    onConnect: function () {
        log.info("MQTT -> onConnect: " + mqttClient.isConnected());
    },
    subscribe: function (stopic, sqos) {
    
        if (!mqttClient.isConnected()) {
            log.erro("MQTT -> Não conectado, nao poderá subscrever");
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
            log.erro("MQTT -> Não conectado, nao poderá enviar");
            return;
        }
        log.info(`MQTT -> Enviando mensagem: "${msg}", Tópico: "${topic}", Retain: "${retain_flag}", QoS: ${pqos}`);
        if (pqos > 2) pqos = 0;
        message = new Paho.MQTT.Message(msg);
        message.destinationName = topic;
        message.qos = pqos;
        message.retained = retain_flag;
        mqttClient.send(message);
    }
}