// HTML Elements Selection
let questionsCountSpan = document.querySelector(".quiz-info .count span"),
  spansContainer = document.querySelector(".bullets .spans-container"),
  asnwersArea = document.querySelector(".answers-area"),
  secondsSpan = document.querySelector(".count-down .seconds"),
  minutesSpan = document.querySelector(".count-down .minutes"),
  questionArea = document.querySelector(".quiz-area h2"),
  submitAnswerBtn = document.getElementById("submit-btn");

let questionCount = 7, // Number of questions to show
  questionVar = questionCount; // decrement counter

// Increment Counters + exam Duration
let correctAnswerCount = 0; // increment correct answers
let spansCounter = 0; // bullets counter
let duration = 90;
// Count Down Interval
let countDownInterval;
// Arrays
let wrongQuestions = []; // All Wrong Questions
let wrongAnswersList = []; // All Wrong Answers
let questionIndices = []; // all indices of questions

getQuestions();

async function getQuestions() {
  try {
    let questionsArray = await new Promise((resolve, reject) => {
      let myRequest = new XMLHttpRequest();
      myRequest.onload = function () {
        if (this.readyState == 4 && this.status >= 200 && this.status < 300) {
          resolve(JSON.parse(this.responseText));
          return;
        }
        reject({ status: this.status, statusText: this.statusText });
      };
      myRequest.open("GET", "html_question.json", true);
      myRequest.send();
    });
    setQuestionsAndStartTime(questionsArray);
  } catch ({ status, statusText }) {
    fireSweetAlert(`${status}: failed to connect api`, statusText, "error");
  }
}

function setQuestionsAndStartTime(questions) {
  questionIndices = Array.from(
    { length: questions.length },
    (_, index) => index
  );

  createBullets();
  addQuestion(questions);
  // Count Down Timer
  startCountdown();
  submitAnswerBtn.addEventListener("click", () =>
    submitAnswerHandler(questions)
  );
}

function generateRandomQuestion(questionsArray) {
  let randomQuestionIndex = Math.floor(Math.random() * questionIndices.length);
  let selectedQuestion = questionsArray[questionIndices[randomQuestionIndex]];
  questionIndices = questionIndices.filter(
    (element) => element !== questionIndices[randomQuestionIndex]
  );
  return selectedQuestion;
}

function generateRandomAnswer(
  totalNumberOfAnswers,
  selectedQuestion,
  answersIndices
) {
  // answersIndices points at the same array
  // answers indices have address of the array we can change it here
  let randomAnswerIndex = Math.floor(Math.random() * totalNumberOfAnswers);
  let selectedAnswerIndex = answersIndices[randomAnswerIndex];
  let selectedAnswer = selectedQuestion.answers[selectedAnswerIndex];
  answersIndices.splice(randomAnswerIndex, 1);
  // splices changes the array itself
  return selectedAnswer;
}

function addQuestion(questionsArray) {
  questionArea.innerHTML = "";
  asnwersArea.innerHTML = "";
  if (questionVar-- > 0) {
    // Generate Random Question
    let selectedQuestion = generateRandomQuestion(
      questionsArray,
      questionIndices
    );
    questionArea.textContent = selectedQuestion.title;
    if (selectedQuestion.lang == "ar") {
      document.body.classList.add("rtl");
    } else {
      document.body.classList.remove("rtl");
    }
    let totalCountOfAns = selectedQuestion.answers.length;
    let answersIndices = Array.from(
      { length: totalCountOfAns },
      (_, index) => index
    );
    selectedQuestion.answers.forEach((_, index) => {
      // Generate Random Answer
      let selectedAnswer = generateRandomAnswer(
        totalCountOfAns--,
        selectedQuestion,
        answersIndices // Memory Address
      );
      // Creating DOM Answers Elements
      let answerDiv = document.createElement("div");
      answerDiv.className = "answer";
      // Creating radioInput
      let radioInput = document.createElement("input");
      // Add name, type, id and data-answer
      radioInput.name = "answers";
      radioInput.type = "radio";
      radioInput.id = `answer_${index + 1}`;
      if (index == 0) {
        radioInput.checked = true;
      }
      radioInput.dataset.answer = selectedAnswer;
      let label = document.createElement("label");
      label.setAttribute("for", radioInput.id);
      label.appendChild(document.createTextNode(selectedAnswer));
      answerDiv.append(radioInput, label);
      asnwersArea.appendChild(answerDiv);
    });
    return;
  }
  // Questions Finished Show Results
  showResult();
}

function submitAnswerHandler(questionsArray) {
  // Check Answer Correction
  let radioBtns = document.getElementsByName("answers");
  let currentQuestion = questionsArray.find(
    ({ title }) => title == questionArea.textContent
  );
  let checkedRadio = Array.from(radioBtns).find((radioBtn) => radioBtn.checked);
  if (currentQuestion.right_answer == checkedRadio.dataset.answer) {
    correctAnswerCount++;
  } else {
    wrongAnswersList.push(checkedRadio.dataset.answer);
    wrongQuestions.push(currentQuestion);
  }
  // Move To Next Bullet + Add Next Quesion
  moveBullets();
  addQuestion(questionsArray);
}

function moveBullets() {
  let spansContainer = document.querySelector(".spans-container").children;
  // Time Finished Make All Bullets Enabled
  if (!duration) {
    Array.from(spansContainer).forEach((span) => {
      span.classList.add("on");
      span.classList.remove("current");
    });
    return;
  }
  // User Submit Answer [And There Is Time]
  spansContainer[spansCounter].classList.remove("current");
  // If Reached Last Bullet Add Enabled Class
  if (spansCounter == questionCount - 1) {
    spansContainer[spansCounter].classList.add("on");
    return;
  }
  // Not Last Bullet
  spansContainer[++spansCounter].classList.add("on");
  spansContainer[spansCounter].classList.add("current");
}

function createBullets() {
  questionsCountSpan.innerHTML = questionCount;
  for (let i = 0; i < questionCount; i++)
    spansContainer.appendChild(document.createElement("span"));

  // First Bullet Enabled And Faded-in
  spansContainer.children[0].className = "on current";
}

function showResult() {
  // Stop Time
  clearInterval(countDownInterval);
  questionArea.innerHTML = "";
  asnwersArea.innerHTML = "";
  let rank =
    correctAnswerCount == questionCount
      ? "perfect"
      : correctAnswerCount >= Math.ceil(questionCount / 2) ||
        (correctAnswerCount <= Math.ceil(questionCount / 2) &&
          correctAnswerCount > 3)
      ? "good"
      : "bad";
  // Creating result Container
  let resultContainer = document.createElement("div");
  resultContainer.className = "results";
  // Creating rank span
  let rankSpan = document.createElement("span");
  rankSpan.appendChild(document.createTextNode(rank));
  rankSpan.classList.add(rank);
  // Creating result info containner
  let resultInfo = document.createElement("div");
  // Creating correct questionn span
  let correctSpan = document.createElement("span");
  correctSpan.className = `answered-question ${rank}`;
  correctSpan.appendChild(document.createTextNode(correctAnswerCount));
  // Cloning questions count span
  let totalQuestionsSpan = questionsCountSpan.cloneNode(true);
  totalQuestionsSpan.className = "total-questions";
  resultInfo.append(
    document.createTextNode("You answered "),
    correctSpan,
    document.createTextNode(" out of "),
    totalQuestionsSpan
  );
  resultContainer.append(rankSpan, resultInfo);
  asnwersArea.appendChild(resultContainer);
  submitAnswerBtn.removeEventListener("click", submitAnswerHandler);
  submitAnswerBtn.remove();
  // Logging Wrong Answered Questions + Wrong Answers Of These Questions
  console.table(wrongQuestions);
  console.table(wrongAnswersList);
}

function startCountdown() {
  countDownInterval = setInterval(countDownTimeHandler, 1000);

  function countDownTimeHandler() {
    duration--;
    let minutes = parseInt(duration / 60);
    let seconds = parseInt(duration % 60);
    secondsSpan.innerHTML = seconds < 10 ? `0${seconds}` : seconds;
    minutesSpan.innerHTML = minutes < 10 ? `0${minutes}` : minutes;
    if (!duration) {
      showResult();
      moveBullets();
    }
  }
}

function fireSweetAlert(
  text,
  title,
  icon,
  timer = 0,
  showConfirmButton = true
) {
  Swal.fire({
    icon,
    text,
    title,
    timer,
    showConfirmButton,
  });
}
