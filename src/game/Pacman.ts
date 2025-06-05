import { NeuralNetwork } from '../neural/NeuralNetwork';
import { Maze, Cell } from './Maze';
import { Ghost } from './Ghost';

export enum Direction {
  UP,
  RIGHT,
  DOWN,
  LEFT,
  NONE
}

export interface Position {
  x: number;
  y: number;
}

export class Pacman {
  private x: number;
  private y: number;
  private direction: Direction;
  private score: number;
  private alive: boolean;
  private brain: NeuralNetwork;
  private maze: Maze;
  private ghosts: Ghost[];
  private cellSize: number;
  private visionRange: number = 5; // How far Pacman can "see"
  private powerUpTimer: number = 0;
  private isPoweredUp: boolean = false;
  private lastPosition: Position = { x: 0, y: 0 };
  private stationaryTime: number = 0;
  
  constructor(x: number, y: number, cellSize: number, maze: Maze, ghosts: Ghost[], brain?: NeuralNetwork) {
    this.x = x;
    this.y = y;
    this.cellSize = cellSize;
    this.direction = Direction.NONE;
    this.score = 0;
    this.alive = true;
    this.maze = maze;
    this.ghosts = ghosts;
    
    // Create a new brain if none is provided
    if (brain) {
      this.brain = brain;
    } else {
      // Create a neural network with:
      // - Input neurons: 4 directions * 4 sensor types (wall, dot, fruit, ghost) = 16
      // - Hidden neurons: 12
      // - Output neurons: 4 (one for each direction)
      this.brain = new NeuralNetwork([16, 12, 4]);
    }
  }
  
  update(deltaTime: number): void {
    if (!this.alive) return;
    
    // Store last position
    this.lastPosition = { x: this.x, y: this.y };
    
    // Update power-up timer
    if (this.isPoweredUp) {
      this.powerUpTimer -= deltaTime;
      if (this.powerUpTimer <= 0) {
        this.isPoweredUp = false;
      }
    }
    
    // Get inputs for the neural network
    const inputs = this.getVisionInputs();
    
    // Get the action from the neural network
    const outputs = this.brain.feedForward(inputs);
    
    // Find the index of the highest output value
    let maxIndex = 0;
    for (let i = 1; i < outputs.length; i++) {
      if (outputs[i] > outputs[maxIndex]) {
        maxIndex = i;
      }
    }
    
    // Convert index to direction
    this.direction = maxIndex;
    
    // Move based on the selected direction
    this.move();
    
    // Check if Pacman is stationary
    if (Math.abs(this.x - this.lastPosition.x) < 0.1 && 
        Math.abs(this.y - this.lastPosition.y) < 0.1) {
      this.stationaryTime += deltaTime;
      // Penalty for staying still
      if (this.stationaryTime > 0.5) {
        this.score -= 5 * deltaTime;
      }
    } else {
      this.stationaryTime = 0;
      // Small reward for moving
      this.score += deltaTime;
    }
    
    // Check for collisions with dots and fruits
    this.checkCollectibles();
    
    // Check for collisions with ghosts
    this.checkGhostCollisions();
  }
  
  private getVisionInputs(): number[] {
    const inputs: number[] = new Array(16).fill(0);
    
    // Helper function to get information about a specific direction
    const getDirectionInfo = (direction: Direction, inputOffset: number): void => {
      const dirX = direction === Direction.RIGHT ? 1 : direction === Direction.LEFT ? -1 : 0;
      const dirY = direction === Direction.DOWN ? 1 : direction === Direction.UP ? -1 : 0;
      
      let wallDistance = 1;
      let dotDistance = 1;
      let fruitDistance = 1;
      let ghostDistance = 1;
      
      // Look ahead in this direction
      for (let i = 1; i <= this.visionRange; i++) {
        const checkX = Math.floor(this.x / this.cellSize) + dirX * i;
        const checkY = Math.floor(this.y / this.cellSize) + dirY * i;
        
        const cell = this.maze.getCell(checkX, checkY);
        
        // If we've hit a wall, stop looking in this direction
        if (!cell || cell.isWall) {
          wallDistance = i / this.visionRange;
          break;
        }
        
        // Check for dots
        if (cell.hasDot && dotDistance === 1) {
          dotDistance = i / this.visionRange;
        }
        
        // Check for fruits
        if (cell.hasFruit && fruitDistance === 1) {
          fruitDistance = i / this.visionRange;
        }
        
        // Check for ghosts
        for (const ghost of this.ghosts) {
          const ghostCellX = Math.floor(ghost.getX() / this.cellSize);
          const ghostCellY = Math.floor(ghost.getY() / this.cellSize);
          
          if (ghostCellX === checkX && ghostCellY === checkY && ghostDistance === 1) {
            ghostDistance = i / this.visionRange;
            break;
          }
        }
      }
      
      // Set the input values (normalize between 0 and 1)
      inputs[inputOffset] = 1 - wallDistance; // Wall: closer = higher value
      inputs[inputOffset + 1] = 1 - dotDistance; // Dot: closer = higher value
      inputs[inputOffset + 2] = 1 - fruitDistance; // Fruit: closer = higher value
      inputs[inputOffset + 3] = 1 - ghostDistance; // Ghost: closer = higher value
    };
    
    // Get information about each direction
    getDirectionInfo(Direction.UP, 0);
    getDirectionInfo(Direction.RIGHT, 4);
    getDirectionInfo(Direction.DOWN, 8);
    getDirectionInfo(Direction.LEFT, 12);
    
    return inputs;
  }
  
  private move(): void {
    const currentCellX = Math.floor(this.x / this.cellSize);
    const currentCellY = Math.floor(this.y / this.cellSize);
    
    let newX = this.x;
    let newY = this.y;
    
    const speed = 2 * this.cellSize / 20; // Adjust speed relative to cell size
    
    switch (this.direction) {
      case Direction.UP:
        newY -= speed;
        break;
      case Direction.RIGHT:
        newX += speed;
        break;
      case Direction.DOWN:
        newY += speed;
        break;
      case Direction.LEFT:
        newX -= speed;
        break;
      default:
        break;
    }
    
    // Calculate the new cell position and check for wall collisions
    const newCellX = Math.floor(newX / this.cellSize);
    const newCellY = Math.floor(newY / this.cellSize);
    
    // Check if the new position would hit a wall
    const newCell = this.maze.getCell(newCellX, newCellY);
    const currentCell = this.maze.getCell(currentCellX, currentCellY);
    
    if (newCell && !newCell.isWall) {
      // Additional collision checks for wall corners
      const radius = this.cellSize * 0.4;
      const corners = [
        { x: newX - radius, y: newY - radius },
        { x: newX + radius, y: newY - radius },
        { x: newX - radius, y: newY + radius },
        { x: newX + radius, y: newY + radius }
      ];
      
      let canMove = true;
      for (const corner of corners) {
        const cornerCellX = Math.floor(corner.x / this.cellSize);
        const cornerCellY = Math.floor(corner.y / this.cellSize);
        const cornerCell = this.maze.getCell(cornerCellX, cornerCellY);
        if (cornerCell && cornerCell.isWall) {
          canMove = false;
          break;
        }
      }
      
      if (canMove) {
        this.x = newX;
        this.y = newY;
      } else {
        // Align with grid if blocked
        this.x = currentCellX * this.cellSize + this.cellSize / 2;
        this.y = currentCellY * this.cellSize + this.cellSize / 2;
      }
    } else {
      // Align with grid if hitting a wall
      this.x = currentCellX * this.cellSize + this.cellSize / 2;
      this.y = currentCellY * this.cellSize + this.cellSize / 2;
      this.score -= 1; // Small penalty for hitting walls
    }
  }
  
  private checkCollectibles(): void {
    const cellX = Math.floor(this.x / this.cellSize);
    const cellY = Math.floor(this.y / this.cellSize);
    
    // Check for dots
    if (this.maze.collectDot(cellX, cellY)) {
      this.score += 10;
    }
    
    // Check for fruits
    if (this.maze.collectFruit(cellX, cellY)) {
      this.score += 200; // Increased from 50 to 200
      this.powerUp();
    }
  }
  
  private checkGhostCollisions(): void {
    const pacmanCellX = Math.floor(this.x / this.cellSize);
    const pacmanCellY = Math.floor(this.y / this.cellSize);
    
    for (const ghost of this.ghosts) {
      const ghostCellX = Math.floor(ghost.getX() / this.cellSize);
      const ghostCellY = Math.floor(ghost.getY() / this.cellSize);
      
      if (pacmanCellX === ghostCellX && pacmanCellY === ghostCellY) {
        if (this.isPoweredUp) {
          // Eat the ghost
          ghost.reset();
          this.score += 500; // Increased from 200 to 500
        } else {
          // Got caught by a ghost
          this.die();
          break;
        }
      }
    }
  }
  
  private powerUp(): void {
    this.isPoweredUp = true;
    this.powerUpTimer = 10; // 10 seconds of power-up
  }
  
  die(): void {
    if (this.alive) {
      this.alive = false;
      this.score -= 300; // Increased death penalty from 100 to 300
    }
  }
  
  getScore(): number {
    return this.score;
  }
  
  isAlive(): boolean {
    return this.alive;
  }
  
  getX(): number {
    return this.x;
  }
  
  getY(): number {
    return this.y;
  }
  
  getBrain(): NeuralNetwork {
    return this.brain;
  }
  
  isPowered(): boolean {
    return this.isPoweredUp;
  }
  
  clone(): Pacman {
    return new Pacman(
      this.x,
      this.y,
      this.cellSize,
      this.maze,
      this.ghosts,
      this.brain.clone()
    );
  }
}