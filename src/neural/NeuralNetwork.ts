export class NeuralNetwork {
  private layers: number[];
  private weights: Float32Array[];
  private biases: Float32Array[];
  
  constructor(layers: number[]) {
    this.layers = layers;
    this.weights = [];
    this.biases = [];
    
    // Initialize weights and biases
    for (let i = 0; i < layers.length - 1; i++) {
      const weightsForLayer = new Float32Array(layers[i] * layers[i + 1]);
      const biasesForLayer = new Float32Array(layers[i + 1]);
      
      // Initialize with random values
      this.initializeRandomValues(weightsForLayer, -1, 1);
      this.initializeRandomValues(biasesForLayer, -1, 1);
      
      this.weights.push(weightsForLayer);
      this.biases.push(biasesForLayer);
    }
  }
  
  private initializeRandomValues(array: Float32Array, min: number, max: number): void {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.random() * (max - min) + min;
    }
  }
  
  feedForward(inputs: number[]): number[] {
    if (inputs.length !== this.layers[0]) {
      throw new Error(`Expected ${this.layers[0]} inputs but got ${inputs.length}`);
    }
    
    let currentValues = Float32Array.from(inputs);
    
    // Process each layer
    for (let layerIndex = 0; layerIndex < this.layers.length - 1; layerIndex++) {
      const nextLayerSize = this.layers[layerIndex + 1];
      const nextValues = new Float32Array(nextLayerSize);
      
      // Calculate values for next layer
      for (let nextNeuron = 0; nextNeuron < nextLayerSize; nextNeuron++) {
        let sum = this.biases[layerIndex][nextNeuron];
        
        for (let currentNeuron = 0; currentNeuron < currentValues.length; currentNeuron++) {
          const weightIndex = currentNeuron * nextLayerSize + nextNeuron;
          sum += currentValues[currentNeuron] * this.weights[layerIndex][weightIndex];
        }
        
        // Apply activation function (ReLU for hidden layers, sigmoid for output)
        if (layerIndex < this.layers.length - 2) {
          nextValues[nextNeuron] = Math.max(0, sum); // ReLU
        } else {
          nextValues[nextNeuron] = 1 / (1 + Math.exp(-sum)); // Sigmoid
        }
      }
      
      currentValues = nextValues;
    }
    
    return Array.from(currentValues);
  }
  
  getWeights(): Float32Array[] {
    return this.weights;
  }
  
  getBiases(): Float32Array[] {
    return this.biases;
  }
  
  setWeights(weights: Float32Array[]): void {
    this.weights = weights;
  }
  
  setBiases(biases: Float32Array[]): void {
    this.biases = biases;
  }
  
  clone(): NeuralNetwork {
    const clone = new NeuralNetwork([...this.layers]);
    
    // Deep copy weights and biases
    for (let i = 0; i < this.weights.length; i++) {
      clone.weights[i] = new Float32Array(this.weights[i]);
      clone.biases[i] = new Float32Array(this.biases[i]);
    }
    
    return clone;
  }
  
  static crossover(parent1: NeuralNetwork, parent2: NeuralNetwork): NeuralNetwork {
    if (!NeuralNetwork.isSameStructure(parent1, parent2)) {
      throw new Error('Cannot crossover networks with different structures');
    }
    
    const offspring = new NeuralNetwork([...parent1.layers]);
    
    // Crossover weights and biases
    for (let i = 0; i < parent1.weights.length; i++) {
      const weightsCrossover = new Float32Array(parent1.weights[i].length);
      const biasesCrossover = new Float32Array(parent1.biases[i].length);
      
      // Determine crossover points
      const weightsCrossoverPoint = Math.floor(Math.random() * parent1.weights[i].length);
      const biasesCrossoverPoint = Math.floor(Math.random() * parent1.biases[i].length);
      
      // Perform crossover
      for (let j = 0; j < parent1.weights[i].length; j++) {
        weightsCrossover[j] = j < weightsCrossoverPoint ? 
          parent1.weights[i][j] : parent2.weights[i][j];
      }
      
      for (let j = 0; j < parent1.biases[i].length; j++) {
        biasesCrossover[j] = j < biasesCrossoverPoint ? 
          parent1.biases[i][j] : parent2.biases[i][j];
      }
      
      offspring.weights[i] = weightsCrossover;
      offspring.biases[i] = biasesCrossover;
    }
    
    return offspring;
  }
  
  mutate(mutationRate: number, mutationAmount: number = 0.2): void {
    // Mutate weights
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        if (Math.random() < mutationRate) {
          // Add a random value between -mutationAmount and mutationAmount
          this.weights[i][j] += (Math.random() * 2 - 1) * mutationAmount;
        }
      }
    }
    
    // Mutate biases
    for (let i = 0; i < this.biases.length; i++) {
      for (let j = 0; j < this.biases[i].length; j++) {
        if (Math.random() < mutationRate) {
          // Add a random value between -mutationAmount and mutationAmount
          this.biases[i][j] += (Math.random() * 2 - 1) * mutationAmount;
        }
      }
    }
  }
  
  static isSameStructure(network1: NeuralNetwork, network2: NeuralNetwork): boolean {
    if (network1.layers.length !== network2.layers.length) {
      return false;
    }
    
    for (let i = 0; i < network1.layers.length; i++) {
      if (network1.layers[i] !== network2.layers[i]) {
        return false;
      }
    }
    
    return true;
  }
}