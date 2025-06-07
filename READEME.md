# 🧠 PacMan Rede Neural 🎮
Este projeto é um experimento de Inteligência Artificial com Aprendizado Evolutivo, onde uma rede neural é treinada para jogar Pac-Man de forma autônoma. A IA aprende por meio de um algoritmo genético, aprimorando suas decisões a cada geração.

## 🚀 Visão Geral
Neste sistema, agentes controlados por uma rede neural enfrentam o desafio de jogar Pac-Man. Cada agente decide entre quatro possíveis movimentos:

- ⬆️ Cima

- ⬇️ Baixo

- ⬅️ Esquerda

- ➡️ Direita

Ao longo de várias gerações, esses agentes evoluem com base em seu desempenho no jogo, usando conceitos de seleção natural, elitismo, crossover e mutação genética.

## 🧬 Arquitetura do Projeto
### 🧠 Rede Neural
A rede neural é responsável por tomar decisões de movimento com base no estado atual do jogo. Ela pode receber informações como:

- Posição do Pac-Man

- Posição dos itens a serem coletados

- Distância para o objetivo

- Presença de paredes ou obstáculos

- Histórico de movimentos anteriores

### ⚙️ Saídas da Rede
A rede retorna 4 saídas numéricas (uma para cada direção). O movimento escolhido é o que tem a maior ativação dentre essas saídas.

### 🧪 Aprendizado por Evolução
O projeto utiliza um algoritmo genético, onde populações de redes neurais evoluem de geração em geração. A evolução segue os seguintes princípios:

### 🌟 Elitismo
Os melhores agentes da geração atual são copiados diretamente para a próxima geração sem alterações, garantindo que as boas estratégias não se percam.

### 💞 Crossover
Pares de agentes combinam seus “genes” (pesos da rede neural) para gerar novos agentes com características de ambos.

### ⚡ Mutação
Após o crossover, uma pequena parte dos genes pode ser modificada aleatoriamente, permitindo a exploração de novas estratégias.

### 📈 Sistema de Pontuação
A pontuação de cada agente é calculada com base em:

- 🍒 Coleta de itens → Recompensa positiva

- 🎯 Proximidade ao objetivo → Recompensa baseada na redução da distância

- 🔁 Movimentos em loop → Penalidade para evitar padrões inúteis

- 🕒 Tempo parado ou ineficiente → Penalidade para evitar estagnação

Essas regras guiam o processo evolutivo, selecionando os agentes mais eficazes no ambiente.

## 📊 Registro de Evolução
O sistema acompanha os seguintes indicadores durante o treinamento:

- 🧬 Geração Atual

- 🏆 Melhor Pontuação da Geração

- 🥇 Melhor Pontuação Geral

- 📉 Progresso ao Longo do Tempo

Esses dados ajudam a monitorar a performance da IA e avaliar a eficiência da evolução.

## 🛠️ Como Funciona
- Uma população inicial de agentes é gerada com redes neurais aleatórias.

- Cada agente joga Pac-Man por um tempo limitado.

- Ao final, os agentes são avaliados e ranqueados por desempenho.

- A nova geração é criada a partir dos melhores agentes via elitismo, crossover e mutação.

- O ciclo se repete, aprimorando a habilidade dos agentes a cada geração.

## 🎯 Objetivo
Criar uma IA capaz de jogar Pac-Man de forma eficaz apenas por meio de tentativa, erro e evolução, sem qualquer conhecimento prévio do jogo ou aprendizado supervisionado.