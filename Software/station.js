// *****************************************************************
// ToDo: Deixar Dinamico
const stations =  {
    station1: {
        id: function(){ return this.mac.replace(":","");},
        name: "station 1",
        mac: "123:123:123",
        x: 30,
        y: 30,
        beacons: []
    },
    station2: {
        id: function(){ return this.mac.replace(":","");},
        name: "station 2",
        mac: "321:321:321",
        x: 50,
        y: 50,
        beacons: []
    }
};

// *****************************************************************
function addStation(station){
    if(stations[station.name] !== undefined){
        console.log(`addStation -> Estação ${station.name} ja existe na lista com id ${station.id()}`);
        return false;
    }
    stations.push(station);
    console.log(`addStation -> Estação ${station.name} foi criada com o id ${station.id()}`);
    return true;
}
function drawStations(){
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    for(var station in stations){
        var st = stations[station];
        ctx.fillRect(st.x,st.y,10,10);
        console.log(`drawStations -> Estação ${st.name} (${st.mac}) desenhado em x:${st.x} y:${st.y}`);
    }
}

function drawTableHeader(){
    var tHead = document.getElementById("tableHead");
    for(var station in stations){
        var st = stations[station];
        $(tHead).append(`<th scope="col" id="${st.id()}">${station}</th>`);
        console.log(`drawTableHeader -> Estação ${st.name} (${st.mac}) adicionado como coluna. ID: ${st.id()}`);
    }
}

drawStations();
drawTableHeader();