// detect is an array for searching all the box element that haven't been filled in
var detect = []; 
//click_index to check which clicked unit is
var click_index;

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
function drawBox(unit){
    // we set the height of canvas
    let init_height = 100;
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");

    let start = unit.start;
    let end = unit.end;
    let height = unit.height;

    drawLine(start, [start[0] + 50, start[1]]);
    start = [start[0] + 50, start[1]];
    drawLine([end[0] - 50, end[1]], end);
    end = [end[0] - 50, end[1]];
    
    context.fillStyle = "black";
    context.fillRect(start[0], start[1] - height / 2, end[0] - start[0], height);

    detect.push([start[0], start[1] - height / 2 + init_height, end[0], end[1] + height / 2 + init_height, unit]);
}

// when fill in the box and erase it
function eraseBox(unit){
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");
    let start = unit.start;
    let end = unit.end; 
    let height = unit.height;
    start = [start[0] + 50, start[1]];
    end = [end[0] - 50, end[1]];
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
        if (width >= height){
            width = height;
        }else{
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
        drawBox(units[i]);
        start = [start[0] + delta, start[1]];    
    }
    return units;
    
}

// show the parallel structure
function showParallel(unit, num){

    let end = [unit.end[0] - 50, unit.end[1]];
    let start = [unit.start[0] + 50, unit.start[1]];
    let height = unit.height;

    drawLine([start[0], start[1] - height / 2], [start[0], start[1] + height / 2]);
    drawLine([end[0], end[1] - height / 2], [end[0], end[1] + height / 2]);
    
    let delta = height / (num - 1);
    let units = [];
    start[1] = start[1] - height / 2 - delta;
    
    for (let i = 0; i < num; i++){
        units.push(new Unit([start[0], start[1] + delta], [end[0], start[1] + delta], unit.width, height / num));
        drawBox(units[i]);
        start = [start[0], start[1] + delta];    
    }
    return units;
}

// Initialization (line 157 to 164)
showSource(100, 400, "https://cdn-icons-png.flaticon.com/512/120/120319.png", 0, 100);
showSource(100, 550, "https://cdn-icons-png.flaticon.com/512/120/120324.png", 0, 100);

// connect DC & GND
drawLine([150, 500], [150, 570]);
// start = (150 350) end = (1200 350)
drawLine([150, 400], [150, 300]);
drawLine([1200, 300], [150, 540]);



var canvas = document.getElementById("myCanvas");
var submitBtn = document.getElementsByClassName('submit');
var input = document.getElementsByTagName("input");

var functionBox = document.getElementsByClassName('functionBox');

for (let i = 0; i < submitBtn.length; i++){
    submitBtn[i].addEventListener("click", function(){
        eraseBox(detect[click_index][4]);
        switch (i){
            // set each button's duty
            case 0:
                detect[click_index][4].setType(1, parseInt(input[i].value), 0);
                break;
            case 1:
                detect[click_index][4].setType(-1, parseInt(input[i].value), 0);
                break;
            case 2:
                detect[click_index][4].setType(0, 0, parseInt(input[i].value));
                break;
            case 3:
                detect[click_index][4].setType(0, 1, parseInt(input[i].value));
                break;
            case 4:
                detect[click_index][4].setType(0, 2, parseInt(input[i].value));
                break;
        }
        detect.splice(click_index, 1);
        input[i].value = "";
        functionBox[0].style.display = "none";
    });
}

// move over boxes and change into pointer,
// while move out them and change into default
canvas.addEventListener('mousemove', function(event){
    for(let i = 0; i < detect.length; i++){
        if (event.pageX > detect[i][0] && event.pageX < detect[i][2] && event.pageY > detect[i][1] && event.pageY < detect[i][3]){
            canvas.style.cursor = "pointer";
            break;
        }else{
            canvas.style.cursor = "default"; 
        }
    }
});

// click at boxes open the Btns, 
// click at other place close them
canvas.addEventListener("click", function(event){
    for(let i = 0; i < detect.length; i++){
        if (event.pageX > detect[i][0] && event.pageX < detect[i][2] && event.pageY > detect[i][1] && event.pageY < detect[i][3]){
            click_index = i;
            functionBox[0].style.display = "flex";
            break;
        }else{
            functionBox[0].style.display = "none";
        }
    }
});

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
    setType(type, num, value){
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
                    showUnit(this.start, this.end, src, this.width, this.height);
                    // test
                    this.resistance = value;
                }else if (num == 1){
                    let src = "https://cdn-icons-png.flaticon.com/512/120/120302.png";
                    showUnit(this.start, this.end, src, this.width, this.height);
                }else if (num == 2){
                    let src = "https://cdn-icons-png.flaticon.com/512/114/114762.png";
                    showUnit(this.start, this.end, src, this.width, this.height);
                }
                    
                this.Units = [];
                break;
        }

    }
    calResistance(){
        let sum = 0;
        for (let i = 0; i < this.Units.length; i++){
            switch (this.type){
                case 1:
                    // Series
                    sum = sum + this.Units[i].calResistance();
                    break;
                case -1:
                    // Parallel
                    sum = sum + 1 / this.Units[i].calResistance();
                    break;
            }
        }
        if (this.type == -1){
            this.resistance = 1 / sum;
            return 1 / sum;
        }else if (this.type == 1){
            this.resistance = sum;
            return sum;
        }else{
            return this.resistance;
        }
    }
    
}

var head = new Unit([150, 300], [1200, 300], 950, 200);
drawBox(head);

// run button interaction effect
window.onload = function(){
    var runBtn = document.getElementsByClassName('run')[0];
    // click cal button to print out the total resistance in console
    runBtn.addEventListener('click', function(){
        console.log(head.calResistance());
    });

    runBtn.addEventListener('mouseover', function(){
        runBtn.style.cursor = "pointer"; 
    });

    runBtn.addEventListener('mouseleave', function(){
        runBtn.style.cursor = "default";
    });

};