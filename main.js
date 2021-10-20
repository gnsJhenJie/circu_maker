// detect is an array for searching all the box element that haven't been filled in
var detect = []; 

// give two point and draw a line
function drawLine(point_1, point_2){

    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");

    context.beginPath();
    context.moveTo(point_1[0], point_1[1]);

    // 2在右 : 先上再右(2在上) or 先右再下(2在下)
    // 1在右 : 先上再左(2在上) or 先下再左(2在下)
    if (point_1[0] < point_2[0] && (point_2[1] < point_1[1])) {
        context.lineTo(point_1[0], point_2[1]);
        context.moveTo(point_1[0], point_2[1]);
        context.lineTo(point_2[0], point_2[1]);
    }else if (point_1[0] < point_2[0] && (point_2[1] >= point_1[1])){
        context.lineTo(point_2[0], point_1[1]);
        context.moveTo(point_2[0], point_1[1]);
        context.lineTo(point_2[0], point_2[1]);
    }else if (point_1[0] > point_2[0] && (point_2[1] < point_1[1])){
        context.lineTo(point_1[0], point_2[1]);
        context.moveTo(point_1[0], point_2[1]);
        context.lineTo(point_2[0], point_2[1]);
    }else{
        context.lineTo(point_1[0], point_2[1]);
        context.moveTo(point_1[0], point_2[1]);
        context.lineTo(point_2[0], point_2[1]);
    }
    context.lineWidth = 6;
    context.closePath();
    context.stroke();
}

// for initialization : show DC & GND 
function showSource(x, y, src, width, height){

    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");

    var image = new Image();
    image.src = src;

    image.addEventListener('load', function(){
        if (width == 0){
            width = height / image.height * image.width;
        }
        if (height == 0){
            height = width / image.width * image.height;
        }
        
        context.drawImage(image, x, y, width, height);
    })
}

// when click series or parallel will use it (generate the box waiting for filling in)
function drawBox(start, end, height){
    let init_height = 100;
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");
    drawLine(start, [start[0] + 50, start[1]]);
    start = [start[0] + 50, start[1]];
    drawLine([end[0] - 50, end[1]], end);
    end = [end[0] - 50, end[1]];
    
    context.fillStyle = "black";
    context.fillRect(start[0], start[1] - height / 2, end[0] - start[0], height);

    detect.push([start[0], start[1] - height / 2 + init_height, end[0], end[1] + height / 2 + init_height]);
}

// when fill in the box and erase it
function eraseBox(start, end, height){
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(start[0], start[1] - height / 2, end[0] - start[0], height);
    
}

// based on the src input, show it on the canvas (resistance, capacitor, inductor)
function showUnit(start, end, src, width, height){
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");

    var image = new Image();
    image.src = src;

    image.addEventListener('load', function(){
        if (width == 0){
            width = height;
        }
        if (height == 0){
            height = width;
        }

        
        context.drawImage(image, (start[0] + end[0] - width) / 2, start[1] - height / 2, width, height);
        drawLine(start, [(start[0] + end[0] - width) / 2, start[1]]);
        drawLine([(start[0] + end[0] + width) / 2, start[1]], end);
    })
}

// show the series structure
function showSeries(unit, num){
    
    let end = unit.end;
    let start = unit.start;
    let delta = (end[0] - start[0]) / num;
    let units = [];
    
    for (let i = 0; i < num; i++){
        units.push(new Unit(start, [start[0] + delta, start[1]], (unit.width - num * 100) / num, unit.height));
        drawBox(start, [start[0] + delta, start[1]], unit.height);
        start = [start[0] + delta, start[1]];    
    }
    return units;
    
}

// show the parallel structure
function showParallel(unit, num){

    let end = unit.end;
    let start = unit.start;
    let height = unit.height;

    drawLine([start[0], start[1] - height / 2], [start[0], start[1] + height / 2]);
    drawLine([end[0], end[1] - height / 2], [end[0], end[1] + height / 2]);
    
    let delta = height / (num - 1);
    let units = [];
    start[1] = start[1] - height / 2 - delta;
    
    for (let i = 0; i < num; i++){ 
        units.push(new Unit([start[0], start[1] + delta], [end[0], start[1] + delta], unit.width, height / num));
        drawBox([start[0], start[1] + delta], [end[0], start[1] + delta], height / num);
        start = [start[0], start[1] + delta];    
    }
    return units;
}

// Initialization (line 140 to 148)
showSource(100, 400, "https://cdn-icons-png.flaticon.com/512/120/120319.png", 0, 100);
showSource(100, 550, "https://cdn-icons-png.flaticon.com/512/120/120324.png", 0, 100);

// connect DC & GND
drawLine([150, 500], [150, 570]);
// start = (150 350) end = (1200 350)
drawLine([150, 400], [150, 350]);
drawLine([1200, 350], [150, 540]);
drawBox([150, 350], [1200, 350], 200);



var canvas = document.getElementById("myCanvas");

canvas.addEventListener('mousemove', function(event){
    for(let i = 0; i < detect.length; i++){
        if (event.pageX > detect[i][0] && event.pageX < detect[i][2] && event.pageY > detect[i][1] && event.pageY < detect[i][3]){
            document.getElementsByTagName('body')[0].style.cursor = "pointer";
        }else{
            document.getElementsByTagName('body')[0].style.cursor = "default"; 
        }
    }
});

var typeBtn = document.getElementsByClassName('typeBtn');

for (let i = 0; i < typeBtn.length; i++){
    typeBtn[i].addEventListener("click", function(){
        eraseBox(head.start, head.end, head.height);
        detect.pop();

        switch (i){
            case 0:
                head.setType(1, 3);
                break;
            case 1:
                head.setType(-1, 3);
                break;
            case 2:
                head.setType(0, 0);
                break;
            case 3:
                head.setType(0, 1);
                break;
            case 4:
                head.setType(0, 2);
                break;
        }

        btnNotVisit();
    });
}

canvas.addEventListener("click", function(event){
    
    for(let i = 0; i < detect.length; i++){
        if (event.pageX > detect[i][0] && event.pageX < detect[i][2] && event.pageY > detect[i][1] && event.pageY < detect[i][3]){
            for (let j = 0; j < typeBtn.length; j++){
                btnCanVisit();
            }

        }else{
            btnNotVisit();
        }
    }
});

function btnCanVisit(){
    for (let i = 0; i < typeBtn.length; i++){
        typeBtn[i].style.display = "block";
    }
}
function btnNotVisit(){
    for (let i = 0; i < typeBtn.length; i++){
        typeBtn[i].style.display = "none";
    }
}

class Unit{
    
    constructor(start, end, width, height){

        // start and end are the array types [x, y]
        // width and height are the box size
        this.start = start;
        this.end = end;
        this.width = width;
        this.height = height;
    }

    // setter
    setType(type, num){
        /*******************************\ 
        **** type :                 **** 
        ****   1 : series           ****
        ****  -1 : parallel         ****
        ****   0 : electrical Unit  ****
        \*******************************/
        this.type = type;

        switch (type){
            case 1:
                this.Units = showSeries(this, num);
                break;
            case -1:
                this.Units = showParallel(this, num);
                break;
            case 0:
                if (num == 0){
                    let src = "https://cdn-icons-png.flaticon.com/512/120/120336.png";
                    showUnit(this.start, this.end, src, 0, 100);
                }else if (num == 1){
                    let src = "https://cdn-icons-png.flaticon.com/512/120/120302.png";
                    showUnit(this.start, this.end, src, 0, 100);
                }else if (num == 2){
                    let src = "https://cdn-icons-png.flaticon.com/512/114/114762.png";
                    showUnit(this.start, this.end, src, 0, 100);
                }
                    
                this.Units = [null];
                break;
        }

    }
    
}

var head = new Unit([200, 350], [1150, 350], 950, 200);
