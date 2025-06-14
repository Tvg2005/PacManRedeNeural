import { Game } from './Game';
import { GeneticAlgorithm } from '../neural/GeneticAlgorithm';
import { NeuralNetwork } from '../neural/NeuralNetwork';

export class Simulation {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private games: Game[];
  private geneticAlgorithm: GeneticAlgorithm;
  private running: boolean;
  private generation: number;
  private bestScore: number;
  private timeScale: number;
  private lastTime: number;
  private animationFrameId: number | null;
  private numberOfGames: number = 16; // Changed to 12 games
  private onPacmanDeath: () => void;
  private onScoreUpdate: (score: number) => void;
  private onGenerationComplete: (generation: number, bestScore: number) => void;
  
  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    onPacmanDeath: () => void,
    onScoreUpdate: (score: number) => void,
    onGenerationComplete: (generation: number, bestScore: number) => void
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.running = false;
    this.generation = 0;
    this.bestScore = 0;
    this.timeScale = 1;
    this.lastTime = 0;
    this.animationFrameId = null;
    this.onPacmanDeath = onPacmanDeath;
    this.onScoreUpdate = onScoreUpdate;
    this.onGenerationComplete = onGenerationComplete;
    
    // Create genetic algorithm
    this.geneticAlgorithm = new GeneticAlgorithm(
      0.1, // Mutation rate
      0.3, // Crossover rate
      4,   // Elitism
      [16, 12, 4] // Neural network structure
    );
    
    // Initialize games
    this.games = [];
    this.initializeGames();
  }
  
  private initializeGames(): void {
    this.games = [];
    
    // If this is the first generation, create random neural networks
    if (this.generation === 0) {
      for (let i = 0; i < this.numberOfGames; i++) {
        const game = new Game(this.canvas.width, this.canvas.height);
        game.setTimeScale(this.timeScale);
        this.games.push(game);
      }
    } else {
      // Otherwise, use the genetic algorithm to create new networks
      const brains = this.geneticAlgorithm.evolve();
      
      for (let i = 0; i < this.numberOfGames; i++) {
        const game = new Game(this.canvas.width, this.canvas.height, brains[i]);
        game.setTimeScale(this.timeScale);
        this.games.push(game);
      }
    }
  }
  
  start(): void {
    if (this.running) return;
    
    this.running = true;
    this.lastTime = performance.now();
    
    // Start the animation loop
    this.animate(this.lastTime);
  }
  
  pause(): void {
    this.running = false;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
  
  reset(): void {
    this.pause();
    this.generation = 0;
    this.bestScore = 0;
    this.initializeGames();
  }
  
  private animate(currentTime: number): void {
    if (!this.running) return;
    
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;
    
    // Update and draw all games
    this.update(deltaTime);
    this.draw();
    
    // Check if all games are over
    if (this.areAllGamesOver()) {
      this.nextGeneration();
    }
    
    // Continue animation
    this.animationFrameId = requestAnimationFrame((time) => this.animate(time));
  }
  
  private update(deltaTime: number): void {
    let bestCurrentScore = 0;
    
    for (const game of this.games) {
      if (!game.isGameOver()) {
        game.update(deltaTime);
        
        // Check if the game just ended
        if (game.isGameOver()) {
          this.onPacmanDeath();
        }
        
        // Update best current score
        const score = game.getScore();
        if (score > bestCurrentScore) {
          bestCurrentScore = score;
          this.onScoreUpdate(bestCurrentScore);
        }
      }
    }
  }
  
  private draw(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Calculate grid layout - 6x6 grid
    const cols = 4;
    const rows = 4;
    
    const gameWidth = this.canvas.width / cols;
    const gameHeight = this.canvas.height / rows;
    
    // Draw background to eliminate black spaces
    this.ctx.fillStyle = '#1f2937'; // Match the app's background color
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw each game in its grid cell
    for (let i = 0; i < this.games.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      
      const x = col * gameWidth;
      const y = row * gameHeight;
      
      // Draw cell background
      this.ctx.fillStyle = '#111827';
      this.ctx.fillRect(x + 1, y + 1, gameWidth - 2, gameHeight - 2);
      
      // Save context state
      this.ctx.save();
      
      // Set clipping region for this game
      this.ctx.beginPath();
      this.ctx.rect(x + 2, y + 2, gameWidth - 4, gameHeight - 4);
      this.ctx.clip();
      
      // Translate context to the game's position
      this.ctx.translate(x + 2, y + 2);
      
      // Scale to fit the game in its cell
      const scaleX = (gameWidth - 4) / this.canvas.width;
      const scaleY = (gameHeight - 4) / this.canvas.height;
      this.ctx.scale(scaleX, scaleY);
      
      // Draw the game
      this.games[i].draw(this.ctx);
      
      // Draw game number and dead indicator if game is over
      this.ctx.font = '16px Arial';
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.fillText(`#${i + 1}`, 10, 25);
      
      if (this.games[i].isGameOver()) {
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctx.fillText('DEAD', 10, 45);
      }
      
      // Restore context state
      this.ctx.restore();
    }
  }
  
  private areAllGamesOver(): boolean {
    return this.games.every(game => game.isGameOver());
  }
  
  private nextGeneration(): void {
    // Extract neural networks and scores
    const networks: NeuralNetwork[] = [];
    const scores: number[] = [];
    
    for (const game of this.games) {
      networks.push(game.getBrain());
      scores.push(game.getScore());
    }
    
    // Find best score
    const generationBestScore = Math.max(...scores);
    if (generationBestScore > this.bestScore) {
      this.bestScore = generationBestScore;
    }
    
    // Set networks and scores in genetic algorithm
    this.geneticAlgorithm.setPopulation(networks, scores);
    
    // Increment generation
    this.generation++;
    
    // Initialize new games
    this.initializeGames();
    
    // Notify generation complete
    this.onGenerationComplete(this.generation, this.bestScore);
  }
  
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    
    // Reinitialize games with new size
    this.initializeGames();
  }
  
  setSpeed(speed: number): void {
    this.timeScale = speed;
    
    // Update all games
    for (const game of this.games) {
      game.setTimeScale(this.timeScale);
    }
  }
}