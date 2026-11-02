import { questions } from "./questions.js";
import {
  auth, db, firebaseIsConfigured, signInAnonymously,
  collection, doc, getDoc, setDoc, updateDoc, onSnapshot,
  serverTimestamp, increment
} from "./firebase.js";

const $ = id => document.getElementById(id);
const TOTAL_QUESTIONS = questions.length;
const FINISH_METERS = 150;
const views = {
  join: $('joinView'),
  waiting: $('waitingView'),
  race: $('raceView'),
  result: $('resultView')
};

let roomCode = '';
let playerRef = null;
let playerUid = '';
let roomData = null;
let playerData = null;
let roomUnsub = null;
let playersUnsub = null;
let playerUnsub = null;
let questionTick = null;
let questionStartedAt = Date.now();
let latestPlayers = [];
let answerInProgress = false;

const showView = name => Object.entries(views).forEach(([key, view]) => view.classList.toggle('hidden', key !== name));
function msg(text) { $('joinMessage').textContent = text; }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function esc(text) {
  return String(text).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function speedBonus(seconds) {
  if (seconds <= 30) return 5;
  if (seconds <= 60) return 3;
  if (seconds <= 90) return 1;
  return 0;
}

function formatTime(seconds) {
  const whole = Math.floor(seconds);
  return `${String(Math.floor(whole / 60)).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}`;
}

function progressPercent(player) {
  // A distância conquistada move o carrinho; ao concluir os 10 desafios únicos, ele cruza a chegada.
  if (player.finalizado) return 100;
  return Math.max(0, Math.min(99, ((player.metros || 0) / FINISH_METERS) * 100));
}

function miniCar(player) {
  const progress = progressPercent(player);
  return `<div class="mini-race-track" aria-label="Progresso de ${Math.round(progress)}%">
    <span class="mini-race-fill" style="width:${progress}%"></span>
    <span class="mini-race-car" style="left:${progress}%">🏎️</span>
  </div>`;
}

function rankList(target, list) {
  if (!list.length) {
    target.innerHTML = '<div class="empty-leader">Aguardando participantes...</div>';
    return;
  }
  target.innerHTML = list.map((player, index) => `
    <div class="leader-row">
      <div class="rank-no ${index === 0 ? 'first' : ''}">${index === 0 ? '🏆' : String(index + 1).padStart(2, '0')}</div>
      <div>
        <div class="leader-name">${esc(player.nome || 'Participante')}</div>
        <div class="leader-sub">${esc(player.turma || '')} · ${player.acertos || 0}/${TOTAL_QUESTIONS} acertos · ${player.finalizado ? 'Finalizou' : player.emRevisao ? 'Em revisão' : 'Na pista'}</div>
      </div>
      <div class="leader-score">
        ${miniCar(player)}
        ${player.metros || 0} m
        <small>${player.finalizado ? 'FINALIZOU' : 'NA PISTA'}</small>
      </div>
    </div>`).join('');
}

function sortPlayers(players) {
  return [...players].sort((a, b) => {
    if (a.finalizado && b.finalizado) return (a.duracaoFinalMs || 0) - (b.duracaoFinalMs || 0);
    if (a.finalizado !== b.finalizado) return a.finalizado ? -1 : 1;
    return (b.metros || 0) - (a.metros || 0) || (b.acertos || 0) - (a.acertos || 0);
  });
}

function renderWaiting() {
  showView('waiting');
  $('playerCount').textContent = latestPlayers.length;
  rankList($('waitingLeaderboard'), sortPlayers(latestPlayers));
}

function getCurrentQuestionIndex() {
  if (playerData?.emRevisao) {
    const queue = Array.isArray(playerData.filaRevisao) ? playerData.filaRevisao : [];
    if (queue.length) return queue[0];
  }
  return playerData?.questaoAtual || 0;
}

function renderRace() {
  if (!playerData) return;
  if (playerData.finalizado) {
    renderResult();
    return;
  }

  showView('race');
  $('playerMeters').innerHTML = `${playerData.metros || 0} <small>m</small>`;

  const progress = progressPercent(playerData);
  $('meterFill').style.width = `${progress}%`;
  $('playerCarMarker').style.left = `${progress}%`;
  $('playerCarMarker').setAttribute('aria-label', `Seu carrinho avançou ${Math.round(progress)}% da pista`);

  const index = getCurrentQuestionIndex();
  const question = questions[index];
  $('questionNumber').textContent = String(Math.min(index + 1, TOTAL_QUESTIONS)).padStart(2, '0');
  // Exibe o enunciado do desafio; sem esta atribuição o cabeçalho ficava preso em "Carregando desafio...".
  $('questionText').textContent = question?.question || 'Enunciado indisponível. Atualize a página e tente novamente.';
  $('questionTopic').textContent = `${playerData.emRevisao ? 'REVISÃO · ' : ''}${question?.topic || 'DESAFIO'}`;
  $('answerFeedback').textContent = '';
  $('answerFeedback').className = 'answer-feedback';

  const options = $('answerOptions');
  options.innerHTML = '';
  if (!question) {
    renderResult();
    return;
  }

  question.options.forEach((option, optionIndex) => {
    const button = document.createElement('button');
    button.className = 'answer-option';
    button.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + optionIndex)}</span>${esc(option)}`;
    button.addEventListener('click', () => answer(optionIndex));
    options.appendChild(button);
  });

  startTimer();
  rankList($('raceLeaderboard'), sortPlayers(latestPlayers));
}

function startTimer() {
  clearInterval(questionTick);
  questionStartedAt = playerData?.inicioQuestaoMs || Date.now();
  // O tempo da primeira questão começa na largada, não quando o aluno entrou na sala.
  if (!playerData?.emRevisao && (playerData?.etapaQuestao || 0) === 0 && (playerData?.questaoAtual || 0) === 0 && roomData?.startedAt?.toMillis) {
    questionStartedAt = Math.max(questionStartedAt, roomData.startedAt.toMillis());
  }
  const tick = () => {
    const seconds = Math.max(0, (Date.now() - questionStartedAt) / 1000);
    const bonus = speedBonus(seconds);
    const bonusText = bonus ? `BÔNUS +${bonus}` : 'SEM BÔNUS';
    $('timerBadge').textContent = `⏱ ${formatTime(seconds)} · ${bonusText}`;
  };
  tick();
  questionTick = setInterval(tick, 250);
}

function makeFinishPatch(startedAt) {
  const roomStart = startedAt?.toMillis ? startedAt.toMillis() : Date.now();
  return {
    finalizado: true,
    emRevisao: false,
    filaRevisao: [],
    duracaoFinalMs: Math.max(0, Date.now() - roomStart),
    finalizadoEm: serverTimestamp()
  };
}

async function answer(choice) {
  if (!playerData || playerData.finalizado || answerInProgress) return;
  const index = getCurrentQuestionIndex();
  const question = questions[index];
  if (!question) return;

  answerInProgress = true;
  const buttons = [...document.querySelectorAll('.answer-option')];
  buttons.forEach(button => { button.disabled = true; });

  const isCorrect = choice === question.correct;
  const elapsed = Math.max(0, (Date.now() - questionStartedAt) / 1000);
  const bonus = isCorrect ? speedBonus(elapsed) : 0;
  const currentQueue = Array.isArray(playerData.filaRevisao) ? [...playerData.filaRevisao] : [];
  const inReview = Boolean(playerData.emRevisao);
  const patch = { etapaQuestao: increment(1) };

  try {
    if (!isCorrect) {
      $('answerFeedback').className = 'answer-feedback wrong';
      if (inReview) {
        $('answerFeedback').textContent = 'Ainda não! Esta questão vai para o fim da fila. Você tentará novamente depois das outras pendentes.';
        await sleep(900);
        const queue = currentQueue.length ? currentQueue : [index];
        // Retira a questão atual do início e a coloca no fim da fila.
        const nextQueue = [...queue.slice(1), index];
        patch.filaRevisao = nextQueue;
        patch.emRevisao = true;
        patch.questaoAtual = nextQueue[0];
      } else {
        $('answerFeedback').textContent = 'Resposta incorreta. A questão foi guardada para revisão. Vamos avançar para o próximo desafio.';
        await sleep(900);
        if (!currentQueue.includes(index)) currentQueue.push(index);
        patch.filaRevisao = currentQueue;
        const nextIndex = index + 1;
        if (nextIndex < TOTAL_QUESTIONS) {
          patch.questaoAtual = nextIndex;
          patch.emRevisao = false;
        } else {
          // Terminou a primeira passagem: volta somente às questões que ficaram erradas.
          patch.emRevisao = true;
          patch.questaoAtual = currentQueue[0];
        }
      }
      patch.tentativasErradas = increment(1);
      patch.inicioQuestaoMs = Date.now();
      await updateDoc(playerRef, patch);
      return;
    }

    const metersGain = 10 + bonus;
    const xpGain = 10 + bonus;
    $('answerFeedback').className = 'answer-feedback correct';
    $('answerFeedback').textContent = `CORRETO! +10 m de avanço${bonus ? ` · +${bonus} pontos extras de velocidade` : ' · sem bônus de velocidade'}.`;
    await sleep(700);

    patch.acertos = increment(1);
    patch.metros = (playerData.metros || 0) + metersGain;
    patch.xp = (playerData.xp || 0) + xpGain;
    patch.inicioQuestaoMs = Date.now();

    if (inReview) {
      const queue = currentQueue.length ? currentQueue : [index];
      const nextQueue = queue.slice(1);
      patch.filaRevisao = nextQueue;
      if (nextQueue.length) {
        patch.emRevisao = true;
        patch.questaoAtual = nextQueue[0];
      } else {
        patch.questaoAtual = index;
        Object.assign(patch, makeFinishPatch(roomData?.startedAt));
      }
    } else {
      const nextIndex = index + 1;
      if (nextIndex < TOTAL_QUESTIONS) {
        patch.questaoAtual = nextIndex;
        patch.emRevisao = false;
      } else if (currentQueue.length) {
        // O 10º desafio foi concluído; começa a rodada das questões erradas.
        patch.emRevisao = true;
        patch.questaoAtual = currentQueue[0];
      } else {
        patch.questaoAtual = index;
        Object.assign(patch, makeFinishPatch(roomData?.startedAt));
      }
    }

    await updateDoc(playerRef, patch);
  } catch (error) {
    $('answerFeedback').className = 'answer-feedback wrong';
    $('answerFeedback').textContent = `Não foi possível registrar sua resposta. Tente novamente. (${error.message})`;
    buttons.forEach(button => { button.disabled = false; });
  } finally {
    answerInProgress = false;
  }
}

function renderResult() {
  clearInterval(questionTick);
  showView('result');
  const sorted = sortPlayers(latestPlayers);
  const myRank = sorted.findIndex(player => player.uid === playerUid) + 1;
  const winner = sorted[0];
  $('resultTitle').textContent = myRank === 1 ? 'VOCÊ É O CAMPEÃO!' : 'CORRIDA CONCLUÍDA!';
  $('resultSubtitle').textContent = `Você terminou em ${myRank}º lugar${winner ? `. ${winner.nome} está na liderança.` : ''}`;
  $('finalCorrect').textContent = `${playerData?.acertos || 0}/${TOTAL_QUESTIONS}`;
  $('finalMeters').textContent = `${playerData?.metros || 0} m`;
  $('finalXp').textContent = `${playerData?.xp || 0} XP`;
  $('finishBanner').textContent = myRank === 1
    ? '🏆 Parabéns! Você cruzou a linha de chegada em primeiro lugar!'
    : '🏁 Boa corrida! Seu resultado foi registrado na classificação.';
  rankList($('finalLeaderboard'), sorted);
}

function subscribeRoom() {
  roomUnsub = onSnapshot(doc(db, 'corridas_cilindros', roomCode), snapshot => {
    if (!snapshot.exists()) {
      msg('A sala não existe mais. Confira o código com o professor.');
      showView('join');
      return;
    }
    roomData = snapshot.data();
    if (roomData.status === 'correndo') {
      if (playerData?.finalizado) renderResult();
      else renderRace();
    } else if (roomData.status === 'encerrada') {
      if (playerData?.finalizado) renderResult();
      else {
        showView('result');
        $('resultTitle').textContent = 'CORRIDA ENCERRADA';
        $('resultSubtitle').textContent = 'O professor encerrou a sala.';
        rankList($('finalLeaderboard'), sortPlayers(latestPlayers));
      }
    } else {
      renderWaiting();
    }
  }, error => msg('Não foi possível acompanhar a sala: ' + error.message));

  playersUnsub = onSnapshot(collection(db, 'corridas_cilindros', roomCode, 'participantes'), snapshot => {
    latestPlayers = snapshot.docs.map(document => ({ uid: document.id, ...document.data() }));
    $('playerCount').textContent = latestPlayers.length;
    rankList($('waitingLeaderboard'), sortPlayers(latestPlayers));
    rankList($('raceLeaderboard'), sortPlayers(latestPlayers));
    if (!views.result.classList.contains('hidden')) rankList($('finalLeaderboard'), sortPlayers(latestPlayers));
    if (playerData?.finalizado) renderResult();
  });

  playerUnsub = onSnapshot(playerRef, snapshot => {
    if (!snapshot.exists()) return;
    const nextData = snapshot.data();
    const previousStage = playerData?.etapaQuestao || 0;
    const previousIndex = playerData?.questaoAtual;
    const previousReview = Boolean(playerData?.emRevisao);
    const previousFinished = playerData?.finalizado;
    playerData = nextData;
    if (playerData.finalizado) {
      renderResult();
    } else if (roomData?.status === 'correndo' && (
      previousIndex === undefined ||
      previousIndex !== playerData.questaoAtual ||
      previousReview !== Boolean(playerData.emRevisao) ||
      previousStage !== (playerData.etapaQuestao || 0) ||
      previousFinished
    )) {
      renderRace();
    }
  });
}

$('joinForm').addEventListener('submit', async event => {
  event.preventDefault();
  if (!firebaseIsConfigured) {
    msg('O Firebase ainda não foi configurado nesta aplicação.');
    return;
  }
  const name = $('playerName').value.trim();
  const group = $('playerGroup').value;
  if (!name) return;
  $('joinBtn').disabled = true;
  msg('Localizando a corrida aberta pelo professor...');

  try {
    const credential = await signInAnonymously(auth);
    playerUid = credential.user.uid;

    // A página do aluno usa sempre o endereço fixo. O código interno da sala
    // é descoberto pelo documento configuracoes/corrida_ativa no Firestore.
    const activeRoomSnapshot = await getDoc(doc(db, 'configuracoes', 'corrida_ativa'));
    if (!activeRoomSnapshot.exists()) {
      throw new Error('O professor ainda não abriu uma corrida. Aguarde e tente novamente.');
    }
    const activeRoomData = activeRoomSnapshot.data();
    const code = String(activeRoomData.codigo || '').trim().toUpperCase();
    if (!code) {
      throw new Error('Não há uma corrida aberta no momento. Aguarde o professor iniciar uma nova rodada.');
    }

    roomCode = code;
    const roomRef = doc(db, 'corridas_cilindros', roomCode);
    const roomSnapshot = await getDoc(roomRef);
    if (!roomSnapshot.exists()) throw new Error('A corrida ativa não foi encontrada. Avise o professor.');
    roomData = roomSnapshot.data();
    if (roomData.status !== 'aguardando') throw new Error('A corrida já começou ou foi encerrada. Peça ao professor uma nova sala.');
    if (roomData.turma && group !== roomData.turma) throw new Error(`Esta sala foi criada para ${roomData.turma}. Selecione essa turma para entrar.`);

    playerRef = doc(db, 'corridas_cilindros', roomCode, 'participantes', playerUid);
    const existingPlayer = await getDoc(playerRef);
    if (!existingPlayer.exists()) {
      await setDoc(playerRef, {
        uid: playerUid,
        nome: name,
        turma: group,
        questaoAtual: 0,
        acertos: 0,
        tentativasErradas: 0,
        metros: 0,
        xp: 0,
        filaRevisao: [],
        emRevisao: false,
        etapaQuestao: 0,
        finalizado: false,
        duracaoFinalMs: null,
        inicioQuestaoMs: Date.now(),
        entrouEm: serverTimestamp()
      });
    } else {
      playerData = existingPlayer.data();
    }
    subscribeRoom();
  } catch (error) {
    msg(error.message || 'Não foi possível entrar.');
    $('joinBtn').disabled = false;
  }
});

if (!firebaseIsConfigured) {
  msg('Configuração pendente: o professor precisa configurar o novo projeto Firebase antes de abrir a sala.');
  $('joinBtn').disabled = true;
}
