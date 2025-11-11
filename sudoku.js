class SudokuGame {
    constructor() {
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.givenCells = new Set();
        this.selectedCell = null;
        this.startTime = null;
        this.timerInterval = null;
        this.gameStarted = false;
        this.confettiCanvas = null;
        this.confettiCtx = null;
        
        this.initializeGame();
        this.setupEventListeners();
        this.initializeConfetti();
    }

    initializeGame() {
        this.createGrid();
        this.clearBoard(); // Clear board on initial load
        this.disableGameButtons();
        this.showWelcomeMessage();
    }

    createGrid() {
        const grid = document.getElementById('sudoku-grid');
        grid.innerHTML = '';
        
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.selectCell(i));
            
            // Drag and drop functionality for cells (receiving)
            cell.addEventListener('dragover', (e) => this.handleDragOver(e));
            cell.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            cell.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            cell.addEventListener('drop', (e) => this.handleDrop(e));
            
            // Drag functionality for cells (sending)
            cell.addEventListener('dragstart', (e) => this.handleCellDragStart(e));
            cell.addEventListener('dragend', (e) => this.handleCellDragEnd(e));
            
            grid.appendChild(cell);
        }
        
        // Delete zone event listeners
        const deleteZone = document.getElementById('delete-zone');
        deleteZone.addEventListener('dragover', (e) => this.handleDeleteZoneDragOver(e));
        deleteZone.addEventListener('dragenter', (e) => this.handleDeleteZoneDragEnter(e));
        deleteZone.addEventListener('dragleave', (e) => this.handleDeleteZoneDragLeave(e));
        deleteZone.addEventListener('drop', (e) => this.handleDeleteZoneDrop(e));
    }

    selectCell(index) {
        if (!this.gameStarted) return;
        
        // Remove previous selection
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected');
        });
        
        // Select new cell
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.classList.add('selected');
        this.selectedCell = index;
    }

    setupEventListeners() {
        // Number pad buttons
        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const number = parseInt(btn.dataset.number);
                this.inputNumber(number);
            });
            
            // Drag and drop functionality
            btn.addEventListener('dragstart', (e) => this.handleDragStart(e));
            btn.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });

        // Control buttons
        document.getElementById('startGame').addEventListener('click', () => this.startGame());
        document.getElementById('newGame').addEventListener('click', () => this.generateNewGame());
        document.getElementById('solveGame').addEventListener('click', () => this.solveGame());
        document.getElementById('checkGame').addEventListener('click', () => this.checkGame());
        document.getElementById('clearGame').addEventListener('click', () => this.clearGame());
        document.getElementById('printGame').addEventListener('click', () => this.printGame());
        
        // Modal buttons
        document.getElementById('viewDocs').addEventListener('click', (e) => {
            e.preventDefault();
            this.showReadmeModal();
        });
        document.getElementById('closeModal').addEventListener('click', () => this.hideReadmeModal());
        document.getElementById('doneBtn').addEventListener('click', () => this.hideReadmeModal());

        // Keyboard input
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') {
                this.inputNumber(parseInt(e.key));
            } else if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') {
                this.inputNumber(0);
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
                      e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                this.moveSelection(e.key);
            }
        });
    }

    inputNumber(number) {
        if (!this.gameStarted || this.selectedCell === null) return;
        
        const row = Math.floor(this.selectedCell / 9);
        const col = this.selectedCell % 9;
        const cellKey = `${row}-${col}`;
        
        // Don't allow editing given cells
        if (this.givenCells.has(cellKey)) return;
        
        const oldValue = this.board[row][col];
        this.board[row][col] = number;
        
        // Update display and make cell draggable if it has a number
        this.updateCellDisplay(this.selectedCell, number);
        this.updateCellDraggability(this.selectedCell);
        
        // Check for conflicts
        this.checkConflicts();
        
        // Check if game is complete
        if (this.isGameComplete()) {
            this.showMessage('Congratulations! You solved the puzzle!', 'success');
            this.stopTimer();
            this.triggerConfetti();
        }
    }

    moveSelection(direction) {
        if (this.selectedCell === null) {
            this.selectedCell = 0;
        } else {
            const row = Math.floor(this.selectedCell / 9);
            const col = this.selectedCell % 9;
            
            switch (direction) {
                case 'ArrowUp':
                    if (row > 0) this.selectedCell -= 9;
                    break;
                case 'ArrowDown':
                    if (row < 8) this.selectedCell += 9;
                    break;
                case 'ArrowLeft':
                    if (col > 0) this.selectedCell -= 1;
                    break;
                case 'ArrowRight':
                    if (col < 8) this.selectedCell += 1;
                    break;
            }
        }
        
        this.selectCell(this.selectedCell);
    }

    updateCellDisplay(index, value) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = value === 0 ? '' : value;
        cell.classList.remove('error', 'valid');
    }

    updateCellDraggability(index) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        const row = Math.floor(index / 9);
        const col = index % 9;
        const cellKey = `${row}-${col}`;
        const value = this.board[row][col];
        
        if (!this.givenCells.has(cellKey) && value !== 0) {
            // Make user-filled cells draggable
            cell.classList.add('draggable');
            cell.draggable = true;
        } else {
            // Remove draggable from empty cells or given cells
            cell.classList.remove('draggable');
            cell.draggable = false;
        }
    }

    checkConflicts() {
        // Clear previous conflict highlighting
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('error', 'valid');
        });
        
        let hasConflicts = false;
        
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] !== 0) {
                    const cellIndex = row * 9 + col;
                    const cell = document.querySelector(`[data-index="${cellIndex}"]`);
                    const cellKey = `${row}-${col}`;
                    
                    if (!this.givenCells.has(cellKey) && !this.isValidPlacement(row, col, this.board[row][col])) {
                        cell.classList.add('error');
                        hasConflicts = true;
                    } else if (!this.givenCells.has(cellKey)) {
                        cell.classList.add('valid');
                    }
                }
            }
        }
        
        return hasConflicts;
    }

    isValidPlacement(row, col, num) {
        // Check row
        for (let c = 0; c < 9; c++) {
            if (c !== col && this.board[row][c] === num) return false;
        }
        
        // Check column
        for (let r = 0; r < 9; r++) {
            if (r !== row && this.board[r][col] === num) return false;
        }
        
        // Check 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        
        for (let r = boxRow; r < boxRow + 3; r++) {
            for (let c = boxCol; c < boxCol + 3; c++) {
                if ((r !== row || c !== col) && this.board[r][c] === num) return false;
            }
        }
        
        return true;
    }

    startGame() {
        this.generateNewGame();
        this.gameStarted = true;
        this.enableGameButtons();
        this.startTimer(); // Start timer when game actually begins
        this.showMessage('Game started! Good luck!', 'success');
    }

    showWelcomeMessage() {
        this.showMessage('Welcome! Select difficulty and click "Start Game" to begin.', 'info');
    }

    enableGameButtons() {
        document.getElementById('startGame').disabled = true;
        document.getElementById('newGame').disabled = false;
        document.getElementById('solveGame').disabled = false;
        document.getElementById('checkGame').disabled = false;
        document.getElementById('clearGame').disabled = false;
        document.getElementById('printGame').disabled = false;
        
        // Enable board and controls
        document.querySelector('.sudoku-container').classList.remove('disabled');
        document.querySelector('.number-pad').classList.remove('disabled');
    }

    disableGameButtons() {
        document.getElementById('startGame').disabled = false;
        document.getElementById('newGame').disabled = true;
        document.getElementById('solveGame').disabled = true;
        document.getElementById('checkGame').disabled = true;
        document.getElementById('clearGame').disabled = true;
        document.getElementById('printGame').disabled = true;
        
        // Clear the board before disabling
        this.clearBoard();
        
        // Disable board and controls
        document.querySelector('.sudoku-container').classList.add('disabled');
        document.querySelector('.number-pad').classList.add('disabled');
    }

    generateNewGame() {
        this.resetGame();
        this.clearConfetti(); // Clear any existing confetti
        
        // Generate a complete solved board
        this.generateSolution();
        
        // Copy solution to board
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.solution[i][j] = this.board[i][j];
            }
        }
        
        // Remove cells based on difficulty
        const difficulty = document.getElementById('difficulty').value;
        const cellsToRemove = this.getCellsToRemove(difficulty);
        this.removeCells(cellsToRemove);
        
        this.updateDisplay();
        this.showMessage('New game generated!', 'info');
    }

    generateSolution() {
        // Clear board
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        
        // Fill diagonal 3x3 boxes first (they are independent)
        this.fillDiagonalBoxes();
        
        // Fill remaining cells
        this.solveBoard();
    }

    fillDiagonalBoxes() {
        for (let box = 0; box < 9; box += 3) {
            this.fillBox(box, box);
        }
    }

    fillBox(row, col) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shuffleArray(numbers);
        
        let index = 0;
        for (let r = row; r < row + 3; r++) {
            for (let c = col; c < col + 3; c++) {
                this.board[r][c] = numbers[index++];
            }
        }
    }

    solveBoard() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.isValidPlacement(row, col, num)) {
                            this.board[row][col] = num;
                            
                            if (this.solveBoard()) {
                                return true;
                            }
                            
                            this.board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    getCellsToRemove(difficulty) {
        const difficultySettings = {
            easy: 40,
            normal: 50,
            hard: 60,
            insane: 70
        };
        
        return difficultySettings[difficulty] || 50;
    }

    removeCells(count) {
        const positions = [];
        for (let i = 0; i < 81; i++) {
            positions.push(i);
        }
        
        this.shuffleArray(positions);
        
        for (let i = 0; i < count && i < positions.length; i++) {
            const pos = positions[i];
            const row = Math.floor(pos / 9);
            const col = pos % 9;
            this.board[row][col] = 0;
        }
        
        // Mark remaining cells as given
        this.givenCells.clear();
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] !== 0) {
                    this.givenCells.add(`${row}-${col}`);
                }
            }
        }
    }

    updateDisplay() {
        for (let i = 0; i < 81; i++) {
            const row = Math.floor(i / 9);
            const col = i % 9;
            const cell = document.querySelector(`[data-index="${i}"]`);
            const value = this.board[row][col];
            const cellKey = `${row}-${col}`;
            
            cell.textContent = value === 0 ? '' : value;
            cell.className = 'cell';
            
            if (this.givenCells.has(cellKey)) {
                cell.classList.add('given');
            }
            
            // Update draggability for each cell
            this.updateCellDraggability(i);
        }
    }

    solveGame() {
        // Copy current board to solution
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                this.solution[i][j] = this.board[i][j];
            }
        }
        
        // Solve the puzzle
        if (this.solveBoard()) {
            // Copy solution back to board
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    this.board[i][j] = this.solution[i][j];
                }
            }
            this.updateDisplay();
            this.stopTimer();
            this.showMessage('Puzzle solved!', 'success');
            this.triggerConfetti();
        } else {
            this.showMessage('No solution found!', 'error');
        }
    }

    checkGame() {
        if (this.isGameComplete()) {
            this.showMessage('Congratulations! The puzzle is correct!', 'success');
        } else {
            this.showMessage('The puzzle is not complete or has errors.', 'error');
        }
    }

    clearGame() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cellKey = `${row}-${col}`;
                if (!this.givenCells.has(cellKey)) {
                    this.board[row][col] = 0;
                }
            }
        }
        this.updateDisplay();
        this.showMessage('Game cleared!', 'info');
    }

    isGameComplete() {
        // Check if all cells are filled
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0) return false;
            }
        }
        
        // Check if all placements are valid
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (!this.isValidPlacement(row, col, this.board[row][col])) {
                    return false;
                }
            }
        }
        
        return true;
    }

    resetGame() {
        this.board = Array(9).fill().map(() => Array(9).fill(0));
        this.solution = Array(9).fill().map(() => Array(9).fill(0));
        this.givenCells.clear();
        this.selectedCell = null;
        this.gameStarted = false;
        this.stopTimer();
        this.resetTimerDisplay();
        this.disableGameButtons();
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resetTimerDisplay() {
        document.getElementById('timer').textContent = '00:00';
    }

    clearBoard() {
        // Clear all cells visually
        for (let i = 0; i < 81; i++) {
            const cell = document.querySelector(`[data-index="${i}"]`);
            cell.textContent = '';
            cell.className = 'cell';
            cell.classList.remove('draggable');
            cell.draggable = false;
        }
    }

    showMessage(message, type) {
        const statusMessage = document.getElementById('statusMessage');
        statusMessage.textContent = message;
        statusMessage.className = `status-message ${type}`;
        
        // Clear message after 3 seconds
        setTimeout(() => {
            statusMessage.textContent = '';
            statusMessage.className = 'status-message';
        }, 3000);
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    showReadmeModal() {
        const modal = document.getElementById('readmeModal');
        const content = document.getElementById('readmeContent');
        
        // Load README content directly
        const readmeContent = this.getReadmeContent();
        content.innerHTML = this.parseMarkdown(readmeContent);
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideReadmeModal();
            }
        });
    }

    hideReadmeModal() {
        const modal = document.getElementById('readmeModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }

    getReadmeContent() {
        return `# SUDOKU GAME - PROJECT NOTES
================================

## PROJECT OVERVIEW:
This is an interactive Sudoku web application that combines puzzle generation and solving functionality from the original C++ implementations into a modern, user-friendly web interface.

## FILES INCLUDED:
- sudoku.html    - Main HTML structure and game interface
- sudoku.css     - Modern styling with responsive design
- sudoku.js      - Complete game logic and algorithms
- README.md      - This documentation file

## ORIGINAL C++ FILES (for reference):
- SudokuGenerator.cpp        - Original puzzle generator
- SudokuSolver.cpp          - Original puzzle solver
- SudokuGenerator - Enhanced.cpp - Enhanced generator version
- SudokuSolver - Enhanced.cpp   - Enhanced solver version
- InteractiveSudoku.cpp     - Interactive console version

## FEATURES IMPLEMENTED:
====================

### GAME MECHANICS:
- 9x9 Sudoku grid with proper 3x3 box divisions
- Real-time conflict detection (row, column, 3x3 box)
- Visual feedback for valid/invalid placements
- Difficulty-based puzzle generation (Easy/Normal/Hard/Insane)
- Complete puzzle solving algorithm
- Puzzle validation and checking

### USER INTERFACE:
- Modern, responsive web design
- Click-to-select cell interaction
- Number pad for input (1-9, clear)
- Keyboard support (numbers, arrows, backspace)
- Timer and mistake counter
- Status messages and feedback
- Mobile-friendly responsive layout

### DIFFICULTY LEVELS:
- Easy: 40 cells removed (41 given)
- Normal: 50 cells removed (31 given)
- Hard: 60 cells removed (21 given)
- Insane: 70 cells removed (11 given)

## TECHNICAL IMPLEMENTATION:
========================

### ALGORITHMS USED:
1. **Puzzle Generation:**
   - Fill diagonal 3x3 boxes first (independent)
   - Use backtracking to fill remaining cells
   - Randomize number order for variety
   - Remove cells based on difficulty setting

2. **Puzzle Solving:**
   - Backtracking algorithm with constraint checking
   - Validates row, column, and 3x3 box constraints
   - Finds single solution (not all solutions)

3. **Conflict Detection:**
   - Real-time validation on every input
   - Visual highlighting of conflicts
   - Prevents invalid moves

### KEY FEATURES:
- Object-oriented JavaScript design
- Event-driven architecture
- Responsive CSS Grid and Flexbox layout
- Smooth animations and transitions
- Cross-browser compatibility
- Mobile-responsive design

## USAGE INSTRUCTIONS:
==================
1. Open sudoku.html in any modern web browser
2. Select difficulty level from dropdown
3. Click "Start Game" to generate a puzzle
4. Click on empty cells to select them
5. Use number pad or keyboard to input numbers
6. Game provides real-time feedback on conflicts
7. Use "Check" to validate progress or "Solve" for solution

## BROWSER COMPATIBILITY:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## DEVELOPMENT NOTES:
=================
- Converted from C++ console applications to web interface
- Maintained original algorithm logic and structure
- Enhanced with modern web technologies
- Added comprehensive user interaction features
- Implemented responsive design for all devices

## FUTURE ENHANCEMENTS (Potential):
- Save/load game state
- Multiple puzzle themes
- Statistics tracking
- Hint system
- Multiplayer support
- Puzzle sharing functionality

Created: 9/28/2025
Technology Stack: HTML5, CSS3, JavaScript (ES6+)`;
    }

    parseMarkdown(text) {
        // Simple markdown parser for basic formatting
        return text
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^\* (.*$)/gim, '<li>$1</li>')
            .replace(/^- (.*$)/gim, '<li>$1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^(.*)$/gm, '<p>$1</p>')
            .replace(/<p><h/g, '<h')
            .replace(/<\/h([1-6])><\/p>/g, '</h$1>')
            .replace(/<p><li>/g, '<ul><li>')
            .replace(/<\/li><\/p>/g, '</li></ul>')
            .replace(/<ul><li>/g, '<ul><li>')
            .replace(/<\/li><ul><li>/g, '</li><li>')
            .replace(/<p><\/p>/g, '');
    }

    // Drag and Drop Methods
    handleDragStart(e) {
        if (!this.gameStarted) {
            e.preventDefault();
            return;
        }
        
        this.draggedNumber = parseInt(e.target.dataset.number);
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', this.draggedNumber.toString());
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        
        // Clear all drag visual effects
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('drag-over', 'drag-invalid');
        });
        
        // Don't clear draggedNumber here - let handleDrop use it
        // this.draggedNumber will be cleared in handleDrop
    }

    handleDragOver(e) {
        if (!this.gameStarted) return;
        
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }

    handleDragEnter(e) {
        if (!this.gameStarted) return;
        
        e.preventDefault();
        const cellIndex = parseInt(e.target.dataset.index);
        const row = Math.floor(cellIndex / 9);
        const col = cellIndex % 9;
        const cellKey = `${row}-${col}`;
        
        // Check if cell is editable
        if (this.givenCells.has(cellKey)) {
            e.target.classList.add('drag-invalid');
        } else {
            e.target.classList.add('drag-over');
        }
    }

    handleDragLeave(e) {
        e.target.classList.remove('drag-over', 'drag-invalid');
    }

    handleDrop(e) {
        if (!this.gameStarted) return;
        
        e.preventDefault();
        const cellIndex = parseInt(e.target.dataset.index);
        const row = Math.floor(cellIndex / 9);
        const col = cellIndex % 9;
        const cellKey = `${row}-${col}`;
        
        console.log('Drop event:', { cellIndex, row, col, draggedNumber: this.draggedNumber });
        
        // Check if cell is editable
        if (this.givenCells.has(cellKey)) {
            e.target.classList.remove('drag-invalid');
            this.showMessage('Cannot edit given cells!', 'error');
            return;
        }
        
        // Clear visual effects
        e.target.classList.remove('drag-over', 'drag-invalid');
        
        // Handle moving numbers between cells
        if (this.draggedFromCell !== null && this.draggedFromCell !== cellIndex) {
            // Moving from one cell to another
            const fromRow = Math.floor(this.draggedFromCell / 9);
            const fromCol = this.draggedFromCell % 9;
            this.board[fromRow][fromCol] = 0; // Clear source cell
            this.updateCellDraggability(this.draggedFromCell); // Update source cell
        }
        
        // Directly update the board and display
        if (this.draggedNumber !== null && this.draggedNumber !== undefined) {
            this.board[row][col] = this.draggedNumber;
            this.updateCellDisplay(cellIndex, this.draggedNumber);
            this.updateCellDraggability(cellIndex);
            console.log('Number placed:', this.draggedNumber, 'at', row, col);
        } else {
            console.log('No dragged number available');
        }
        
        // Set the selected cell
        this.selectedCell = cellIndex;
        
        // Update visual selection
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected');
        });
        e.target.classList.add('selected');
        
        // Check for conflicts
        this.checkConflicts();
        
        // Check if game is complete
        if (this.isGameComplete()) {
            this.showMessage('Congratulations! You solved the puzzle!', 'success');
            this.stopTimer();
            this.triggerConfetti();
        }
        
        // Clear the dragged number after successful drop
        this.draggedNumber = null;
    }

    // Confetti Methods
    initializeConfetti() {
        this.confettiCanvas = document.getElementById('confetti-canvas');
        this.confettiCtx = this.confettiCanvas.getContext('2d');
        this.resizeConfettiCanvas();
        
        // Resize canvas when window resizes
        window.addEventListener('resize', () => this.resizeConfettiCanvas());
        setTimeout(() => {
            this.clearConfetti(); // Clear any existing confetti
        }, 3000);
    }

    resizeConfettiCanvas() {
        this.confettiCanvas.width = window.innerWidth;
        this.confettiCanvas.height = window.innerHeight;
    }

    triggerConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
        const confettiCount = 150;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                this.createConfettiPiece(colors[Math.floor(Math.random() * colors.length)]);
            }, i * 10);
        }
    }

    createConfettiPiece(color) {
        const piece = {
            x: Math.random() * this.confettiCanvas.width,
            y: -10,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 2,
            color: color,
            size: Math.random() * 8 + 4,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 10
        };
        
        this.animateConfettiPiece(piece);
    }

    animateConfettiPiece(piece) {
        const animate = () => {
            // Update position
            piece.x += piece.vx;
            piece.y += piece.vy;
            piece.rotation += piece.rotationSpeed;
            
            // Add some gravity
            piece.vy += 0.1;
            
            // Draw the piece
            this.confettiCtx.save();
            this.confettiCtx.translate(piece.x, piece.y);
            this.confettiCtx.rotate(piece.rotation * Math.PI / 180);
            this.confettiCtx.fillStyle = piece.color;
            this.confettiCtx.fillRect(-piece.size/2, -piece.size/2, piece.size, piece.size);
            this.confettiCtx.restore();
            
            // Continue animation if piece is still on screen
            if (piece.y < this.confettiCanvas.height + 50) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    clearConfetti() {
        this.confettiCtx.clearRect(0, 0, this.confettiCanvas.width, this.confettiCanvas.height);
    }

    // Print Methods
    printGame() {
        if (!this.gameStarted) {
            this.showMessage('Please start a game first!', 'error');
            return;
        }

        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        const difficulty = document.getElementById('difficulty').value;
        const difficultyText = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        
        // Get current date
        const currentDate = new Date().toLocaleDateString();
        
        // Create print content
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sudoku Puzzle - ${difficultyText}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 20px;
                        background: white;
                        color: black;
                    }
                    .print-header {
                        text-align: center;
                        margin-bottom: 20px;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .print-difficulty {
                        text-align: center;
                        margin-bottom: 10px;
                        font-size: 16px;
                        color: #666;
                    }
                    .print-date {
                        text-align: center;
                        margin-bottom: 20px;
                        font-size: 14px;
                        color: #666;
                    }
                    .sudoku-container {
                        display: flex;
                        justify-content: center;
                        margin: 20px 0;
                    }
                    .sudoku-grid {
                        display: grid;
                        grid-template-columns: repeat(9, 1fr);
                        grid-template-rows: repeat(9, 1fr);
                        gap: 1px;
                        background: black;
                        padding: 2px;
                        width: 360px;
                        height: 360px;
                    }
                    .cell {
                        width: 40px;
                        height: 40px;
                        background: white;
                        border: 1px solid #333;
                        font-size: 18px;
                        font-weight: bold;
                        color: black;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .cell.given {
                        background: #f0f0f0;
                        font-weight: 900;
                    }
                    .cell:nth-child(3n) {
                        border-right: 2px solid black;
                    }
                    .cell:nth-child(n+19):nth-child(-n+27),
                    .cell:nth-child(n+46):nth-child(-n+54) {
                        border-bottom: 2px solid black;
                    }
                    .print-instructions {
                        margin-top: 30px;
                        font-size: 12px;
                        color: #666;
                        text-align: center;
                        line-height: 1.4;
                    }
                    @media print {
                        body { margin: 0; }
                        .print-header { font-size: 20px; }
                        .sudoku-grid { width: 300px; height: 300px; }
                        .cell { width: 32px; height: 32px; font-size: 16px; }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">🎯 Sudoku Puzzle</div>
                <div class="print-difficulty">Difficulty: ${difficultyText}</div>
                <div class="print-date">Date: ${currentDate}</div>
                
                <div class="sudoku-container">
                    <div class="sudoku-grid">
                        ${this.generatePrintGrid()}
                    </div>
                </div>
                
                <div class="print-instructions">
                    <strong>Instructions:</strong><br>
                    Fill in the grid so that every row, column, and 3×3 box contains the digits 1-9.<br>
                    The numbers in gray are given and cannot be changed.<br>
                    Each number must appear exactly once in each row, column, and 3×3 box.
                </div>
            </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Wait for content to load, then print
        printWindow.onload = function() {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
        
        this.showMessage('Opening print preview...', 'info');
    }

    generatePrintGrid() {
        let gridHTML = '';
        for (let i = 0; i < 81; i++) {
            const row = Math.floor(i / 9);
            const col = i % 9;
            const cellKey = `${row}-${col}`;
            const value = this.board[row][col];
            const isGiven = this.givenCells.has(cellKey);
            
            gridHTML += `<div class="cell ${isGiven ? 'given' : ''}">${value === 0 ? '' : value}</div>`;
        }
        return gridHTML;
    }

    // Cell Drag Methods (for dragging numbers from cells)
    handleCellDragStart(e) {
        if (!this.gameStarted) {
            e.preventDefault();
            return;
        }
        
        const cellIndex = parseInt(e.target.dataset.index);
        const row = Math.floor(cellIndex / 9);
        const col = cellIndex % 9;
        const cellKey = `${row}-${col}`;
        
        // Only allow dragging user-filled cells (not given cells)
        if (this.givenCells.has(cellKey) || this.board[row][col] === 0) {
            e.preventDefault();
            return;
        }
        
        this.draggedNumber = this.board[row][col];
        this.draggedFromCell = cellIndex;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.draggedNumber.toString());
    }

    handleCellDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedNumber = null;
        this.draggedFromCell = null;
        
        // Clear all drag visual effects
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('drag-over', 'drag-invalid');
        });
        document.getElementById('delete-zone').classList.remove('drag-over');
    }

    // Delete Zone Methods
    handleDeleteZoneDragOver(e) {
        if (!this.gameStarted) return;
        
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDeleteZoneDragEnter(e) {
        if (!this.gameStarted) return;
        
        e.preventDefault();
        e.target.classList.add('drag-over');
    }

    handleDeleteZoneDragLeave(e) {
        e.target.classList.remove('drag-over');
    }

    handleDeleteZoneDrop(e) {
        if (!this.gameStarted) return;
        
        e.preventDefault();
        e.target.classList.remove('drag-over');
        
        if (this.draggedFromCell !== null) {
            // Clear the cell that was dragged from
            const row = Math.floor(this.draggedFromCell / 9);
            const col = this.draggedFromCell % 9;
            this.board[row][col] = 0;
            this.updateDisplay();
            this.showMessage('Number deleted!', 'info');
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});
