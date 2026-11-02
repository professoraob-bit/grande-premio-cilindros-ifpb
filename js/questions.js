// Grande Prêmio dos Cilindros — IFPB | 8º ano
// Banco revisado: 5 questões conceituais + 5 problemas.
// Convenção da atividade: use π = 3 em todos os cálculos.
// Gabarito equilibrado: A=3, B=3, C=2, D=2.
export const questions = [
  {
    topic: "CONCEITO 1/5 · BASES DO CILINDRO",
    question: "Uma lata de milho tem formato de cilindro circular reto. Quais figuras geométricas formam as duas bases desse sólido?",
    options: [
      "Dois retângulos iguais e paralelos.",
      "Dois círculos iguais e paralelos.",
      "Dois triângulos iguais.",
      "Dois quadrados iguais."
    ],
    correct: 1,
    explain: "Um cilindro circular reto possui duas bases circulares congruentes e paralelas."
  },
  {
    topic: "CONCEITO 2/5 · ALTURA",
    question: "Em um cilindro circular reto, o que representa a altura?",
    options: [
      "A medida que vai do centro da base até sua borda.",
      "O contorno circular de uma das bases.",
      "A distância inclinada entre dois pontos da borda.",
      "A distância perpendicular entre os planos das duas bases."
    ],
    correct: 3,
    explain: "A altura é a distância perpendicular entre as duas bases paralelas do cilindro."
  },
  {
    topic: "CONCEITO 3/5 · RAIO E DIÂMETRO",
    question: "A base de um cilindro tem raio de 5 cm. Sabendo que o diâmetro corresponde a duas vezes o raio, qual é o diâmetro dessa base?",
    options: ["10 cm", "5 cm", "15 cm", "20 cm"],
    correct: 0,
    explain: "O diâmetro é o dobro do raio: d = 2 × 5 = 10 cm. O raio mede a metade do diâmetro."
  },
  {
    topic: "CONCEITO 4/5 · PLANIFICAÇÃO",
    question: "Imagine que você corte a superfície lateral de um cilindro circular reto e a abra sobre uma mesa, sem incluir as bases. Qual figura plana será formada?",
    options: [
      "Um triângulo.",
      "Um círculo.",
      "Um retângulo.",
      "Um trapézio."
    ],
    correct: 2,
    explain: "A superfície lateral planificada de um cilindro reto forma um retângulo. Um lado tem a medida da altura e o outro corresponde ao comprimento da circunferência da base."
  },
  {
    topic: "CONCEITO 5/5 · CLASSIFICAÇÃO",
    question: "Na classificação dos sólidos geométricos, como devemos classificar um cilindro circular reto?",
    options: [
      "Como um prisma, pois possui duas bases iguais.",
      "Como um corpo redondo, pois possui superfície lateral curva; portanto, não é um poliedro.",
      "Como um poliedro de Platão, pois possui faces regulares.",
      "Como uma pirâmide, pois tem uma base e uma superfície lateral."
    ],
    correct: 1,
    explain: "O cilindro é um corpo redondo. Ele possui superfície lateral curva e duas bases circulares; por isso, não é prisma, pirâmide nem poliedro de Platão."
  },
  {
    topic: "PROBLEMA 1/5 · ÁREA DA BASE E ÁREA TOTAL",
    question: "Uma peça cilíndrica tem raio de 2 cm e altura de 5 cm. Considerando π = 3, qual alternativa apresenta corretamente a área de uma base e a área total do cilindro? Use Ab = π · r², Al = 2 · π · r · h e At = 2 · Ab + Al.",
    options: [
      "Área da base = 12 cm²; área total = 84 cm².",
      "Área da base = 6 cm²; área total = 72 cm².",
      "Área da base = 12 cm²; área total = 60 cm².",
      "Área da base = 24 cm²; área total = 84 cm²."
    ],
    correct: 0,
    explain: "Ab = 3 × 2² = 12 cm². Al = 2 × 3 × 2 × 5 = 60 cm². At = 2 × 12 + 60 = 84 cm²."
  },
  {
    topic: "PROBLEMA 2/5 · DESCUBRA A ALTURA",
    question: "Um cilindro possui volume de 216 cm³ e raio da base de 3 cm. Considerando π = 3, qual é a altura desse cilindro? Use V = π · r² · h.",
    options: ["6 cm", "9 cm", "12 cm", "8 cm"],
    correct: 3,
    explain: "216 = 3 × 3² × h. Assim, 216 = 27h e h = 216 ÷ 27 = 8 cm."
  },
  {
    topic: "PROBLEMA 3/5 · DESCUBRA O RAIO E O DIÂMETRO",
    question: "Um recipiente cilíndrico tem volume de 300 cm³ e altura de 4 cm. Considerando π = 3, qual é o raio da base e qual é o diâmetro? Use V = π · r² · h.",
    options: [
      "Raio de 10 cm e diâmetro de 20 cm.",
      "Raio de 4 cm e diâmetro de 8 cm.",
      "Raio de 5 cm e diâmetro de 10 cm.",
      "Raio de 25 cm e diâmetro de 50 cm."
    ],
    correct: 2,
    explain: "300 = 3 × r² × 4; então 300 = 12r², r² = 25 e r = 5 cm. O diâmetro é 2 × 5 = 10 cm."
  },
  {
    topic: "PROBLEMA 4/5 · RAIO TRIPLICADO",
    question: "Um cilindro reto possui raio de 3 cm. Se triplicarmos esse raio, mantendo a mesma altura, quantas vezes maior será o volume do novo cilindro em relação ao volume do cilindro original? Considere π = 3.",
    options: [
      "3 vezes, porque o raio foi multiplicado por 3.",
      "9 vezes, porque o volume varia com o quadrado do raio.",
      "6 vezes, porque a diferença entre os raios é 6 cm.",
      "27 vezes, porque o raio foi triplicado e a altura também."
    ],
    correct: 1,
    explain: "Como as alturas são iguais, a razão entre os volumes é 9² ÷ 3² = 81 ÷ 9 = 9. Ao triplicar o raio, mantendo a altura, o volume fica 9 vezes maior."
  },
  {
    topic: "PROBLEMA 5/5 · ÁREA LATERAL",
    question: "Uma indústria vai colocar um rótulo que cobre somente a superfície lateral de uma lata cilíndrica. A lata tem raio de 3 cm e altura de 10 cm. Considerando π = 3, qual será a área do rótulo? Use Al = 2 · π · r · h.",
    options: ["180 cm²", "90 cm²", "270 cm²", "360 cm²"],
    correct: 0,
    explain: "Al = 2 × 3 × 3 × 10 = 180 cm². O rótulo cobre a superfície lateral, sem incluir as duas bases."
  }
];
