const stations = [];

const Station = {
    processMessage(message){
        log.info("Station -> processMessage: Processando Mensagem")
        var cBeacons = message.e.length;
        log.info(`Station -> processMessage: Estação ${message.stNome} [${message.stMac}]`);
        log.info(`Station -> processMessage: Encontrado(s) ${cBeacons} Beacons`);
        var st = {
            id: function(){ return this.mac.replace(":","");},
            name: message.stNome,
            mac: message.stMac,
            x:Helper.getRandomInt(0,canvas.width), 
            y:Helper.getRandomInt(0,canvas.height),
            beacons: []
        };
        this.addStation(st);
        this.drawStations();
        this.drawTableHeader();

        for(beacon in message.e){
            var bc = {
                id: function () { return this.mac.replace(":", ""); },
                name: message.e[beacon].n,
                mac: message.e[beacon].m,
                rssi: message.e[beacon].r,
                station: message.stMac,
                x:Helper.getRandomInt(0,canvas.width), 
                y:Helper.getRandomInt(0,canvas.height),
                getStation: function () { return stations.find(x => x.id() === message.stMac.replace(":","")); }
            }
            Beacon.addBeacon(bc);
        }
        return true;
    },
    addStation: function (station){
        if(stations[station.name] !== undefined){
            log.info(`addStation -> Estação ${station.name} ja existe na lista com id ${station.id()}`);
            return false;
        }
        stations.push(station);
        log.info(`addStation -> Estação ${station.name} foi criada com id ${station.id()}`);
        return true;
    },
    drawStations: function(){
        for(var station in stations){
            var st = stations[station];
            shapes.push({x:st.x,y:st.y,width:25,height:20,fill:"#FF0000",isDragging:false});
            Canvas.draw();
            log.info(`drawStations -> Estação ${st.name} (${st.mac}) desenhado em x:${st.x} y:${st.y}`);
        }
    },    
    drawTableHeader: function(){
        var tHead = document.getElementById("tableHead");
        for(var station in stations){
            var st = stations[station];
            $(tHead).append(`<th scope="col" id="${st.id()}">${st.name}</th>`);
            log.info(`drawTableHeader -> Estação ${st.name} (${st.mac}) adicionado como coluna. ID: ${st.id()}`);
        }
    }
}

