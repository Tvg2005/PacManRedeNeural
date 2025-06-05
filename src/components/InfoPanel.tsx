import React from 'react';
import { X, Brain, Lightbulb, ChevronRight } from 'lucide-react';

interface InfoPanelProps {
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-blue-400 flex items-center">
            <Brain className="mr-2\" size={24} />
            Neural Network Pacman Explained
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <section className="mb-6">
            <h3 className="text-xl font-bold text-yellow-400 mb-3 flex items-center">
              <Lightbulb className="mr-2" size={20} />
              What's Happening Here?
            </h3>
            <p className="text-gray-300 mb-4">
              You're watching neural networks learn to play Pacman through a technique called reinforcement learning 
              combined with genetic algorithms. Each Pacman is controlled by its own neural network that makes decisions 
              based on what it can "see" in the game.
            </p>
            <p className="text-gray-300 mb-2">
              As they play:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>They receive <span className="text-green-400">rewards</span> for collecting dots, eating fruits, and ghosts</li>
              <li>They receive <span className="text-red-400">penalties</span> for getting trapped or caught by ghosts</li>
              <li>The best performers' "brains" are selected to create the next generation</li>
              <li>Over time, they learn optimal strategies through this evolutionary process</li>
            </ul>
          </section>
          
          <section className="mb-6">
            <h3 className="text-xl font-bold text-yellow-400 mb-3">The Neural Network</h3>
            <p className="text-gray-300 mb-4">
              Each Pacman's neural network has:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li><strong>Input Layer:</strong> Information about the game state (nearby walls, ghosts, dots, etc.)</li>
              <li><strong>Hidden Layers:</strong> Neurons that process the information</li>
              <li><strong>Output Layer:</strong> Four neurons representing possible moves (up, down, left, right)</li>
            </ul>
            <p className="text-gray-300 mt-4">
              The network with the highest "fitness" (score) has a greater chance of passing its "genes" 
              (neural network weights) to the next generation.
            </p>
          </section>
          
          <section className="mb-6">
            <h3 className="text-xl font-bold text-yellow-400 mb-3">Training Process</h3>
            <div className="bg-gray-700 p-4 rounded-lg mb-4">
              <ol className="space-y-3 text-gray-300">
                <li className="flex">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</span>
                  <span>10 Pacmans with randomly initialized neural networks begin playing</span>
                </li>
                <li className="flex">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</span>
                  <span>Each Pacman plays until it's caught by a ghost or the time limit expires</span>
                </li>
                <li className="flex">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</span>
                  <span>Networks are ranked by their performance (score achieved)</span>
                </li>
                <li className="flex">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">4</span>
                  <span>Top performers are selected to "breed" the next generation (elitism)</span>
                </li>
                <li className="flex">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">5</span>
                  <span>New neural networks are created through crossover and mutation</span>
                </li>
                <li className="flex">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">6</span>
                  <span>The process repeats with each generation learning from the previous one</span>
                </li>
              </ol>
            </div>
          </section>
          
          <section>
            <h3 className="text-xl font-bold text-yellow-400 mb-3">Controls</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li className="bg-gray-700 p-3 rounded-lg flex items-center">
                <div className="bg-green-600 p-2 rounded-full mr-3">
                  <PlayIcon size={18} />
                </div>
                <span className="text-gray-300">Start/resume the simulation</span>
              </li>
              <li className="bg-gray-700 p-3 rounded-lg flex items-center">
                <div className="bg-yellow-600 p-2 rounded-full mr-3">
                  <PauseIcon size={18} />
                </div>
                <span className="text-gray-300">Pause the simulation</span>
              </li>
              <li className="bg-gray-700 p-3 rounded-lg flex items-center">
                <div className="bg-red-600 p-2 rounded-full mr-3">
                  <RotateCcwIcon size={18} />
                </div>
                <span className="text-gray-300">Reset to generation 0</span>
              </li>
              <li className="bg-gray-700 p-3 rounded-lg flex items-center">
                <div className="bg-gray-600 p-2 rounded-full mr-3">
                  <FastForwardIcon size={18} />
                </div>
                <span className="text-gray-300">Adjust simulation speed (1x-10x)</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

// Import the icons needed
import { PlayIcon, PauseIcon, FastForwardIcon, RotateCcwIcon } from 'lucide-react';

export default InfoPanel;