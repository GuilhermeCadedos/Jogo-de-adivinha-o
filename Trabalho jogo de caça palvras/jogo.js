document.addEventListener('DOMContentLoaded', () => {
    // --- 1. CONFIGURAÇÃO INICIAL E VARIÁVEIS ---
    let BASE_WORDS = [
        'PREVENCAO', 'CAMISINHA', 'TRATAMENTO', 'TESTE', 'AIDS', 
        'HIV', 'PRÉP', 'PEP', 'SAUDE', 'CUIDADO', 
        'CONSCIENTIZACAO', 'VIRUS', 'CONTAMINACAO', 'SAUDESEXUAL', 'RESPEITO', 'DEZEMBRO'

    ];
    const SECRET_WORD = 'ESPERANCA';
    const GRID_SIZE = 14; 
    
    // Variáveis que serão atualizadas durante o jogo
    let WORDS = [];
    let gridData = [];
    let selectedCells = [];
    let isSelecting = false;
    let foundWords = new Set();
    
    // Referências aos elementos HTML
    const gridElement = document.getElementById('word-search-grid');
    const listElement = document.getElementById('word-list');
    const inputElement = document.getElementById('word-input');
    const FEEDBACK_ELEMENT = document.getElementById('feedback-message');
    const addWordInput = document.getElementById('add-word-input');
    const addWordButton = document.getElementById('add-word-button');
    const resetButton = document.getElementById('reset-button');
    
    gridElement.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // --- FUNÇÕES DE UTILIDADE (Posicionamento Aleatório) ---

    function createEmptyGrid() {
        gridData = Array.from({ length: GRID_SIZE }, () => 
            Array(GRID_SIZE).fill(' ')
        );
    }
    
    function canPlaceWord(word, r, c, dr, dc) {
        for (let i = 0; i < word.length; i++) {
            const row = r + i * dr;
            const col = c + i * dc;
            
            if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
                return false;
            }
            if (gridData[row][col] !== ' ' && gridData[row][col] !== word[i]) {
                return false;
            }
        }
        return true;
    }
    
    function placeWord(word, r, c, dr, dc) {
        for (let i = 0; i < word.length; i++) {
            gridData[r + i * dr][c + i * dc] = word[i];
        }
    }
    
    function placeWordsInGrid() {
        createEmptyGrid();
        const directions = [
            [0, 1], [1, 0], [1, 1], [0, -1], [-1, 0], [-1, -1], [-1, 1], [1, -1]
        ];

        const wordsToPlace = [...WORDS, SECRET_WORD];
        wordsToPlace.sort((a, b) => b.length - a.length);

        wordsToPlace.forEach(word => {
            const wordArray = word.split('');
            let placed = false;
            let attempts = 0;
            const MAX_ATTEMPTS = GRID_SIZE * GRID_SIZE * 2; 

            while (!placed && attempts < MAX_ATTEMPTS) {
                attempts++;
                
                const r = Math.floor(Math.random() * GRID_SIZE);
                const c = Math.floor(Math.random() * GRID_SIZE);
                const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
                
                const finalWord = Math.random() < 0.5 ? wordArray : wordArray.reverse();
                const wordToPlace = finalWord.join('');

                if (canPlaceWord(wordToPlace, r, c, dr, dc)) {
                    placeWord(wordToPlace, r, c, dr, dc);
                    placed = true;
                }
            }
            if (!placed) {
                console.warn(`A palavra '${word}' não pôde ser colocada na grade.`);
            }
        });

        // Preenche células vazias com letras aleatórias
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (gridData[r][c] === ' ') {
                    const randomLetter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
                    gridData[r][c] = randomLetter;
                }
            }
        }
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO E FEEDBACK ---

    function renderGrid() {
        gridElement.innerHTML = '';
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.textContent = gridData[r][c];
                
                cell.addEventListener('mousedown', startSelection);
                cell.addEventListener('mouseenter', continueSelection);
                cell.addEventListener('mouseup', endSelection);
                
                // Marca as células se já foram encontradas antes do reset (mantém o estado visual)
                const wordFoundList = [...foundWords].join(',');
                if (wordFoundList.includes(gridData[r][c])) { // Simplificação: em um jogo real, precisaria de mapeamento de coordenadas
                    // Não re-marca células, apenas as que o usuário encontrou por clique
                }

                gridElement.appendChild(cell);
            }
        }
        // Após renderizar, re-aplica a classe 'found' para palavras já encontradas
         document.querySelectorAll('.cell').forEach(cell => {
             const cellLetter = cell.textContent;
             if ([...foundWords].some(word => word.includes(cellLetter))) { 
                 // Isto é uma simplificação, para o jogo manter a marcação visual após o reset, 
                 // você teria que armazenar as coordenadas de cada palavra encontrada.
                 // Manteremos a lógica de checagem mais simples e focada no reset do estado `foundWords`.
             }
         });
    }

    function renderWordList() { 
        listElement.innerHTML = '<h2>Palavras para Encontrar:</h2>';
        const ul = document.createElement('ul');
        ul.classList.add('word-list');
        WORDS.forEach(word => {
            const li = document.createElement('li');
            li.id = `word-${word}`;
            li.textContent = word;
            
            if (foundWords.has(word)) {
                li.classList.add('found-word');
            }
            
            ul.appendChild(li);
        });
        listElement.appendChild(ul);
    }

    function showFeedback(message, type) {
        if (!FEEDBACK_ELEMENT) return;
        
        FEEDBACK_ELEMENT.classList.add('hidden-message');
        FEEDBACK_ELEMENT.classList.remove('success-message', 'error-message');
        
        FEEDBACK_ELEMENT.textContent = message;
        
        if (type === 'success') {
            FEEDBACK_ELEMENT.classList.add('success-message');
        } else if (type === 'error') {
            FEEDBACK_ELEMENT.classList.add('error-message');
        }
        
        FEEDBACK_ELEMENT.classList.remove('hidden-message');
        
        setTimeout(() => {
            FEEDBACK_ELEMENT.classList.add('hidden-message');
        }, 3000);
    }

    // --- FUNÇÕES DE INTERAÇÃO (Mouse e Digitação) ---
    
    // ... (clearSelection, startSelection, continueSelection, endSelection) ...
    // ... (As funções de seleção do mouse são mantidas como no script anterior) ...

    function clearSelection() {
        document.querySelectorAll('.cell').forEach(cell => {
            if (!cell.classList.contains('found')) {
                cell.classList.remove('selected');
            }
        });
        selectedCells = [];
    }
    
    function startSelection(event) {
        if (event.button !== 0) return;
        isSelecting = true;
        clearSelection();
        
        const cell = event.target;
        cell.classList.add('selected');
        selectedCells.push(cell);
    }
    
    function continueSelection(event) {
        if (!isSelecting) return;
        const cell = event.target;
        
        if (selectedCells.length === 0 || selectedCells[selectedCells.length - 1] !== cell) {
            cell.classList.add('selected');
            selectedCells.push(cell);
        }
    }
    
    function endSelection() {
        if (!isSelecting) return;
        isSelecting = false;
        
        if (selectedCells.length < 2) {
            clearSelection();
            return;
        }

        const selectedWord = selectedCells.map(cell => cell.textContent).join('');
        checkWord(selectedWord);
    }


    function checkWord(word) {
        const normalizedWord = word.toUpperCase();
        const reversedWord = normalizedWord.split('').reverse().join('');
        let wordFound = false;

        const allCurrentWords = [...WORDS, SECRET_WORD];

        if (allCurrentWords.includes(normalizedWord) && !foundWords.has(normalizedWord)) {
            wordFound = normalizedWord;
        } else if (allCurrentWords.includes(reversedWord) && !foundWords.has(reversedWord)) {
            wordFound = reversedWord;
        }
        
        if (wordFound) {
            foundWords.add(wordFound);
            
            selectedCells.forEach(cell => {
                cell.classList.remove('selected');
                cell.classList.add('found');
            });

            if (WORDS.includes(wordFound)) {
                const listItem = document.getElementById(`word-${wordFound}`);
                if (listItem) listItem.classList.add('found-word');
            }

            if (wordFound === SECRET_WORD) {
                alert('🌟 UAU! Você encontrou a Palavra Secreta: ESPERANÇA! \n\nLembre-se: com informação, prevenção e tratamento, é possível viver com qualidade. A luta contra o HIV/AIDS é de todos!');
            }
            
            if (foundWords.size === allCurrentWords.length) {
                alert('🎉 JOGO COMPLETO! Você encontrou todas as palavras e ajudou na conscientização do Dezembro Vermelho! ');
            }
            
        } else {
            clearSelection();
        }
    }
    
    function handleInput() {
        const inputWord = inputElement.value.toUpperCase().trim();
        
        if (inputWord.length === 0) return;

        const allCurrentWords = [...WORDS, SECRET_WORD];

        if (allCurrentWords.includes(inputWord) && !foundWords.has(inputWord)) {
            
            foundWords.add(inputWord);

            if (WORDS.includes(inputWord)) {
                const listItem = document.getElementById(`word-${inputWord}`);
                if (listItem) listItem.classList.add('found-word');
            }
            
            showFeedback(`✅ ${inputWord} ENCONTRADA!`, 'success');

            if (inputWord === SECRET_WORD) {
                 alert('🌟 UAU! Você encontrou a Palavra Secreta: ESPERANÇA! \n\nLembre-se: com informação, prevenção e tratamento, é possível viver com qualidade. A luta contra o HIV/AIDS é de todos!');
            }

            inputElement.value = '';

            if (foundWords.size === allCurrentWords.length) {
                alert('🎉 JOGO COMPLETO! Você encontrou todas as palavras e ajudou na conscientização do Dezembro Vermelho! ');
            }

        } else {
            if (foundWords.has(inputWord)) {
                 showFeedback(`⚠️ ${inputWord} já foi encontrada!`, 'error');
            } else {
                 showFeedback(`❌ ${inputWord} não está na lista. Tente outra vez!`, 'error');
            }
        }
    }
    
    // --- FUNÇÕES DE NOVOS CONTROLES (Adicionar e Resetar) ---

    function addCustomWord() {
        const newWord = addWordInput.value.toUpperCase().trim();
        addWordInput.value = '';

        if (newWord.length < 3 || newWord.length > GRID_SIZE - 2) {
            showFeedback(`A palavra deve ter entre 3 e ${GRID_SIZE - 2} letras.`, 'error');
            return;
        }

        const allCurrentWords = [...BASE_WORDS, SECRET_WORD];
        if (allCurrentWords.includes(newWord)) {
            showFeedback(`${newWord} já está na lista!`, 'error');
            return;
        }
        
        // ADICIONA NO ARRAY BASE
        BASE_WORDS.push(newWord);
        showFeedback(`"${newWord}" adicionada com sucesso! Clique em "Mudar Posição das Palavras" para incluí-la na grade.`, 'success');
    }

    function resetGame() {
        // Usa a lista base (incluindo as adicionadas)
        WORDS = [...BASE_WORDS]; 
        
        foundWords.clear(); // Zera as encontradas
        clearSelection();
        
        // RE-EMBARALHA E COLOCA AS PALAVRAS EM NOVAS POSIÇÕES
        placeWordsInGrid(); 
        
        renderGrid();
        renderWordList();
        
        if (inputElement) inputElement.focus();
        
        showFeedback('Novo Jogo iniciado! Letras e posições embaralhadas.', 'success');
    }

    function startGame() {
        resetGame(); 
    }

    // --- 4. LISTENERS DE EVENTOS ---
    
    if (inputElement) {
        inputElement.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                handleInput();
            }
        });
    }

    if (addWordButton) {
        addWordButton.addEventListener('click', addCustomWord);
    }
    
    if (resetButton) {
        resetButton.addEventListener('click', resetGame);
    }

    if (addWordInput) {
        addWordInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                addCustomWord();
            }
        });
    }

    // --- 5. INICIALIZAÇÃO ---
    startGame();
});