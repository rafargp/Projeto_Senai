//Objeto responsavel pela ações dos Beacons
const Beacon = {
    //Método que desenha um Beacon no Canvas
    drawBeacon: function (beacon) {
        log.info(`drawBeacon -> ${beacon.mac}`);
        if (shapes.find(x => x.id == beacon.id()) !== undefined) return;
        shapes.push({ id: beacon.id(), x: Helper.getRandomInt(0, canvas.width), y: Helper.getRandomInt(0, canvas.height), r: 0, fill: "#FFFFFF", isDragging: false });
        Canvas.draw();
        log.info(`Beacon -> drawBeacon: beacon ${beacon.mac} foi desenhado em x=${beacon.x()}, y=${beacon.y()}`);
    },
    //Método que adiona um Beacon na estação indicada
    addBeacon: function (beacon) {
        if (beacon.getStation() === undefined) {
            log.erro(`Beacon -> addBeacon: ${beacon.station} não encontrada`);
            return false;
        }
        beacon.getStation().beacons.push(beacon);
        log.info(`Beacon -> addBeacon ${beacon.mac} adicionado`);
        this.drawBeacon(beacon);
        return true;
    },
    //Método que remove um Beacon da estação indicada
    delBeacon: function (station, beacon) {
        var canRemove = true;
        log.info(`delBeacon -> Validando se Beacon pode ser removido do Canvas`);
        for (i in stations) {
            if (stations[i].id() === station.id()) continue;
            canRemove = canRemove & (!stations[i].hasBeacon(beacon));
        }
        if (!canRemove) {
            log.warn(`delBeacon -> Beacon ${beacon.id()} não pode ser removido do Canvas pois há uma estação associada`);
            return;
        }
        for (var i = shapes.length - 1; i >= 0; --i) {
            if (shapes[i].id == beacon.id()) shapes.splice(i, 1);
        }
        log.warn(`delBeacon -> Beacon ${beacon.id()} removido do Canvas`);
        $(`#${beacon.id()}`).remove();
        log.warn(`delBeacon -> Beacon ${beacon.id()} removido da tabela`);
    },
    //Método que busca todos os Beacons
    getAllBeacons: function () {
        var allBeacons = [];
        for (i in stations) {
            for (z in stations[i].beacons) allBeacons.push(stations[i].beacons[z]);
        }
        return allBeacons;
    },
    //Método que atualiza os Beacons na tabela
    reDrawTable: function () {
        for (i in stations) {
            for (beacon in stations[i].beacons) {
                var bc = stations[i].beacons[beacon];
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
        this.updateZeroRssi();
    },
    //Método que cria uma nova linha na tabela para o Beacon indicado 
    drawTableRow: function (beacon) {
        var st = beacon.getStation();
        var tBody = $("#tableBody");
        var tHeaders = $("#tableHead").find("th");

        var print = `<tr id="${beacon.id()}">`;
        for (var x = 0; x < tHeaders.length; x++) {
            var col = tHeaders[x];
            if (col.id === "bMac") {
                print += `<th scope="row">${beacon.mac}</th>`;
            } else if (col.id === "bName") {
                if (beacon.name === "") print += `<th scope="row">S/N</th>`;
                else print += `<th scope="row">${beacon.name}</th>`;
            } else if (col.id === st.id()) {
                print += `<th scope="row">${beacon.rssi}</th>`;
            } else {
                print += `<th scope="row">0</th>`;
            }
        }
        print += `</tr>`;

        log.info(`drawTableRow -> Nova linha criada para beacon ${beacon.name} (${beacon.mac})`);

        tBody.append(print);
    },
    //Método que atualiza a linha do Beacon indicado
    reDrawTableRow: function (beacon) {
        var st = beacon.getStation();
        var colIndex = $(`#tableHead th#${st.id()}`).index();
        var row = $(`#${beacon.id()} th:eq(${colIndex})`);
        if (row[0] === undefined) {
            var old = $(`#${beacon.id()}`).html();
            $(`#${beacon.id()}`).html(`${old}<th scope="row">${beacon.rssi}</th>`);
        } else {
            $(`#${beacon.id()} th:eq(${colIndex})`).html(beacon.rssi);
            log.info(`reDrawTableRow -> Linha atualizada para beacon ${beacon.name} (${beacon.mac})`);
        }
    },
    //Método que preenche os campos vazios para as estações que nao possuem o Beacon
    updateZeroRssi: function () {
        log.warn(`updateZeroRssi -> Atualizando linhas da tabela`);
        for (i in stations) {
            var station = stations[i];
            var colIndex = $(`#tableHead th#${station.id()}`).index();
            $("#tableBody tr").each(function (i, row) {
                var id = row.id;
                if (station.hasBeaconId(id) !== undefined) return;
                var newRow = $(`#${id} th:eq(${colIndex})`);
                if (newRow[0] === undefined) {
                    var old = $(`#${id}`).html();
                    $(`#${id}`).html(`${old}<th scope="row">0</th>`);
                } else {
                    newRow.html(`0`);
                }
            });
        }
    }
}