//Proporção
var px_meter = 8.5;

const Application = {
    processMessage: function (message) {
        log.info("Station -> processMessage: Processando Mensagem")
        var cBeacons = message.e.length;
        log.info(`Station -> processMessage: Estação ${message.stNome} [${message.stMac}]`);
        log.info(`Station -> processMessage: Encontrado(s) ${cBeacons} Beacons`);
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
            Station.addStation(st);
            Station.drawStations();
            Station.drawTableHeader();
        } else {
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
            Beacon.addBeacon(bc);
        }

        Beacon.reDrawTable();
        this.calculatePosition();
        Canvas.draw();
        return true;
    },
    calculatePosition: function () {
        var beacons = [];
        var groupBeacon = Helper.groupBy(Beacon.getAllBeacons(), "mac");
        for (i in groupBeacon) {
            if (groupBeacon[i].length > 2) {
                beacons.push(groupBeacon[i]);
            }else{
                let sp = shapes.find(x => x.id === groupBeacon[i][0].id());
                sp.fill = "#FFFFFF";
                sp.r = 0;
            }
        }
        if (beacons.length == 0) return;

        for (i in beacons) {
            let bId = "";
            let input = [];
            for (z in beacons[i]) {
                bId = beacons[i][z].id();
                var st = beacons[i][z].getStation();
                input.push([parseInt(st.x(), 10), parseInt(st.y(), 10), this.calculateDistance(beacons[i][z].rssi)]);
            }
            let output = trilat(input);
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
    },
    calculateDistance: function (rssi) {
        let P = -69;
        let n = 3;
        let d = Math.pow(10, (P - rssi) / (10 * n));
        return d * px_meter;
    }
}