const Beacon = {
    drawBeacon: function (beacon) {
        log.info(`drawBeacon -> ${beacon.mac}`);
        shapes.push({ x: beacon.x, y: beacon.y, r: 20, fill: "#800080", isDragging: false });
        Canvas.draw();
        log.info(`drawBeacon -> beacon ${beacon.mac} foi desenhado em x=${beacon.x}, y=${beacon.y}`);
    },
    addBeacon: function (beacon) {
        if (beacon.getStation() === undefined) {
            log.erro(`addBeacon -> ${beacon.station} não encontrada`);
            return false;
        }
        beacon.getStation().beacons.push(beacon);
        log.info(`addBeacon -> ${beacon.mac} adicionado`);
        this.drawBeacon(beacon);
        this.reDrawTable();
        return true;
    },
    delBeacon: function (beacon) {
        if (beacon.getStation() === undefined) {
            log.erro(`delBeacon -> ${beacon.station} não encontrada`);
            return false;
        }
    },
    reDrawTable: function () {
        for (station in stations) {
            for (beacon in stations[station].beacons) {
                var bc = stations[station].beacons[beacon];
                var row = $(`#${bc.id()}`)[0];
                if (row === undefined) {
                    log.info(`reDrawTable -> Criando nova linha para beacon ${bc.name} (${bc.mac})`);
                    this.drawTableRow(bc)
                } else {
                    log.info(`reDrawTable -> Atualizando linha para beacon ${bc.name} (${bc.mac})`);
                    this.reDrawTableRow(bc);
                }
            }
        }
    },
    drawTableRow: function (beacon) {
        var st = beacon.getStation();
        var tBody = $("#tableBody");
        var tHeaders = $("#tableHead").find("th");

        var print = `<tr>`;
        for (var x = 0; x < tHeaders.length; x++) {
            var col = tHeaders[x];
            if (col.id === "") {
                print += `<th scope="row">${beacon.mac}</th>`;
            } else if (col.id === st.id()) {
                print += `<th scope="row">${beacon.rssi}</th>`;
            } else {
                print += `<th scope="row">0</th>`;
            }
        }
        print += `</tr>`;

        log.info(`drawTableRow -> Nova linha criada para beacon ${beacon.name} (${beacon.mac})`);

        tBody.append(print);
    }
}