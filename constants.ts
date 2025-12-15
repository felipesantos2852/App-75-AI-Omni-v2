import { WorkoutRoutine, Exercise } from './types';

export const TARGET_WEIGHT = 75;
export const INITIAL_WEIGHT = 68;
export const DAILY_WATER_GOAL = 3000; // ml

// Banco de dados de exercícios para troca manual
export const EXERCISE_DB: Omit<Exercise, 'id' | 'sets' | 'reps' | 'weight'>[] = [
    // Peito
    { name: 'Supino Inclinado com Halteres', targetMuscles: 'Peitoral Superior', description: 'Banco a 30-45 graus. Cotovelos a 45 graus do tronco.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=SUPINO+INCLINADO' },
    { name: 'Supino Reto com Barra', targetMuscles: 'Peitoral Maior', description: 'Pegada um pouco maior que os ombros. Desça na linha dos mamilos.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=SUPINO+RETO' },
    { name: 'Crucifixo Inclinado', targetMuscles: 'Peitoral Superior', description: 'Abra os braços alongando o peitoral. Mantenha cotovelos levemente flexionados.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=CRUCIFIXO' },
    { name: 'Crossover Polia Alta', targetMuscles: 'Peitoral Inferior', description: 'Puxe as polias em direção ao quadril.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=CROSSOVER' },
    
    // Costas
    { name: 'Barra Fixa', targetMuscles: 'Grande Dorsal', description: 'Puxe o corpo até o queixo passar da barra.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=BARRA+FIXA' },
    { name: 'Puxada Alta (Lat Pulldown)', targetMuscles: 'Dorsais', description: 'Puxe a barra em direção ao peito superior.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=PUXADA+ALTA' },
    { name: 'Remada Curvada', targetMuscles: 'Dorsais', description: 'Tronco inclinado, coluna reta. Puxe a barra no umbigo.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=REMADA+CURVADA' },
    { name: 'Remada Serrote', targetMuscles: 'Dorsais', description: 'Apoie-se no banco. Puxe o halter rente ao corpo.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=SERROTE' },
    
    // Ombros
    { name: 'Desenvolvimento Militar', targetMuscles: 'Ombros', description: 'Empurre a barra acima da cabeça.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=DESENVOLVIMENTO' },
    { name: 'Elevação Lateral', targetMuscles: 'Deltoide Lateral', description: 'Eleve os braços até a altura dos ombros.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=ELEVACAO+LATERAL' },
    { name: 'Face Pulls', targetMuscles: 'Deltoide Posterior', description: 'Puxe a corda na direção da testa.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=FACE+PULL' },
    
    // Pernas
    { name: 'Agachamento Livre', targetMuscles: 'Quadríceps, Glúteos', description: 'Desça o quadril para trás e para baixo.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=AGACHAMENTO' },
    { name: 'Leg Press 45', targetMuscles: 'Quadríceps', description: 'Empurre a plataforma sem estender totalmente os joelhos.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=LEG+PRESS' },
    { name: 'Cadeira Extensora', targetMuscles: 'Quadríceps', description: 'Estenda os joelhos completamente.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXTENSORA' },
    { name: 'Stiff (RDL)', targetMuscles: 'Posterior de Coxa', description: 'Desça a barra rente às pernas, quadril para trás.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=STIFF' },
    { name: 'Mesa Flexora', targetMuscles: 'Posterior de Coxa', description: 'Flexione os joelhos trazendo o suporte ao glúteo.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=MESA+FLEXORA' },
    
    // Braços
    { name: 'Rosca Direta', targetMuscles: 'Bíceps', description: 'Flexione os cotovelos sem balançar o corpo.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=ROSCA+DIRETA' },
    { name: 'Tríceps Corda', targetMuscles: 'Tríceps', description: 'Estenda os cotovelos abrindo a corda no final.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=TRICEPS+CORDA' },
    { name: 'Tríceps Testa', targetMuscles: 'Tríceps', description: 'Desça a barra em direção à testa.', gifUrl: 'https://placehold.co/600x400/171717/eab308?text=TRICEPS+TESTA' },
];

export const DEFAULT_WORKOUTS: WorkoutRoutine[] = [
  {
    id: 'A',
    name: 'Empurrar (Peito/Ombro/Tríceps)',
    exercises: [
      { 
        id: 'a1', 
        name: 'Supino Inclinado com Halteres', 
        sets: 4, 
        reps: '8-12', 
        weight: 20,
        description: 'Ajuste o banco a 30-45 graus. Mantenha os cotovelos levemente fechados (45 graus em relação ao tronco). Desça controlando até tocar o peito e empurre explosivamente.',
        targetMuscles: 'Peitoral Superior',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+SUPINO+INCLINADO'
      },
      { 
        id: 'a2', 
        name: 'Supino Reto com Barra', 
        sets: 3, 
        reps: '8-10', 
        weight: 60,
        description: 'Pegada um pouco mais larga que os ombros. Desça a barra na linha dos mamilos, mantendo os pés firmes no chão e escápulas retraídas.',
        targetMuscles: 'Peitoral Maior',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+SUPINO+RETO'
      },
      { 
        id: 'a3', 
        name: 'Elevação Lateral', 
        sets: 4, 
        reps: '12-15', 
        weight: 10,
        description: 'Eleve os braços até a altura dos ombros. Mantenha os cotovelos levemente flexionados. Não use impulso das costas.',
        targetMuscles: 'Deltoide Lateral',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+ELEVACAO+LATERAL'
      },
      { 
        id: 'a4', 
        name: 'Tríceps Corda', 
        sets: 3, 
        reps: '12-15', 
        weight: 25,
        description: 'Mantenha os cotovelos fixos ao lado do corpo. Estenda o braço completamente e abra a corda no final do movimento para contração máxima.',
        targetMuscles: 'Tríceps',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+TRICEPS+CORDA'
      },
    ]
  },
  {
    id: 'B',
    name: 'Puxar (Costas/Bíceps)',
    exercises: [
      { 
        id: 'b1', 
        name: 'Barra Fixa', 
        sets: 4, 
        reps: 'Falha', 
        weight: 0,
        description: 'Pendure-se com pegada pronada (palmas para frente). Puxe o corpo até o queixo passar da barra. Controle a descida.',
        targetMuscles: 'Grande Dorsal',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+BARRA+FIXA'
      },
      { 
        id: 'b2', 
        name: 'Remada Curvada', 
        sets: 3, 
        reps: '8-12', 
        weight: 50,
        description: 'Incline o tronco à frente (quase paralelo ao chão). Mantenha a coluna neutra. Puxe a barra em direção ao umbigo.',
        targetMuscles: 'Dorsais',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+REMADA+CURVADA'
      },
      { 
        id: 'b3', 
        name: 'Face Pulls', 
        sets: 3, 
        reps: '15-20', 
        weight: 20,
        description: 'Puxe a corda em direção à testa, separando as mãos e rotacionando os ombros externamente. Foco na parte posterior do ombro.',
        targetMuscles: 'Deltoide Posterior',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+FACE+PULLS'
      },
      { 
        id: 'b4', 
        name: 'Rosca Martelo', 
        sets: 3, 
        reps: '10-12', 
        weight: 14,
        description: 'Segure os halteres com as palmas viradas para dentro (pegada neutra). Flexione o cotovelo sem balançar o tronco.',
        targetMuscles: 'Bíceps',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+ROSCA+MARTELO'
      },
    ]
  },
  {
    id: 'C',
    name: 'Pernas (Foco Quadríceps)',
    exercises: [
      { 
        id: 'c1', 
        name: 'Agachamento Livre', 
        sets: 4, 
        reps: '6-10', 
        weight: 80,
        description: 'Pés na largura dos ombros. Desça jogando o quadril para trás e joelhos para fora. Mantenha o peito estufado.',
        targetMuscles: 'Quadríceps',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+AGACHAMENTO'
      },
      { 
        id: 'c2', 
        name: 'Cadeira Extensora', 
        sets: 3, 
        reps: '12-15', 
        weight: 40,
        description: 'Ajuste o banco para que o joelho alinhe com o eixo. Estenda completamente a perna e segure 1 segundo no topo.',
        targetMuscles: 'Quadríceps',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+CADEIRA+EXTENSORA'
      },
      { 
        id: 'c3', 
        name: 'Avanço (Lunges)', 
        sets: 3, 
        reps: '10-12', 
        weight: 15,
        description: 'Dê um passo largo à frente. Desça até o joelho de trás quase tocar o chão. Mantenha o tronco reto.',
        targetMuscles: 'Quadríceps',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+AVANCO'
      },
      { 
        id: 'c4', 
        name: 'Panturrilha em Pé', 
        sets: 4, 
        reps: '15-20', 
        weight: 60,
        description: 'Pise na ponta dos pés. Suba o máximo possível e desça alongando bem o calcanhar.',
        targetMuscles: 'Gastrocnêmio',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+PANTURRILHA'
      },
    ]
  },
  {
    id: 'D',
    name: 'Superior (Hipertrofia)',
    exercises: [
      { 
        id: 'd1', 
        name: 'Desenvolvimento Militar', 
        sets: 3, 
        reps: '8-12', 
        weight: 40,
        description: 'Empurre a barra acima da cabeça até estender os braços. Não arqueie excessivamente a lombar.',
        targetMuscles: 'Ombros',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+DESENVOLVIMENTO'
      },
      { 
        id: 'd2', 
        name: 'Puxada Alta (Lat Pulldown)', 
        sets: 3, 
        reps: '10-12', 
        weight: 50,
        description: 'Puxe a barra em direção ao peito superior, imaginando que quer colocar os cotovelos nos bolsos de trás.',
        targetMuscles: 'Dorsais',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+PUXADA+ALTA'
      },
      { 
        id: 'd3', 
        name: 'Crucifixo Inclinado', 
        sets: 3, 
        reps: '12-15', 
        weight: 12,
        description: 'Abra os braços como se fosse abraçar uma árvore. Sinta o alongamento no peitoral e feche contraindo.',
        targetMuscles: 'Peitoral Superior',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+CRUCIFIXO'
      },
      { 
        id: 'd4', 
        name: 'Rosca Direta Barra', 
        sets: 3, 
        reps: '10-12', 
        weight: 30,
        description: 'Cotovelos fixos ao lado do corpo. Suba a barra até contrair o bíceps e desça controlando.',
        targetMuscles: 'Bíceps',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+ROSCA+DIRETA'
      },
    ]
  },
  {
    id: 'E',
    name: 'Pernas (Glúteo/Posterior)',
    exercises: [
      { 
        id: 'e1', 
        name: 'Stiff (RDL)', 
        sets: 4, 
        reps: '8-10', 
        weight: 90,
        description: 'Pés largura do quadril. Desça a barra rente às pernas jogando o quadril para trás. Mantenha as costas retas. Sinta o posterior alongar.',
        targetMuscles: 'Posterior de Coxa',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+STIFF'
      },
      { 
        id: 'e2', 
        name: 'Mesa Flexora', 
        sets: 3, 
        reps: '12-15', 
        weight: 35,
        description: 'Flexione os joelhos trazendo o suporte em direção ao glúteo. Não tire o quadril do banco.',
        targetMuscles: 'Posterior de Coxa',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+MESA+FLEXORA'
      },
      { 
        id: 'e3', 
        name: 'Agachamento Búlgaro', 
        sets: 3, 
        reps: '10-12', 
        weight: 15,
        description: 'Apoie o pé de trás num banco. Desça com a perna da frente até a coxa ficar paralela ao chão. Incline o tronco levemente para focar no glúteo.',
        targetMuscles: 'Glúteos',
        gifUrl: 'https://placehold.co/600x400/171717/eab308?text=EXECUCAO:+BULGARO'
      },
    ]
  }
];