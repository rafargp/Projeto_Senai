// *****************************************************************
// ToDo: Deixar os Beacons Dinamico

const beacon1 = {
    id: function () { return this.mac.replace(":", ""); },
    name: "beacon1",
    mac: "123:123:123",
    rssi: -10,
    station: "station1",
    getStation: function () { return stations[this.station]; }
}

// *****************************************************************

function addBeacon(beacon) {
    if (stations[beacon.station] === undefined) {
        console.log(`addBeacon -> ${beacon.station} não encontrada`);
        return false;
    }
    stations[beacon.station].beacons.push(beacon);
    console.log(`addBeacon -> ${beacon.mac} adicionado`);
    return true;
}
function delBeacon(beacon) {
    if (stations[beacon.station] === undefined) {
        console.log(`delBeacon -> ${beacon.station} não encontrada`);
        return false;
    }
}

function reDrawTable() {
    for (station in stations) {
        for (beacon in stations[station].beacons) {
            var bc = stations[station].beacons[beacon];
            var row = $(`#${bc.id()}`)[0];
            if (row === undefined) {
                console.log(`reDrawTable -> Criando nova linha para beacon ${bc.name} (${bc.mac})`);
                drawTableRow(bc)
            } else {
                console.log(`reDrawTable -> Atualizando linha para beacon ${bc.name} (${bc.mac})`);
                reDrawTableRow(bc);
            }

        }
    }
}

function drawTableRow(beacon) {
    var st = beacon.getStation();
    var tBody = $("#tableBody");
    var tHeaders = $("#tableHead").find("th");

    var print = `<tr>`;
    for (var x = 0; x < tHeaders.length; x++) {
        var col = tHeaders[x];
        if (col.id === "") {
            print += `<th scope="row">${beacon.name}</th>`;
        } else if (col.id === st.id()) {
            print += `<th scope="row">${beacon.rssi}</th>`;
        } else {
            print += `<th scope="row">0</th>`;
        }
    }
    print += `</tr>`;

    console.log(`drawTableRow -> Nova linha criada para beacon ${beacon.name} (${beacon.mac})`);

    tBody.append(print);
}
function reDrawTableRow(beacon) {

}

if (addBeacon(beacon1)) reDrawTable();