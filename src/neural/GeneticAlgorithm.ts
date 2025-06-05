import { NeuralNetwork } from './NeuralNetwork';

export class GeneticAlgorithm {
  private mutationRate: number;
  private crossoverRate: number;
  private elitism: number;
  private population: NeuralNetwork[];
  private fitnessScores: number[];
  private networkStructure: number[];
  
  constructor(
    mutationRate: number,
    crossoverRate: number,
    elitism: number,
    networkStructure: number[]
  ) {
    this.mutationRate = mutationRate;
    this.crossoverRate = crossoverRate;
    this.elitism = elitism;
    this.networkStructure = networkStructure;
    this.population = [];
    this.fitnessScores = [];
  }
  
  setPopulation(networks: NeuralNetwork[], scores: number[]): void {
    if (networks.length !== scores.length) {
      throw new Error('Networks and scores arrays must have the same length');
    }
    
    this.population = networks;
    this.fitnessScores = scores;
  }
  
  evolve(): NeuralNetwork[] {
    const populationSize = this.population.length;
    
    // If this is the first generation, create a random population
    if (populationSize === 0) {
      return this.createInitialPopulation(10); // Default to 10 individuals
    }
    
    // Create a new generation
    const newPopulation: NeuralNetwork[] = [];
    
    // Sort population by fitness (descending)
    const sortedIndices = this.getSortedIndices();
    
    // Elitism: keep the best individuals unchanged
    for (let i = 0; i < Math.min(this.elitism, populationSize); i++) {
      newPopulation.push(this.population[sortedIndices[i]].clone());
    }
    
    // Fill the rest of the population with offspring
    while (newPopulation.length < populationSize) {
      // Select parents using tournament selection
      const parent1 = this.tournamentSelection();
      const parent2 = this.tournamentSelection();
      
      let offspring: NeuralNetwork;
      
      // Crossover with probability crossoverRate
      if (Math.random() < this.crossoverRate) {
        offspring = NeuralNetwork.crossover(parent1, parent2);
      } else {
        // No crossover, just clone one of the parents
        offspring = Math.random() < 0.5 ? parent1.clone() : parent2.clone();
      }
      
      // Mutate
      offspring.mutate(this.mutationRate);
      
      // Add to new population
      newPopulation.push(offspring);
    }
    
    return newPopulation;
  }
  
  private createInitialPopulation(size: number): NeuralNetwork[] {
    const population: NeuralNetwork[] = [];
    
    for (let i = 0; i < size; i++) {
      population.push(new NeuralNetwork([...this.networkStructure]));
    }
    
    return population;
  }
  
  private getSortedIndices(): number[] {
    // Create array of indices
    const indices = Array.from(Array(this.fitnessScores.length).keys());
    
    // Sort indices by fitness scores (descending)
    indices.sort((a, b) => this.fitnessScores[b] - this.fitnessScores[a]);
    
    return indices;
  }
  
  private tournamentSelection(): NeuralNetwork {
    // Tournament selection: randomly select individuals and pick the best one
    const tournamentSize = 3;
    let bestIndex = Math.floor(Math.random() * this.population.length);
    let bestFitness = this.fitnessScores[bestIndex];
    
    for (let i = 1; i < tournamentSize; i++) {
      const index = Math.floor(Math.random() * this.population.length);
      const fitness = this.fitnessScores[index];
      
      if (fitness > bestFitness) {
        bestIndex = index;
        bestFitness = fitness;
      }
    }
    
    return this.population[bestIndex];
  }
  
  private rouletteWheelSelection(): NeuralNetwork {
    // Calculate sum of all fitness scores
    let fitnessSum = 0;
    for (const fitness of this.fitnessScores) {
      // Add offset to handle negative fitness scores
      fitnessSum += Math.max(0, fitness + 1000);
    }
    
    // If all fitness scores are negative, use tournament selection
    if (fitnessSum <= 0) {
      return this.tournamentSelection();
    }
    
    // Generate random value between 0 and fitnessSum
    const rand = Math.random() * fitnessSum;
    
    // Find the individual that corresponds to this value
    let runningSum = 0;
    for (let i = 0; i < this.population.length; i++) {
      runningSum += Math.max(0, this.fitnessScores[i] + 1000);
      if (runningSum >= rand) {
        return this.population[i];
      }
    }
    
    // Fallback (should never happen)
    return this.population[0];
  }
}