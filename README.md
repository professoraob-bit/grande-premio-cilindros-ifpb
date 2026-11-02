# Grande Prêmio dos Cilindros — IFPB Campus João Pessoa

Aplicação independente para aula de Geometria Espacial, Licenciatura em Matemática. Professor: Arthur Oliveira Barbosa.

## Estrutura
- `index.html`: acesso dos participantes.
- `professor.html`: criação de salas e painel de desempenho.
- `firebase-config.js`: credenciais da aplicação web do NOVO projeto Firebase.
- `firestore.rules`: regras para a coleção `corridas_cilindros`.
- `js/questions.js`: 10 desafios de cilindros baseados no roteiro fornecido.
- `js/student.js` / `js/professor.js`: lógica da corrida e do painel.

## Criar um projeto Firebase separado
1. Crie um projeto exclusivo para esta atividade (não use o projeto `zulmira-edf-2026`).
2. Em Authentication > Sign-in method, habilite **Email/Password** e **Anonymous**.
3. Crie o usuário do professor em Authentication > Users > Add user.
4. Crie o banco Firestore.
5. Registre um aplicativo Web nas configurações do projeto.
6. Copie a configuração do aplicativo Web para `firebase-config.js`, substituindo todos os campos `PREENCHER_...`.
7. Publique o conteúdo de `firestore.rules` na aba Firestore > Rules.

Não gere nem utilize chave privada de conta de serviço. O aplicativo usa somente a configuração pública do Firebase Web SDK. Nunca coloque uma chave privada no GitHub.

## Publicar no GitHub Pages
1. Crie um repositório novo, por exemplo `grande-premio-cilindros-ifpb`.
2. Envie todos os arquivos mantendo a estrutura de pastas.
3. Ative Settings > Pages > Deploy from a branch > `main` > `/ (root)`.
4. Aguarde o GitHub Pages publicar e abra `index.html`.
5. O painel do professor ficará em `professor.html`.

## Usar
1. O professor acessa `professor.html`, entra com o usuário Email/Password e cria a sala.
2. Seleciona a turma/grupo e compartilha o código ou o link `index.html?sala=CODIGO`.
3. Os participantes entram com nome e turma; a autenticação anônima é automática.
4. O professor inicia a sala. O placar se atualiza ao vivo.
5. Cada resposta correta faz o participante avançar 10 m + bônus de velocidade (1 a 5 m). Resposta incorreta não avança; o aluno pode tentar de novo.
6. Após 10 desafios, o participante termina e aparece no painel. O professor pode encerrar a sala e exportar CSV.

## Turmas e enquadramento
O seletor está configurado exclusivamente para o **8º ano do Ensino Fundamental**. O banco atual cobre cilindros conforme as questões fornecidas e destina-se à revisão desse conteúdo no 8º ano. A atividade integra uma aula de Geometria Espacial vinculada ao IFPB — Campus João Pessoa.

## Pontuação e limitações
A partida tem 10 questões. O aluno precisa acertar para avançar; pode tentar novamente sem limite, mas o tempo continua contando. Acerto: 10 m base + bônus de velocidade; bônus = 5 m até 5 s, 4 m até 10 s, 3 m até 18 s, 2 m até 28 s, ou 1 m depois disso. O painel registra acertos, erros, metros, XP e tempo final.

A aplicação é adequada a competição recreativa e pontuação extra em sala. Como a validação da resposta ocorre no navegador, não é um sistema antifraude para avaliação de alto impacto; participantes tecnicamente experientes poderiam inspecionar o código. Para avaliação formal, seria necessário backend confiável (por exemplo, Cloud Functions).

## Cuidado com dados pessoais
Use apenas nomes ou apelidos necessários à atividade. Evite coletar dados sensíveis. Apague as salas antigas pelo console do Firebase quando não forem mais necessárias.
