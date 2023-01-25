let questionsCountSpan = document.querySelector(".quiz-info .count span");
let spansContainer = document.querySelector(".bullets .spans-container");
let asnwersArea = document.querySelector(".answers-area");
let secondsSpan = document.querySelector(".count-down .seconds");
let minutesSpan = document.querySelector(".count-down .minutes");
let questionCount = 7; // Number of questions to show
let questionVar = questionCount; // decrement counter
let correctAnswerCount = 0; // increment correct answers
let spansCounter = 0; // bullets counter
let questionArea = document.querySelector(".quiz-area h2");
let questionIndices; // array contains all indices of json file questions

// count Down Timer
let countDownInterval = setInterval(countDownTimeHandler, 1000);

getQuestions().then((questionsArray) => {
  createBullets(questionCount);
  questionIndices = Array.from(
    { length: questionsArray.length },
    (_, index) => index
  );
  addQuestion(questionsArray);
  document
    .getElementById("submit-btn")
    .addEventListener("click", () => checkAnswer(questionsArray));
});
function generateRandomQuestion(questionsArray) {
  let randomQuestionIndex = Math.floor(Math.random() * questionIndices.length);
  let selectedQuestion = questionsArray[questionIndices[randomQuestionIndex]];
  questionIndices = questionIndices.filter(
    (element) => element !== questionIndices[randomQuestionIndex]
  );
  return selectedQuestion;
}
function generateRandomAnswer(answersLength, selectedQuestion, answersIndices) {
  // answers indices have address of the array we can change it here
  let randomAnswerIndex = Math.floor(Math.random() * answersLength);
  let selectedAnswerIndex = answersIndices[randomAnswerIndex];
  let selectedAnswer = selectedQuestion.answers[selectedAnswerIndex];
  answersIndices.splice(randomAnswerIndex, 1);
  return selectedAnswer;
}
function addQuestion(questionsArray) {
  questionArea.innerHTML = "";
  asnwersArea.innerHTML = "";
  // get random Question
  if (questionVar > 0) {
    questionVar--;
    let selectedQuestion = generateRandomQuestion(questionsArray);
    questionArea.textContent = selectedQuestion.title;
    if (selectedQuestion.lang == "ar") {
      document.body.classList.add("rtl");
    } else {
      document.body.classList.remove("rtl");
    }
    let answersIndices = Array.from(
      { length: selectedQuestion.answers.length },
      (_, index) => index
    );
    let answersLength = selectedQuestion.answers.length;
    selectedQuestion.answers.forEach((_, index) => {
      // generate Random Questionn
      let selectedAnswer = generateRandomAnswer(
        answersLength--,
        selectedQuestion,
        answersIndices // Memory Address
      );
      console.log(answersIndices);
      // Creating DOM answers Elements
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
  showResult(countDownInterval);
}
function checkAnswer(questionsArray) {
  let radioBtns = document.getElementsByName("answers");
  let currentQuestion = questionsArray.find(
    ({ title }) => title == questionArea.textContent
  );
  console.log(currentQuestion.right_answer);
  let checkRadio = Array.from(radioBtns).find((radioBtn) => radioBtn.checked);
  if (currentQuestion.right_answer == checkRadio.dataset.answer) {
    correctAnswerCount++;
  }
  moveBullets();
  addQuestion(questionsArray);
}
function moveBullets() {
  let spansContainer = document.querySelector(".spans-container").children;
  // Time finished make all spans enabled
  if (!parseInt(minutesSpan.innerHTML) && !parseInt(secondsSpan.innerHTML)) {
    Array.from(spansContainer).forEach((span) => {
      span.classList.add("on");
      span.classList.remove("current");
    });
    return;
  }
  //  submit answer [there is time]
  spansContainer[spansCounter].classList.remove("current");
  if (spansCounter == questionCount - 1) {
    spansContainer[spansCounter].classList.add("on");
    return;
  }
  spansContainer[++spansCounter].classList.add("on");
  spansContainer[spansCounter].classList.add("current");
}
function showResult(countDownInterval) {
  // stop time
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
  removeEventListener("click", checkAnswer);
  document.getElementById("submit-btn").remove();
}
function createBullets(numberOfQuestions) {
  questionsCountSpan.innerHTML = numberOfQuestions;
  for (let i = 0; i < numberOfQuestions; i++) {
    spansContainer.appendChild(document.createElement("span"));
  }
  spansContainer.children[0].className = "on current";
}
function countDownTimeHandler() {
  secondsSpan.innerHTML =
    parseInt(secondsSpan.innerHTML) - 1 < 10
      ? `0${parseInt(secondsSpan.innerHTML) - 1}`
      : parseInt(secondsSpan.innerHTML) - 1;
  if (!parseInt(secondsSpan.innerHTML) && parseInt(minutesSpan.innerHTML)) {
    minutesSpan.innerHTML =
      parseInt(minutesSpan.innerHTML) - 1 < 10
        ? `0${parseInt(minutesSpan.innerHTML) - 1}`
        : parseInt(minutesSpan.innerHTML) - 1;
    secondsSpan.innerHTML = "59";
  }
  // time finished
  if (!parseInt(secondsSpan.innerHTML) && !parseInt(minutesSpan.innerHTML)) {
    showResult(countDownInterval);
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
