const gameContainerDiv = document.getElementById("game-container");
const startGameContainerDiv = document.getElementById("start-game-container");
const contestTimeText = document.getElementById("contest-time")
const oQuestion = document.getElementById("question");
const questionContainerDiv = document.getElementById("question-container");
const optionContainerDiv = document.getElementById("option-container");
const optionA = document.getElementById("optionA");
const optionB = document.getElementById("optionB");
const optionC = document.getElementById("optionC");
const optionD = document.getElementById("optionD");
const questionPreviewDiv = document.getElementById("question-preview")
const previousButton = document.getElementById("previous-btn");
const nextButton = document.getElementById("next-btn");
const infoQuestionCountText = document.getElementById("info-question-count")
const correctCountText = document.getElementById("correct-count")
const wrongCountText = document.getElementById("wrong-count")
const emptyCountText = document.getElementById("empty-count")
const resultCountInfoDiv = document.getElementById("resultcount-info")
const startGameButton = document.getElementById("start-game-btn")
const messageBox = document.getElementById('message-box');

let questionData = null
let contestTime = 30;
let questionIndex = 0
let contestInterval;

const fetchQuestionData = async () => {
    try {
        const response = await fetch("questionData.json");
        questionData = await response.json();
    } catch (error) {
        showMessage("Soru verileri yüklenemedi.");
    }
};

const startGame = async () => {
    await fetchQuestionData()
    gameContainerDiv.style.display = "block";
    startGameContainerDiv.style.display = "none";
    contestTimeText.innerHTML = `SÜRE: ${contestTime}`;

    contestInterval = setInterval(setContestTime, 1000);
    setQuestionAndOptions();
    setQuestionPreview()
    setQuestionCount()
}

const setContestTime = () => {
    contestTime--;
    if (contestTime === 0) {
        endGame();
    }
    contestTimeText.innerHTML = `SÜRE: ${contestTime}`;
}

const endGame = () => {
    correctCountText.innerHTML = `${questionData.filter(x => x.status == "correct").length}`
    wrongCountText.innerHTML = `${questionData.filter(x => x.status == "wrong").length}`
    emptyCountText.innerHTML = `${questionData.filter(x => x.status == "empty").length}`

    startGameButton.innerText = "Tekrar Oyunu Başlat"
    resultCountInfoDiv.style.display = "block"
    gameContainerDiv.style.display = "none";
    startGameContainerDiv.style.display = "block";

    clearInterval(contestInterval);
    resetContest();
};

const resetContest = () => {
    contestTime = 30
    questionIndex = 0
    updateButtonStates()
}

const setQuestionAndOptions = () => {
    questionContainerDiv.innerHTML = "";
    const { type, question, options, selectedOption } = questionData[questionIndex];

    if (type.name === "audio") {
        questionContainerDiv.appendChild(setCreateAudioElement(type.value));
    } else if (type.name === "image") {
        questionContainerDiv.appendChild(setCreateImageElement(type.value));
    }

    const questionTxt = document.createElement("p");
    questionTxt.innerHTML = question;
    questionContainerDiv.appendChild(questionTxt);

    optionContainerDiv.innerHTML = "";
    options.forEach(({ option, value, isCorrect }) => {
        const optionDiv = document.createElement("div");
        optionDiv.className = "option";

        optionDiv.innerHTML = `
            <span class="optionName">${option}</span>
            <p class="optionText">${value}</p>
        `;

        if (selectedOption) {
            optionDiv.style.backgroundColor = isCorrect ? 'green' : value === selectedOption ? 'red' : '';
        }

        optionDiv.addEventListener("click", () => {
            onPressOption(optionDiv);
            setQuestionPreview();
        });

        optionContainerDiv.appendChild(optionDiv);
    });

    if (selectedOption) setDisabledControl();
};

const setCreateAudioElement = (path) => {
    const audioElement = document.createElement('audio');
    audioElement.controls = true;
    const sourceElement = document.createElement('source');
    sourceElement.src = path;
    sourceElement.type = 'audio/mpeg';
    audioElement.appendChild(sourceElement);
    return audioElement
}
const setCreateImageElement = (path) => {
    const imgElement = document.createElement('img');
    imgElement.src = path;
    imgElement.style.width = "30vh";
    imgElement.style.height = "20vh";
    return imgElement
}
const onPressOption = (selectedOption) => {
    const currentQuestion = questionData[questionIndex];
    const correctOption = currentQuestion.options.find(option => option.isCorrect);
    const selectedOptionText = selectedOption.querySelector('.optionText').textContent;

    questionData[questionIndex].selectedOption = selectedOptionText;
    questionData[questionIndex].status = selectedOptionText === correctOption.value ? "correct" : "wrong";

    selectedOption.style.backgroundColor = selectedOptionText === correctOption.value ? 'green' : 'red';

    if (selectedOptionText !== correctOption.value) {
        const correctElement = Array.from(optionContainerDiv.children).find(option =>
            option.querySelector('.optionText').textContent === correctOption.value
        );
        correctElement.style.backgroundColor = 'green';
    }

    setDisabledControl();
};
const setDisabledControl = () => {
    Array.from(optionContainerDiv.children).forEach(option => option.style.pointerEvents = 'none');
}
const setQuestionPreview = () => {
    questionPreviewDiv.innerHTML = ''; // Önceki içeriği temizle
    questionData.forEach((element, index) => {
        const infoDiv = document.createElement("div");
        infoDiv.className = `infoPreview ${element.status}`;
        infoDiv.id = `${index}Question`;

        infoDiv.addEventListener('click', () => {
            questionIndex = index
            setQuestionAndOptions()
            setQuestionCount(questionData[questionIndex].count)
            updateButtonStates()
        })

        questionPreviewDiv.appendChild(infoDiv);
    });
}

const goNextQuestion = () => {
    questionIndex += 1
    setQuestionAndOptions()
    updateButtonStates()
    setQuestionCount(questionData[questionIndex].count)
}

const goPreviousQuestion = () => {
    questionIndex -= 1
    setQuestionAndOptions()
    updateButtonStates()
    setQuestionCount(questionData[questionIndex].count)
}

const setQuestionCount = (currentQuestion = 1) => {
    infoQuestionCountText.innerHTML = `SORU: ${currentQuestion} / ${questionData.length}`
}

function updateButtonStates() {
    questionIndex === 0 ? previousButton.disabled = true : previousButton.disabled = false;
    questionIndex === questionData.length - 1 ? nextButton.disabled = true : nextButton.disabled = false;
}
function showMessage(message) {
    messageBox.innerHTML = message;
    messageBox.classList.add('visible');
    setTimeout(() => {
        hideMessage()
    }, 2000);
}

function hideMessage() {
    messageBox.classList.remove('visible');
}