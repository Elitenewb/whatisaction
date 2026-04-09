/**
 * Forms of Action — Grade 5 board game (static site)
 * Board path is defined here so teachers can edit questions.json only for cards.
 */

const FINISH_INDEX = 27;

/** @type {{ label: string, special: null | 'rollAgain' | 'forward1' | 'back1' }[]} */
const BOARD_SPACES = [
  { label: 'Start', special: null },
  { label: '1', special: null },
  { label: '2', special: null },
  { label: '3', special: 'forward1' },
  { label: '4', special: null },
  { label: '5', special: null },
  { label: '6', special: 'rollAgain' },
  { label: '7', special: null },
  { label: '8', special: null },
  { label: '9', special: null },
  { label: '10', special: 'back1' },
  { label: '11', special: null },
  { label: '12', special: null },
  { label: '13', special: null },
  { label: '14', special: null },
  { label: '15', special: null },
  { label: '16', special: null },
  { label: '17', special: 'rollAgain' },
  { label: '18', special: null },
  { label: '19', special: null },
  { label: '20', special: null },
  { label: '21', special: null },
  { label: '22', special: null },
  { label: '23', special: 'forward1' },
  { label: '24', special: null },
  { label: '25', special: null },
  { label: '26', special: null },
  { label: 'Finish', special: null },
];

/** @typedef {{ id: string, type: string, prompt: string, options: string[], answer: string, explanation: string, target?: string, namedAction?: string }} Card */

/** @type {Record<string, Card>} */
let cardsById = {};

/** @type {{
 *   players: { name: string, position: number }[],
 *   currentPlayerIndex: number,
 *   phase: 'setup' | 'rolling' | 'awaitAnswer' | 'awaitNextTurn' | 'gameOver',
 *   pendingRoll: number | null,
 *   deck: string[],
 *   usedCards: string[],
 *   currentCard: Card | null,
 *   lastResult: { correct: boolean, explanation: string, extra?: string } | null,
 *   pendingExtraRoll: boolean,
 * }} */
let state = createInitialState();

function createInitialState() {
  return {
    players: [
      { name: 'Player 1', position: 0 },
      { name: 'Player 2', position: 0 },
    ],
    currentPlayerIndex: 0,
    phase: 'setup',
    pendingRoll: null,
    deck: [],
    usedCards: [],
    currentCard: null,
    lastResult: null,
    pendingExtraRoll: false,
  };
}

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initDeck() {
  const ids = Object.keys(cardsById);
  if (ids.length === 0) {
    state.deck = [];
    return;
  }
  state.deck = shuffle(ids);
  state.usedCards = [];
}

function drawNextCard() {
  if (state.deck.length === 0) {
    const pool = state.usedCards.length > 0 ? [...state.usedCards] : Object.keys(cardsById);
    state.usedCards = [];
    state.deck = shuffle(pool);
  }
  const id = state.deck.pop();
  if (id) state.usedCards.push(id);
  return id ? cardsById[id] : null;
}

function rollDie() {
  return 1 + Math.floor(Math.random() * 6);
}

function clampPosition(n) {
  return Math.max(0, Math.min(FINISH_INDEX, n));
}

function currentPlayer() {
  return state.players[state.currentPlayerIndex];
}

/**
 * After landing on `index`, apply special tile effects (not Start/Finish specials).
 * Returns { extraMessage?: string }
 */
function applyLandingSpecial(index) {
  const sp = BOARD_SPACES[index]?.special;
  const p = currentPlayer();
  let extra = '';

  if (!sp) return { extraMessage: '' };

  if (sp === 'rollAgain') {
    state.pendingExtraRoll = true;
    extra = 'Special space: Roll again after this turn (same player).';
  } else if (sp === 'forward1') {
    p.position = clampPosition(p.position + 1);
    extra = 'Special space: Move forward 1.';
  } else if (sp === 'back1') {
    p.position = clampPosition(p.position - 1);
    extra = 'Special space: Move back 1.';
  }

  return { extraMessage: extra };
}

// — DOM —
const el = {
  screenSetup: document.getElementById('screen-setup'),
  screenGame: document.getElementById('screen-game'),
  inputP1: document.getElementById('input-p1'),
  inputP2: document.getElementById('input-p2'),
  btnStart: document.getElementById('btn-start'),
  turnBanner: document.getElementById('turn-banner'),
  statusBar: document.getElementById('status-bar'),
  boardPath: document.getElementById('board-path'),
  diceValue: document.getElementById('dice-value'),
  cardPrompt: document.getElementById('card-prompt'),
  cardOptions: document.getElementById('card-options'),
  feedback: document.getElementById('feedback'),
  btnRoll: document.getElementById('btn-roll'),
  btnNext: document.getElementById('btn-next'),
  btnRestart: document.getElementById('btn-restart'),
  gameOver: document.getElementById('game-over'),
  winnerText: document.getElementById('winner-text'),
  btnPlayAgain: document.getElementById('btn-play-again'),
};

function buildBoardDom() {
  el.boardPath.innerHTML = '';
  BOARD_SPACES.forEach((space, i) => {
    const cell = document.createElement('div');
    cell.className = 'space';
    cell.dataset.index = String(i);
    if (i === 0) cell.classList.add('is-start');
    if (i === FINISH_INDEX) cell.classList.add('is-finish');
    if (space.special) cell.classList.add('is-special');

    const lab = document.createElement('div');
    lab.className = 'space-label';
    lab.textContent = i === 0 ? 'Start' : i === FINISH_INDEX ? 'Finish' : `Space ${i}`;
    cell.appendChild(lab);

    if (i > 0 && i < FINISH_INDEX) {
      const num = document.createElement('div');
      num.className = 'space-num';
      num.textContent = String(i);
      cell.appendChild(num);
    }

    if (space.special) {
      const badge = document.createElement('div');
      badge.className = 'space-badge';
      badge.textContent =
        space.special === 'rollAgain'
          ? 'Roll again'
          : space.special === 'forward1'
            ? '+1'
            : '−1';
      cell.appendChild(badge);
    }

    const tokens = document.createElement('div');
    tokens.className = 'space-tokens';
    tokens.setAttribute('aria-hidden', 'true');
    cell.appendChild(tokens);

    el.boardPath.appendChild(cell);
  });
}

function renderTokens() {
  document.querySelectorAll('.space-tokens').forEach((t) => {
    t.innerHTML = '';
  });
  state.players.forEach((pl, pi) => {
    const idx = pl.position;
    const cell = el.boardPath.querySelector(`.space[data-index="${idx}"]`);
    if (!cell) return;
    const holder = cell.querySelector('.space-tokens');
    const tok = document.createElement('span');
    tok.className = `token p${pi}`;
    tok.title = pl.name;
    holder.appendChild(tok);
  });
}

function renderStatus() {
  const lines = state.players.map((p, i) => {
    const here = p.position;
    const label =
      here === 0 ? 'Start' : here >= FINISH_INDEX ? 'Finish' : `Space ${here} of ${FINISH_INDEX - 1}`;
    return `<strong>${escapeHtml(p.name)}</strong>: ${label}`;
  });
  el.statusBar.innerHTML = lines.join('<br />');
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function renderTurnBanner() {
  if (state.phase === 'gameOver') {
    el.turnBanner.textContent = 'Game over';
    return;
  }
  const name = currentPlayer().name;
  el.turnBanner.textContent = `${name}'s turn`;
}

function renderDice() {
  if (state.pendingRoll == null) {
    el.diceValue.textContent = '—';
  } else {
    el.diceValue.textContent = String(state.pendingRoll);
  }
}

function renderCard() {
  const c = state.currentCard;
  if (!c) {
    el.cardPrompt.textContent = 'Click Roll to roll the die and draw a question.';
    el.cardOptions.innerHTML = '';
    return;
  }
  el.cardPrompt.textContent = c.prompt;
  el.cardOptions.innerHTML = '';
  c.options.forEach((opt) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'opt-btn';
    b.textContent = opt;
    b.addEventListener('click', () => onChooseOption(opt));
    el.cardOptions.appendChild(b);
  });
}

function setOptionButtonsDisabled(disabled) {
  el.cardOptions.querySelectorAll('.opt-btn').forEach((b) => {
    b.disabled = disabled;
  });
}

function renderFeedback() {
  const r = state.lastResult;
  if (!r) {
    el.feedback.classList.add('is-hidden');
    el.feedback.classList.remove('is-correct', 'is-wrong');
    el.feedback.innerHTML = '';
    return;
  }
  el.feedback.classList.remove('is-hidden');
  el.feedback.classList.toggle('is-correct', r.correct);
  el.feedback.classList.toggle('is-wrong', !r.correct);
  const title = r.correct ? 'Correct!' : 'Not quite.';
  let html = `<span class="title">${title}</span>`;
  html += `<span class="explanation">${escapeHtml(r.explanation)}</span>`;
  if (r.extra) {
    html += `<span class="extra">${escapeHtml(r.extra)}</span>`;
  }
  el.feedback.innerHTML = html;
}

function updateControls() {
  const ph = state.phase;
  const locked = ph === 'gameOver' || ph === 'setup';
  el.btnRoll.disabled = locked || ph !== 'rolling';
  el.btnNext.disabled = locked || ph !== 'awaitNextTurn';
  if (ph === 'awaitAnswer') {
    setOptionButtonsDisabled(false);
  } else {
    setOptionButtonsDisabled(true);
  }
}

function syncUi() {
  renderTurnBanner();
  renderStatus();
  renderDice();
  renderCard();
  renderFeedback();
  renderTokens();
  updateControls();
}

function showGameScreen() {
  el.screenSetup.classList.add('is-hidden');
  el.screenGame.classList.remove('is-hidden');
}

function showSetupScreen() {
  el.gameOver.classList.add('is-hidden');
  el.screenGame.classList.add('is-hidden');
  el.screenSetup.classList.remove('is-hidden');
}

function startGame() {
  const n1 = (el.inputP1.value || '').trim() || 'Player 1';
  const n2 = (el.inputP2.value || '').trim() || 'Player 2';
  state = createInitialState();
  state.players[0].name = n1;
  state.players[1].name = n2;
  state.phase = 'rolling';
  initDeck();
  state.pendingExtraRoll = false;
  showGameScreen();
  syncUi();
}

function onRoll() {
  if (state.phase !== 'rolling') return;
  state.pendingRoll = rollDie();
  state.currentCard = drawNextCard();
  if (!state.currentCard) {
    el.cardPrompt.textContent = 'No question cards loaded. Add cards to questions.json.';
    state.phase = 'awaitNextTurn';
    syncUi();
    return;
  }
  state.lastResult = null;
  el.feedback.classList.add('is-hidden');
  state.phase = 'awaitAnswer';
  syncUi();
}

function onChooseOption(choice) {
  if (state.phase !== 'awaitAnswer' || !state.currentCard) return;
  const c = state.currentCard;
  const correct = choice === c.answer;
  setOptionButtonsDisabled(true);

  if (!correct) {
    state.lastResult = {
      correct: false,
      explanation: c.explanation,
    };
    state.phase = 'awaitNextTurn';
    syncUi();
    return;
  }

  const roll = state.pendingRoll ?? 0;
  const p = currentPlayer();
  p.position = clampPosition(p.position + roll);

  if (p.position >= FINISH_INDEX) {
    showWinner(c.explanation, '');
    return;
  }

  const { extraMessage } = applyLandingSpecial(p.position);

  if (p.position >= FINISH_INDEX) {
    showWinner(c.explanation, extraMessage);
    return;
  }

  state.lastResult = {
    correct: true,
    explanation: c.explanation,
    extra: extraMessage || undefined,
  };
  state.phase = 'awaitNextTurn';
  syncUi();
}

function showWinner(explanation, extra) {
  const p = currentPlayer();
  state.lastResult = {
    correct: true,
    explanation,
    extra: extra || undefined,
  };
  state.phase = 'gameOver';
  el.gameOver.classList.remove('is-hidden');
  el.winnerText.textContent = `${p.name} reached the finish and wins!`;
  syncUi();
}

function onNextTurn() {
  if (state.phase !== 'awaitNextTurn') return;

  if (state.pendingExtraRoll) {
    state.pendingExtraRoll = false;
    state.pendingRoll = null;
    state.currentCard = null;
    state.lastResult = null;
    el.feedback.classList.add('is-hidden');
    state.phase = 'rolling';
    syncUi();
    return;
  }

  state.currentPlayerIndex = 1 - state.currentPlayerIndex;
  state.pendingRoll = null;
  state.currentCard = null;
  state.lastResult = null;
  el.feedback.classList.add('is-hidden');
  state.phase = 'rolling';
  syncUi();
}

function onRestart() {
  state = createInitialState();
  state.phase = 'setup';
  el.gameOver.classList.add('is-hidden');
  showSetupScreen();
  syncUi();
}

function onPlayAgain() {
  el.gameOver.classList.add('is-hidden');
  startGame();
}

async function loadQuestions() {
  const res = await fetch('./questions.json');
  if (!res.ok) throw new Error(`Could not load questions.json (${res.status})`);
  const data = await res.json();
  cardsById = {};
  for (const card of data.cards || []) {
    if (card && card.id) cardsById[card.id] = card;
  }
}

function wireEvents() {
  el.btnStart.addEventListener('click', startGame);
  el.btnRoll.addEventListener('click', onRoll);
  el.btnNext.addEventListener('click', onNextTurn);
  el.btnRestart.addEventListener('click', onRestart);
  el.btnPlayAgain.addEventListener('click', onPlayAgain);
}

function init() {
  buildBoardDom();
  wireEvents();
  loadQuestions()
    .then(() => {
      initDeck();
    })
    .catch((err) => {
      console.error(err);
      el.cardPrompt.textContent =
        'Could not load questions.json. Serve this folder over HTTP (see README).';
    })
    .finally(() => {
      syncUi();
    });
}

init();
