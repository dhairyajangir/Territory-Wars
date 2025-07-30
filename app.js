/**
 * TERRITORY WARS - Turn-Based Strategy Game
 * 
 * Game Rules:
 * - 8x8 grid board for 2 players
 * - Players alternate turns placing pieces
 * - Win immediately by getting 4 pieces in a row (any direction)
 * - If board fills without 4-in-a-row, winner determined by territory control
 * - Territory = connected regions of same-colored pieces (orthogonally adjacent)
 * - Session scores persist until page refresh
 */

// Game State Management
const GameState = {
    board: [],
    currentPlayer: 1,
    turnNumber: 1,
    gameActive: true,
    scores: { player1: 0, player2: 0 },
    boardSize: 8
};

// Player Configuration
const Players = {
    1: { name: 'Player 1', symbol: '●', color: 'player1', displayColor: '#1FB8CD' },
    2: { name: 'Player 2', symbol: '●', color: 'player2', displayColor: '#DB4545' }
};

// DOM Elements
let gameBoard, currentPlayerIndicator, currentPlayerSymbol, currentPlayerName;
let gameMessage, turnNumber, player1Score, player2Score;
let restartButton, resetScoresButton, gameOverModal, playAgainButton;

// Game Initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeDOM();
    initializeGame();
    setupEventListeners();
});

/**
 * Initialize DOM element references
 */
function initializeDOM() {
    gameBoard = document.getElementById('gameBoard');
    currentPlayerIndicator = document.getElementById('currentPlayerIndicator');
    currentPlayerSymbol = document.getElementById('currentPlayerSymbol');
    currentPlayerName = document.getElementById('currentPlayerName');
    gameMessage = document.getElementById('gameMessage');
    turnNumber = document.getElementById('turnNumber');
    player1Score = document.getElementById('player1Score');
    player2Score = document.getElementById('player2Score');
    restartButton = document.getElementById('restartButton');
    resetScoresButton = document.getElementById('resetScoresButton');
    gameOverModal = document.getElementById('gameOverModal');
    playAgainButton = document.getElementById('playAgainButton');
}

/**
 * Set up event listeners for game interactions
 */
function setupEventListeners() {
    restartButton.addEventListener('click', startNewGame);
    resetScoresButton.addEventListener('click', resetScores);
    playAgainButton.addEventListener('click', () => {
        hideGameOverModal();
        startNewGame();
    });

    // Close modal when clicking outside
    gameOverModal.addEventListener('click', (e) => {
        if (e.target === gameOverModal) {
            hideGameOverModal();
        }
    });

    // Keyboard accessibility for modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !gameOverModal.classList.contains('hidden')) {
            hideGameOverModal();
        }
    });
}

/**
 * Initialize or reset the game state
 */
function initializeGame() {
    // Reset game state
    GameState.board = Array(GameState.boardSize).fill().map(() => Array(GameState.boardSize).fill(0));
    GameState.currentPlayer = 1;
    GameState.turnNumber = 1;
    GameState.gameActive = true;

    // Create game board
    createGameBoard();
    updateUI();
}

/**
 * Create the visual game board with clickable cells
 */
function createGameBoard() {
    gameBoard.innerHTML = '';
    
    for (let row = 0; row < GameState.boardSize; row++) {
        for (let col = 0; col < GameState.boardSize; col++) {
            const cell = document.createElement('button');
            cell.className = 'game-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.setAttribute('aria-label', `Cell ${row + 1}, ${col + 1}`);
            
            cell.addEventListener('click', () => handleCellClick(row, col));
            
            gameBoard.appendChild(cell);
        }
    }
}

/**
 * Handle cell click events
 */
function handleCellClick(row, col) {
    // Check if game is active and cell is empty
    if (!GameState.gameActive || GameState.board[row][col] !== 0) {
        return;
    }

    makeMove(row, col);
}

/**
 * Execute a player move
 */
function makeMove(row, col) {
    // Place piece on board
    GameState.board[row][col] = GameState.currentPlayer;
    
    // Update visual board
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.textContent = Players[GameState.currentPlayer].symbol;
    cell.classList.add('occupied', Players[GameState.currentPlayer].color);
    cell.setAttribute('aria-label', `${Players[GameState.currentPlayer].name} piece at ${row + 1}, ${col + 1}`);

    // Check for win conditions
    const winResult = checkWinConditions();
    
    if (winResult.hasWon) {
        handleGameEnd(winResult);
        return;
    }

    // Check for board full (territory control game)
    if (isBoardFull()) {
        const territoryResult = calculateTerritoryControl();
        handleGameEnd(territoryResult);
        return;
    }

    // Switch turns
    switchTurn();
}

/**
 * Check for 4-in-a-row win condition - comprehensive board scan
 */
function checkWinConditions() {
    const player = GameState.currentPlayer;
    const directions = [
        [0, 1],   // horizontal
        [1, 0],   // vertical
        [1, 1],   // diagonal \
        [1, -1]   // diagonal /
    ];

    // Check entire board for winning combinations
    for (let row = 0; row < GameState.boardSize; row++) {
        for (let col = 0; col < GameState.boardSize; col++) {
            if (GameState.board[row][col] === player) {
                // Check each direction from this position
                for (const [dRow, dCol] of directions) {
                    const winningCells = [];
                    let currentRow = row;
                    let currentCol = col;
                    
                    // Count consecutive pieces in this direction
                    while (
                        currentRow >= 0 && currentRow < GameState.boardSize &&
                        currentCol >= 0 && currentCol < GameState.boardSize &&
                        GameState.board[currentRow][currentCol] === player
                    ) {
                        winningCells.push({ row: currentRow, col: currentCol });
                        currentRow += dRow;
                        currentCol += dCol;
                    }
                    
                    // If we found 4 or more in a row, we have a winner
                    if (winningCells.length >= 4) {
                        return {
                            hasWon: true,
                            winner: player,
                            type: 'four_in_a_row',
                            winningCells: winningCells
                        };
                    }
                }
            }
        }
    }

    return { hasWon: false };
}

/**
 * Check if the board is completely full
 */
function isBoardFull() {
    for (let row = 0; row < GameState.boardSize; row++) {
        for (let col = 0; col < GameState.boardSize; col++) {
            if (GameState.board[row][col] === 0) {
                return false;
            }
        }
    }
    return true;
}

/**
 * Calculate territory control using flood fill algorithm
 */
function calculateTerritoryControl() {
    const visited = Array(GameState.boardSize).fill().map(() => Array(GameState.boardSize).fill(false));
    const territories = { 1: 0, 2: 0 };

    for (let row = 0; row < GameState.boardSize; row++) {
        for (let col = 0; col < GameState.boardSize; col++) {
            if (!visited[row][col] && GameState.board[row][col] !== 0) {
                const territorySize = floodFill(row, col, GameState.board[row][col], visited);
                territories[GameState.board[row][col]] += territorySize;
            }
        }
    }

    // Determine winner
    let winner = 0;
    let type = 'draw';
    
    if (territories[1] > territories[2]) {
        winner = 1;
        type = 'territory_control';
    } else if (territories[2] > territories[1]) {
        winner = 2;
        type = 'territory_control';
    }

    return {
        hasWon: winner !== 0,
        winner: winner,
        type: type,
        territories: territories
    };
}

/**
 * Flood fill algorithm to calculate connected territory
 */
function floodFill(row, col, player, visited) {
    if (row < 0 || row >= GameState.boardSize || col < 0 || col >= GameState.boardSize) {
        return 0;
    }
    
    if (visited[row][col] || GameState.board[row][col] !== player) {
        return 0;
    }

    visited[row][col] = true;
    let size = 1;

    // Check all 4 orthogonal directions
    size += floodFill(row + 1, col, player, visited);
    size += floodFill(row - 1, col, player, visited);
    size += floodFill(row, col + 1, player, visited);
    size += floodFill(row, col - 1, player, visited);

    return size;
}

/**
 * Handle game end scenarios
 */
function handleGameEnd(result) {
    GameState.gameActive = false;

    if (result.hasWon) {
        // Update scores
        if (result.winner === 1) {
            GameState.scores.player1++;
        } else if (result.winner === 2) {
            GameState.scores.player2++;
        }
        updateScoreDisplay();

        // Highlight winning cells if 4-in-a-row
        if (result.winningCells) {
            highlightWinningCells(result.winningCells);
        }
    }

    // Update game message
    if (result.hasWon) {
        gameMessage.textContent = `${Players[result.winner].name} wins!`;
    } else {
        gameMessage.textContent = "It's a draw!";
    }

    // Show game over modal after a brief delay
    setTimeout(() => {
        showGameOverModal(result);
    }, 500);
}

/**
 * Highlight winning cells on the board
 */
function highlightWinningCells(cells) {
    cells.forEach(({row, col}) => {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (cell) {
            cell.classList.add('winning-cell');
        }
    });
}

/**
 * Switch to the next player's turn
 */
function switchTurn() {
    GameState.currentPlayer = GameState.currentPlayer === 1 ? 2 : 1;
    GameState.turnNumber++;
    updateUI();
}

/**
 * Update all UI elements
 */
function updateUI() {
    // Update current player indicator
    const currentPlayerData = Players[GameState.currentPlayer];
    currentPlayerSymbol.textContent = currentPlayerData.symbol;
    currentPlayerName.textContent = currentPlayerData.name;
    
    // Update the player indicator class
    currentPlayerIndicator.classList.remove('player1', 'player2');
    currentPlayerIndicator.classList.add(currentPlayerData.color);

    // Update turn number
    turnNumber.textContent = GameState.turnNumber;

    // Update game message
    if (GameState.gameActive) {
        gameMessage.textContent = `${currentPlayerData.name}'s turn - Click any empty cell`;
    }

    // Update scores
    updateScoreDisplay();
}

/**
 * Update score display
 */
function updateScoreDisplay() {
    player1Score.textContent = GameState.scores.player1;
    player2Score.textContent = GameState.scores.player2;
}

/**
 * Start a new game
 */
function startNewGame() {
    initializeGame();
    hideGameOverModal();
}

/**
 * Reset session scores
 */
function resetScores() {
    GameState.scores = { player1: 0, player2: 0 };
    updateScoreDisplay();
}

/**
 * Show game over modal
 */
function showGameOverModal(result) {
    const modal = gameOverModal;
    const title = document.getElementById('gameOverTitle');
    const winnerInfo = document.getElementById('winnerInfo');
    const winnerSymbol = document.getElementById('winnerSymbol');
    const winnerText = document.getElementById('winnerText');
    const winReason = document.getElementById('winReason');
    const territoryInfo = document.getElementById('territoryInfo');

    if (result.hasWon) {
        const winner = Players[result.winner];
        title.textContent = 'Game Over!';
        winnerSymbol.textContent = winner.symbol;
        winnerSymbol.className = `winner-symbol ${winner.color}`;
        winnerText.textContent = `${winner.name} Wins!`;
        
        if (result.type === 'four_in_a_row') {
            winReason.textContent = '4 in a row!';
            territoryInfo.classList.add('hidden');
        } else if (result.type === 'territory_control') {
            winReason.textContent = 'Territory Control Victory!';
            document.getElementById('player1Territory').textContent = result.territories[1];
            document.getElementById('player2Territory').textContent = result.territories[2];
            territoryInfo.classList.remove('hidden');
        }
        
        winnerInfo.classList.remove('hidden');
    } else {
        title.textContent = "It's a Draw!";
        winnerText.textContent = 'Equal territory control';
        winReason.textContent = 'Board is full with no clear winner';
        winnerInfo.classList.add('hidden');
        
        if (result.territories) {
            document.getElementById('player1Territory').textContent = result.territories[1];
            document.getElementById('player2Territory').textContent = result.territories[2];
            territoryInfo.classList.remove('hidden');
        }
    }

    modal.classList.remove('hidden');
    
    // Focus the play again button for accessibility
    setTimeout(() => {
        playAgainButton.focus();
    }, 100);
}

/**
 * Hide game over modal
 */
function hideGameOverModal() {
    gameOverModal.classList.add('hidden');
}

// Accessibility and keyboard support
document.addEventListener('keydown', (e) => {
    if (!GameState.gameActive) return;

    // Allow keyboard navigation of game board
    const focusedElement = document.activeElement;
    if (focusedElement && focusedElement.classList.contains('game-cell')) {
        const row = parseInt(focusedElement.dataset.row);
        const col = parseInt(focusedElement.dataset.col);
        
        let newRow = row;
        let newCol = col;
        
        switch (e.key) {
            case 'ArrowUp':
                newRow = Math.max(0, row - 1);
                e.preventDefault();
                break;
            case 'ArrowDown':
                newRow = Math.min(GameState.boardSize - 1, row + 1);
                e.preventDefault();
                break;
            case 'ArrowLeft':
                newCol = Math.max(0, col - 1);
                e.preventDefault();
                break;
            case 'ArrowRight':
                newCol = Math.min(GameState.boardSize - 1, col + 1);
                e.preventDefault();
                break;
            case 'Enter':
            case ' ':
                handleCellClick(row, col);
                e.preventDefault();
                break;
        }
        
        if (newRow !== row || newCol !== col) {
            const newCell = document.querySelector(`[data-row="${newRow}"][data-col="${newCol}"]`);
            if (newCell) {
                newCell.focus();
            }
        }
    }
});

// Performance optimization: Debounce resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Recalculate board dimensions if needed
        updateUI();
    }, 250);
});

// Prevent context menu on touch devices for better UX
document.addEventListener('contextmenu', (e) => {
    if (e.target.classList.contains('game-cell')) {
        e.preventDefault();
    }
});