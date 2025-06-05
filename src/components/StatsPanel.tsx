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
        Status da Rede Neural
      </h2>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Zap size={20} className="text-yellow-400 mr-2" />
            <h3 className="text-lg font-semibold">Geração</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-400">{generation}</p>
          <p className="text-sm text-gray-400 mt-1">Ciclo de treino atual</p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Users size={20} className="text-green-400 mr-2" />
            <h3 className="text-lg font-semibold">Pacmans Vivos</h3>
          </div>
          <div className="flex items-center">
            <p className="text-3xl font-bold text-green-400">{aliveCount}</p>
            <p className="text-xl ml-2 text-gray-400">/ 16</p>
          </div>
          <p className="text-sm text-gray-400 mt-1">Agentes sobreviventes</p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Award size={20} className="text-purple-400 mr-2" />
            <h3 className="text-lg font-semibold">Melhor pontuação</h3>
          </div>
          <p className="text-3xl font-bold text-purple-400">{Math.floor(bestScore)}</p>
          <p className="text-sm text-gray-400 mt-1">Maior pontuação dentre todas as gerações</p>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <Award size={20} className="text-blue-400 mr-2" />
            <h3 className="text-lg font-semibold">Melhor Vivo da Geração</h3>
          </div>
          <p className="text-3xl font-bold text-blue-400">{Math.floor(currentBestScore)}</p>
          <p className="text-sm text-gray-400 mt-1">Maior pontuação da geração Atual</p>
        </div>
      </div>
      
      <div className="mt-auto pt-4">
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-2">Progresso de aprendizado</h3>
          <div className="w-full bg-gray-600 rounded-full h-4 mb-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (bestScore / 1500) * 100)}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400">Baseado na melhor pontuação alcançada</p>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;