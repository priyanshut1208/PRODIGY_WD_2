const welcomePage = document.getElementById('welcomePage');
const gamePage = document.getElementById('gamePage');
const cells = document.querySelectorAll('.cell');
const statusText = document.querySelector('.status');
const restartButton = document.getElementById('restartButton');
const backButton = document.getElementById('backButton');
const aiDifficultySelect = document.getElementById('aiDifficulty');
const aiSettings = document.getElementById('aiSettings');
const scorecard = document.getElementById('scorecard');
const scoreXElement = document.getElementById('scoreX');
const scoreOElement = document.getElementById('scoreO');

let currentPlayer = 'X';
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];
let isAI = false; // Check if playing against AI
let aiLevel = 'easy'; // Default AI level
let scoreX = 0;
let scoreO = 0;

const winConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

const handleCellClick = (clickedCellEvent) => {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (gameState[clickedCellIndex] !== "" || !gameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();

    if (isAI && gameActive && currentPlayer === 'O') {
        setTimeout(() => handleAIMove(aiLevel), 500); // AI makes a move based on difficulty
    }
};

const handleCellPlayed = (clickedCell, clickedCellIndex) => {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.innerHTML = currentPlayer;
};

const handleResultValidation = () => {
    let roundWon = false;
    for (let i = 0; i < winConditions.length; i++) {
        const winCondition = winConditions[i];
        let a = gameState[winCondition[0]];
        let b = gameState[winCondition[1]];
        let c = gameState[winCondition[2]];
        if (a === '' || b === '' || c === '') {
            continue;
        }
        if (a === b && b === c) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusText.innerHTML = `Player ${currentPlayer} has won!`;
        gameActive = false;
        updateScore(currentPlayer);
        return;
    }

    let roundDraw = !gameState.includes("");
    if (roundDraw) {
        statusText.innerHTML = 'Game ended in a draw!';
        gameActive = false;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusText.innerHTML = `It's ${currentPlayer}'s turn`;
};

const updateScore = (winner) => {
    if (winner === 'X') {
        scoreX++;
        scoreXElement.innerHTML = `X: ${scoreX}`;
    } else if (winner === 'O') {
        scoreO++;
        scoreOElement.innerHTML = `O: ${scoreO}`;
    }
};

const handleRestartGame = () => {
    currentPlayer = 'X';
    gameActive = true;
    gameState = ["", "", "", "", "", "", "", "", ""];
    statusText.innerHTML = "It's X's turn";
    cells.forEach(cell => cell.innerHTML = "");
};

const handleAIMove = (level) => {
    let emptyCells = [];
    for (let i = 0; i < gameState.length; i++) {
        if (gameState[i] === "") {
            emptyCells.push(i);
        }
    }

    if (emptyCells.length > 0) {
        let aiMoveIndex;

        switch (level) {
            case 'medium':
                aiMoveIndex = mediumAIMove(emptyCells);
                break;
            case 'hard':
                aiMoveIndex = hardAIMove();
                break;
            default:
                aiMoveIndex = easyAIMove(emptyCells);
                break;
        }

        handleCellPlayed(cells[aiMoveIndex], aiMoveIndex);
        handleResultValidation();
    }
};

const easyAIMove = (emptyCells) => {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

const mediumAIMove = (emptyCells) => {
    // Medium AI logic: random move with basic strategy
    return easyAIMove(emptyCells); // Placeholder, add more strategy if needed
};

const hardAIMove = () => {
    // Hard AI logic: use Minimax algorithm
    return minimax(gameState, 'O').index;
};

const minimax = (board, player) => {
    const availableMoves = board.reduce((acc, cell, index) => {
        if (cell === "") acc.push(index);
        return acc;
    }, []);

    if (checkWin(board, 'X')) return { score: -10 };
    if (checkWin(board, 'O')) return { score: 10 };
    if (availableMoves.length === 0) return { score: 0 };

    const moves = [];

    for (const move of availableMoves) {
        const newBoard = board.slice();
        newBoard[move] = player;
        const result = minimax(newBoard, player === 'O' ? 'X' : 'O');
        moves.push({
            index: move,
            score: result.score
        });
    }

    let bestMove;
    if (player === 'O') {
        const bestScore = Math.max(...moves.map(move => move.score));
        bestMove = moves.find(move => move.score === bestScore);
    } else {
        const bestScore = Math.min(...moves.map(move => move.score));
        bestMove = moves.find(move => move.score === bestScore);
    }

    return bestMove;
};

const checkWin = (board, player) => {
    return winConditions.some(condition => {
        return condition.every(index => board[index] === player);
    });
};

// Mode Selection
document.getElementById('individualMode').addEventListener('click', () => {
    isAI = true;
    welcomePage.classList.add('hidden');
    gamePage.classList.remove('hidden');
    currentPlayer = 'X';
    aiSettings.classList.remove('hidden');
    scorecard.classList.add('hidden'); // Hide scorecard if in AI mode
    switchMode('individual-mode');
});

document.getElementById('friendMode').addEventListener('click', () => {
    isAI = false;
    welcomePage.classList.add('hidden');
    gamePage.classList.remove('hidden');
    currentPlayer = 'X';
    aiSettings.classList.add('hidden'); // Hide AI settings if in friend mode
    scorecard.classList.remove('hidden'); // Show scorecard if in friend mode
    switchMode('friend-mode');
});

backButton.addEventListener('click', () => {
    gamePage.classList.add('hidden');
    welcomePage.classList.remove('hidden');
    switchMode('welcome-mode');
    handleRestartGame();
});

restartButton.addEventListener('click', handleRestartGame);

aiDifficultySelect.addEventListener('change', (event) => {
    aiLevel = event.target.value; // Set AI level based on user selection
    handleRestartGame(); // Automatically reset the game
});

cells.forEach(cell => cell.addEventListener('click', handleCellClick));

const switchMode = (mode) => {
    document.querySelector('.image-container.active').classList.remove('active');
    document.querySelector(`.image-container.${mode}`).classList.add('active');
};
