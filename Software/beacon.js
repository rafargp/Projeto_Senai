const Beacon = {
    drawBeacon: function (beacon) {
        log.info(`drawBeacon -> ${beacon.mac}`);
        if(shapes.find(x => x.id == beacon.id()) !== undefined) return;
        shapes.push({ id: beacon.id(), x: beacon.x, y: beacon.y, r: 20, fill: "#800080", isDragging: false });
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
        
        return true;
    },
    delBeacon: function (station,beacon) {
        var canRemove = true;
        for(i in stations){
            if(stations[i].id() === station.id()) continue;
            canRemove = canRemove & (!stations[i].hasBeacon(beacon));
        }
        if(!canRemove) return;
        for (var i = shapes.length - 1; i >= 0; --i){
            if (shapes[i].id == beacon.id()) shapes.splice(i,1);        
        }
        $(`#${beacon.id()}`).remove();
    },
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
    drawTableRow: function (beacon) {
        var st = beacon.getStation();
        var tBody = $("#tableBody");
        var tHeaders = $("#tableHead").find("th");

        var print = `<tr id="${beacon.id()}">`;
        for (var x = 0; x < tHeaders.length; x++) {
            var col = tHeaders[x];
            if (col.id === "bMac") {
                print += `<th scope="row">${beacon.mac}</th>`;
            }else if (col.id === "bName") {
                if(beacon.name === "") print += `<th scope="row">S/N</th>`;
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
    reDrawTableRow: function(beacon){
        var st = beacon.getStation();
        var colIndex = $(`#tableHead th#${st.id()}`).index();
        var row = $(`#${beacon.id()} th:eq(${colIndex})`);
        if(row[0] === undefined){
            var old = $(`#${beacon.id()}`).html();
            $(`#${beacon.id()}`).html(`${old}<th scope="row">${beacon.rssi}</th>`);
        }else{
            $(`#${beacon.id()} th:eq(${colIndex})`).html(beacon.rssi);
            log.info(`reDrawTableRow -> Linha atualizada para beacon ${beacon.name} (${beacon.mac})`);
        }
    },
    updateZeroRssi: function(){
        for(i in stations){
            var station = stations[i];
            var colIndex = $(`#tableHead th#${station.id()}`).index();
            $("#tableBody tr").each(function(i,row){
                var id = row.id;
                if(station.hasBeaconId(id) !== undefined) return;
                var newRow = $(`#${id} th:eq(${colIndex})`);
                if(newRow[0] === undefined){
                    var old = $(`#${id}`).html();
                    $(`#${id}`).html(`${old}<th scope="row">0</th>`);    
                }else{
                    newRow.html(`0`);
                }
            });
        }
    }
}