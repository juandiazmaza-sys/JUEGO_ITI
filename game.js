
const ROUND_SECONDS = 10;

const element = id => document.getElementById(id);
const answerContainers = [element('answers1'), element('answers2')];
const statusElements = [element('status1'), element('status2')];
const scoreElements = [element('score1'), element('score2')];
const operationElements = [element('operation1'), element('operation2')];

let scores = [0, 0];
let questionTotal = 10;
let questionNumber = 0;
let correctAnswer = 0;
let secondsLeft = ROUND_SECONDS;
let timer = null;
let roundOpen = false;
let attempted = [false, false];
let gameRunning = false;

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = values => [...values].sort(() => Math.random() - 0.5);

function createProblem() {
  const operator = ['+', '−', '×', '÷'][randomInt(0, 3)];
  let first;
  let second;
  let result;

  if (operator === '+') {
    first = randomInt(1, 50);
    second = randomInt(1, 50);
    result = first + second;
  } else if (operator === '−') {
    first = randomInt(5, 70);
    second = randomInt(1, first);
    result = first - second;
  } else if (operator === '×') {
    first = randomInt(1, 12);
    second = randomInt(1, 12);
    result = first * second;
  } else {
    second = randomInt(1, 12);
    result = randomInt(1, 12);
    first = second * result;
  }

  return { text: `${first} ${operator} ${second} = ?`, result };
}

function createOptions(answer) {
  const options = new Set([answer]);
  const range = Math.max(5, Math.min(18, Math.ceil(Math.abs(answer) / 3)));
  while (options.size < 4) {
    options.add(Math.max(0, answer + randomInt(-range, range)));
  }
  return [...options];
}

function renderAnswers(container, options, playerIndex) {
  container.innerHTML = '';
  options.forEach(value => {
    const button = document.createElement('button');
    button.className = 'answer-button';
    button.type = 'button';
    button.textContent = value;
    button.addEventListener('click', () => selectAnswer(button, playerIndex, value));
    container.appendChild(button);
  });
}

function updateCenter() {
  element('round1').textContent = `${questionNumber} / ${questionTotal}`;
  element('round2').textContent = `${questionNumber} / ${questionTotal}`;
  element('time1').textContent = secondsLeft;
  element('time2').textContent = secondsLeft;
}

function lockPlayer(playerIndex) {
  [...answerContainers[playerIndex].children].forEach(button => button.disabled = true);
  statusElements[playerIndex].textContent = 'Intento utilizado';
}

function lockBothPlayers() {
  lockPlayer(0);
  lockPlayer(1);
}

function speedPoints() {
  return Math.max(10, secondsLeft * 10);
}

function beginRound() {
  if (questionNumber >= questionTotal) {
    finishGame();
    return;
  }

  clearInterval(timer);
  questionNumber += 1;
  secondsLeft = ROUND_SECONDS;
  attempted = [false, false];
  roundOpen = true;

  const problem = createProblem();
  correctAnswer = problem.result;
  operationElements.forEach(item => item.textContent = problem.text);

  const options = createOptions(correctAnswer);
  renderAnswers(answerContainers[0], shuffle(options), 0);
  renderAnswers(answerContainers[1], shuffle(options), 1);

  statusElements.forEach(item => item.textContent = 'Un solo intento');
  element('centerMessage').textContent = 'Más rápido = más puntos';
  updateCenter();

  timer = setInterval(() => {
    secondsLeft -= 1;
    updateCenter();

    if (secondsLeft <= 0) {
      clearInterval(timer);
      roundOpen = false;
      lockBothPlayers();
      element('centerMessage').textContent = `Tiempo agotado. Respuesta: ${correctAnswer}`;
      setTimeout(beginRound, 1400);
    }
  }, 1000);
}

function selectAnswer(button, playerIndex, selectedValue) {
  if (!gameRunning || !roundOpen || attempted[playerIndex]) return;

  attempted[playerIndex] = true;

  if (selectedValue === correctAnswer) {
    roundOpen = false;
    clearInterval(timer);

    const earnedPoints = speedPoints();
    scores[playerIndex] += earnedPoints;
    scoreElements[playerIndex].textContent = scores[playerIndex];

    lockBothPlayers();
    button.classList.add('correct');
    button.disabled = false;
    statusElements[playerIndex].textContent = `Correcto: +${earnedPoints} puntos`;
    element('centerMessage').textContent = `Estudiante ${playerIndex + 1} gana ${earnedPoints} puntos`;
    setTimeout(beginRound, 1300);
    return;
  }

  button.classList.add('wrong');
  lockPlayer(playerIndex);
  element('centerMessage').textContent = `Estudiante ${playerIndex + 1} falló`;

  if (attempted[0] && attempted[1]) {
    roundOpen = false;
    clearInterval(timer);
    document.querySelectorAll('.answer-button').forEach(answerButton => {
      if (Number(answerButton.textContent) === correctAnswer) {
        answerButton.classList.add('correct');
        answerButton.style.opacity = '1';
      }
    });
    element('centerMessage').textContent = `Ambos fallaron. Respuesta: ${correctAnswer}`;
    setTimeout(beginRound, 1500);
  }
}

function startGame(event) {
  event.preventDefault();
  questionTotal = Number(document.querySelector('input[name="questions"]:checked').value);
  questionNumber = 0;
  scores = [0, 0];
  gameRunning = true;
  scoreElements.forEach(item => item.textContent = '0');
  element('setupDialog').close();
  beginRound();
}

function finishGame() {
  gameRunning = false;
  roundOpen = false;
  clearInterval(timer);

  const result = scores[0] === scores[1]
    ? '¡Empate!'
    : `¡Ganó el estudiante ${scores[0] > scores[1] ? 1 : 2}!`;

  element('winnerText').textContent = result;
  element('finalScore').textContent = `Estudiante 1: ${scores[0]} puntos · Estudiante 2: ${scores[1]} puntos`;
  element('finishDialog').showModal();
}

function openSettings() {
  if (gameRunning) {
    clearInterval(timer);
    roundOpen = false;
  }
  element('setupDialog').showModal();
}

document.querySelectorAll('[data-open-settings]').forEach(button => button.addEventListener('click', openSettings));
element('setupForm').addEventListener('submit', startGame);
element('cancelSetup').addEventListener('click', () => element('setupDialog').close());
element('playAgain').addEventListener('click', () => {
  element('finishDialog').close();
  element('setupDialog').showModal();
});
window.addEventListener('load', () => element('setupDialog').showModal());
