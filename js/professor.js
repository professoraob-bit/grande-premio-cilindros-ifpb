import {
  auth, db, firebaseIsConfigured,
  signInWithEmailAndPassword, onAuthStateChanged, signOut,
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch,
  onSnapshot, query, where, serverTimestamp
} from './firebase.js';

const $ = id => document.getElementById(id);
let unsubRooms = null;
const roomListeners = new Map();
let createdLink = '';

function esc(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function statusLabel(status) {
  if (status === 'aguardando') return 'AGUARDANDO';
  if (status === 'correndo') return 'AO VIVO';
  return 'ENCERRADA';
}

function progressPercent(player) {
  if (player.finalizado) return 100;
  return Math.max(0, Math.min(99, ((player.metros || 0) / 150) * 100));
}

function miniCar(player) {
  const progress = progressPercent(player);
  return `<div class="mini-race-track" aria-label="Progresso de ${Math.round(progress)}%">
    <span class="mini-race-fill" style="width:${progress}%"></span>
    <span class="mini-race-car" style="left:${progress}%">🏎️</span>
  </div>`;
}

function renderRooms(docs) {
  const root = $('roomsList');
  if (!docs.length) {
    root.innerHTML = '<div class="panel"><p class="muted">Nenhuma sala criada ainda. Crie a primeira corrida acima.</p></div>';
    return;
  }

  root.innerHTML = docs.map(({ id, d }) => `
    <article class="panel room-admin" data-code="${id}" style="margin-bottom:15px">
      <div class="status-row">
        <div>
          <span class="card-kicker">RODADA INTERNA · ${id}</span>
          <h3 style="font:800 25px 'Barlow Condensed';margin:4px 0">${esc(d.titulo || 'Corrida dos Cilindros')}</h3>
          <p class="muted">${esc(d.turma || '')} · ${statusLabel(d.status)}</p>
        </div>
        <span class="count-pill" id="count-${id}">0</span>
      </div>
      <div class="admin-actions" style="display:flex;gap:8px;flex-wrap:wrap;margin:14px 0">
        <button class="btn btn-primary start-room" data-code="${id}" ${d.status !== 'aguardando' ? 'disabled' : ''}>▶ INICIAR CORRIDA</button>
        <button class="btn end-room" data-code="${id}" style="background:#fff0e8;color:#a94f2d" ${d.status !== 'correndo' ? 'disabled' : ''}>ENCERRAR</button>
        <button class="btn copy-room" data-code="${id}" style="background:#edf2f1;color:#244252">COPIAR LINK PERMANENTE</button>
        <button class="btn export-room" data-code="${id}" style="background:#edf2f1;color:#244252">EXPORTAR CSV</button>
        <button class="btn delete-room" data-code="${id}" data-status="${esc(d.status || '')}"
          style="background:#fff0f0;color:#a52626;border:1px solid #f0cccc"
          ${d.status === 'correndo' ? 'disabled title="Encerre a corrida antes de excluí-la."' : ''}>EXCLUIR SALA</button>
      </div>
      <div class="leader-list" id="participants-${id}"><div class="empty-leader">Carregando participantes...</div></div>
    </article>`).join('');

  root.querySelectorAll('.start-room').forEach(button => {
    button.onclick = () => startRoom(button.dataset.code);
  });
  root.querySelectorAll('.end-room').forEach(button => {
    button.onclick = () => endRoom(button.dataset.code);
  });
  root.querySelectorAll('.copy-room').forEach(button => {
    button.onclick = () => copyRoom(button.dataset.code);
  });
  root.querySelectorAll('.export-room').forEach(button => {
    button.onclick = () => exportRoom(button.dataset.code);
  });
  root.querySelectorAll('.delete-room').forEach(button => {
    button.onclick = () => deleteRoom(button.dataset.code, button.dataset.status);
  });

  docs.forEach(({ id }) => watchParticipants(id));
}

function watchParticipants(code) {
  if (roomListeners.has(code)) return;
  const unsubscribe = onSnapshot(
    collection(db, 'corridas_cilindros', code, 'participantes'),
    snapshot => {
      const participants = snapshot.docs
        .map(item => ({ uid: item.id, ...item.data() }))
        .sort((a, b) => {
          if (a.finalizado && b.finalizado) return (a.duracaoFinalMs || 0) - (b.duracaoFinalMs || 0);
          if (a.finalizado !== b.finalizado) return a.finalizado ? -1 : 1;
          return (b.metros || 0) - (a.metros || 0);
        });

      const count = $(`count-${code}`);
      if (count) count.textContent = participants.length;
      const list = $(`participants-${code}`);
      if (list) {
        list.innerHTML = participants.length
          ? participants.map((player, index) => `
            <div class="leader-row">
              <div class="rank-no ${index === 0 ? 'first' : ''}">${index === 0 ? '🏆' : index + 1}</div>
              <div>
                <div class="leader-name">${esc(player.nome || 'Participante')}</div>
                <div class="leader-sub">${esc(player.turma || '')} · ${player.acertos || 0}/10 · ${player.finalizado ? 'Finalizou' : player.emRevisao ? 'Em revisão' : 'Em andamento'}</div>
              </div>
              <div class="leader-score">${miniCar(player)}${player.metros || 0} m<small>${player.xp || 0} XP</small></div>
            </div>`).join('')
          : '<div class="empty-leader">Aguardando participantes...</div>';
      }
    }
  );
  roomListeners.set(code, unsubscribe);
}

async function startRoom(code) {
  try {
    await updateDoc(doc(db, 'corridas_cilindros', code), {
      status: 'correndo', startedAt: serverTimestamp()
    });
  } catch (error) {
    alert('Não foi possível iniciar: ' + error.message);
  }
}

async function endRoom(code) {
  if (!confirm('Deseja encerrar esta corrida?')) return;
  try {
    await updateDoc(doc(db, 'corridas_cilindros', code), {
      status: 'encerrada', endedAt: serverTimestamp()
    });
  } catch (error) {
    alert('Não foi possível encerrar: ' + error.message);
  }
}

async function deleteRoom(code, status) {
  if (status === 'correndo') {
    alert('Encerre a corrida antes de excluí-la.');
    return;
  }

  const confirmed = confirm(
    `Tem certeza de que deseja excluir permanentemente a sala ${code}?\n\n` +
    'Todos os participantes e resultados dessa sala também serão apagados. ' +
    'Se quiser guardar os resultados, clique em Cancelar e exporte o CSV antes.'
  );
  if (!confirmed) return;

  const button = document.querySelector(`.delete-room[data-code="${code}"]`);
  if (button) button.disabled = true;

  try {
    const participantsSnapshot = await getDocs(
      collection(db, 'corridas_cilindros', code, 'participantes')
    );
    const batch = writeBatch(db);
    participantsSnapshot.docs.forEach(participant => batch.delete(participant.ref));
    batch.delete(doc(db, 'corridas_cilindros', code));

    // Se a sala excluída era a rodada ativa, limpa o ponteiro do link fixo.
    const activeRef = doc(db, 'configuracoes', 'corrida_ativa');
    const activeSnapshot = await getDoc(activeRef);
    if (activeSnapshot.exists() && activeSnapshot.data().codigo === code) {
      batch.set(activeRef, {
        codigo: null,
        professorUid: auth.currentUser.uid,
        atualizadoEm: serverTimestamp()
      }, { merge: true });
    }
    await batch.commit();

    const unsubscribe = roomListeners.get(code);
    if (unsubscribe) unsubscribe();
    roomListeners.delete(code);
    alert(`A sala ${code} e seus registros foram excluídos.`);
  } catch (error) {
    if (button) button.disabled = false;
    alert('Não foi possível excluir a sala: ' + error.message);
  }
}

function linkFor(_code) {
  // Um único endereço permanente para todas as rodadas.
  return new URL('index.html', location.href).href;
}

async function copyRoom(code) {
  const link = linkFor(code);
  try {
    await navigator.clipboard.writeText(link);
    alert('Link copiado!');
  } catch {
    prompt('Copie o link da sala:', link);
  }
}

async function exportRoom(code) {
  try {
    const snapshot = await getDocs(collection(db, 'corridas_cilindros', code, 'participantes'));
    const rows = snapshot.docs.map(item => item.data());
    const header = ['Nome', 'Turma', 'Acertos', 'Tentativas erradas', 'Metros', 'XP', 'Finalizou', 'Tempo final (ms)'];
    const csv = [header, ...rows.map(player => [
      player.nome, player.turma, player.acertos, player.tentativasErradas,
      player.metros, player.xp, player.finalizado, player.duracaoFinalMs
    ])].map(row => row.map(value => '"' + String(value ?? '').replace(/"/g, '""') + '"').join(';')).join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `corrida-${code}-resultados.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    alert('Não foi possível exportar os resultados: ' + error.message);
  }
}

$('loginForm').addEventListener('submit', async event => {
  event.preventDefault();
  $('loginBtn').disabled = true;
  $('loginMessage').textContent = 'Entrando...';
  try {
    await signInWithEmailAndPassword(auth, $('email').value.trim(), $('password').value);
    $('loginMessage').textContent = '';
  } catch (error) {
    $('loginMessage').textContent = 'Não foi possível entrar. Confira e-mail e senha.';
    $('loginBtn').disabled = false;
  }
});

$('logoutBtn').onclick = () => signOut(auth);

$('createRoomBtn').onclick = async () => {
  if (!auth.currentUser) return;
  const group = $('raceGroup').value;
  $('createRoomBtn').disabled = true;
  try {
    const code = Array.from(crypto.getRandomValues(new Uint8Array(4)))
      .map(value => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[value % 32]).join('');
    const title = $('raceTitle').value.trim() || 'Corrida dos Cilindros';
    const roomRef = doc(db, 'corridas_cilindros', code);
    const activeRef = doc(db, 'configuracoes', 'corrida_ativa');
    const batch = writeBatch(db);

    batch.set(roomRef, {
      codigo: code,
      titulo: title,
      turma: group,
      campus: 'IFPB — Campus João Pessoa',
      disciplina: 'Geometria Espacial',
      professorNome: 'Arthur Oliveira Barbosa',
      professorUid: auth.currentUser.uid,
      status: 'aguardando',
      createdAt: serverTimestamp(),
      startedAt: null,
      endedAt: null,
      totalQuestoes: 10,
      linhaChegada: 150
    });

    // Atualiza o destino do link permanente para a nova rodada.
    batch.set(activeRef, {
      codigo: code,
      professorUid: auth.currentUser.uid,
      atualizadoEm: serverTimestamp()
    });

    await batch.commit();

    createdLink = linkFor(code);
    $('newRoomCode').textContent = code;
    $('newRoomLink').textContent = createdLink;
    $('createdRoom').classList.remove('hidden');
    $('createMessage').textContent = 'Nova rodada aberta. Os alunos podem entrar pelo link permanente, informando apenas nome e turma.';
  } catch (error) {
    $('createMessage').textContent = 'Erro ao criar sala: ' + error.message;
  } finally {
    $('createRoomBtn').disabled = false;
  }
};

$('copyLinkBtn').onclick = async () => {
  try {
    await navigator.clipboard.writeText(createdLink);
    $('copyLinkBtn').textContent = 'LINK COPIADO!';
  } catch {
    prompt('Copie o link:', createdLink);
  }
};

if (firebaseIsConfigured) {
  onAuthStateChanged(auth, user => {
    if (user && !user.isAnonymous) {
      $('loginPanel').classList.add('hidden');
      $('dashboard').classList.remove('hidden');
      if (unsubRooms) unsubRooms();
      unsubRooms = onSnapshot(
        query(collection(db, 'corridas_cilindros'), where('professorUid', '==', user.uid)),
        snapshot => {
          const docs = snapshot.docs
            .map(item => ({ id: item.id, d: item.data() }))
            .sort((a, b) => (b.d.createdAt?.seconds || 0) - (a.d.createdAt?.seconds || 0));
          renderRooms(docs);
        }
      );
    } else {
      $('loginPanel').classList.remove('hidden');
      $('dashboard').classList.add('hidden');
    }
  });
}

if (!firebaseIsConfigured) {
  $('loginMessage').textContent = 'Configure firebase-config.js com as credenciais do novo projeto Firebase.';
  $('loginBtn').disabled = true;
  $('createRoomBtn').disabled = true;
}
