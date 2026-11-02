// Banco atualizado — cilindros | 8º ano
// Convenção desta atividade: utilize π = 3 em todos os cálculos.
export const questions = [
  {
    topic: "ELEMENTOS DO CILINDRO",
    question: "Uma lata de milho tem formato cilíndrico. Quais figuras geométricas representam suas duas bases?",
    options: ["Dois triângulos", "Dois círculos", "Dois retângulos", "Dois quadrados"],
    correct: 1,
    explain: "As bases de um cilindro circular reto são dois círculos iguais e paralelos."
  },
  {
    topic: "RAIO E DIÂMETRO",
    question: "Um cilindro possui raio de 4 cm. Qual é o diâmetro de sua base?",
    options: ["2 cm", "4 cm", "8 cm", "16 cm"],
    correct: 2,
    explain: "O diâmetro corresponde ao dobro do raio: d = 2 × 4 = 8 cm."
  },
  {
    topic: "DIMENSÕES DO CILINDRO",
    question: "Qual alternativa explica corretamente a diferença entre o raio e a altura de um cilindro?",
    options: [
      "O raio vai do centro até a borda da base; a altura é a distância perpendicular entre as duas bases.",
      "O raio é a distância entre as bases; a altura mede a borda do círculo.",
      "Raio e altura sempre possuem a mesma medida.",
      "O raio mede a lateral do cilindro e a altura mede o diâmetro."
    ],
    correct: 0,
    explain: "O raio é uma medida do círculo da base. A altura mede a distância perpendicular entre as bases."
  },
  {
    topic: "DESAFIO INVERSO · ENCONTRE A ALTURA",
    question: "Um cilindro tem volume de 216 cm³ e raio de 3 cm. Qual é sua altura? Considere π = 3 e use V = π · r² · h.",
    options: ["6 cm", "8 cm", "9 cm", "12 cm"],
    correct: 1,
    explain: "216 = 3 × 3² × h; 216 = 27h; portanto, h = 216 ÷ 27 = 8 cm."
  },
  {
    topic: "DESAFIO INVERSO · ENCONTRE O RAIO",
    question: "Um cilindro possui volume de 300 cm³ e altura de 4 cm. Considerando π = 3, qual é o raio da base e qual é seu diâmetro?",
    options: [
      "Raio de 5 cm e diâmetro de 10 cm.",
      "Raio de 10 cm e diâmetro de 20 cm.",
      "Raio de 4 cm e diâmetro de 8 cm.",
      "Raio de 25 cm e diâmetro de 50 cm."
    ],
    correct: 0,
    explain: "300 = 3 × r² × 4; 300 = 12r²; r² = 25; r = 5 cm. O diâmetro é 2 × 5 = 10 cm."
  },
  {
    topic: "ÁREA DA BASE",
    question: "A base de um cilindro tem raio de 4 cm. Qual é a área de uma base? Considere π = 3 e use Ab = π · r².",
    options: ["12 cm²", "24 cm²", "48 cm²", "64 cm²"],
    correct: 2,
    explain: "Ab = 3 × 4² = 3 × 16 = 48 cm²."
  },
  {
    topic: "ÁREA LATERAL",
    question: "Uma embalagem cilíndrica tem raio de 3 cm e altura de 10 cm. Qual é a área lateral, correspondente à parte que receberá o rótulo? Considere π = 3 e use Al = 2 · π · r · h.",
    options: ["90 cm²", "180 cm²", "270 cm²", "360 cm²"],
    correct: 1,
    explain: "Al = 2 × 3 × 3 × 10 = 180 cm²."
  },
  {
    topic: "ÁREA TOTAL",
    question: "Um cilindro possui raio de 2 cm e altura de 5 cm. Considerando π = 3, qual é sua área total? Use At = 2 · Ab + Al.",
    options: ["72 cm²", "60 cm²", "96 cm²", "84 cm²"],
    correct: 3,
    explain: "Ab = 3 × 2² = 12 cm². Al = 2 × 3 × 2 × 5 = 60 cm². At = 2 × 12 + 60 = 84 cm²."
  },
  {
    topic: "VOLUME · APLICAÇÃO",
    question: "Um recipiente cilíndrico tem raio de 3 cm e altura de 4 cm. Qual é seu volume? Considere π = 3.",
    options: ["36 cm³", "72 cm³", "108 cm³", "144 cm³"],
    correct: 2,
    explain: "V = 3 × 3² × 4 = 3 × 9 × 4 = 108 cm³."
  },
  {
    topic: "DESAFIO FINAL · COMPARAÇÃO DE ÁREAS",
    question: "Dois cilindros têm estas medidas: A possui raio de 2 cm e altura de 12 cm; B possui raio de 4 cm e altura de 6 cm. Considerando π = 3, o que acontece com as áreas laterais?",
    options: [
      "A área lateral de A é o dobro da área lateral de B.",
      "A área lateral de B é o dobro da área lateral de A.",
      "As áreas laterais são iguais: 144 cm² cada uma.",
      "Não é possível comparar as áreas laterais com as medidas fornecidas."
    ],
    correct: 2,
    explain: "Al(A) = 2 × 3 × 2 × 12 = 144 cm². Al(B) = 2 × 3 × 4 × 6 = 144 cm². As áreas laterais são iguais."
  }
];
