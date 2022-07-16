const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;
const carCtx = carCanvas.getContext("2d"); // to draw on the canvas he will need a context
const networkCtx = networkCanvas.getContext("2d");
const road = new Road(carCanvas.width/2,carCanvas.width*0.9);
const N = 1000;
const cars = generateCars(N);
let bestCar = cars[0];
if(localStorage.getItem("bestBrain")){
    for(let i = 0; i < cars.length;i++){
        cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"))
        if(i != 0){
            NeuralNetwork.mutate(cars[i].brain,0.2);
            //0.2 represents how similar the new cars will be
            // wrt previous one, higher the value higher the
            // similarility
        }
    }
}
//const car = new Car(road.getLaneCenter(1),100,30,50,"AI");// (posx,posy,carwidth, carh)
//car.draw(ctx);
//key listeners are overridden by traffic cars. so we will control
// the last car in traffic insead of our car. hence dummy keyword

const traffic = [
    new Car(road.getLaneCenter(1), -100,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(0), -300,30,50,"DUMMY",2),
    new Car(road.getLaneCenter(2), -300,30,50,"DUMMY",2)
];
animate();
function save(){
    localStorage.setItem("bestBrain",JSON.stringify(bestCar.brain));
}
function discard(){
    localStorage.removeItem("bestBrain");
}

function generateCars(N){
    const cars = [];
    for (let i = 1; i <= N; i++) {
        cars.push(new Car(road.getLaneCenter(1),100,30,50,"AI"));  
    }
    return cars;
}

function animate(time){
    for(let i = 0; i < traffic.length;i++){
        // empty array cuz we dont want the car to be damaged by itself
        // also dont want traffic to get damaged by itself
        traffic[i].update(road.borders,[]);
    }
    for(let i = 0; i < cars.length;i++){
        cars[i].update(road.borders,traffic);
    }
    bestCar = cars.find(
        c => c.y == Math.min(...cars.map(c => c.y)
        ));

    // this also clears the console again therefore we dont see a trail
    // if we move this line above we will see a trail of car as it moves
    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;
    carCtx.save();
    //keep camera above car and make the road move
    carCtx.translate(0, -bestCar.y + carCanvas.height*0.7);

    road.draw(carCtx);
    for (let i = 0; i < traffic.length; i++) {
        traffic[i].draw(carCtx,"red");   
    }
    carCtx.globalAlpha = 0.2;//make cars semi transparent
    for(let i = 0; i < cars.length;i++){
        cars[i].draw(carCtx,"blue");
    }
    carCtx.globalAlpha = 1;
    bestCar.draw(carCtx,"blue",true);
    carCtx.restore();
    // calls the animate method again and again
    networkCtx.lineDashOffset = -time/50;
    Visualizer.drawNetwork(networkCtx,bestCar.brain);
    requestAnimationFrame(animate);
} 

 