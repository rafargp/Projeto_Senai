var shapes = [];
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var BB = canvas.getBoundingClientRect();
var offsetX = BB.left;
var offsetY = BB.top;
var dragok = false;
var startX;
var startY;

//Setup do Canvas
$(document).ready(function () {
    canvas.onmousedown = Canvas.myDown;
    canvas.onmouseup = Canvas.myUp;
    canvas.onmousemove = Canvas.myMove;
});

//Objeto responsavel por gerenciar os dados do Canvas
const Canvas = {
    //Método que limpa o Canvas
    clear: function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    //Método desenha um retangulo
    rect: function (r) {
        ctx.fillStyle = r.fill;
        ctx.fillRect(r.x, r.y, r.width, r.height);
    },
    //Método desenha um circulo
    circle: function (c) {
        ctx.fillStyle = c.fill;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    },
    //Método desenha os shapes
    draw: function () {
        this.clear();
        for (var i = 0; i < shapes.length; i++) {
            if (shapes[i].width) this.rect(shapes[i]);
            else this.circle(shapes[i]);
        }
    },
    //Método Handler para MouseDown no Canvas
    myDown: function (e) {
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // get the current mouse position
        var mx = parseInt(e.clientX - offsetX);
        var my = parseInt(e.clientY - offsetY);

        // test each shape to see if mouse is inside
        dragok = false;
        for (var i = 0; i < shapes.length; i++) {
            var s = shapes[i];
            // decide if the shape is a rect or circle               
            if (s.width) {
                // test if the mouse is inside this rect
                if (mx > s.x && mx < s.x + s.width && my > s.y && my < s.y + s.height) {
                    // if yes, set that rects isDragging=true
                    dragok = true;
                    s.isDragging = true;
                }
            }
        }
        // save the current mouse position
        startX = mx;
        startY = my;
    },
    //Método Handler para MouseUp no Canvas
    myUp: function (e) {
        // tell the browser we're handling this mouse event
        e.preventDefault();
        e.stopPropagation();

        // clear all the dragging flags
        dragok = false;
        for (var i = 0; i < shapes.length; i++) shapes[i].isDragging = false;
    },
    //Método Handler para MouseMove no Canvas
    myMove: function (e) {
        // if we're dragging anything...
        if (dragok) {
            // tell the browser we're handling this mouse event
            e.preventDefault();
            e.stopPropagation();
            // get the current mouse position
            var mx = parseInt(e.clientX - offsetX);
            var my = parseInt(e.clientY - offsetY);
            // calculate the distance the mouse has moved
            // since the last mousemove
            var dx = mx - startX;
            var dy = my - startY;
            // move each rect that isDragging 
            // by the distance the mouse has moved
            // since the last mousemove
            for (var i = 0; i < shapes.length; i++) {
                var s = shapes[i];
                if (s.isDragging) {
                    s.x += dx;
                    s.y += dy;
                }
            }
            // redraw the scene with the new rect positions
            Application.calculatePosition();
            Canvas.draw();
            // reset the starting mouse position for the next mousemove
            startX = mx;
            startY = my;
        }
    }
}
