class NeuralNetwork{
    constructor(neuronCounts){
        this.levels = [];
        for (let i = 0; i  < neuronCounts.length - 1; i++) {
            this.levels.push(new Level(
                neuronCounts[i],neuronCounts[i + 1]
            ));
        }
    }
    static feedForward(givenInputs,network){
        let outputs = Level.feedForward(
            givenInputs,network.levels[0]);
        for (let i = 1; i < network.levels.length; i++) {
            outputs  = Level.feedForward(outputs,network.levels[i]);
        }
        return outputs;
    }
    //mutate network i.e choose bestcar as some kind of base
    // so next iteration will follow bestcar paths and deviate from there
    static mutate(network,amount = 1){
        network.levels.forEach(level => {
            for(let i = 0; i < level.biases.length;i++){
                level.biases[i] = lerp(
                    level.biases[i],
                    Math.random() * 2 - 1,
                    amount
                )
            }
            for(let i = 0;i < level.weights.length;i++){
                for(let j = 0; j < level.weights[i];j++){
                    level.weights[i][j] = lerp(
                        level.weights[i][j],
                        Math.random() * 2 - 1,
                        amount
                    )
                }
            }
        });
    }
}


class Level{
    constructor(inputCount,outputCount){
        //inputs is sensor data 
        this.inputs = new Array(inputCount);
        //outputs are calc with weights n biases n based on inputs
        this.outputs = new Array(outputCount);
        // bias = value above which it will fire
        this.biases = new Array(outputCount);

        this.weights = [];
        for (let i = 0; i < inputCount; i++) {
            //for each input we have o/p count # of conns
            this.weights[i] = new Array(outputCount);
        }
        Level.#randomize(this);
    }
    // using static to serialize this method afterwards
    // methods dont serialize
    static #randomize(level){
        for (let i = 0; i < level.inputs.length; i++) {
            for (let j = 0; j < level.outputs.length; j++) {
                //-ve # between -1 and 1
                //-ve weights are used to show undesireable outcomes.
                //eg if car is infront and we are on the rightmost lane 
                //right will have a -ve weight so dont turn right
                level.weights[i][j] = Math.random()*2 - 1;
            }
        }
        for (let i = 0; i < level.biases.length; i++) {
            
            level.biases[i] = Math.random()*2 - 1;
        }
    }
    static feedForward(givenInputs, level){
        for (let i = 0; i < level.inputs.length; i++) {
            //inputs from sensor stored directly in innputs
            level.inputs[i] = givenInputs[i];
        }
        for (let i = 0; i < level.outputs.length; i++) {
            let sum = 0;
            for (let j = 0; j < level.inputs.length; j++) {
                sum += level.inputs[j] * level.weights[j][i];
            }
            if(sum > level.biases[i]){
                //turning the neuron on
                level.outputs[i] = 1;
            }
            else{
                level.outputs[i] = 0;
            }
        }
        return level.outputs;
    }
}