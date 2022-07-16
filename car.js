class Car{
    constructor(x,y,width,height,controlType,maxSpeed = 3){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;
        this.damaged = false;
        this.useBrain = controlType == "AI";
        if(controlType != "DUMMY"){
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork(
                [this.sensor.rayCount,6,4]
            );
        }
        this.controls = new Controls(controlType);
    }
    update(roadBorders,traffic){
        if(!this.damaged){
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders,traffic);
        } 
        if(this.sensor){
            this.sensor.update(roadBorders,traffic);
            const offsets = this.sensor.readings.map(s =>s== null?0: 1- s.offset)
            const outputs = NeuralNetwork.feedForward(offsets,this.brain);
            //console.log(outputs);
            if(this.useBrain){
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
            }
        }
    }
    #assessDamage(roadBorders,traffic){
        for (let i = 0; i < roadBorders.length; i++) {
            if(polyIntersect(this.polygon,roadBorders[i])){
                return true;
            }
        }
        for (let i = 0; i < traffic.length; i++) {
            if(polyIntersect(this.polygon,traffic[i].polygon)){
                return true;
            }
        }
        return false;
    }
    #createPolygon(){
        //polygon we can experiment with different shapes of
        //car like multiplying rad with some number;
        const points = [];
        const rad = Math.hypot(this.width,this.height)/2;
        const alpha = Math.atan2(this.width,this.height);
        points.push({
            x:this.x - Math.sin(this.angle-alpha) * rad,
            y:this.y-Math.cos(this.angle-alpha) * rad
        });
        points.push({
            x:this.x - Math.sin(this.angle+alpha) * rad,
            y:this.y-Math.cos(this.angle+alpha) * rad
        });
        points.push({
            x:this.x - Math.sin(Math.PI + this.angle-alpha) * rad,
            y:this.y-Math.cos(Math.PI + this.angle-alpha) * rad
        });
        points.push({
            x:this.x - Math.sin(Math.PI + this.angle+alpha) * rad,
            y:this.y-Math.cos(Math.PI + this.angle+alpha) * rad
        });
        return points;
    }

    #move(){
        if(this.controls.forward){
            // y increases on the screen as we go downward
            //this.y -= 2;
            this.speed += this.acceleration;
        }
        if(this.controls.reverse){
            //this.y += 2;
            this.speed -= this.acceleration;
        }
        if(this.speed > this.maxSpeed){
            this.speed = this.maxSpeed;
        }
        if(this.speed < -this.maxSpeed/2){
            this.speed = -this.maxSpeed/2;
        }  
        if(this.speed > 0){
            this.speed -= this.friction;
        }
        if(this.speed < 0){
            this.speed += this.friction;
        }
        //if not this then the above if stm will move back n forward        
        if(Math.abs(this.speed) < this.friction){
            this.speed = 0;
        }
        if(this.speed != 0){
            //flip req cuz if we press rev n right the car moves left 
            // so we are flipping the controls
            const flip = this.speed > 0 ? 1: -1;
        
            if(this.controls.left){
                //speed may exceed maxspeed if both forward n left pressed         
                //this.x -= 2;
                //unit circle rotate 90 deg anticlockwise cuz of y being +ve as we move downnwards
                this.angle += 0.03 * flip;
            }
            if(this.controls.right){
                //this.x += 2;
                this.angle -= 0.03 * flip;
            }
        }
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
       // this.y -= this.speed;
    }
    draw(ctx,color,drawSensor=false){
        // ctx.save();
        // ctx.translate(this.x,this.y);
        // ctx.rotate(-this.angle);

        // ctx.beginPath();
        // //console.log(this.x - this.width/2);
        // //where on the canvas car is.

        // //ctx.rect(this.x - this.width/2, this.y - this.height/2,this.width,this.height);
        // // not this.x -.... cuz we already tranlate.
        // ctx.rect(-this.width/2, -this.height/2,this.width,this.height);
        
        // ctx.fill();
        // ctx.restore();
        // now we are drawing with polygon otherwise 
        if(this.damaged){
            ctx.fillStyle="grey";
        }else{
            ctx.fillStyle= color;
        }
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x,this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x,this.polygon[i].y);
        } 
        ctx.fill();
        if(this.sensor && drawSensor){
            this.sensor.draw(ctx);
        }
    }
}