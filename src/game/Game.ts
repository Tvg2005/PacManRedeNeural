import { Maze } from './Maze';
import { Pacman } from './Pacman';
import { Ghost, GhostType } from './Ghost';
import { NeuralNetwork } from '../neural/NeuralNetwork';

export class Game {
  private maze: Maze;
  private pacman: Pacman;
  private ghosts: Ghost[];
  private cellSize: number;
  private width: number;
  private height: number;
  private gameOver: boolean;
  private maxTime: number = 20; 
  private elapsedTime: number = 0;
  private timeScale: number = 1;
  
  constructor(width: number, height: number, brain?: NeuralNetwork) {
    // Ensure minimum dimensions
    this.width = Math.max(200, width);
    this.height = Math.max(200, height);
    
    // Ensure cell size is reasonable (minimum 10px)
    this.cellSize = Math.max(10, Math.min(this.width, this.height) / 20);
    
    // Calculate maze dimensions and ensure minimum size of 3x3
    const mazeWidth = Math.max(3, Math.floor(this.width / this.cellSize));
    const mazeHeight = Math.max(3, Math.floor(this.height / this.cellSize));
    
    // Create the maze
    this.maze = new Maze(mazeWidth, mazeHeight);
    
    // Create ghosts
    this.ghosts = this.createGhosts();
    
    // Create Pacman with the provided brain or a new one
    const startX = Math.floor(mazeWidth / 2) * this.cellSize + this.cellSize / 2;
    const startY = Math.floor(mazeHeight / 2) * this.cellSize + this.cellSize / 2;
    this.pacman = new Pacman(startX, startY, this.cellSize, this.maze, this.ghosts, brain);
    
    this.gameOver = false;
  }
  
  private createGhosts(): Ghost[] {
    const ghosts: Ghost[] = [];
    const mazeWidth = this.maze.getWidth();
    const mazeHeight = this.maze.getHeight();
    
    // Create one of each ghost type at different corners
    const ghostPositions = [
      { x: 1, y: 1, type: GhostType.RED },
      { x: mazeWidth - 2, y: 1, type: GhostType.PINK },
      { x: 1, y: mazeHeight - 2, type: GhostType.BLUE },
      { x: mazeWidth - 2, y: mazeHeight - 2, type: GhostType.ORANGE }
    ];
    
    for (const pos of ghostPositions) {
      const x = pos.x * this.cellSize + this.cellSize / 2;
      const y = pos.y * this.cellSize + this.cellSize / 2;
      ghosts.push(new Ghost(x, y, pos.type, this.cellSize, this.maze));
    }
    
    return ghosts;
  }
  
  update(deltaTime: number): void {
    if (this.gameOver) return;
    
    // Apply time scaling
    const scaledDelta = deltaTime * this.timeScale;
    
    // Update game time
    this.elapsedTime += scaledDelta;
    if (this.elapsedTime >= this.maxTime * this.timeScale) {
      this.gameOver = true;
      return;
    }
    
    // Update Pacman
    this.pacman.update(scaledDelta);
    
    // Update ghosts
    for (const ghost of this.ghosts) {
      ghost.update(scaledDelta, this.pacman.getX(), this.pacman.getY());
    }
    
    // Check if Pacman is dead
    if (!this.pacman.isAlive()) {
      this.gameOver = true;
    }
  }
  
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw maze
    this.drawMaze(ctx);
    
    // Draw dots and fruits
    this.drawCollectibles(ctx);
    
    // Draw ghosts
    for (const ghost of this.ghosts) {
      this.drawGhost(ctx, ghost);
    }
    
    // Draw Pacman
    this.drawPacman(ctx);
    
    // Draw score
    this.drawScore(ctx);
    
    // Draw time remaining
    this.drawTime(ctx);
    
    // Draw game over overlay if game is over
    if (this.gameOver) {
      this.drawGameOver(ctx);
    }
  }
  
  private drawMaze(ctx: CanvasRenderingContext2D): void {
    // Draw walls
    ctx.fillStyle = '#2563eb'; // Blue walls
    
    for (let y = 0; y < this.maze.getHeight(); y++) {
      for (let x = 0; x < this.maze.getWidth(); x++) {
        const cell = this.maze.getCell(x, y);
        if (cell && cell.isWall) {
          ctx.fillRect(
            x * this.cellSize,
            y * this.cellSize,
            this.cellSize,
            this.cellSize
          );
          
          // Add highlight/shadow for 3D effect
          ctx.fillStyle = '#1d4ed8'; // Darker blue for shadow
          ctx.fillRect(
            x * this.cellSize + this.cellSize - 3,
            y * this.cellSize,
            3,
            this.cellSize
          );
          ctx.fillRect(
            x * this.cellSize,
            y * this.cellSize + this.cellSize - 3,
            this.cellSize,
            3
          );
          
          ctx.fillStyle = '#3b82f6'; // Lighter blue for highlight
          ctx.fillRect(
            x * this.cellSize,
            y * this.cellSize,
            3,
            this.cellSize
          );
          ctx.fillRect(
            x * this.cellSize,
            y * this.cellSize,
            this.cellSize,
            3
          );
          
          ctx.fillStyle = '#2563eb'; // Reset fill color
        }
      }
    }
  }
  
  private drawCollectibles(ctx: CanvasRenderingContext2D): void {
    // Draw dots
    ctx.fillStyle = '#f0f0f0'; // White dots
    
    for (let y = 0; y < this.maze.getHeight(); y++) {
      for (let x = 0; x < this.maze.getWidth(); x++) {
        const cell = this.maze.getCell(x, y);
        if (cell && cell.hasDot) {
          ctx.beginPath();
          ctx.arc(
            x * this.cellSize + this.cellSize / 2,
            y * this.cellSize + this.cellSize / 2,
            this.cellSize / 10,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
    
    // Draw fruits
    for (let y = 0; y < this.maze.getHeight(); y++) {
      for (let x = 0; x < this.maze.getWidth(); x++) {
        const cell = this.maze.getCell(x, y);
        if (cell && cell.hasFruit) {
          // Draw a cherry
          const centerX = x * this.cellSize + this.cellSize / 2;
          const centerY = y * this.cellSize + this.cellSize / 2;
          
          // Draw the cherry body
          ctx.fillStyle = '#e11d48'; // Red
          ctx.beginPath();
          ctx.arc(
            centerX - 2,
            centerY + 2,
            this.cellSize / 4,
            0,
            Math.PI * 2
          );
          ctx.fill();
          
          // Draw another cherry
          ctx.beginPath();
          ctx.arc(
            centerX + 4,
            centerY,
            this.cellSize / 4,
            0,
            Math.PI * 2
          );
          ctx.fill();
          
          // Draw the stem
          ctx.strokeStyle = '#65a30d'; // Green
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(centerX - 2, centerY);
          ctx.quadraticCurveTo(
            centerX,
            centerY - 6,
            centerX + 3,
            centerY - 8
          );
          ctx.stroke();
        }
      }
    }
  }
  
  private drawPacman(ctx: CanvasRenderingContext2D): void {
    const x = this.pacman.getX();
    const y = this.pacman.getY();
    const radius = this.cellSize * 0.4;
    
    // Draw Pacman body
    ctx.fillStyle = this.pacman.isPowered() ? '#facc15' : '#fbbf24'; // Yellow with power-up effect
    ctx.beginPath();
    
    // Mouth angle based on direction
    let startAngle = 0.2 * Math.PI;
    let endAngle = 1.8 * Math.PI;
    
    ctx.arc(x, y, radius, startAngle, endAngle);
    ctx.lineTo(x, y);
    ctx.fill();
    
    // Draw eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(
      x + radius * 0.3,
      y - radius * 0.3,
      radius * 0.1,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Power-up glow effect
    if (this.pacman.isPowered()) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  
  private drawGhost(ctx: CanvasRenderingContext2D, ghost: Ghost): void {
    const x = ghost.getX();
    const y = ghost.getY();
    const radius = this.cellSize * 0.45;
    
    // Ghost color based on type
    let color;
    switch (ghost.getType()) {
      case GhostType.RED:
        color = '#ef4444'; // Red
        break;
      case GhostType.PINK:
        color = '#ec4899'; // Pink
        break;
      case GhostType.BLUE:
        color = '#3b82f6'; // Blue
        break;
      case GhostType.ORANGE:
        color = '#f97316'; // Orange
        break;
      default:
        color = '#ffffff'; // White (fallback)
    }
    
    // If Pacman is powered up, make ghosts blue with fear
    if (this.pacman.isPowered()) {
      color = '#94a3b8'; // Bluish gray
    }
    
    // Draw ghost body
    ctx.fillStyle = color;
    
    // Head
    ctx.beginPath();
    ctx.arc(
      x,
      y - radius * 0.2,
      radius,
      Math.PI,
      0,
      false
    );
    
    // Skirt
    const skirtHeight = radius * 0.5;
    ctx.lineTo(x + radius, y - radius * 0.2 + skirtHeight);
    
    // Wavy bottom
    const waveWidth = radius / 3;
    for (let i = 0; i < 3; i++) {
      ctx.quadraticCurveTo(
        x + radius - waveWidth * (i + 0.5),
        y - radius * 0.2 + skirtHeight + radius * 0.4,
        x + radius - waveWidth * (i + 1),
        y - radius * 0.2 + skirtHeight
      );
    }
    
    ctx.lineTo(x - radius, y - radius * 0.2 + skirtHeight);
    ctx.lineTo(x - radius, y - radius * 0.2);
    ctx.fill();
    
    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(
      x - radius * 0.3,
      y - radius * 0.4,
      radius * 0.25,
      0,
      Math.PI * 2
    );
    ctx.arc(
      x + radius * 0.3,
      y - radius * 0.4,
      radius * 0.25,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Pupils
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(
      x - radius * 0.3 + radius * 0.1,
      y - radius * 0.4,
      radius * 0.13,
      0,
      Math.PI * 2
    );
    ctx.arc(
      x + radius * 0.3 + radius * 0.1,
      y - radius * 0.4,
      radius * 0.13,
      0,
      Math.PI * 2
    );
    ctx.fill();
    
    // Scared expression when Pacman is powered up
    if (this.pacman.isPowered()) {
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - radius * 0.5, y - radius * 0.1);
      ctx.lineTo(x + radius * 0.5, y - radius * 0.1);
      ctx.stroke();
    }
  }
  
  private drawScore(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${this.pacman.getScore()}`, 10, 20);
  }
  
  private drawTime(ctx: CanvasRenderingContext2D): void {
    const timeLeft = Math.max(0, this.maxTime - this.elapsedTime);
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Time: ${timeLeft.toFixed(1)}s`, this.width - 10, 20);
  }
  
  private drawGameOver(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, this.width, this.height);
    
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', this.width / 2, this.height / 2);
    
    ctx.font = '24px Arial';
    ctx.fillStyle = '#fff';
    ctx.fillText(`Score: ${this.pacman.getScore()}`, this.width / 2, this.height / 2 + 40);
  }
  
  isGameOver(): boolean {
    return this.gameOver;
  }
  
  getScore(): number {
    return this.pacman.getScore();
  }
  
  getBrain(): NeuralNetwork {
    return this.pacman.getBrain();
  }
  
  setTimeScale(scale: number): void {
    this.timeScale = scale;
  }
}