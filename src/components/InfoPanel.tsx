import React from 'react';
import { X, Brain, Lightbulb, ChevronRight } from 'lucide-react';
import { PlayIcon, PauseIcon, FastForwardIcon, RotateCcwIcon } from 'lucide-react';

interface InfoPanelProps {
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-blue-400 flex items-center">
            <Brain className="mr-2" size={24} />
            Rede Neural do PacMan Explicada
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
              O que está acontecendo aqui?
            </h3>
            <p className="text-gray-300 mb-4">
              Você está assistindo redes neurais aprenderem a jogar Pacman através de uma técnica chamada aprendizado por reforço 
              combinada com algoritmos genéticos. Cada Pacman é controlado por sua própria rede neural que toma decisões 
              com base no que ele pode "ver" no jogo.
            </p>
            <p className="text-gray-300 mb-2">
              Enquanto eles jogam:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li>Eles recebem <span className="text-green-400">recompensas</span> por coletar pontos, comer frutas e fantasmas</li>
              <li>Eles recebem <span className="text-red-400">penalidades</span> por ficarem presos, parados ou serem pegos pelos fantasmas</li>
              <li>Os melhores desempenhos têm seus "cérebros" selecionados para criar a próxima geração</li>
              <li>Com o tempo, eles aprendem estratégias otimizadas através desse processo evolutivo</li>
            </ul>
          </section>
          
          <section className="mb-6">
            <h3 className="text-xl font-bold text-yellow-400 mb-3">A Rede Neural</h3>
            <p className="text-gray-300 mb-4">
              Cada rede neural do Pacman possui:
            </p>
            <ul className="list-disc pl-6 text-gray-300 space-y-2">
              <li><strong>Camada de Entrada:</strong> Informações sobre o estado do jogo (paredes próximas, fantasmas, pontos, etc.)</li>
              <li><strong>Camadas Ocultas:</strong> Neurônios que processam as informações</li>
              <li><strong>Camada de Saída:</strong> Quatro neurônios representando os possíveis movimentos (cima, baixo, esquerda, direita)</li>
            </ul>
            <p className="text-gray-300 mt-4">
              A rede com a maior "aptidão" (pontuação) tem uma chance maior de passar seus "genes" 
              (pesos da rede neural) para a próxima geração.
            </p>
          </section>
          
          <section className="mb-6">
            <h3 className="text-xl font-bold text-yellow-400 mb-3">Processo de Treinamento</h3>
            <div className="bg-gray-700 p-4 rounded-lg mb-4">
              <ol className="space-y-3 text-gray-300">
                <li className="flex">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</span>
                  <span>16 PacMans com redes neurais inicializadas aleatoriamente começam a jogar</span>
                </li>
                <li className="flex">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</span>
                  <span>Cada Pacman joga até ser pego por um fantasma ou passarem-se 20 segundos</span>
                </li>
                <li className="flex">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</span>
                  <span>As redes são classificadas pelo seu desempenho (pontuação alcançada)</span>
                </li>
                <li className="flex">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">4</span>
                  <span>Os melhores desempenhos são selecionados para "gerar" a próxima geração (elitismo)</span>
                </li>
                <li className="flex">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">5</span>
                  <span>Novas redes neurais são criadas através de cruzamento e mutação</span>
                </li>
                <li className="flex">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">6</span>
                  <span>O processo se repete, com cada geração aprendendo com a anterior</span>
                </li>
              </ol>
            </div>
          </section>
          
          <section>
            <h3 className="text-xl font-bold text-yellow-400 mb-3">Controles</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <li className="bg-gray-700 p-3 rounded-lg flex items-center">
                <div className="bg-green-600 p-2 rounded-full mr-3">
                  <PlayIcon size={18} />
                </div>
                <span className="text-gray-300">Iniciar/retomar a simulação</span>
              </li>
              <li className="bg-gray-700 p-3 rounded-lg flex items-center">
                <div className="bg-yellow-600 p-2 rounded-full mr-3">
                  <PauseIcon size={18} />
                </div>
                <span className="text-gray-300">Pausar a simulação</span>
              </li>
              <li className="bg-gray-700 p-3 rounded-lg flex items-center">
                <div className="bg-red-600 p-2 rounded-full mr-3">
                  <RotateCcwIcon size={18} />
                </div>
                <span className="text-gray-300">Reiniciar para a geração 0</span>
              </li>
              <li className="bg-gray-700 p-3 rounded-lg flex items-center">
                <div className="bg-gray-600 p-2 rounded-full mr-3">
                  <FastForwardIcon size={18} />
                </div>
                <span className="text-gray-300">Ajustar a velocidade da simulação (1x-50x)</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
