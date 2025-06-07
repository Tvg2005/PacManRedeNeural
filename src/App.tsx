import React, { useEffect, useRef, useState } from 'react';
import { PauseIcon, PlayIcon, FastForwardIcon, RotateCcwIcon, Info } from 'lucide-react';
import GameSimulation from './components/GameSimulation';
import StatsPanel from './components/StatsPanel';
import InfoPanel from './components/InfoPanel';

function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [generation, setGeneration] = useState(0);
  const [aliveCount, setAliveCount] = useState(16);
  const [bestScore, setBestScore] = useState(0);
  const [currentBestScore, setCurrentBestScore] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  
  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setGeneration(0);
    setBestScore(0);
    setCurrentBestScore(0);
    setAliveCount(16);
  };
  
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };
  
  const handleGenerationComplete = (newGeneration: number, bestScoreAchieved: number) => {
    setGeneration(newGeneration);
    setAliveCount(16);
    if (bestScoreAchieved > bestScore) {
      setBestScore(bestScoreAchieved);
    }
    setCurrentBestScore(0);
  };
  
  const handlePacmanDeath = () => {
    setAliveCount(prev => Math.max(0, prev - 1));
  };
  
  const handleScoreUpdate = (score: number) => {
    if (score > currentBestScore) {
      setCurrentBestScore(score);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="bg-gray-800 p-4 shadow-md">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2 md:mb-0">
            <img className='h-12' src='pacmanlogo.png'></img>PacMan <span className="text-blue-400">Rede Neural</span>
          </h1>
          <div className="flex space-x-4 items-center">
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center space-x-1 text-gray-300 hover:text-white"
            >
              <Info size={18} />
              <span>Sobre o projeto</span>
            </button>
            <div className="flex space-x-2">
              {!isRunning ? (
                <button 
                  onClick={handleStart}
                  className="bg-green-600 hover:bg-green-700 p-2 rounded-full"
                >
                  <PlayIcon size={20} />
                </button>
              ) : (
                <button 
                  onClick={handlePause}
                  className="bg-yellow-600 hover:bg-yellow-700 p-2 rounded-full"
                >
                  <PauseIcon size={20} />
                </button>
              )}
              <button 
                onClick={handleReset}
                className="bg-red-600 hover:bg-red-700 p-2 rounded-full"
              >
                <RotateCcwIcon size={20} />
              </button>
              <div className="flex items-center space-x-2 bg-gray-700 rounded-full px-3 py-1">
                <button 
                  onClick={() => handleSpeedChange(1)} 
                  className={`text-xs ${speed === 1 ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}
                >
                  1x
                </button>
                <button 
                  onClick={() => handleSpeedChange(5)} 
                  className={`text-xs ${speed === 5 ? 'text-yellow-400 font-bold' : 'text-gray-300'}`}
                >
                  5x
                </button>
              </div>
            </div>
          </div>
        </div>
        
      </header>
      
      <main className="flex-grow p-4">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <GameSimulation 
              isRunning={isRunning}
              speed={speed}
              generation={generation}
              onGenerationComplete={handleGenerationComplete}
              onPacmanDeath={handlePacmanDeath}
              onScoreUpdate={handleScoreUpdate}
            />
            <div className="flex justify-center items-center flex-col p-4 text-gray-300">
                <span className='text-lg font-semibold'>Projeto feito para demonstrar utilização, evolução e metodologia das redes neurais</span>
                <span className='text-gray-400'>Devido a complexidade do jogo e a quantidade possível de movimentos e variáveis em que a rede neural precisa processar</span>
                <span className='text-gray-400'> A rede neural irá levar uma grande quantidade de gerações para conseguir ficar boa no jogo</span>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg shadow-xl p-4">
            <StatsPanel 
              generation={generation}
              aliveCount={aliveCount}
              bestScore={bestScore}
              currentBestScore={currentBestScore}
            />
          </div>
        </div>
        
      </main>
      
      {showInfo && (
        <InfoPanel onClose={() => setShowInfo(false)} />
      )}
    </div>
  );
}

export default App;