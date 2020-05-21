// BY BREZHART
// Код польностью мой, за исключением функций помеченых /*<*-COPIED-*>*/


/*<*-COPIED-*>*/ function gRI(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function getAllIndexes(arr, val) { 
    var indexes = [], i = -1;
    while ((i = arr.indexOf(val, i+1)) != -1){
        indexes.push(i);
    }
    return indexes;
}
/*<*-COPIED-*>*/ function LightenColor(color, percent) {
    var num = parseInt(color.replace("#",""),16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) + amt,
        B = (num >> 8 & 0x00FF) + amt,
        G = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
};
function isItemInArray(array, item) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][0] == item[0] && array[i][1] == item[1]) {
            return true;   // Found it
        }
    }
    return false;   // Not found
}
function exportGame(snakeArr,field,foodLim,energyLim,id,iter) {
    let gameData = {snakesArr: [], field: field.area,foodLim: foodLim,energyLim:energyLim};

    for (let i = 0; i < snakeArr.length; i++){
        let s = snakeArr[i];
        let visArr = [];
        for (let g = 0; g < s.view.area.length; g++){ 
            visArr.push([]);
            for (let j = 0; j < s.view.area[g].length;j++){
                let sF = s.view.area[g][j].food;
                let sW = s.view.area[g][j].walls;
                visArr[g].push([[sF.e,sF.s,sF.w,sF.n],[sW.e,sW.s,sW.w,sW.n]]);
            }
        }
        let tail = [];
        for (let g = 0; g < s.poss.length; g++){
            tail.push([s.poss[g].x,s.poss[g].y])
        }
        gameData.snakesArr.push({tail:tail,visArr: visArr ,color:s.color,energy:s.energy});
    }
    gameData.iter = iter;
    gameData.id = id;
    return JSON.stringify(gameData);
}
function importGame(gameData,snakesArr) {
    let field = new Field(255,255);
    field.area = gameData.field;
    for (let i = 0; i < gameData.snakesArr.length; i++){
        let newSnake = new Snake(11,11,[],field,gameData.snakesArr[i].color,[],gameData.snakesArr[i].energy,0);
        gDV = gameData.snakesArr[i].visArr; // gameDataVis
        let newVis = [];
        for (let g = 0; g < newSnake.view.h; g++){
            newVisStr = [];
            for (let j = 0; j < newSnake.view.w; j++){
                newVisStr.push({
                    food: {e:gDV[g][j][0][0],s:gDV[g][j][0][1],w:gDV[g][j][0][2],n:gDV[g][j][0][3]},
                    walls: {e:gDV[g][j][1][0],s:gDV[g][j][1][1],w:gDV[g][j][1][2],n:gDV[g][j][1][3]}
                })

            }
            newVis.push(newVisStr);
        }
        newSnake.view.area = newVis;
        let newTail = [];
        for (let g = 0; g < gameData.snakesArr[i].tail.length;g++){
            newTail.push({x:gameData.snakesArr[i].tail[g][0], y:gameData.snakesArr[i].tail[g][1]});
        }
        newSnake.poss = newTail;
        newSnake.pos = newSnake.poss[0];
        snakesArr.push(newSnake)
    }
    return {foodLim: gameData.foodLim,foodNow: gameData.foodNow,energyLim:gameData.energyLim,field: field, lId: gameData.id, iter: gameData.iter}
}



//----------------------------------------------------------------------------------------------------------------------
class Food{
    constructor(field){
        this.field = {x:field.w,y:field.h};
        this.x = gRI(0,field.w-1);
        this.y = gRI(0,field.h-1);
        while (field.area[this.y][this.x] != "A"){
            this.x = gRI(1,field.w -1);
            this.y = gRI(1,field.h - 1);
        }
        field.area[this.y][this.x] = "F";
    }

}
//----------------------------------------------------------------------------------------------------------------------
class Field{
    constructor(w,h){
        /*
        A - air (free space)
        W - wall (wall )
        H - head (Same as )
         */
        this.w = w;
        this.h = h;
        this.area = []
        for (let i = 0; i < this.h; i++){
            let row = [];
            for (let g = 0; g < this.w; g++){
                row.push((i == 0 || g == 0 || g == this.w - 1 || i == this.h - 1) ? "W" : "A");

            }
            this.area.push(row)
        }
    }
    draw(ctx,w,h){

        for (var i = 0; i < this.h; i++){
            for (var g = 0; g < this.w; g++){
                let color = 'white';
                switch (this.area[i][g]) {
                    case "A":
                        color =  "#E0E0E0";
                        break;
                    case "W":
                        color = "black";
                        break;
                    case "F":
                        color = "yellow";
                        break;

                }
                ctx.beginPath();
                ctx.fillStyle = color;
                let s = Math.min(w,h);
                ctx.fillRect(g*(s/this.w), i*(s/this.h),s/this.w,s/this.h);
                ctx.closePath();
            }
        }



    }
    drawCells(ctx,w,h){
        for (let g = 0; g < this.h; g++) {
            ctx.beginPath();
            ctx.strokeStyle = "white";
            let s = Math.min(w, h);
            ctx.moveTo( s/this.h * g, 0);
            ctx.lineTo(s/this.h * g, s );
            ctx.stroke();
            ctx.closePath();
        }
        for (let g = 0; g < this.w; g++) {
            ctx.beginPath();
            ctx.strokeStyle = "white";
            let s = Math.min(w, h);
            ctx.moveTo(0, s/this.w * g);
            ctx.lineTo(s,s/this.w * g);
            ctx.stroke();
            ctx.closePath();
        }

    }
}
//----------------------------------------------------------------------------------------------------------------------
class Snake{
    constructor(w,h,tail,field,color,visArr,energy,mutated) {
        this.mutArr = 0;
        this.field = field;
        this.energy = energy;
        this.view = {w:w,h:h};
        this.poss = tail;
        this.dead = false;
        this.color = color;
        for (let i = 0; i <  this.poss.length; i++){
            this.field.area[this.poss[i].y][this.poss[i].x] = "W"
        }

        this.pos = this.poss[0];
        this.view.area = visArr;
    }
    wSum(field){ // return sum of all weights (food and walls)
        let dirObj = {e:0,s:0,w:0,n:0}; // returning object that have sum of detects cell
        for (let i = 0; i < this.view.h; i++){
            for (let g = 0; g < this.view.w; g++){
                let posNX = this.pos.x - (this.view.w - 1)/2 + g;
                let posNY = this.pos.y - (this.view.h - 1)/2 + i;
                if ((posNX >=0 && posNX < field.w) && (posNY >=0 && posNY < field.h)) {
                    if (field.area[posNY][posNX] === "F") {
                        dirObj.e += this.view.area[i][g].food.e;
                        dirObj.s += this.view.area[i][g].food.s;
                        dirObj.w += this.view.area[i][g].food.w;
                        dirObj.n += this.view.area[i][g].food.n;
                    } else if (field.area[posNY][posNX] === "W") {
                        dirObj.e += this.view.area[i][g].walls.e;
                        dirObj.s += this.view.area[i][g].walls.s;
                        dirObj.w += this.view.area[i][g].walls.w;
                        dirObj.n += this.view.area[i][g].walls.n;
                    }
                }
            }
        }
        return [dirObj.e,dirObj.s,dirObj.w,dirObj.n]
    }
    makeStep(field) {
        if (!this.dead) {
            field.area[this.poss[0].y][this.poss[0].x] = "W";

            let dirObj = this.wSum(field);
            let possibleWays = getAllIndexes(dirObj, Math.max(...dirObj));
            possibleWays = possibleWays[gRI(0, possibleWays.length - 1)];

            let newHead = {x: this.pos.x, y: this.pos.y};
            switch (possibleWays) {
                case 0:
                    newHead.x += 1;
                    break;
                case 1:
                    newHead.y += 1;
                    break;
                case 2:
                    newHead.x -= 1;
                    break;
                case 3:
                    newHead.y -= 1;
            }
            this.poss.unshift(newHead);
            this.pos = this.poss[0];
            if (field.area[this.pos.y][this.pos.x] == "F") {
                foodNow--;
                this.energy = energyLim;
                while (foodNow < foodLim) {
                    foodNow++;
                    new Food(this.field);
                }
                field.area[this.poss[0].y][this.poss[0].x] = "W";
                if (this.poss.length == 20){
                    aliveSnakes.push(this.devide())
                }
            } else if (field.area[this.pos.y][this.pos.x] == "W") {
                this.dead = true;
                field.area[this.poss[0].y][this.poss[0].x] = "W";
                field.area[this.poss[this.poss.length - 1].y][this.poss[this.poss.length - 1].x] = "A";
                this.poss.splice(this.poss.length - 1);
                for (let i = 1; i < this.poss.length; i++){
                    field.area[this.poss[i].y][this.poss[i].x] = "A";
                }
            } else {
                this.energy--;
                field.area[this.poss[0].y][this.poss[0].x] = "W";
                field.area[this.poss[this.poss.length - 1].y][this.poss[this.poss.length - 1].x] = "A";
                this.poss.splice(this.poss.length - 1);
            }
            if (this.energy === 0){
                this.energy = energyLim;
                field.area[this.poss[this.poss.length - 1].y][this.poss[this.poss.length - 1].x] = "A";
                this.poss.splice(this.poss.length - 1);
                if (this.poss.length === 0){
                    this.dead = true;
                }
            }


        }
    }
    devide(){
        let newViewArea;
        let isMutated = false;
        let mutSpotX;
        let mutSpotY;
        if (Math.random()<= 0.25){ // mutate chance is 0.25
            isMutated = true;
            newViewArea = JSON.parse(JSON.stringify(this.view.area));
            let chromosome;
            let maxMinValue; // if food - 99, walls - -99
            let chromosomePicked;
            mutSpotX = gRI(0,this.view.w-1);
            mutSpotY = gRI(0,this.view.h-1);
            if (Math.random() < 0.5){
                chromosome = newViewArea[mutSpotY][mutSpotX].food;
                maxMinValue = 99;
                chromosomePicked = "food"
            }else{
                chromosome = newViewArea[mutSpotY][mutSpotX].walls;
                maxMinValue = -99;
                chromosomePicked = "wall"
            }
            let genPicked = gRI(0,3);
            let gen;

            switch (genPicked) {
                case 0:
                    if (chromosomePicked == "wall"){
                        chromosome.e += gRI(-5,Math.min(-1*chromosome.e,20));
                    } else if (chromosomePicked = "food"){
                        chromosome.e += gRI(Math.max(-20,-1*chromosome.e),20);
                    }
                    break;
                case 1:
                    if (chromosomePicked == "wall"){
                        chromosome.s += gRI(-5,Math.min(-1*chromosome.s,20));
                    } else if (chromosomePicked = "food"){
                        chromosome.s += gRI(Math.max(-20,-1*chromosome.s),20);
                    }
                    break;
                case 2:
                    if (chromosomePicked == "wall"){
                        chromosome.w += gRI(-5,Math.min(-1*chromosome.w,20));
                    } else if (chromosomePicked = "food"){
                        chromosome.w += gRI(Math.max(-20,-1*chromosome.w),20);
                    }
                    break;
                case 3:
                    if (chromosomePicked == "wall"){
                        chromosome.n += gRI(-5,Math.min(-1*chromosome.n,20));
                    } else if (chromosomePicked = "food"){
                        chromosome.n += gRI(Math.max(-20,-1*chromosome.n),20);
                    }
                    break;
            }


        } else {
            newViewArea = this.view.area;
        }
        let newPoss = this.poss.splice(10,19).reverse();
        let newSnake = new Snake(this.view.w,this.view.h,newPoss,this.field,this.color,newViewArea,energyLim,this.mutated);
        if (isMutated) {
            newSnake.mutArr++
        }
        return  newSnake;
    };

    draw(ctx,w,h,field){
        for (let i = 0; i < this.poss.length; i++) {
            ctx.beginPath();
            ctx.fillStyle = this.dead ? "gray" : (i == 0 ? LightenColor(this.color,-55) : this.color);
            let s = Math.min(w, h);
            ctx.fillRect(this.poss[i].x * (s / field.w), this.poss[i].y * (s / field.h), s / field.w, s / field.h);
            ctx.closePath();
        }
    }
}

//snake = new Snake(7,7);
//----------------------------------------------------------------------------------------------------------------------
var fs = require("fs");
let snakes = [];
let readed;
let gameData = importGame(JSON.parse(fs.readFileSync("CodeHere/Saves/newSave_1.json",'utf8')),snakes);
let field = gameData.field;

let ac = 0;
for(let i = 0; i < field.area.length; i ++) {
    for (let g = 0; g < field.area[i].length; g++) {
        if (field.area[i][g] == "F") {
            ac++;
        }
    }
}

let foodLim = gameData.foodLim;
let foodNow = ac;
let energyLim = gameData.energyLim;
let lId = gameData.lId;
console.log("lId",lId);
console.log(energyLim);
function saveFile() {
    lId++;
    fs.writeFileSync("Codehere/Saves/newSave_" + lId + ".json", exportGame(snakes, field, foodLim, energyLim, lId,iter+1));
}
let aliveSnakes = [];
let iter = gameData.iter;
console.log("iter",iter);
console.log('foodNow',foodNow,foodLim);




function loop() {
    if(iter%100000===0){
        saveFile();
        console.log('saved',lId,foodNow);
    }

    if (iter % 1000 === 0){
        console.log(snakes.length,iter);
    }

    iter++;
    // console.log(iter);

    for (let i = 0; i < snakes.length; i++){
        snakes[i].makeStep(field);

    }

    for (let i = 0; i < snakes.length; i++){
        if (snakes[i].dead === false){
            aliveSnakes.push(snakes[i]);

        }
    }

    snakes = aliveSnakes;
    aliveSnakes = [];
    setTimeout(loop,1);

}
loop();



