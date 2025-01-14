const oContinueGameContainer = document.getElementById("continueGameContainer");
const oStartGameContainer = document.getElementById("startGameContainer");
const oQuestion = document.getElementById("question");
const questionContainerDiv = document.getElementById("questionContainer");

const oOptionContainer = document.getElementById("optionContainer");
const optionA = document.getElementById("optionA");
const optionB = document.getElementById("optionB");
const optionC = document.getElementById("optionC");
const optionD = document.getElementById("optionD");
const questionPreviewDiv = document.getElementById("question-preview")
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const infoQuestionCount = document.getElementById("infoQuestionCount")
const contestTimeText = document.getElementById("contestTime")
const correctCountText = document.getElementById("correctCount")
const wrongCountText = document.getElementById("wrongCount")
const emptyCountText = document.getElementById("emptyCount")

var questionData = null
let contestTime = 5;
let questionIndex = 0
let contestInterval;

async function fetchQuestionData() {
    const response = await fetch('questionData.json');
    const data = await response.json();
    return data;
}

fetchQuestionData().then(res => {
    questionData = res;
});


const startGame = () => {
    oContinueGameContainer.style.display = "block";
    oStartGameContainer.style.display = "none";
    contestTimeText.innerHTML = `SÜRE: ${contestTime}`;

    contestInterval = setInterval(countDown, 1000);

    setQuestionAndOptions(questionData[questionIndex]);
    setQuestionPreview()
    setQuestionCount()
}

const countDown = () => {
    contestTime--;
    if (contestTime == 0) {
        correctCountText.innerHTML = `${questionData.filter(x => x.type == "correct").length}`
        wrongCountText.innerHTML = `${questionData.filter(x => x.type == "wrong").length}`
        emptyCountText.innerHTML = `${questionData.filter(x => x.type == "empty").length}`
        oContinueGameContainer.style.display = "none";
        oStartGameContainer.style.display = "block";
        clearInterval(contestInterval);
    }

    contestTimeText.innerHTML = `SÜRE: ${contestTime}`;

}
const setQuestionAndOptions = (data) => {

    const audioElement = setCreateAudioElement('sevdindenelerettin.mp3')
    // questionContainerDiv.prepend(audioElement);
    console.log(data);

    oOptionContainer.innerHTML = ""
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

        oOptionContainer.appendChild(option);
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
        selectedOption.style.backgroundColor = 'green';
        questionData[questionIndex].type = "correct"
    } else {
        questionData[questionIndex].type = "wrong"
        selectedOption.style.backgroundColor = 'red';
        // Doğru cevabı yeşil yap
        const correctElement = Array.from(oOptionContainer.children).find(option => {
            return option.querySelector('.optionText').textContent === correctOption.value;
        });
        correctElement.style.backgroundColor = 'green';
    }
}

const setQuestionCount = (currentQuestion = 1) => {
    infoQuestionCount.innerHTML = `SORU: ${currentQuestion} / ${questionData.length}`

}
const setDisabledControl = () => {
    Array.from(oOptionContainer.children).forEach(x => x.style.pointerEvents = 'none');
}
const setQuestionPreview = () => {
    questionPreviewDiv.innerHTML = ''; // Önceki içeriği temizle
    questionData.forEach((element, index) => {
        const infoDiv = document.createElement("div");
        infoDiv.className = "infoPreview"
        infoDiv.className += " " + element.type;
        infoDiv.id = index + "Question";

        infoDiv.addEventListener('click', () => {
            setQuestionAndOptions(element)
        })

        questionPreviewDiv.appendChild(infoDiv);
    });
}

const goNextQuestion = () => {
    questionIndex += 1
    setQuestionAndOptions(questionData[questionIndex])
    updateButtonStates()
    setQuestionCount(questionData[questionIndex].count)
}

const goPreviousQuestion = () => {
    questionIndex -= 1
    setQuestionAndOptions(questionData[questionIndex])
    updateButtonStates()
    setQuestionCount(questionData[questionIndex].count)
}


function updateButtonStates() {
    questionIndex === 0 ? prevButton.disabled = true : prevButton.disabled = false;
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