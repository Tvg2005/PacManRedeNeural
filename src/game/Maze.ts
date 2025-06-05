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
  private wallProbability: number = 0.4; // Increased from 0.3 to 0.4 for more walls
  
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
    
    // Generate maze using randomized DFS
    this.generateMaze(2, 2);
    
    // Add dots and fruits
    this.addDotsAndFruits();
    
    // Ensure there's a valid path through the maze
    this.ensureValidPath();
    
    // Add additional random walls to make the maze more challenging
    this.addRandomWalls();
  }
  
  private addRandomWalls(): void {
    // Add some random walls to make the maze more interesting
    for (let y = 2; y < this.height - 2; y++) {
      for (let x = 2; x < this.width - 2; x++) {
        if (!this.cells[y][x].isWall && Math.random() < 0.2) {
          // Check if adding a wall here would create a dead end
          let adjacentWalls = 0;
          if (this.cells[y-1][x].isWall) adjacentWalls++;
          if (this.cells[y+1][x].isWall) adjacentWalls++;
          if (this.cells[y][x-1].isWall) adjacentWalls++;
          if (this.cells[y][x+1].isWall) adjacentWalls++;
          
          // Only add wall if it won't create a dead end
          if (adjacentWalls < 2) {
            this.cells[y][x].isWall = true;
          }
        }
      }
    }
  }
  
  private generateMaze(startX: number, startY: number): void {
    // Use a simple algorithm to place walls randomly while ensuring connectivity
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        // Skip the starting position
        if (x === startX && y === startY) continue;
        
        // Randomly place walls
        if (Math.random() < this.wallProbability) {
          this.cells[y][x].isWall = true;
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
    
    // Add a few fruits
    let fruitsAdded = 0;
    const maxFruits = 3;
    
    while (fruitsAdded < maxFruits) {
      const x = Math.floor(Math.random() * (this.width - 2)) + 1;
      const y = Math.floor(Math.random() * (this.height - 2)) + 1;
      
      if (!this.cells[y][x].isWall && !this.cells[y][x].hasFruit) {
        this.cells[y][x].hasFruit = true;
        this.cells[y][x].hasDot = false; // Remove dot if there's a fruit
        fruitsAdded++;
      }
    }
  }
  
  private ensureValidPath(): void {
    // Simple flood fill to check and fix connectivity
    const visited: boolean[][] = Array(this.height).fill(null).map(() => 
      Array(this.width).fill(false)
    );
    
    const startX = 1;
    const startY = 1;
    
    // Make sure the starting position is not a wall
    this.cells[startY][startX].isWall = false;
    
    // Flood fill from the starting position
    this.floodFill(startX, startY, visited);
    
    // Check if any non-wall cell was not visited and make a path to it
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (!this.cells[y][x].isWall && !visited[y][x]) {
          // Create a path from a visited cell to this isolated cell
          this.createPathToIsolatedCell(x, y, visited);
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
  
  private createPathToIsolatedCell(x: number, y: number, visited: boolean[][]): void {
    // Find the nearest visited cell and create a path
    let nearestX = -1;
    let nearestY = -1;
    let minDistance = Infinity;
    
    for (let ny = 1; ny < this.height - 1; ny++) {
      for (let nx = 1; nx < this.width - 1; nx++) {
        if (visited[ny][nx]) {
          const distance = Math.abs(nx - x) + Math.abs(ny - y);
          if (distance < minDistance) {
            minDistance = distance;
            nearestX = nx;
            nearestY = ny;
          }
        }
      }
    }
    
    if (nearestX !== -1 && nearestY !== -1) {
      // Create a straight path
      this.createStraightPath(x, y, nearestX, nearestY);
    }
  }
  
  private createStraightPath(x1: number, y1: number, x2: number, y2: number): void {
    // Create a simple L-shaped path
    let currentX = x1;
    let currentY = y1;
    
    // Move horizontally first
    while (currentX !== x2) {
      this.cells[currentY][currentX].isWall = false;
      currentX += (x2 > currentX) ? 1 : -1;
    }
    
    // Then move vertically
    while (currentY !== y2) {
      this.cells[currentY][currentX].isWall = false;
      currentY += (y2 > currentY) ? 1 : -1;
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