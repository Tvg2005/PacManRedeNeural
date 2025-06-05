export interface Cell {
  x: number;
  y: number;
  isWall: boolean;
  hasDot: boolean;
  hasFruit: boolean;
}

export class Maze {
  private width: number;
  private height: number;
  private cells: Cell[][];
  private wallProbability: number = 0.25; // Reduced wall probability
  
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.cells = [];
    
    this.generate();
  }
  
  generate(): void {
    // Initialize empty grid
    this.cells = Array(this.height).fill(null).map((_, y) => 
      Array(this.width).fill(null).map((_, x) => ({
        x,
        y,
        isWall: false,
        hasDot: false,
        hasFruit: false
      }))
    );
    
    // Add border walls
    for (let x = 0; x < this.width; x++) {
      this.cells[0][x].isWall = true;
      this.cells[this.height - 1][x].isWall = true;
    }
    
    for (let y = 0; y < this.height; y++) {
      this.cells[y][0].isWall = true;
      this.cells[y][this.width - 1].isWall = true;
    }
    
    // Generate maze using a more structured approach
    this.generateStructuredMaze();
    
    // Add dots and fruits
    this.addDotsAndFruits();
    
    // Ensure there's a valid path through the maze
    this.ensureValidPath();
    
    // Create some strategic openings
    this.createStrategicOpenings();
  }
  
  private generateStructuredMaze(): void {
    // Create a grid pattern with guaranteed paths
    for (let y = 2; y < this.height - 2; y += 2) {
      for (let x = 2; x < this.width - 2; x += 2) {
        if (Math.random() < this.wallProbability) {
          // Create a wall pattern that ensures connectivity
          this.cells[y][x].isWall = true;
          
          // Randomly extend the wall in one direction
          const direction = Math.floor(Math.random() * 4);
          switch (direction) {
            case 0: // Up
              if (y > 2) this.cells[y-1][x].isWall = true;
              break;
            case 1: // Right
              if (x < this.width - 3) this.cells[y][x+1].isWall = true;
              break;
            case 2: // Down
              if (y < this.height - 3) this.cells[y+1][x].isWall = true;
              break;
            case 3: // Left
              if (x > 2) this.cells[y][x-1].isWall = true;
              break;
          }
        }
      }
    }
  }
  
  private createStrategicOpenings(): void {
    // Create some strategic openings to ensure better connectivity
    for (let y = 2; y < this.height - 2; y++) {
      for (let x = 2; x < this.width - 2; x++) {
        if (this.cells[y][x].isWall) {
          // Count adjacent walls
          let wallCount = 0;
          if (this.cells[y-1][x].isWall) wallCount++;
          if (this.cells[y+1][x].isWall) wallCount++;
          if (this.cells[y][x-1].isWall) wallCount++;
          if (this.cells[y][x+1].isWall) wallCount++;
          
          // If too many adjacent walls, create an opening
          if (wallCount > 2) {
            this.cells[y][x].isWall = false;
          }
        }
      }
    }
    
    // Ensure the center area is clear for Pacman spawn
    const centerX = Math.floor(this.width / 2);
    const centerY = Math.floor(this.height / 2);
    
    // Clear a 3x3 area around the center
    for (let y = centerY - 1; y <= centerY + 1; y++) {
      for (let x = centerX - 1; x <= centerX + 1; x++) {
        if (y > 0 && y < this.height - 1 && x > 0 && x < this.width - 1) {
          this.cells[y][x].isWall = false;
        }
      }
    }
  }
  
  private addDotsAndFruits(): void {
    // Add dots to non-wall cells
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (!this.cells[y][x].isWall) {
          // 90% chance of having a dot
          if (Math.random() < 0.9) {
            this.cells[y][x].hasDot = true;
          }
        }
      }
    }
    
    // Add a few fruits in accessible locations
    let fruitsAdded = 0;
    const maxFruits = 5;
    
    while (fruitsAdded < maxFruits) {
      const x = Math.floor(Math.random() * (this.width - 2)) + 1;
      const y = Math.floor(Math.random() * (this.height - 2)) + 1;
      
      if (!this.cells[y][x].isWall && !this.cells[y][x].hasFruit && this.hasAccessiblePath(x, y)) {
        this.cells[y][x].hasFruit = true;
        this.cells[y][x].hasDot = false;
        fruitsAdded++;
      }
    }
  }
  
  private hasAccessiblePath(x: number, y: number): boolean {
    // Check if there's at least one adjacent non-wall cell
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      
      if (newX > 0 && newX < this.width - 1 && newY > 0 && newY < this.height - 1) {
        if (!this.cells[newY][newX].isWall) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  private ensureValidPath(): void {
    const visited: boolean[][] = Array(this.height).fill(null).map(() => 
      Array(this.width).fill(false)
    );
    
    const centerX = Math.floor(this.width / 2);
    const centerY = Math.floor(this.height / 2);
    
    // Make sure the center is clear for Pacman
    this.cells[centerY][centerX].isWall = false;
    
    // Flood fill from the center
    this.floodFill(centerX, centerY, visited);
    
    // Check for and fix isolated areas
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (!this.cells[y][x].isWall && !visited[y][x]) {
          this.createPathToCenter(x, y, centerX, centerY);
        }
      }
    }
  }
  
  private floodFill(x: number, y: number, visited: boolean[][]): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
    if (this.cells[y][x].isWall || visited[y][x]) return;
    
    visited[y][x] = true;
    
    this.floodFill(x + 1, y, visited);
    this.floodFill(x - 1, y, visited);
    this.floodFill(x, y + 1, visited);
    this.floodFill(x, y - 1, visited);
  }
  
  private createPathToCenter(x: number, y: number, centerX: number, centerY: number): void {
    // Create a path from the isolated point to the center
    let currentX = x;
    let currentY = y;
    
    while (currentX !== centerX || currentY !== centerY) {
      if (currentX < centerX) {
        this.cells[currentY][currentX].isWall = false;
        currentX++;
      } else if (currentX > centerX) {
        this.cells[currentY][currentX].isWall = false;
        currentX--;
      }
      
      if (currentY < centerY) {
        this.cells[currentY][currentX].isWall = false;
        currentY++;
      } else if (currentY > centerY) {
        this.cells[currentY][currentX].isWall = false;
        currentY--;
      }
    }
  }
  
  getCell(x: number, y: number): Cell | null {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }
    return this.cells[y][x];
  }
  
  getWidth(): number {
    return this.width;
  }
  
  getHeight(): number {
    return this.height;
  }
  
  collectDot(x: number, y: number): boolean {
    const cell = this.getCell(x, y);
    if (cell && cell.hasDot) {
      cell.hasDot = false;
      return true;
    }
    return false;
  }
  
  collectFruit(x: number, y: number): boolean {
    const cell = this.getCell(x, y);
    if (cell && cell.hasFruit) {
      cell.hasFruit = false;
      return true;
    }
    return false;
  }
  
  getWalls(): Cell[] {
    const walls: Cell[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.cells[y][x].isWall) {
          walls.push(this.cells[y][x]);
        }
      }
    }
    return walls;
  }
  
  getDots(): Cell[] {
    const dots: Cell[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.cells[y][x].hasDot) {
          dots.push(this.cells[y][x]);
        }
      }
    }
    return dots;
  }
  
  getFruits(): Cell[] {
    const fruits: Cell[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.cells[y][x].hasFruit) {
          fruits.push(this.cells[y][x]);
        }
      }
    }
    return fruits;
  }
}