const stations = [];

//Objeto responsavel por fazer a gestão das Estações
const Station = {
    //Método responsavel por adicionar uma nova estação
    addStation: function (station){
        if(stations[station.name] !== undefined){
            log.info(`addStation -> Estação ${station.name} ja existe na lista com id ${station.id()}`);
            return false;
        }
        stations.push(station);
        log.info(`addStation -> Estação ${station.name} foi criada com id ${station.id()}`);
        return true;
    },
    //Método responsavel por desenhar uma estação no Canvas
    drawStations: function(){
        for(var station in stations){
            var st = stations[station];
            if (shapes.find(x => x.id == st.id()) !== undefined) continue;
            shapes.push({id: st.id(), x:Helper.getRandomInt(0, canvas.width),y:Helper.getRandomInt(0, canvas.height),width:30,height:30,fill:"#FF0000",isDragging:false});
            Canvas.draw();
            log.info(`drawStations -> Estação ${st.name} (${st.mac}) desenhado em x:${st.x} y:${st.y}`);
        }
    },
    //Método responsavel por criar o cabeçalho na tabela de Estações
    drawTableHeader: function(){
        var tHead = document.getElementById("tableHead");
        for(var station in stations){
            var st = stations[station];
            if($(`#${st.id()}`)[0] !== undefined) continue;
            $(tHead).append(`<th scope="col" id="${st.id()}">${st.name} (${st.mac})</th>`);
            log.info(`drawTableHeader -> Estação ${st.name} (${st.mac}) adicionado como coluna. ID: ${st.id()}`);
        }
    }
}

