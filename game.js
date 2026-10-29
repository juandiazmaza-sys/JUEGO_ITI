// =========================================
// CONFIGURACIÓN PRINCIPAL
// =========================================

const ROUND_SECONDS = 10;

const getElement = (id) => document.getElementById(id);


// Contenedores de respuestas

const answerContainers = [
  getElement("answers1"),
  getElement("answers2")
];


// Estados de los estudiantes

const statusElements = [
  getElement("status1"),
  getElement("status2")
];


// Marcadores

const scoreElements = [
  getElement("score1"),
  getElement("score2")
];


// Operaciones matemáticas

const operationElements = [
  getElement("operation1"),
  getElement("operation2")
];


// =========================================
// VARIABLES DEL JUEGO
// =========================================

let scores = [0, 0];

let totalQuestions = 10;
let currentQuestion = 0;

let correctAnswer = 0;

let secondsLeft = ROUND_SECONDS;
let timer = null;

let roundOpen = false;
let attempted = [false, false];

let gameRunning = false;

// mixed, sum, sub, mul o div

let operationMode = "mixed";


// =========================================
// FUNCIONES AUXILIARES
// =========================================

function randomNumber(minimum, maximum) {
  return Math.floor(
    Math.random() * (maximum - minimum + 1)
  ) + minimum;
}


function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}


// =========================================
// CREAR OPERACIÓN MATEMÁTICA
// =========================================

function createProblem() {
  const symbols = {
    sum: "+",
    sub: "−",
    mul: "×",
    div: "÷"
  };

  let operator;

  if (operationMode === "mixed") {
    const mixedOperators = ["+", "−", "×", "÷"];

    operator = mixedOperators[
      randomNumber(0, mixedOperators.length - 1)
    ];
  } else {
    operator = symbols[operationMode];
  }

  let firstNumber;
  let secondNumber;
  let result;

  // Suma

  if (operator === "+") {
    firstNumber = randomNumber(1, 50);
    secondNumber = randomNumber(1, 50);

    result = firstNumber + secondNumber;
  }

  // Resta

  else if (operator === "−") {
    firstNumber = randomNumber(5, 70);
    secondNumber = randomNumber(1, firstNumber);

    result = firstNumber - secondNumber;
  }

  // Multiplicación

  else if (operator === "×") {
    firstNumber = randomNumber(1, 12);
    secondNumber = randomNumber(1, 12);

    result = firstNumber * secondNumber;
  }

  // División exacta

  else {
    secondNumber = randomNumber(1, 12);
    result = randomNumber(1, 12);

    firstNumber = secondNumber * result;
  }

  return {
    text: `${firstNumber} ${operator} ${secondNumber} = ?`,
    result: result
  };
}


// =========================================
// CREAR OPCIONES DE RESPUESTA
// =========================================

function createOptions(result) {
  const options = new Set([result]);

  const range = Math.max(
    5,
    Math.min(
      18,
      Math.ceil(Math.abs(result) / 3)
    )
  );

  while (options.size < 4) {
    const incorrectAnswer = Math.max(
      0,
      result + randomNumber(-range, range)
    );

    options.add(incorrectAnswer);
  }

  return [...options];
}


// =========================================
// DIBUJAR BOTONES DE RESPUESTA
// =========================================

function renderAnswers(container, values, playerIndex) {
  container.innerHTML = "";

  values.forEach((value) => {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "answer";
    button.textContent = value;

    button.addEventListener("click", () => {
      selectAnswer(
        button,
        playerIndex,
        value
      );
    });

    container.appendChild(button);
  });
}


// =========================================
// ACTUALIZAR RONDA Y TIEMPO
// =========================================

function updateGameInformation() {
  getElement("round1").textContent =
    `${currentQuestion} / ${totalQuestions}`;

  getElement("round2").textContent =
    `${currentQuestion} / ${totalQuestions}`;

  getElement("time1").textContent = secondsLeft;
  getElement("time2").textContent = secondsLeft;
}


// =========================================
// BLOQUEAR RESPUESTAS
// =========================================

function lockPlayer(playerIndex) {
  const buttons = answerContainers[
    playerIndex
  ].children;

  [...buttons].forEach((button) => {
    button.disabled = true;
  });

  statusElements[playerIndex].textContent =
    "INTENTO UTILIZADO";
}


function lockAllPlayers() {
  lockPlayer(0);
  lockPlayer(1);
}


// =========================================
// COMENZAR UNA PREGUNTA
// =========================================

function startRound() {
  if (currentQuestion >= totalQuestions) {
    finishGame();
    return;
  }

  clearInterval(timer);

  currentQuestion++;

  secondsLeft = ROUND_SECONDS;

  attempted = [false, false];

  roundOpen = true;

  const problem = createProblem();

  correctAnswer = problem.result;

  operationElements.forEach((element) => {
    element.textContent = problem.text;
  });

  const options = createOptions(correctAnswer);

  renderAnswers(
    answerContainers[0],
    shuffleArray(options),
    0
  );

  renderAnswers(
    answerContainers[1],
    shuffleArray(options),
    1
  );

  statusElements.forEach((element) => {
    element.textContent = "UN SOLO INTENTO";
  });

  getElement("message").textContent =
    "MÁS RÁPIDO = MÁS PUNTOS";

  updateGameInformation();

  timer = setInterval(() => {
    secondsLeft--;

    updateGameInformation();

    if (secondsLeft <= 0) {
      clearInterval(timer);

      roundOpen = false;

      lockAllPlayers();

      getElement("message").textContent =
        `TIEMPO. RESPUESTA: ${correctAnswer}`;

      setTimeout(startRound, 1400);
    }
  }, 1000);
}


// =========================================
// SELECCIONAR RESPUESTA
// =========================================

function selectAnswer(
  button,
  playerIndex,
  selectedValue
) {
  if (
    !gameRunning ||
    !roundOpen ||
    attempted[playerIndex]
  ) {
    return;
  }

  attempted[playerIndex] = true;

  // Respuesta correcta

  if (selectedValue === correctAnswer) {
    roundOpen = false;

    clearInterval(timer);

    const points = Math.max(
      10,
      secondsLeft * 10
    );

    scores[playerIndex] += points;

    scoreElements[playerIndex].textContent =
      scores[playerIndex];

    lockAllPlayers();

    button.classList.add("correct");

    // Mantener visible el botón correcto

    button.disabled = false;

    statusElements[playerIndex].textContent =
      `CORRECTO: +${points} PUNTOS`;

    getElement("message").textContent =
      `ESTUDIANTE ${playerIndex + 1}: +${points}`;

    setTimeout(startRound, 1300);

    return;
  }

  // Respuesta incorrecta

  button.classList.add("wrong");

  lockPlayer(playerIndex);

  getElement("message").textContent =
    `ESTUDIANTE ${playerIndex + 1} FALLÓ`;

  // Comprobar si ambos fallaron

  if (attempted[0] && attempted[1]) {
    roundOpen = false;

    clearInterval(timer);

    document
      .querySelectorAll(".answer")
      .forEach((answerButton) => {
        if (
          Number(answerButton.textContent) ===
          correctAnswer
        ) {
          answerButton.classList.add("correct");
          answerButton.style.opacity = "1";
        }
      });

    getElement("message").textContent =
      `AMBOS FALLARON. ERA ${correctAnswer}`;

    setTimeout(startRound, 1500);
  }
}


// =========================================
// LEER OPCIONES DEL MENÚ
// =========================================

function readOptions() {
  const selectedQuestions =
    document.querySelector(
      'input[name="questions"]:checked'
    );

  const selectedOperation =
    document.querySelector(
      'input[name="operation"]:checked'
    );

  totalQuestions = Number(
    selectedQuestions.value
  );

  operationMode =
    selectedOperation.value;
}


// =========================================
// INICIAR PARTIDA
// =========================================

function launchGame() {
  currentQuestion = 0;

  scores = [0, 0];

  scoreElements.forEach((element) => {
    element.textContent = "0";
  });

  gameRunning = true;

  getElement("optionsDialog").close();

  startRound();
}


// =========================================
// TERMINAR PARTIDA
// =========================================

function finishGame() {
  gameRunning = false;

  roundOpen = false;

  clearInterval(timer);

  let winnerMessage;

  if (scores[0] === scores[1]) {
    winnerMessage = "🤝 ¡EMPATE!";
  } else if (scores[0] > scores[1]) {
    winnerMessage =
      "🎉 ¡GANÓ EL ESTUDIANTE 1!";
  } else {
    winnerMessage =
      "🎉 ¡GANÓ EL ESTUDIANTE 2!";
  }

  getElement("winnerText").textContent =
    winnerMessage;

  getElement("finalScore").innerHTML = `
    Estudiante 1:
    <b>${scores[0]}</b> puntos
    <br>
    Estudiante 2:
    <b>${scores[1]}</b> puntos
  `;

  getElement("finishDialog").showModal();
}


// =========================================
// VOLVER AL MENÚ
// =========================================

function showMenu() {
  clearInterval(timer);

  gameRunning = false;

  roundOpen = false;

  const finishDialog =
    getElement("finishDialog");

  if (finishDialog.open) {
    finishDialog.close();
  }

  getElement("optionsDialog").showModal();
}


// =========================================
// EVENTOS DE LOS BOTONES
// =========================================

// Bienvenida → opciones

getElement("goOptions").addEventListener(
  "click",
  () => {
    getElement("welcomeDialog").close();

    getElement("optionsDialog").showModal();
  }
);


// Iniciar juego desde el formulario

getElement("optionsForm").addEventListener(
  "submit",
  (event) => {
    event.preventDefault();

    readOptions();

    launchGame();
  }
);


// Seguir jugando con la misma configuración

getElement("continueGame").addEventListener(
  "click",
  () => {
    getElement("finishDialog").close();

    launchGame();
  }
);


// Volver al menú de opciones

getElement("backMenu").addEventListener(
  "click",
  showMenu
);


// Botones de menú del panel central

document
  .querySelectorAll("[data-menu]")
  .forEach((button) => {
    button.addEventListener(
      "click",
      showMenu
    );
  });


// Mostrar bienvenida al cargar la página

window.addEventListener("load", () => {
  getElement("welcomeDialog").showModal();
});