import { Maze } from './Maze';

export enum GhostType {
  RED,
  PINK,
  BLUE,
  ORANGE
}

export class Ghost {
  private x: number;
  private y: number;
  private type: GhostType;
  private maze: Maze;
  private cellSize: number;
  private speed: number;
  private direction: number; // 0: up, 1: right, 2: down, 3: left
  private initialX: number;
  private initialY: number;
  private movementTimer: number = 0;
  private scatterMode: boolean = false;
  private scatterTimer: number = 0;
  
  constructor(x: number, y: number, type: GhostType, cellSize: number, maze: Maze) {
    this.x = x;
    this.y = y;
    this.initialX = x;
    this.initialY = y;
    this.type = type;
    this.cellSize = cellSize;
    this.maze = maze;
    this.direction = Math.floor(Math.random() * 4);
    
    // Different ghosts have different speeds
    switch (type) {
      case GhostType.RED:
        this.speed = 1.8;
        break;
      case GhostType.PINK:
        this.speed = 1.6;
        break;
      case GhostType.BLUE:
        this.speed = 1.4;
        break;
      case GhostType.ORANGE:
        this.speed = 1.2;
        break;
      default:
        this.speed = 1.5;
    }
    
    // Start with a short scatter phase
    this.enterScatterMode();
  }
  
  update(deltaTime: number, pacmanX: number, pacmanY: number): void {
    this.movementTimer += deltaTime;
    
    // Update scatter mode timer
    if (this.scatterMode) {
      this.scatterTimer -= deltaTime;
      if (this.scatterTimer <= 0) {
        this.scatterMode = false;
      }
    } else {
      // Occasionally enter scatter mode
      if (Math.random() < 0.001) {
        this.enterScatterMode();
      }
    }
    
    // Only move every few milliseconds to create a grid-like movement
    if (this.movementTimer >= 0.05) {
      this.movementTimer = 0;
      this.move(pacmanX, pacmanY);
    }
  }
  
  private move(pacmanX: number, pacmanY: number): void {
    const currentCellX = Math.floor(this.x / this.cellSize);
    const currentCellY = Math.floor(this.y / this.cellSize);
    
    // At cell centers, decide on a new direction
    const atCellCenter = 
      Math.abs(this.x - (currentCellX * this.cellSize + this.cellSize / 2)) < 2 &&
      Math.abs(this.y - (currentCellY * this.cellSize + this.cellSize / 2)) < 2;
    
    if (atCellCenter) {
      this.chooseNewDirection(currentCellX, currentCellY, pacmanX, pacmanY);
    }
    
    // Move in the current direction
    switch (this.direction) {
      case 0: // Up
        this.y -= this.speed;
        break;
      case 1: // Right
        this.x += this.speed;
        break;
      case 2: // Down
        this.y += this.speed;
        break;
      case 3: // Left
        this.x -= this.speed;
        break;
    }
    
    // Check for wall collisions and adjust position
    this.handleWallCollisions();
  }
  
  private chooseNewDirection(cellX: number, cellY: number, pacmanX: number, pacmanY: number): void {
    const pacmanCellX = Math.floor(pacmanX / this.cellSize);
    const pacmanCellY = Math.floor(pacmanY / this.cellSize);
    
    // Possible directions: up, right, down, left
    const directions = [0, 1, 2, 3];
    
    // Remove the opposite of the current direction (to prevent 180° turns)
    const oppositeDirection = (this.direction + 2) % 4;
    const filteredDirections = directions.filter(dir => dir !== oppositeDirection);
    
    // Check which directions are valid (not walls)
    const validDirections = filteredDirections.filter(dir => {
      let checkX = cellX;
      let checkY = cellY;
      
      switch (dir) {
        case 0: // Up
          checkY--;
          break;
        case 1: // Right
          checkX++;
          break;
        case 2: // Down
          checkY++;
          break;
        case 3: // Left
          checkX--;
          break;
      }
      
      const cell = this.maze.getCell(checkX, checkY);
      return cell && !cell.isWall;
    });
    
    if (validDirections.length === 0) {
      // If no valid directions (very rare), try all directions
      this.direction = Math.floor(Math.random() * 4);
      return;
    }
    
    if (this.scatterMode) {
      // In scatter mode, move randomly
      this.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
      return;
    }
    
    // Different ghosts have different targeting behaviors
    switch (this.type) {
      case GhostType.RED:
        // Red ghost directly targets Pacman
        this.targetPacman(validDirections, cellX, cellY, pacmanCellX, pacmanCellY);
        break;
      case GhostType.PINK:
        // Pink ghost tries to get ahead of Pacman
        this.targetAhead(validDirections, cellX, cellY, pacmanCellX, pacmanCellY, 4);
        break;
      case GhostType.BLUE:
        // Blue ghost has more erratic movement
        if (Math.random() < 0.3) {
          this.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
        } else {
          this.targetPacman(validDirections, cellX, cellY, pacmanCellX, pacmanCellY);
        }
        break;
      case GhostType.ORANGE:
        // Orange ghost alternates between targeting Pacman and moving randomly
        if (Math.random() < 0.4) {
          this.direction = validDirections[Math.floor(Math.random() * validDirections.length)];
        } else {
          this.targetPacman(validDirections, cellX, cellY, pacmanCellX, pacmanCellY);
        }
        break;
    }
  }
  
  private targetPacman(validDirections: number[], ghostX: number, ghostY: number, pacmanX: number, pacmanY: number): void {
    // Calculate which direction would get us closest to Pacman
    let bestDirection = validDirections[0];
    let bestDistance = Infinity;
    
    for (const dir of validDirections) {
      let checkX = ghostX;
      let checkY = ghostY;
      
      switch (dir) {
        case 0: // Up
          checkY--;
          break;
        case 1: // Right
          checkX++;
          break;
        case 2: // Down
          checkY++;
          break;
        case 3: // Left
          checkX--;
          break;
      }
      
      const distance = Math.sqrt(
        Math.pow(checkX - pacmanX, 2) + Math.pow(checkY - pacmanY, 2)
      );
      
      if (distance < bestDistance) {
        bestDistance = distance;
        bestDirection = dir;
      }
    }
    
    this.direction = bestDirection;
  }
  
  private targetAhead(validDirections: number[], ghostX: number, ghostY: number, pacmanX: number, pacmanY: number, lookahead: number): void {
    // Estimate where Pacman is headed
    let targetX = pacmanX;
    let targetY = pacmanY;
    
    // Apply the lookahead in a random direction
    const randomDirection = Math.floor(Math.random() * 4);
    switch (randomDirection) {
      case 0: // Up
        targetY -= lookahead;
        break;
      case 1: // Right
        targetX += lookahead;
        break;
      case 2: // Down
        targetY += lookahead;
        break;
      case 3: // Left
        targetX -= lookahead;
        break;
    }
    
    // Ensure the target is in bounds
    targetX = Math.max(0, Math.min(this.maze.getWidth() - 1, targetX));
    targetY = Math.max(0, Math.min(this.maze.getHeight() - 1, targetY));
    
    // Target this position
    let bestDirection = validDirections[0];
    let bestDistance = Infinity;
    
    for (const dir of validDirections) {
      let checkX = ghostX;
      let checkY = ghostY;
      
      switch (dir) {
        case 0: // Up
          checkY--;
          break;
        case 1: // Right
          checkX++;
          break;
        case 2: // Down
          checkY++;
          break;
        case 3: // Left
          checkX--;
          break;
      }
      
      const distance = Math.sqrt(
        Math.pow(checkX - targetX, 2) + Math.pow(checkY - targetY, 2)
      );
      
      if (distance < bestDistance) {
        bestDistance = distance;
        bestDirection = dir;
      }
    }
    
    this.direction = bestDirection;
  }
  
  private handleWallCollisions(): void {
    const cellX = Math.floor(this.x / this.cellSize);
    const cellY = Math.floor(this.y / this.cellSize);
    
    // Check all four adjacent cells
    const cells = [
      { x: cellX, y: cellY - 1 }, // Up
      { x: cellX + 1, y: cellY }, // Right
      { x: cellX, y: cellY + 1 }, // Down
      { x: cellX - 1, y: cellY }  // Left
    ];
    
    for (let i = 0; i < cells.length; i++) {
      const cell = this.maze.getCell(cells[i].x, cells[i].y);
      if (cell && cell.isWall) {
        // If we're moving toward this wall, adjust position
        if (this.direction === i) {
          switch (i) {
            case 0: // Up
              this.y = cellY * this.cellSize + this.cellSize / 2;
              break;
            case 1: // Right
              this.x = cellX * this.cellSize + this.cellSize / 2;
              break;
            case 2: // Down
              this.y = cellY * this.cellSize + this.cellSize / 2;
              break;
            case 3: // Left
              this.x = cellX * this.cellSize + this.cellSize / 2;
              break;
          }
          
          // Choose a new direction
          this.direction = (this.direction + 1 + Math.floor(Math.random() * 3)) % 4;
        }
      }
    }
  }
  
  private enterScatterMode(): void {
    this.scatterMode = true;
    this.scatterTimer = 5 + Math.random() * 5; // 5-10 seconds of scatter mode
  }
  
  reset(): void {
    this.x = this.initialX;
    this.y = this.initialY;
    this.direction = Math.floor(Math.random() * 4);
    this.enterScatterMode();
  }
  
  getX(): number {
    return this.x;
  }
  
  getY(): number {
    return this.y;
  }
  
  getType(): GhostType {
    return this.type;
  }
}