import React from 'react';
import { Brain, Award, Users, Zap } from 'lucide-react';

interface StatsPanelProps {
  generation: number;
  aliveCount: number;
  bestScore: number;
  currentBestScore: number;
}

const StatsPanel: React.FC<StatsPanelProps> = ({
  generation,
  aliveCount,
  bestScore,
  currentBestScore
}) => {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4 text-blue-400 flex items-center">
        <Brain className="mr-2\" size={24} />
        Neural Network Stats
      </h2>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Zap size={20} className="text-yellow-400 mr-2" />
            <h3 className="text-lg font-semibold">Generation</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{generation}</p>
          <p className="text-sm text-gray-400 mt-1">Current training cycle</p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Users size={20} className="text-green-400 mr-2" />
            <h3 className="text-lg font-semibold">Pacmans Alive</h3>
          </div>
          <div className="flex items-center">
            <p className="text-3xl font-bold text-green-400">{aliveCount}</p>
            <p className="text-xl ml-2 text-gray-400">/ 12</p>
          </div>
          <p className="text-sm text-gray-400 mt-1">Surviving agents</p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Award size={20} className="text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold">Best Score Ever</h3>
          </div>
          <p className="text-3xl font-bold text-purple-400">{Math.floor(bestScore)}</p>
          <p className="text-sm text-gray-400 mt-1">Highest across all generations</p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Award size={20} className="text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold">Generation Best</h3>
          </div>
          <p className="text-3xl font-bold text-blue-400">{Math.floor(currentBestScore)}</p>
          <p className="text-sm text-gray-400 mt-1">Highest in current generation</p>
        </div>
      </div>
      
      <div className="mt-auto pt-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Learning Progress</h3>
          <div className="w-full bg-gray-600 rounded-full h-4 mb-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (bestScore / 1000) * 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400">Based on highest score achieved</p>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;