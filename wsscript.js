
document.addEventListener('DOMContentLoaded', () => {
    const wordInput = document.getElementById('wordInput');
    const generateBtn = document.getElementById('generateBtn');
    const wordSearchGrid = document.getElementById('wordSearchGrid');
    const wordListElement = document.getElementById('wordList');
      const wordCountInput = document.getElementById('wordCount');
  const topicInput = document.getElementById('topic');
  const copyPromptBtn = document.getElementById('copyPromptBtn');

    let words = [];
    let gridSize = 0;
    let grid = [];
    let foundWords = new Set();
    let isDragging = false;
    let startCell = null;
    let currentSelection = [];
    let foundWordData = []; // To store information about found words for highlighting
    

    // Function to initialize the game
    function initializeGame() {
        words = [];
        gridSize = 0;
        grid = [];
        foundWords = new Set();
        isDragging = false;
        startCell = null;
        currentSelection = [];
        foundWordData = [];
        wordSearchGrid.innerHTML = '';
        wordListElement.innerHTML = '';
    }
 

// Update the prompt textarea dynamically
function updatePromptText() {
  const count = parseInt(wordCountInput.value, 10);
  const topic = topicInput.value.trim();

  if (isNaN(count) || count < 1 || !topic) {
    generatedPrompt.value = '';
    return;
  }

  generatedPrompt.value = `Generate a list of ${count} words on the topic of ${topic}. Use no punctuations. List one word per line`;
}

// Trigger prompt generation on input
wordCountInput.addEventListener('input', updatePromptText);
topicInput.addEventListener('input', updatePromptText);



    generateBtn.addEventListener('click', () => {
        initializeGame(); // Reset game state

        const rawWords = wordInput.value.split('\n')
            .map(word => word.trim().toUpperCase())
            .filter(word => word.length > 1); // Filter out empty strings or single characters

        if (rawWords.length === 0) {
            alert('Please enter at least one word.');
            return;
        }

        words = [...new Set(rawWords)].sort((a, b) => b.length - a.length); // Remove duplicates and sort by length (longest first)
        gridSize = Math.ceil(words.length * 1.5); // Grid size is 50% greater than number of words
        grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill('')); // Initialize empty grid

        placeWordsInGrid();
        fillEmptyCells();
        renderGrid();
        renderWordList();
    });

    // Function to place words in the grid
    function placeWordsInGrid() {
        const directions = [
            { dr: 0, dc: 1 },   // Horizontal right
            { dr: 0, dc: -1 },  // Horizontal left
            { dr: 1, dc: 0 },   // Vertical down
            { dr: -1, dc: 0 },  // Vertical up
            { dr: 1, dc: 1 },   // Diagonal down-right
            { dr: 1, dc: -1 },  // Diagonal down-left
            { dr: -1, 1: 1 },  // Diagonal up-right
            { dr: -1, dc: -1 }  // Diagonal up-left
        ];

        for (const word of words) {
            let placed = false;
            let attempts = 0;
            const maxAttempts = gridSize * gridSize * 8; // Prevent infinite loops

            while (!placed && attempts < maxAttempts) {
                const startRow = Math.floor(Math.random() * gridSize);
                const startCol = Math.floor(Math.random() * gridSize);
                const { dr, dc } = directions[Math.floor(Math.random() * directions.length)];

                if (canPlaceWord(word, startRow, startCol, dr, dc)) {
                    placeWord(word, startRow, startCol, dr, dc);
                    placed = true;
                }
                attempts++;
            }
            if (!placed) {
                console.warn(`Could not place word: ${word}`);
            }
        }
    }

    // Check if a word can be placed at a given position and direction
    function canPlaceWord(word, startRow, startCol, dr, dc) {
        let currentRow = startRow;
        let currentCol = startCol;

        for (let i = 0; i < word.length; i++) {
            if (currentRow < 0 || currentRow >= gridSize || currentCol < 0 || currentCol >= gridSize) {
                return false; // Out of bounds
            }
            if (grid[currentRow][currentCol] !== '' && grid[currentRow][currentCol] !== word[i]) {
                return false; // Conflict with existing letter
            }
            currentRow += dr;
            currentCol += dc;
        }
        return true;
    }

    // Place a word in the grid
    function placeWord(word, startRow, startCol, dr, dc) {
        let currentRow = startRow;
        let currentCol = startCol;
        for (let i = 0; i < word.length; i++) {
            grid[currentRow][currentCol] = word[i];
            currentRow += dr;
            currentCol += dc;
        }
    }

    // Fill empty cells with random letters
    function fillEmptyCells() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                if (grid[r][c] === '') {
                    grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
                }
            }
        }
    }

    // Render the grid to the HTML
    function renderGrid() {
        wordSearchGrid.innerHTML = '';
        wordSearchGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        wordSearchGrid.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.textContent = grid[r][c];
                wordSearchGrid.appendChild(cell);
            }
        }
    }

    // Render the list of words to find
    function renderWordList() {
        wordListElement.innerHTML = '';
        words.forEach(word => {
            const listItem = document.createElement('li');
            listItem.textContent = word;
            listItem.id = `word-${word}`; // Assign an ID for easy targeting
            if (foundWords.has(word)) {
                listItem.classList.add('found-word');
            }
            wordListElement.appendChild(listItem);
        });
    }

    // Handle mouse events for selecting letters
    wordSearchGrid.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('grid-cell')) {
            isDragging = true;
            startCell = e.target;
            currentSelection = [startCell];
            startCell.classList.add('selected');
        }
    });

    wordSearchGrid.addEventListener('mouseover', (e) => {
        if (isDragging && e.target.classList.contains('grid-cell')) {
            const newCell = e.target;
            if (!currentSelection.includes(newCell)) {
                // Clear previous selection visually (except start cell)
                currentSelection.forEach(cell => {
                    if (cell !== startCell) {
                        cell.classList.remove('selected');
                    }
                });

                // Get all cells between startCell and newCell
                currentSelection = getCellsInLine(startCell, newCell);
                currentSelection.forEach(cell => cell.classList.add('selected'));
            }
        }
    });

    wordSearchGrid.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            checkSelection();
            // Clear selection visual
            currentSelection.forEach(cell => cell.classList.remove('selected'));
            startCell = null;
            currentSelection = [];
        }
    });

    // Prevent issues if mouse leaves grid while dragging
    wordSearchGrid.addEventListener('mouseleave', () => {
        if (isDragging) {
            isDragging = false;
            currentSelection.forEach(cell => cell.classList.remove('selected'));
            startCell = null;
            currentSelection = [];
        }
    });

    // Helper function to get all cells in a line between two points
    function getCellsInLine(cell1, cell2) {
        const r1 = parseInt(cell1.dataset.row);
        const c1 = parseInt(cell1.dataset.col);
        const r2 = parseInt(cell2.dataset.row);
        const c2 = parseInt(cell2.dataset.col);

        const cells = [];
        const dr = Math.sign(r2 - r1);
        const dc = Math.sign(c2 - c1);

        // Check if it's a straight line (horizontal, vertical, or diagonal)
        if (dr === 0 && dc === 0) { // Same cell
            cells.push(cell1);
            return cells;
        }
        if (dr !== 0 && dc !== 0 && Math.abs(r2 - r1) !== Math.abs(c2 - c1)) {
            return [cell1]; // Not a straight diagonal
        }

        let currentRow = r1;
        let currentCol = c1;

        while (true) {
            const cell = document.querySelector(`.grid-cell[data-row="${currentRow}"][data-col="${currentCol}"]`);
            if (cell) {
                cells.push(cell);
            }

            if (currentRow === r2 && currentCol === c2) {
                break;
            }

            if (currentRow !== r2) currentRow += dr;
            if (currentCol !== c2) currentCol += dc;

            // Prevent infinite loop if calculation somehow goes wrong
            if (cells.length > gridSize * gridSize) break;
        }
        return cells;
    }


       // Check if the selected sequence of letters matches a hidden word
    function checkSelection() {
        if (currentSelection.length === 0) return;

        let selectedWord = '';
        for (const cell of currentSelection) {
            selectedWord += cell.textContent;
        }

        const reversedSelectedWord = selectedWord.split('').reverse().join('');

        let foundMatch = false;
        let matchedWord = '';

        // Check against original words
        if (words.includes(selectedWord) && !foundWords.has(selectedWord)) {
            matchedWord = selectedWord;
            foundMatch = true;
        }
        // Check against reversed words
        else if (words.includes(reversedSelectedWord) && !foundWords.has(reversedSelectedWord)) {
            matchedWord = reversedSelectedWord;
            // Reverse the selection for correct highlighting if the word was found reversed
            currentSelection.reverse(); 
            foundMatch = true;
        }

        if (foundMatch) {
            markWordAsFound(matchedWord, currentSelection);
            renderWordList();
        }
    }

   

// Mark a word as found visually and draw the line
function markWordAsFound(word, cells) {
    foundWords.add(word);
    const wordListItem = document.getElementById(`word-${word}`);
    if (wordListItem) {
        wordListItem.classList.add('found-word');
    }

    // Apply "found" class to cells
    cells.forEach(cell => {
        cell.classList.add('found');
    });

    // --- Corrected code to draw the line ---
    if (cells.length > 1) { // Only draw a line if there's more than one cell
        const firstCell = cells[0];
        const lastCell = cells[cells.length - 1];

        // Get the bounding rectangles of the first and last cells
        const firstCellRect = firstCell.getBoundingClientRect();
        const lastCellRect = lastCell.getBoundingClientRect();
        const gridRect = wordSearchGrid.getBoundingClientRect(); // Get grid's position

        // Calculate start and end points relative to the grid container
        // We want the center of the cells for the line to pass through
        const startX = (firstCellRect.left + firstCellRect.right) / 2 - gridRect.left;
        const startY = (firstCellRect.top + firstCellRect.bottom) / 2 - gridRect.top;
        const endX = (lastCellRect.left + lastCellRect.right) / 2 - gridRect.left;
        const endY = (lastCellRect.top + lastCellRect.bottom) / 2 - gridRect.top;

        // Calculate length and angle
        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        const lineDiv = document.createElement('div');
        lineDiv.classList.add('word-line');

        // Apply styles to position and transform the line
        lineDiv.style.width = `${length}px`;
        lineDiv.style.left = `${startX}px`;
        lineDiv.style.top = `${startY}px`;
        lineDiv.style.transform = `rotate(${angle}deg)`;

        // Append the line to the grid container
        wordSearchGrid.appendChild(lineDiv);
    }
    // --- End corrected code ---
}


    

    // Initial render for empty state
    renderGrid();
});
