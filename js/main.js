// HTML Elements Selection
let questionsCountSpan = document.querySelector(".quiz-info .count span");
let spansContainer = document.querySelector(".bullets .spans-container");
let asnwersArea = document.querySelector(".answers-area");
let secondsSpan = document.querySelector(".count-down .seconds");
let minutesSpan = document.querySelector(".count-down .minutes");
let questionArea = document.querySelector(".quiz-area h2");
let submitAnswerBtn = document.getElementById("submit-btn");
let questionCount = 7; // Number of questions to show

// Decrement Counters + Increment Counters
let questionVar = questionCount; // decrement counter
let correctAnswerCount = 0; // increment correct answers
let spansCounter = 0; // bullets counter
let duration = 90;
// Arrays
let questionIndices; // array contains all indices of json object questions
let wrongQuestions = []; // All Wrong Questions
let wrongAnswersList = []; // All Wrong Answers

// Count Down Timer
let countDownInterval = setInterval(countDownTimeHandler, 1000);

getQuestions().then((questionsArray) => {
  questionIndices = Array.from(
    { length: questionsArray.length },
    (_, index) => index
  );
  createBullets();
  addQuestion(questionsArray);
  submitAnswerBtn.addEventListener("click", () =>
    submitAnswerHandler(questionsArray)
  );
});

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
  // answers indices have address of the array we can change it here
  let randomAnswerIndex = Math.floor(Math.random() * totalNumberOfAnswers);
  let selectedAnswerIndex = answersIndices[randomAnswerIndex];
  let selectedAnswer = selectedQuestion.answers[selectedAnswerIndex];
  answersIndices.splice(randomAnswerIndex, 1);
  return selectedAnswer;
}

function addQuestion(questionsArray) {
  questionArea.innerHTML = "";
  asnwersArea.innerHTML = "";
  if (questionVar > 0) {
    questionVar--;
    // Generate Random Question
    let selectedQuestion = generateRandomQuestion(questionsArray);
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
  // console.table(wrongQuestions);
  // console.table(wrongAnswersList);
}

function countDownTimeHandler() {
  duration--;
  let minutes = parseInt(duration / 60);
  let seconds = parseInt(duration % 60);
  secondsSpan.innerHTML = seconds < 10 ? `0${seconds}` : seconds;
  minutesSpan.innerHTML = minutes < 10 ? `0${minutes}` : minutes;
  if (!duration) {
    clearInterval(countDownInterval);
    showResult();
    moveBullets();
  }
}

async function getQuestions() {
  try {
    return await new Promise((resolve, reject) => {
      let myRequest = new XMLHttpRequest();
      myRequest.onload = function () {
        if (this.readyState == 4 && this.status == 200) {
          resolve(JSON.parse(this.responseText));
        } else {
          reject([this.status, this.statusText]);
        }
      };
      myRequest.open("GET", "html_question.json", true);
      myRequest.send();
    });
  } catch (err) {
    console.log(err[0], err[1]);
  }
}
