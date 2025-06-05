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
  private visionRange: number = 5; 
  private powerUpTimer: number = 0;
  private isPoweredUp: boolean = false;
  private lastPosition: Position = { x: 0, y: 0 };
  private stationaryTime: number = 0;

  // 🔥 Novos atributos para detecção de loop e distância
  private positionHistory: Position[] = [];
  private historyLimit: number = 20; // número de posições a manter no histórico
  private lastDistanceToGoal: number = Number.MAX_VALUE;

  constructor(x: number, y: number, cellSize: number, maze: Maze, ghosts: Ghost[], brain?: NeuralNetwork) {
    this.x = x;
    this.y = y;
    this.cellSize = cellSize;
    this.direction = Direction.NONE;
    this.score = 0;
    this.alive = true;
    this.maze = maze;
    this.ghosts = ghosts;

    if (brain) {
      this.brain = brain;
    } else {
      this.brain = new NeuralNetwork([16, 12, 4]);
    }
  }

  update(deltaTime: number): void {
    if (!this.alive) return;

    this.lastPosition = { x: this.x, y: this.y };

    if (this.isPoweredUp) {
      this.powerUpTimer -= deltaTime;
      if (this.powerUpTimer <= 0) {
        this.isPoweredUp = false;
      }
    }

    const inputs = this.getVisionInputs();
    const outputs = this.brain.feedForward(inputs);

    let maxIndex = 0;
    for (let i = 1; i < outputs.length; i++) {
      if (outputs[i] > outputs[maxIndex]) {
        maxIndex = i;
      }
    }

    this.direction = maxIndex;

    this.move();

    // Loop detection
    this.detectLoop();

    // Distance reward
    this.rewardDistance();

    if (Math.abs(this.x - this.lastPosition.x) < 0.1 && Math.abs(this.y - this.lastPosition.y) < 0.1) {
      this.stationaryTime += deltaTime;
      if (this.stationaryTime > 0.5) {
        this.score -= 10 * deltaTime;
      }
    } else {
      this.stationaryTime = 0;
      this.score -= 0.3;
    }

    this.checkCollectibles();
    this.checkGhostCollisions();
  }

  private detectLoop(): void {
    const currentPos: Position = {
      x: Math.floor(this.x / this.cellSize),
      y: Math.floor(this.y / this.cellSize)
    };

    this.positionHistory.push(currentPos);

    if (this.positionHistory.length > this.historyLimit) {
      this.positionHistory.shift();
    }

    const occurrences = this.positionHistory.filter(pos => pos.x === currentPos.x && pos.y === currentPos.y).length;

    if (occurrences >= 4) {  
      this.score -= 5; 
    }
  }

  private rewardDistance(): void {
    const nearestDistance = this.getDistanceToNearestGoal();
    if (nearestDistance < this.lastDistanceToGoal) {
      this.score += 1;
    } else if (nearestDistance > this.lastDistanceToGoal + 0.1) {
      this.score -= 0.5;
    }
    this.lastDistanceToGoal = nearestDistance;
  }

  private getDistanceToNearestGoal(): number {
    const pacmanCellX = Math.floor(this.x / this.cellSize);
    const pacmanCellY = Math.floor(this.y / this.cellSize);

    let minDistance = Number.MAX_VALUE;

    for (let y = 0; y < this.maze.getHeight(); y++) {
      for (let x = 0; x < this.maze.getWidth(); x++) {
        const cell = this.maze.getCell(x, y);
        if (cell && (cell.hasDot || cell.hasFruit)) {
          const distance = Math.abs(pacmanCellX - x) + Math.abs(pacmanCellY - y);
          if (distance < minDistance) {
            minDistance = distance;
          }
        }
      }
    }

    return minDistance;
  }

  private getVisionInputs(): number[] {
    const inputs: number[] = new Array(16).fill(0);

    const getDirectionInfo = (direction: Direction, inputOffset: number): void => {
      const dirX = direction === Direction.RIGHT ? 1 : direction === Direction.LEFT ? -1 : 0;
      const dirY = direction === Direction.DOWN ? 1 : direction === Direction.UP ? -1 : 0;

      let wallDistance = 1;
      let dotDistance = 1;
      let fruitDistance = 1;
      let ghostDistance = 1;

      for (let i = 1; i <= this.visionRange; i++) {
        const checkX = Math.floor(this.x / this.cellSize) + dirX * i;
        const checkY = Math.floor(this.y / this.cellSize) + dirY * i;

        const cell = this.maze.getCell(checkX, checkY);
        if (!cell || cell.isWall) {
          wallDistance = i / this.visionRange;
          break;
        }

        if (cell.hasDot && dotDistance === 1) {
          dotDistance = i / this.visionRange;
        }
        if (cell.hasFruit && fruitDistance === 1) {
          fruitDistance = i / this.visionRange;
        }
        for (const ghost of this.ghosts) {
          const ghostCellX = Math.floor(ghost.getX() / this.cellSize);
          const ghostCellY = Math.floor(ghost.getY() / this.cellSize);
          if (ghostCellX === checkX && ghostCellY === checkY && ghostDistance === 1) {
            ghostDistance = i / this.visionRange;
            break;
          }
        }
      }

      inputs[inputOffset] = 1 - wallDistance;
      inputs[inputOffset + 1] = 1 - dotDistance;
      inputs[inputOffset + 2] = 1 - fruitDistance;
      inputs[inputOffset + 3] = 1 - ghostDistance;
    };

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

    const speed = 2 * this.cellSize / 20;

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
    }

    const newCellX = Math.floor(newX / this.cellSize);
    const newCellY = Math.floor(newY / this.cellSize);

    const newCell = this.maze.getCell(newCellX, newCellY);
    const currentCell = this.maze.getCell(currentCellX, currentCellY);

    if (newCell && !newCell.isWall) {
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
        this.x = currentCellX * this.cellSize + this.cellSize / 2;
        this.y = currentCellY * this.cellSize + this.cellSize / 2;
      }
    } else {
      this.x = currentCellX * this.cellSize + this.cellSize / 2;
      this.y = currentCellY * this.cellSize + this.cellSize / 2;
      this.score -= 1;
    }
  }

  private checkCollectibles(): void {
    const cellX = Math.floor(this.x / this.cellSize);
    const cellY = Math.floor(this.y / this.cellSize);

    if (this.maze.collectDot(cellX, cellY)) {
      this.score += 20;
    }

    if (this.maze.collectFruit(cellX, cellY)) {
      this.score += 100;
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
          ghost.reset();
          this.score += 500;
        } else {
          this.die();
          break;
        }
      }
    }
  }

  private powerUp(): void {
    this.isPoweredUp = true;
    this.powerUpTimer = 10;
  }

  die(): void {
    if (this.alive) {
      this.alive = false;
      this.score -= 100;
    }
  }

  getScore(): number {
    return Math.floor(this.score);
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
