let wordArray = []
let correctGuesses = 0
let incorrectGuesses = 0
const baseUrl="https://api.nytimes.com/svc/books/v3"
const apiKey="4K39cESMiMkRHkXhuoPoJSOnV2oWGTaY"

function shuffle(array) { //Fisher-Yates Shuffle. unbiased shuffle algorithm!
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;  
}

async function getRandomBook() {
    let bookList = []
    const response = await fetch(`${baseUrl}/lists/full-overview.json?api-key=${apiKey}`);
    const data = await response.json();
    bookList.push(...data.results.lists[2].books)
    bookList.push(...data.results.lists[3].books)
    bookList.push(...data.results.lists[9].books)
    bookList.push(...data.results.lists[14].books)
    bookList.push(...data.results.lists[17].books)

    const book = shuffle(bookList)[0]

    return [book.title.toLowerCase(), book.author, book.amazon_product_url, book.book_image];
}

function disableKeyboard() {
    const keys = document.querySelectorAll(".key")
    keys.forEach((key) => {
        key.disabled = true
    })
}

function displayAllCharacters() {
    const characters = document.querySelectorAll("li")

    wordArray.forEach((char, index) => {
        if(characters[index].innerHTML === "_") {
            characters[index].innerHTML = char
            characters[index].style.color = "red"
        } else {
            characters[index].style.color = "green"
        }
    })
}

function win() {
    disableKeyboard()
    displayAllCharacters()
    document.getElementById("overlay-text").innerHTML = "You Won!"
    openOverlay()
    document.getElementById("submit-guess").disabled = true
    const bookDiv = document.getElementById("book-info")
    bookDiv.style.display = "block"
}

function lose() {
    disableKeyboard()
    displayAllCharacters()
    document.getElementById("overlay-text").innerHTML = "You Lost!"
    openOverlay()
    document.getElementById("submit-guess").disabled = true
    const bookDiv = document.getElementById("book-info")
    bookDiv.style.display = "block"
}

function drawHangMan() {
    const canvas = document.querySelector("canvas")
    const context = canvas.getContext("2d");

    
    switch(incorrectGuesses) {
        case 1:
            context.beginPath();
            context.arc(320,150, 30, 0, 2 * Math.PI);
            break;
        case 2:
            context.moveTo(320,180);
            context.lineTo(320,280);
            break;
        case 3:
            context.moveTo(320,190);
            context.lineTo(280,230);
            break;
        case 4:
            context.moveTo(320,190);
            context.lineTo(360,230);
            break;
        case 5:
            context.moveTo(320,280);
            context.lineTo(290,330);
            break;
        case 6:
            context.moveTo(320,280);
            context.lineTo(350,330);
            break;
    }

    context.stroke();
}

function verifyChar() {
    const characters = document.querySelectorAll("li")
    const clickedKey = this.innerHTML

    const foundChars = wordArray.reduce((acc, key, index) => {
        if(clickedKey === key) {
            acc.push(index)
            characters[index].innerHTML = key
            correctGuesses += 1
        }

        return acc
    }, [])

    if(foundChars.length !== 0) {
        this.classList.add("key-correct")
    } else {
        this.classList.add("key-incorrect")
        incorrectGuesses += 1
        drawHangMan()
    }

    if(correctGuesses === wordArray.length) {
        win()
    }

    if (incorrectGuesses === 6) {
        lose()
    }

    this.disabled = true
}

function isNumeric(value) {
    return /^\d+$/.test(value);
}

function setupNewWord(wordArray) {
    const ul = document.querySelector("ul");
    ul.innerHTML = "";

    wordArray.forEach((char) => {
        const li = document.createElement("li");

        if(char === " ") {
            li.innerHTML = " "
            correctGuesses += 1
        } else if(char === "," || char === "'" || char === "." || char === "-" || char === ":" || isNumeric(char)) {
            li.innerHTML = char
            correctGuesses += 1
        } else {
            li.innerHTML = "_"
        }

        ul.appendChild(li)
    })
}

function setupGallow(canvas, context) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    context.lineWidth = 8;
    context.strokeStyle = '#111';
    context.beginPath();
    context.rect(100, 300, 150, 50);
    context.moveTo(180,300);
    context.lineTo(180,50);
    context.moveTo(180,50);
    context.lineTo(320,50);
    context.moveTo(320,50);
    context.lineTo(320,120);
    context.stroke();
}

function setupVirtualKeyboard(keys) {
    const keyboardArea = document.getElementById("keyboardArea")
    keyboardArea.innerHTML = ""

    keys.forEach((key) => {
        const button = document.createElement("button");
        button.classList.add("key")
        button.innerHTML = key

        button.addEventListener("click", verifyChar)

        keyboardArea.appendChild(button)
    })
}

function setupBookInfo(author, bookURL, bookImage) {
    const bookDiv = document.getElementById("book-info")
    bookDiv.innerHTML = ""
    bookDiv.style.display = "none"
    const img = document.createElement("img")
    const h3 = document.createElement("h3")
    
    img.src = bookImage
    h3.innerHTML = author
    
    bookDiv.appendChild(img)
    bookDiv.appendChild(h3)
    bookDiv.onclick = () => {
        window.location.href = bookURL;
    };
}

async function init() {
    const book = await getRandomBook()
    correctGuesses = 0
    incorrectGuesses = 0
    const canvas = document.querySelector("canvas")
    const context = canvas.getContext("2d");
    const keys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ç', 'z',
    'x', 'c', 'v', 'b', 'n', 'm']


    wordArray = book[0].split('')

    document.getElementById("submit-guess").disabled = false
    setupNewWord(wordArray)
    setupGallow(canvas, context)
    setupVirtualKeyboard(keys)
    setupBookInfo(book[1], book[2], book[3])
}

function openOverlay() {
    document.getElementById("overlay").style.visibility = "visible";
    document.getElementById("overlay").style.opacity = 1;
}

function closeOverlay() {
    document.getElementById("overlay").style.visibility = "hidden";
    document.getElementById("overlay").style.opacity = 0;
}

function onSubmitGuess() {
    event.preventDefault();
    const wordGuessedArray = document.querySelector("input").value.split('');

    if(wordArray.every((wordArrayValue,i)=> wordArrayValue === wordGuessedArray[i])) {
        displayAllCharacters()
        win()
    } else {
        lose()
    }
}

window.onload = async (event) => {
    await init();
  };