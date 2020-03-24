//Proporção de metros para pixels
var px_meter = 100;

//Objeto responsavel pelas regras de negócio
const Application = {
    //Método que recebe a mensagem e processa os dados de acordo com as regras de negócio
    processMessage: function (message) {
        log.info("Application -> processMessage: Processando Mensagem")
        var cBeacons = message.e.length;
        log.info(`Application -> processMessage: Estação ${message.stNome} [${message.stMac}]`);
        log.info(`Application -> processMessage: Encontrado(s) ${cBeacons} Beacons`);
        var st = {
            id: function () { return this.mac.split(":").join(""); },
            name: message.stNome,
            mac: message.stMac,
            x: function () { return shapes.find(x => x.id == this.id()).x },
            y: function () { return shapes.find(x => x.id == this.id()).y },
            beacons: [],
            hasBeacon: function (beacon) { return this.beacons.find(x => x.id() === beacon.id()) },
            hasBeaconId: function (bId) { return this.beacons.find(x => x.id() === bId) }
        };

        var currentStation = stations.find(x => x.id() === st.id());

        if (currentStation === undefined) {
            log.info(`Application -> processMessage: Criando nova estação`);
            Station.addStation(st);
            Station.drawStations();
            Station.drawTableHeader();
        } else {
            log.warn(`Application -> processMessage: Estação ja existe`);
            log.info(`Application -> processMessage: Limpando Beacons existentes`);
            for (i in currentStation.beacons) Beacon.delBeacon(currentStation, currentStation.beacons[i]);
            currentStation.beacons = [];
        }

        for (beacon in message.e) {
            var bc = {
                id: function () { return this.mac.split(":").join(""); },
                name: message.e[beacon].n,
                mac: message.e[beacon].m,
                rssi: message.e[beacon].r,
                station: message.stMac,
                x: function () { return shapes.find(x => x.id == this.id()).x },
                y: function () { return shapes.find(x => x.id == this.id()).y },
                getStation: function () { return stations.find(x => x.id() === message.stMac.split(":").join("")); }
            }
            log.warn(`Application -> processMessage: Adicionando novos Beacons`);
            Beacon.addBeacon(bc);
        }
        Beacon.reDrawTable();
        this.calculatePosition();
        Canvas.draw();
        log.warn(`Application -> processMessage: Mensagem processada`);
        return true;
    },
    //Método que calula a posição dos beacons de acordo com a posição das estações
    calculatePosition: function () {
        log.info(`Application -> calculatePosition: Agrupando beacons`);
        var beacons = [];
        var groupBeacon = Helper.groupBy(Beacon.getAllBeacons(), "mac");
        log.info(`Application -> calculatePosition: Beacons agrupados em ${groupBeacon.length} grupo(s)`);
        for (i in groupBeacon) {
            if (groupBeacon[i].length > 2) {
                log.info(`Application -> calculatePosition: Grupo ${i} possui mais de 2 estações associadas`);
                beacons.push(groupBeacon[i]);
            }else{
                log.info(`Application -> calculatePosition: Grupo ${i} possui menos de 2 estações associadas`);
                log.info(`Application -> calculatePosition: Ocultando beacon ${groupBeacon[i][0].id()} sem localização definida`);
                let sp = shapes.find(x => x.id === groupBeacon[i][0].id());
                sp.fill = "#FFFFFF";
                sp.r = 0;
            }
        }
        if (beacons.length == 0) {
            log.warn(`Application -> calculatePosition: Nenhum grupo de ao menos 3 estaçoes foi encontrado!`);   
            return;
        }
        log.info(`Application -> calculatePosition: Iniciando calulo do posicionamento dos beacons`);   
        for (i in beacons) {
            let bId = "";
            let input = [];
            for (z in beacons[i]) {
                bId = beacons[i][z].id();
                var st = beacons[i][z].getStation();
                input.push([parseInt(st.x(), 10), parseInt(st.y(), 10), this.calculateDistance(beacons[i][z].rssi)]);
            }
            log.info(`Application -> calculatePosition: Triangulando estações`);   
            let output = trilat(input);
            log.info(`Application -> calculatePosition: Beacon ${bId}, novas coordenadas x=${output[0]}, y=${output[1]}`);   
            let coords = {
                x: parseInt(output[0], 10),
                y: parseInt(output[1], 10)
            };
            var shape = shapes.find(x => x.id === bId);
            if (shape !== undefined) {
                shape.x = coords.x;
                shape.y = coords.y;
                shape.fill = "#000000";
                shape.r = 20;
            }
        }
        log.info(`Application -> calculatePosition: Todos os Beacons foram reposicionados`);
    },
    //Método para encontrar o beacon mais proximo do objeto enviado por parametro
    getNearestBeacon: function(element){
        log.info(`Application -> getNearestBeacon: Buscando beacons triangulados`);
        var beacons = [];
        var groupBeacon = Helper.groupBy(Beacon.getAllBeacons(), "mac");
        for (i in groupBeacon) {
            if (groupBeacon[i].length > 2) beacons.push(groupBeacon[i]);
        }
        if (beacons.length == 0) {
            log.warn(`Application -> getNearestBeacon: Nenhum beacon triangulado para calculo`);
            return;
        }
        log.info(`Application -> getNearestBeacon: ${beacons.length} beacon(s) encontrados`);
        let nearBeacon = { beacon: undefined, distance: 99999 }
        for(z in beacons){
            for(i in beacons[z]){
                log.info(`Application -> getNearestBeacon: Calculando distancia`);
                var d = Helper.pythagoras(element.x,element.y,beacons[z][i].x(),beacons[z][i].y());
                log.info(`Application -> getNearestBeacon: Beacon ${beacons[z][i].id()}, Distancia: ${d}`);
                if( d < nearBeacon.distance){
                    log.info(`Application -> getNearestBeacon: Nova Menor distancia encontrada`);
                    nearBeacon.beacon = beacons[z][i];
                    nearBeacon.distance = d;
                }
            }
        }
        nearBeacon.distance /= px_meter;
        log.info(`Application -> getNearestBeacon: Beacon ${nearBeacon.beacon.id()} com menor distancia de ${nearBeacon.distance}M encontrado`);
        return nearBeacon;
    },
    //Método calcula distancia baseado na força do sinal
    calculateDistance: function (rssi) {
        let P = -69;
        let n = 3;
        let d = Math.pow(10, (P - rssi) / (10 * n));
        return d * px_meter;
    }
}