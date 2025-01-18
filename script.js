const gameContainerDiv = document.getElementById("game-container");
const startGameContainerDiv = document.getElementById("start-game-container");
const contestTimeText = document.getElementById("contest-time")
const oQuestion = document.getElementById("question");
const questionContainerDiv = document.getElementById("questionContainer");
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

var questionData = null
let contestTime = 10;
let questionIndex = 0
let contestInterval;

const fetchQuestionData = async () => {
    const response = await fetch('questionData.json');
    const data = await response.json();
    questionData = data
}

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
    if (contestTime == 0) {
        correctCountText.innerHTML = `${questionData.filter(x => x.type == "correct").length}`
        wrongCountText.innerHTML = `${questionData.filter(x => x.type == "wrong").length}`
        emptyCountText.innerHTML = `${questionData.filter(x => x.type == "empty").length}`

        startGameButton.innerText = "Tekrar Oyunu Başlat"
        resultCountInfoDiv.style.display = "block"
        gameContainerDiv.style.display = "none";
        startGameContainerDiv.style.display = "block";

        clearInterval(contestInterval);
        resetContest()
    }
    contestTimeText.innerHTML = `SÜRE: ${contestTime}`;
}

const resetContest = () => {
    contestTime = 10
    questionIndex = 0
    updateButtonStates()
}

const setQuestionAndOptions = () => {
    const data = questionData[questionIndex]
    const audioElement = setCreateAudioElement('sevdindenelerettin.mp3')
    // questionContainerDiv.prepend(audioElement);

    optionContainerDiv.innerHTML = ""
    oQuestion.innerHTML = data.question;
    data.options.forEach((element) => {
        const option = document.createElement("div");
        const optionName = document.createElement("span");
        const optionText = document.createElement("p");

        option.className = "option"
        optionName.className = "optionName"
        optionText.className = "optionText"

        optionName.innerHTML = element.option;
        optionText.innerHTML = element.value;

        if (data.selectedOption) {
            option.style.backgroundColor = element.isCorrect ? 'green' : element.value === data.selectedOption ? 'red' : '';
        }


        option.addEventListener("click", () => {
            onPressOption(option)
            setDisabledControl()
            setQuestionPreview()
        })

        option.appendChild(optionName);
        option.appendChild(optionText);

        optionContainerDiv.appendChild(option);

        if(!!data.selectedOption) setDisabledControl()
    })

}

const setCreateAudioElement = (path) => {
    // Audio elementini oluşturun
    const audioElement = document.createElement('audio');
    audioElement.controls = true;
    const sourceElement = document.createElement('source');
    sourceElement.src = path;
    sourceElement.type = 'audio/mpeg';
    audioElement.appendChild(sourceElement);
    return audioElement
}
const onPressOption = (selectedOption) => {
    const currentQuestion = questionData[questionIndex];
    const correctOption = currentQuestion.options.find(option => option.isCorrect);

    const selectedOptionText = selectedOption.querySelector('.optionText').textContent;
    questionData[questionIndex].selectedOption = selectedOptionText

    if (selectedOptionText === correctOption.value) {
        questionData[questionIndex].type = "correct"
        selectedOption.style.backgroundColor = 'green';
    } else {
        questionData[questionIndex].type = "wrong"
        selectedOption.style.backgroundColor = 'red';

        const correctElement = Array.from(optionContainerDiv.children).find(option => {
            return option.querySelector('.optionText').textContent === correctOption.value;
        });
        correctElement.style.backgroundColor = 'green';
    }
}
const setDisabledControl = () => {
    Array.from(optionContainerDiv.children).forEach(x => x.style.pointerEvents = 'none');
}
const setQuestionPreview = () => {
    questionPreviewDiv.innerHTML = ''; // Önceki içeriği temizle
    questionData.forEach((element, index) => {
        const infoDiv = document.createElement("div");
        infoDiv.className = "infoPreview"
        infoDiv.className += " " + element.type;
        infoDiv.id = index + "Question";

        infoDiv.addEventListener('click', () => {
            questionIndex = index
            setQuestionAndOptions()
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
    const messageBox = document.getElementById('messageBox');
    messageBox.innerHTML = message;
    messageBox.classList.add('visible');
    setTimeout(() => {
        hideMessage()
    }, 2000);
}

function hideMessage() {
    const messageBox = document.getElementById('messageBox');
    messageBox.classList.remove('visible');
}