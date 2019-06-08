canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");

class Box {
    constructor(args) {
        this.x = args.x ? args.x : 0;
        this.y = args.y ? args.y : 0;
        this.width = args.width ? args.width : 50;
        this.height = args.height ? args.height : 50;
        this.intersects = function (box) {
            return box;
        };
        this.draw = function (ctx) {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        };
    }
}

class Player {
    constructor() {
        this.x = 100;
        this.y = 100;
        this.width = 10;
        this.height = 20;
        this.hitbox = new Box({ x: this.x, y: this.x, width: this.width, height: this.height });
        this.move = function (x, y) {

            if(this.x + x < 0) x = 0 - this.x; 
            else if(this.x + this.width + x >= canvas.width) x = canvas.width - (this.x + this.width);
            if(this.y + y < 0) y = 0 - this.y;
            else if(this.y + this.height + y >= canvas.height) y = canvas.height - (this.y + this.height);

            this.x += x;
            this.y += y;
            this.hitbox.x += x;
            this.hitbox.y += y;
        };
        this.draw = function (ctx) {
            ctx.fillRect(this.x, this.y, this.width, this.height);
        };
    }
}

class Point{
    constructor(x, y){
        this.x = x;
        this.y = y;

        this.dist = function(point){ 
            return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
        }

        this.sub = function (x, y){
            return new Point(this.x - x, this.y - y);
        }

        this.inbetween = function(a , b){
            let ab = a.dist(b);
            let ac = a.dist(this);
            let bc = b.dist(this);

            return (ac + bc === ab);
        }
    }
}


player = new Player();
box = new Box({x: 50,y: 50,width: 50,height: 50});
keys = [];

boxes = [];
boxes.push(box);
box = new Box({x: 350,y: 350,width: 50,height: 20});
boxes.push(box);
box = new Box({x: 75,y: 130,width: 20,height: 30});
boxes.push(box);
box = new Box({x: 413,y: 140,width: 10,height: 100});
boxes.push(box);
box = new Box({x: 250,y: 250,width: 10,height: 10});
boxes.push(box);
     

document.onkeydown = function (e) {
    keys[e.keyCode] = true;

    if(e.keyCode == 32)
        findShadow(ctx);

}

document.onkeyup = function (e){
    keys[e.keyCode] = false;
}

function findShadow(ctx){
    //The player point
    p = new Point(player.x + player.width/2, player.y + player.height/2); 
    //Loops through all the boxes.
    boxes.forEach(box => {
        //The midpoint of the box.
        boxm = new Point(box.x + box.width/2, box.y + box.height/2);
        //All the corners of the box.
        corners = [
            new Point(box.x            , box.y             ),
            new Point(box.x + box.width, box.y             ),
            new Point(box.x            , box.y + box.height),
            new Point(box.x + box.width, box.y + box.height)
        ];
        //Sorts them by distance to the player.
        corners.sort(function(a, b){return a.dist(p) - b.dist(p)});
        //The array for saving the visable points.
        visable = [];
        //Loops thorugh the corners of the box.
        for(let i = 0; i < 3; i++){
            c = corners[i];
            //The gradient of the line that passes through the player and corner.
            k = (c.y - p.y)/(c.x - p.x);
            //The y-intercept of the line, transposes so that the boxes top left corner is at the point x = 0, y = 0.
            m = (c.y - box.y) - (c.x - box.x) * k;
            //The point x where the transposed line passes y = 0.
            xzero = Math.round((-m)/k)
            //The point where the transposed line passes y = box.height.
            heightx = Math.round((box.height - m)/k);

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(c.x, c.y);

            //Checks if the box is to the left of the player.
            //In order to check if the lines should be intercepting the left or right side of the box.
            if(p.x > boxm.x){
                //Checks if the box is above the player. Canvas y coordinate increases downward. 
                //In order to check if the lines should be intercepting the top or bottom part of the box.
                if(p.y > boxm.y){
                    //If the y value of the line at the x boit of box.width is outside of the range 0 - box.height and the x value when passing y = box.height is between
                    //x = 0 and x = box.width the corner i not visable. 
                    if(!(0 < Math.round(box.width * k + m) && Math.round(box.width * k + m) < box.height) && !(0 < heightx && heightx < box.width)) visable.push(c);
                    
                } else{
                    //Same check but against the the top part of the box.
                    if(!(0 < Math.round(box.width * k + m) && Math.round(box.width * k + m) < box.height) && !(0 < xzero && xzero < box.width)) visable.push(c);
                }
            } else{
                if(p.y > boxm.y){
                    if(!(0 < m && m < box.height) && !(0 < heightx && heightx < box.width)) visable.push(c);
                } else{
                    if(!(0 < m && m < box.height) && !(0 < xzero && xzero < box.width)) visable.push(c);
                }
            }

            
            if(!visable.includes(c)) ctx.strokeStyle = 'red'; 

            ctx.stroke();
            
            ctx.strokeStyle = 'black';

        }

        for(i = 0; i < visable.length; i++){
            ipoint = visable[i];
            for(a = 0; a < visable.length; a++){
                apoint = visable[a];
                if(apoint == ipoint) continue;
                if(ipoint.inbetween(apoint, p)){
                    visable.splice(a, 1);
                    i = 3;
                    break;
                }
            }
        }

        visable.sort(function(a, b){return b.dist(p) - a.dist(p)});

        ctx.strokeStyle = 'black';
        ctx.beginPath();

        point = visable[0];

        ctx.moveTo(point.x,point.y);

        k = (point.y - p.y)/(point.x - p.x);
        m = point.y - point.x * k;

        y = x = 0;
        if(point.x == p.x){
            x = p.x;
            if(!(point.y < p.y)) y = canvas.height;
        } else if(point.x < p.x){
            if(point.y < p.y){
                if(m > 0) y = m; 
                else x = -m/k;
            } else{
                if(m < canvas.height){ 
                    y = m;
                } else{
                    x = (canvas.height - m)/k;
                    y = canvas.height;
                } 
            }
        } else{
            if(point.y < p.y){
                if(k*canvas.width + m > 0){
                    y = k*canvas.width + m;
                    x = canvas.width;
                } 
                else{ 
                    x = -m/k;
                }
            } else{
                if(k*canvas.width + m < canvas.height){ 
                    y = k*canvas.width + m;
                    x = canvas.width;
                } else{
                    x = (canvas.height - m)/k;
                    y = canvas.height;
                } 
            }
        }
        x = Math.round(x);
        y = Math.round(y); 
        ctx.lineTo(x, y);

        nx = ny = 0;
        point = visable[1];

        if(!point) return;

        k = (point.y - p.y)/(point.x - p.x);
        m = point.y - point.x * k;

        if(point.x == p.x){
            nx = p.x;
            if(!(point.y < p.y)) ny = canvas.height;
        } else if(point.x < p.x){
            if(point.y < p.y){
                if(m > 0) ny = m; 
                else nx = -m/k;
            } else{
                if(m < canvas.height){ 
                    ny = m;
                } else{
                    nx = (canvas.height - m)/k;
                    ny = canvas.height;
                } 
            }
        } else{
            if(point.y < p.y){
                if(k*canvas.width + m > 0){
                    ny = k*canvas.width + m;
                    nx = canvas.width;
                } 
                else{ 
                    nx = -m/k;
                }
            } else{
                if(k*canvas.width + m < canvas.height){ 
                    ny = k*canvas.width + m;
                    nx = canvas.width;
                } else{
                    nx = (canvas.height - m)/k;
                    ny = canvas.height;
                } 
            }
        }
        
        let cornerx, cornery;

        canvasCorners = [];

        if(Math.abs(nx - x) === canvas.width){
            if(boxm.y < p.y){
                canvasCorners.push(new Point(canvas.width, 0))
                canvasCorners.push(new Point(0, 0)) 
            } else{
                canvasCorners.push(new Point(canvas.width, canvas.height)) 
                canvasCorners.push(new Point(0, canvas.height)) 
            }
        } else if(Math.abs(ny - y) === canvas.height){
            if(boxm.x < p.x){
                canvasCorners.push(new Point(0, canvas.height)) 
                canvasCorners.push(new Point(0, 0)) 
            } else{
                canvasCorners.push(new Point(canvas.width, 0)) 
                canvasCorners.push(new Point(canvas.width, canvas.height)) 
            }
        } else if(nx !== x && ny !== y){

            

            canvasCorners.push(new Point((nx < canvas.width && x < canvas.width) ? 0: canvas.width, (ny < canvas.height && y < canvas.height) ? 0: canvas.height))
        }

        if(canvasCorners.length > 1){
            cornerPoint = new Point(x, y);
            canvasCorners.sort(function(a, b){return a.dist(cornerPoint) - b.dist(cornerPoint)});
        }

        for(i = 0; i < canvasCorners.length;i++){
           ctx.lineTo(canvasCorners[i].x, canvasCorners[i].y);
        }

        nx = Math.round(nx);
        ny = Math.round(ny); 
        ctx.lineTo(nx, ny);
        
        ctx.lineTo(point.x, point.y);

        ctx.closePath();
        ctx.fill();   

        });
    
}

function draw(){

    ctx.clearRect(0,0,canvas.width, canvas.height);
    boxes.forEach(element => {
        element.draw(ctx);
    });
    findShadow(ctx);
    box.draw(ctx);
    player.draw(ctx);
     
}

function update(){
    if(keys[38]){
        player.move(0,-2);
    }
    if(keys[39]){
        player.move(2,0);
    }
    if(keys[40]){
        player.move(0,2);
    }
    if(keys[37]){
        player.move(-2,0);
    }
}


function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);