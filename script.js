const gameContainer = document.getElementById("game");
const setGame = document.getElementById('set-game');
const resetGame = document.getElementById('reset-game');
const refreshGameBtn = document.getElementById('refresh-game-btn');
const newGameBtn = document.getElementById('new-game-btn');
let cardCount = 0;
let scoreSpan = document.getElementById('score');
let bestScore = document.getElementById('best-score');
let bestScoreSpan = bestScore.getElementsByTagName('span')[0];
let score = 0;
let congrats;

const COLORS = [
  "git",
  "javascript",
  "nodejs",
  "sass",
  "react",
  "python",
  "git",
  "javascript",
  "nodejs",
  "sass",
  "react",
  "python"
];

resetGame.style.display = 'none';
gameContainer.style.display = 'none';

function setColorArray(cardCount, colors) {
  if (cardCount == 12) return colors;

  let adjustedCardCount = cardCount == 4
    ? 4
    : cardCount == 6
    ? 3
    : cardCount == 8
    ? 2
    : cardCount == 10
    ? 1
    : 0;

  let randomIndicies = [];
  while (randomIndicies.length < adjustedCardCount) {
    let newIndex = Math.floor(Math.random() * (colors.length / 2));
    if (!randomIndicies.includes(colors[newIndex])) {
      randomIndicies.push(colors[newIndex]);
    }
  }
  return colors.filter(color => !randomIndicies.includes(color));
}

// here is a helper function to shuffle an array
// it returns the same array with values shuffled
// it is based on an algorithm called Fisher Yates if you want ot research more
function shuffle(array) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}

function setCongratsMessage() {
  congrats = document.createElement('h1');
  congrats.classList.add('congrats');
  congrats.innerText = "Congrats!";
  gameContainer.append(congrats);
}

function setNewGame() {
  setCongratsMessage();
  setGame.style.display = 'none';
  resetGame.style.display = 'block';
  if (cardCount == 6) {
    gameContainer.className = 'six-cards';
  }
  if (cardCount == 10) {
    gameContainer.className = 'ten-cards';
  }
  let newColors = setColorArray(cardCount, COLORS);
  let shuffledColors = shuffle(newColors);
  createDivsForColors(shuffledColors);
}

function setBestScore() {
  let bestScoreStorage = localStorage.getItem('bestScore');
  if (bestScoreStorage) {
    bestScoreSpan.innerText = bestScoreStorage;
  }
}

// Set new game
setGame.addEventListener('submit', function (event) {
  event.preventDefault();
  setBestScore();
  resetScore();
  cardCount = event.target.elements["card-count"].value;
  setNewGame(event);
});

// Refresh game
refreshGameBtn.addEventListener('click', function (event) {
  event.preventDefault();
  setBestScore();
  resetScore();
  gameContainer.innerHTML = '';
  setTimeout(function () {
    setNewGame(cardCount);
  }, 300);
});

newGameBtn.addEventListener('click', function () {
  location.reload();
});

function resetScore() {
  score = 0;
  scoreSpan.innerText = score;
}

// this function loops over the array of colors
// it creates a new div and gives it a class with the value of the color
// it also adds an event listener for a click for each card
function createDivsForColors(colorArray) {
  for (let color of colorArray) {
    // create a new div
    const newDiv = document.createElement("div");
    const card = document.createElement("div");
    const cardFront = document.createElement("div");
    const cardBack = document.createElement("div");

    // give it a class attribute for the value we are looping over
    newDiv.classList.add('scene', color);
    card.className = 'card';
    cardFront.classList.add('card__face', 'card__face--front');
    cardBack.classList.add('card__face', 'card__face--back');
    card.append(cardFront);
    card.append(cardBack);
    newDiv.append(card);

    // call a function handleCardClick when a div is clicked on
    newDiv.addEventListener("click", handleCardClick);
    newDiv.addEventListener("mouseover", handleCardMouseOver);
    newDiv.addEventListener("mouseout", handleCardMouseOut);

    // append the div to the element with an id of game
    gameContainer.append(newDiv);
  }
  gameContainer.style.display = 'block';
}

function matchOrFlipCards(cards) {
  let selected = [];
  for (let card of cards) {
    for (let name of COLORS) {
      if (card.classList.contains(name)) {
        if (selected.indexOf(name) === -1) {
          selected.push(name);
        }
      }
    }
  }
  if (selected.length === 1) {
    score += 1;
    scoreSpan.innerText = score;
    for (let card of cards) {
      card.classList.add('matched');
      card.classList.remove('selected');
    }
    let matched = document.querySelectorAll('.matched');
    if (matched.length == cardCount) {
      congrats.classList.add('game-over');
      // TODO: localStorage
      let bestScoreStorage = localStorage.getItem('bestScore');
      if (!bestScoreStorage) {
        bestScoreSpan.innerText = score;
        localStorage.setItem('bestScore', score);
      } else if (score > bestScoreStorage) {
        bestScoreSpan.innerText = score;
        localStorage.setItem('bestScore', score);
      }
    }
  } else {
    if (score > 0) {
      score -= .5;
      scoreSpan.innerText = score;
    }
    for (let card of cards) {
      card.classList.remove('selected');
      // need to remove child class of flipped
      card.children[0].classList.remove('is-raised', 'is-flipped-and-raised', 'is-flipped-not-raised');
    }
  }
}

function handleCardClick(event) {
  if (event.target.parentElement.parentElement.classList.contains('matched') || event.target.parentElement.classList.contains('selected')) return;
  if (event.target.classList.contains('card__face--front')) {
    event.target.parentElement.parentElement.classList.add('selected');
    const selected = gameContainer.querySelectorAll('.selected');
    if (selected.length === 2) {
      setTimeout(function () {
        matchOrFlipCards(selected);
      }, 1000)
    } else if (selected.length > 2) {
      return;
    }

    if (event.target.parentElement.classList.contains('is-flipped-and-raised')) {
      event.target.parentElement.classList.remove('is-flipped-and-raised');
      event.target.parentElement.classList.add('is-raised');
    } else {
      event.target.parentElement.classList.add('is-flipped-and-raised');
      event.target.parentElement.classList.remove('is-raised');
    }
  }
}

function handleCardMouseOver(event) {
  if (event.target.parentElement.parentElement.classList.contains('matched')) return;
  if (event.target.parentElement.classList.contains('card')) {
    if (!event.target.parentElement.classList.contains('is-flipped-and-raised') && !event.target.parentElement.classList.contains('is-flipped-not-raised')) {
      event.target.parentElement.classList.add('is-raised');
    } else if (event.target.parentElement.classList.contains('is-flipped-not-raised')) {
      event.target.parentElement.classList.remove('is-flipped-not-raised');
      event.target.parentElement.classList.add('is-flipped-and-raised');
    }
  }
}

function handleCardMouseOut(event) {
  if (event.target.parentElement.classList.contains('is-flipped-and-raised')) {
    event.target.parentElement.classList.remove('is-flipped-and-raised');
    event.target.parentElement.classList.add('is-flipped-not-raised');
  } else if (!event.target.parentElement.classList.contains('is-flipped-and-raised')) {
    event.target.parentElement.classList.remove('is-raised');
  }
}
