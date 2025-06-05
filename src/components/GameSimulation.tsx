import React, { useEffect, useRef, useState } from 'react';
import { Simulation } from '../game/Simulation';

interface GameSimulationProps {
  isRunning: boolean;
  speed: number;
  generation: number;
  onGenerationComplete: (generation: number, bestScore: number) => void;
  onPacmanDeath: () => void;
  onScoreUpdate: (score: number) => void;
}

const GameSimulation: React.FC<GameSimulationProps> = ({
  isRunning,
  speed,
  generation,
  onGenerationComplete,
  onPacmanDeath,
  onScoreUpdate
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simulationRef = useRef<Simulation | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    if (!simulationRef.current) {
      simulationRef.current = new Simulation(
        canvas, 
        context,
        () => onPacmanDeath(),
        (score) => onScoreUpdate(score),
        (gen, score) => onGenerationComplete(gen, score)
      );
      setInitialized(true);
    }
    
    const resizeCanvas = () => {
      if (!canvas || !simulationRef.current) return;
      
      // Get parent container size
      const container = canvas.parentElement;
      if (!container) return;
      
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      
      simulationRef.current.resize(width, height);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  useEffect(() => {
    if (!simulationRef.current || !initialized) return;
    
    if (isRunning) {
      simulationRef.current.start();
    } else {
      simulationRef.current.pause();
    }
  }, [isRunning, initialized]);

  useEffect(() => {
    if (!simulationRef.current) return;
    simulationRef.current.setSpeed(speed);
  }, [speed]);

  useEffect(() => {
    if (generation === 0 && simulationRef.current) {
      simulationRef.current.reset();
    }
  }, [generation]);

  return (
    <div className="w-full h-[600px] relative bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
      {!isRunning && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-white text-xl font-bold px-6 py-3 rounded-lg bg-gray-800 shadow-lg">
            {generation === 0 ? 'Press Play to Start Training' : 'Paused'}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameSimulation;