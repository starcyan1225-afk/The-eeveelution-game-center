// ===== PIXEL ART CREATOR APPLICATION =====

// State management
const state = {
    currentUser: null,
    gridSize: 24,
    pixelData: [],
    history: [],
    currentColor: 'rgb(255, 100, 200)',
    currentBrush: 'normal',
    savedArtworks: {}
};

// Initialize application
window.addEventListener('load', () => {
    loadUserData();
    updateLoginUI();
    setupLoginListener();
    setupOtherListeners();
});

// ===== LOGIN SYSTEM =====
function setupLoginListener() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const username = document.getElementById('usernameInput').value.trim();
            if (username) {
                state.currentUser = username;
                localStorage.setItem('pixelart_currentUser', username);
                state.savedArtworks = JSON.parse(localStorage.getItem(`pixelart_artworks_${username}`) || '{}');
                state.pixelData = JSON.parse(localStorage.getItem(`pixelart_current_${username}`) || '[]');
                updateLoginUI();
                document.getElementById('usernameInput').value = '';
            } else {
                alert('Please enter a username!');
            }
        });
    }
}

function loadUserData() {
    const savedUser = localStorage.getItem('pixelart_currentUser');
    if (savedUser) {
        state.currentUser = savedUser;
        state.savedArtworks = JSON.parse(localStorage.getItem(`pixelart_artworks_${savedUser}`) || '{}');
        state.pixelData = JSON.parse(localStorage.getItem(`pixelart_current_${savedUser}`) || '[]');
    }
}

function updateLoginUI() {
    if (state.currentUser) {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('creatorScreen').classList.add('active');
        document.getElementById('userDisplay').textContent = `👤 ${state.currentUser}`;
        initializeCreator();
        loadSavedArtworks();
    } else {
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('creatorScreen').classList.remove('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            saveCurrentArtwork();
            state.currentUser = null;
            localStorage.removeItem('pixelart_currentUser');
            state.pixelData = [];
            state.history = [];
            updateLoginUI();
        });
    }
});

// ===== CREATOR INITIALIZATION =====
function initializeCreator() {
    createPixelCanvas();
    setupEventListeners();
    updateColorPreview();
}

function createPixelCanvas() {
    const canvas = document.getElementById('pixelCanvas');
    canvas.innerHTML = '';
    const size = state.gridSize;
    canvas.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    canvas.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    
    // Calculate pixel size for 400px canvas
    const pixelSize = Math.max(8, Math.floor(400 / size));
    
    for (let i = 0; i < size * size; i++) {
        const pixel = document.createElement('div');
        pixel.className = 'pixel';
        pixel.style.width = pixelSize + 'px';
        pixel.style.height = pixelSize + 'px';
        pixel.setAttribute('data-index', i);
        
        if (state.pixelData[i]) {
            pixel.style.background = state.pixelData[i];
        }
        
        pixel.addEventListener('click', () => onPixelClick(i, pixel));
        pixel.addEventListener('mouseenter', (e) => {
            if (e.buttons === 1) onPixelClick(i, pixel);
        });
        
        canvas.appendChild(pixel);
    }
}

function getPixelIndex(row, col) {
    return row * state.gridSize + col;
}

function paintPixel(index, pixelElement) {
    const oldColor = state.pixelData[index] || 'white';
    const newColor = state.currentColor;
    
    if (oldColor !== newColor) {
        state.history.push({...state.pixelData});
        state.pixelData[index] = newColor;
        pixelElement.style.background = newColor;
    }
}

function onPixelClick(index, pixelElement) {
    if (state.currentBrush === 'normal') {
        paintPixel(index, pixelElement);
    } else if (state.currentBrush === 'sparkle') {
        paintSparkle(index);
    } else if (state.currentBrush === 'heart') {
        paintHeart(index);
    }
}

// ===== SPARKLE BRUSH =====
function paintSparkle(centerIndex) {
    state.history.push({...state.pixelData});
    const row = Math.floor(centerIndex / state.gridSize);
    const col = centerIndex % state.gridSize;
    
    // Yellow/gold sparkle colors
    const sparkleColors = [
        state.currentColor, // Main color
        'rgb(255, 255, 150)', // Light yellow
        'rgb(255, 240, 100)'  // Gold
    ];
    
    // Paint sparkle pattern (star-like)
    const offsets = [
        {r: 0, c: 0, color: sparkleColors[0]},   // Center
        {r: -1, c: 0, color: sparkleColors[1]},  // Top
        {r: 1, c: 0, color: sparkleColors[1]},   // Bottom
        {r: 0, c: -1, color: sparkleColors[1]},  // Left
        {r: 0, c: 1, color: sparkleColors[1]},   // Right
        {r: -1, c: -1, color: sparkleColors[2]}, // Diagonals
        {r: -1, c: 1, color: sparkleColors[2]},
        {r: 1, c: -1, color: sparkleColors[2]},
        {r: 1, c: 1, color: sparkleColors[2]}
    ];
    
    offsets.forEach(offset => {
        const newRow = row + offset.r;
        const newCol = col + offset.c;
        
        if (newRow >= 0 && newRow < state.gridSize && newCol >= 0 && newCol < state.gridSize) {
            const idx = getPixelIndex(newRow, newCol);
            state.pixelData[idx] = offset.color;
            const pixel = document.querySelector(`[data-index="${idx}"]`);
            if (pixel) pixel.style.background = offset.color;
        }
    });
}

// ===== HEART BRUSH =====
function paintHeart(centerIndex) {
    state.history.push({...state.pixelData});
    const row = Math.floor(centerIndex / state.gridSize);
    const col = centerIndex % state.gridSize;
    
    // Heart pattern
    const heartPattern = [
        {r: 0, c: 0},
        {r: -1, c: -1}, {r: -1, c: 0}, {r: -1, c: 1},
        {r: 0, c: -1}, {r: 0, c: 1},
        {r: 1, c: -1}, {r: 1, c: 0}, {r: 1, c: 1}
    ];
    
    const heartColors = [
        state.currentColor,
        'rgb(255, 200, 220)', // Light pink
    ];
    
    heartPattern.forEach((offset, idx) => {
        const newRow = row + offset.r;
        const newCol = col + offset.c;
        
        if (newRow >= 0 && newRow < state.gridSize && newCol >= 0 && newCol < state.gridSize) {
            const pixelIdx = getPixelIndex(newRow, newCol);
            const color = idx === 0 ? heartColors[0] : heartColors[1];
            state.pixelData[pixelIdx] = color;
            const pixel = document.querySelector(`[data-index="${pixelIdx}"]`);
            if (pixel) pixel.style.background = color;
        }
    });
}

// ===== COLOR PICKER =====
function updateColorPreview() {
    const red = document.getElementById('redSlider').value;
    const green = document.getElementById('greenSlider').value;
    const blue = document.getElementById('blueSlider').value;
    
    state.currentColor = `rgb(${red}, ${green}, ${blue})`;
    document.getElementById('colorPreview').style.background = state.currentColor;
    
    document.getElementById('redValue').textContent = red;
    document.getElementById('greenValue').textContent = green;
    document.getElementById('blueValue').textContent = blue;
}

// ===== SETUP OTHER LISTENERS =====
function setupOtherListeners() {
    const redSlider = document.getElementById('redSlider');
    const greenSlider = document.getElementById('greenSlider');
    const blueSlider = document.getElementById('blueSlider');
    const brushMode = document.getElementById('brushMode');
    const gridSizeSelect = document.getElementById('gridSizeSelect');
    const clearBtn = document.getElementById('clearBtn');
    const undoBtn = document.getElementById('undoBtn');
    const eeveelutionBtn = document.getElementById('eeveelutionBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    if (redSlider) redSlider.addEventListener('input', updateColorPreview);
    if (greenSlider) greenSlider.addEventListener('input', updateColorPreview);
    if (blueSlider) blueSlider.addEventListener('input', updateColorPreview);
    
    if (brushMode) {
        brushMode.addEventListener('change', (e) => {
            state.currentBrush = e.target.value;
        });
    }
    
    if (gridSizeSelect) {
        gridSizeSelect.addEventListener('change', (e) => {
            state.gridSize = parseInt(e.target.value);
            state.pixelData = [];
            state.history = [];
            createPixelCanvas();
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the canvas?')) {
                state.history.push({...state.pixelData});
                state.pixelData = [];
                createPixelCanvas();
            }
        });
    }
    
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            if (state.history.length > 0) {
                state.pixelData = state.history.pop();
                createPixelCanvas();
            }
        });
    }
    
    if (eeveelutionBtn) {
        eeveelutionBtn.addEventListener('click', () => {
            document.getElementById('eeveelutionGallery').classList.add('active');
            renderEeveelutionGallery();
        });
    }
    
    const closeGalleryBtn = document.getElementById('closeGalleryBtn');
    if (closeGalleryBtn) {
        closeGalleryBtn.addEventListener('click', () => {
            document.getElementById('eeveelutionGallery').classList.remove('active');
        });
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            document.getElementById('saveDialog').classList.add('active');
        });
    }
    
    const closeSaveDialogBtn = document.getElementById('closeSaveDialogBtn');
    if (closeSaveDialogBtn) {
        closeSaveDialogBtn.addEventListener('click', () => {
            document.getElementById('saveDialog').classList.remove('active');
        });
    }
    
    const cancelSaveBtn = document.getElementById('cancelSaveBtn');
    if (cancelSaveBtn) {
        cancelSaveBtn.addEventListener('click', () => {
            document.getElementById('saveDialog').classList.remove('active');
        });
    }
    
    const confirmSaveBtn = document.getElementById('confirmSaveBtn');
    if (confirmSaveBtn) {
        confirmSaveBtn.addEventListener('click', () => {
            const name = document.getElementById('artworkNameInput').value.trim();
            if (name) {
                const id = Date.now();
                state.savedArtworks[id] = {
                    name: name,
                    data: [...state.pixelData],
                    date: new Date().toLocaleDateString(),
                    gridSize: state.gridSize
                };
                localStorage.setItem(`pixelart_artworks_${state.currentUser}`, JSON.stringify(state.savedArtworks));
                loadSavedArtworks();
                document.getElementById('saveDialog').classList.remove('active');
                document.getElementById('artworkNameInput').value = '';
                alert('✨ Artwork saved!');
            }
        });
    }
}

// ===== EEVEELUTION GALLERY =====
// Create simple 24x24 pixel art patterns for each eeveelution
function createEeveelutionPatterns() {\n    return {\n        'Eevee': {\n            colors: {\n                main: 'rgb(200, 150, 100)',    // Brown\n                light: 'rgb(230, 190, 140)',   // Light brown\n                dark: 'rgb(150, 100, 50)',     // Dark brown\n                white: 'rgb(255, 255, 255)',   // White\n                black: 'rgb(0, 0, 0)'          // Black\n            },\n            pattern: [\n                '................',\n                '..LLLLLLLLLL....',\n                '.LLLLLLLLLLLL...',\n                '.LLLMMMMMMLLL...',\n                '.LLMMMWWMMML...',\n                '.LLMMWWWWMMLL..',\n                '.LLMMWBBWMML...',\n                '.LLLMMMMMMLLL..',\n                '.LLLLMMMMLL....',\n                '..LLMMMLL......',\n                '..LLLL.........',\n                '................'\n            ]\n        },\n        'Vaporeon': {\n            colors: {\n                main: 'rgb(100, 150, 220)',     // Blue\n                light: 'rgb(150, 200, 255)',   // Light blue\n                dark: 'rgb(50, 100, 180)',     // Dark blue\n                white: 'rgb(200, 230, 255)',   // White-ish\n                black: 'rgb(0, 0, 0)'\n            },\n            pattern: [\n                '................',\n                '..LLLLLLLL......',\n                '.LLLLLLLLLLL....',\n                '.LLLMMMMMLL....',\n                '.LLMMWWMML.....',\n                '.LLMMWWMML.....',\n                '.LLLMMMMMLL....',\n                '.LLLLMMMLLL....',\n                '..LLLMMLL......',\n                '..LLLL.........',\n                '................',\n                '................'\n            ]\n        },\n        'Jolteon': {\n            colors: {\n                main: 'rgb(255, 220, 100)',     // Yellow\n                light: 'rgb(255, 240, 150)',   // Light yellow\n                dark: 'rgb(200, 170, 50)',     // Dark yellow\n                white: 'rgb(255, 255, 200)',   // White-ish\n                black: 'rgb(0, 0, 0)'\n            },\n            pattern: [\n                '................',\n                '..L.LLL.LLL....',\n                '.LL.LLLLLLL....',\n                '.LLLMMMMMLL....',\n                '.LLMMWWMML.....',\n                '.LLMMWWMML.....',\n                '.LLLMMMMLL.....',\n                '..LLMMLLLL.....',\n                '.L.LLML........',\n                '.L.LLL.........',\n                '................',\n                '................'\n            ]\n        },\n        'Flareon': {\n            colors: {\n                main: 'rgb(255, 150, 100)',     // Orange-red\n                light: 'rgb(255, 200, 150)',   // Light orange\n                dark: 'rgb(200, 100, 50)',     // Dark orange\n                white: 'rgb(255, 255, 200)',   // White-ish\n                black: 'rgb(0, 0, 0)'\n            },\n            pattern: [\n                '................',\n                '..LLLLLLLL......',\n                '.LLLLLLLLLLL....',\n                '.LLLMMMMMLL....',\n                '.LLMMWWMML.....',\n                '.LLMMWWMML.....',\n                '.LLLMMMMLL....',\n                '.LLLLMMML......',\n                '..LLLLL.........',\n                '................',\n                '................',\n                '................'\n            ]\n        },\n        'Espeon': {\n            colors: {\n                main: 'rgb(200, 150, 255)',     // Purple\n                light: 'rgb(230, 190, 255)',   // Light purple\n                dark: 'rgb(150, 100, 200)',    // Dark purple\n                white: 'rgb(255, 255, 255)',   // White\n                black: 'rgb(0, 0, 0)'\n            },\n            pattern: [\n                '................',\n                '..LLLLLLLL......',\n                '.LLLLLLLLLLL....',\n                '.LLLMMMMMLL....',\n                '.LLMMWWMML.....',\n                '.LLMMWWMML.....',\n                '.LLLMMMMLL....',\n                '.LLLLMMML......',\n                '..LLLLL.........',\n                '................',\n                '................',\n                '................'\n            ]\n        },\n        'Umbreon': {\n            colors: {\n                main: 'rgb(50, 50, 100)',       // Dark blue\n                light: 'rgb(100, 100, 150)',   // Light blue\n                dark: 'rgb(20, 20, 50)',       // Very dark\n                white: 'rgb(255, 255, 100)',   // Yellow rings\n                black: 'rgb(0, 0, 0)'\n            },\n            pattern: [\n                '................',\n                '..LLLLLLLL......',\n                '.LLLLLLLLLLL....',\n                '.LLLMMMMMLL....',\n                '.LLMMWWMML.....',\n                '.LLMMWWMML.....',\n                '.LLLMMMMLL....',\n                '.LLLLMMML......',\n                '..LLLLL.........',\n                '................',\n                '................',\n                '................'\n            ]\n        },\n        'Leafeon': {\n            colors: {\n                main: 'rgb(100, 200, 100)',     // Green\n                light: 'rgb(150, 230, 150)',   // Light green\n                dark: 'rgb(50, 150, 50)',      // Dark green\n                white: 'rgb(200, 255, 200)',   // White-ish\n                black: 'rgb(0, 0, 0)'\n            },\n            pattern: [\n                '................',\n                '..LLLLLLLL......',\n                '.LLLLLLLLLLL....',\n                '.LLLMMMMMLL....',\n                '.LLMMWWMML.....',\n                '.LLMMWWMML.....',\n                '.LLLMMMMLL....',\n                '.LLLLMMML......',\n                '..LLLLL.........',\n                '................',\n                '................',\n                '................'\n            ]\n        },\n        'Glaceon': {\n            colors: {\n                main: 'rgb(150, 200, 255)',     // Light blue\n                light: 'rgb(200, 230, 255)',   // Very light blue\n                dark: 'rgb(100, 150, 220)',    // Dark blue\n                white: 'rgb(220, 240, 255)',   // Icy white\n                black: 'rgb(0, 0, 0)'\n            },\n            pattern: [\n                '................',\n                '..LLLLLLLL......',\n                '.LLLLLLLLLLL....',\n                '.LLLMMMMMLL....',\n                '.LLMMWWMML.....',\n                '.LLMMWWMML.....',\n                '.LLLMMMMLL....',\n                '.LLLLMMML......',\n                '..LLLLL.........',\n                '................',\n                '................',\n                '................'\n            ]\n        },\n        'Sylveon': {\n            colors: {\n                main: 'rgb(255, 150, 200)',     // Pink\n                light: 'rgb(255, 200, 230)',   // Light pink\n                dark: 'rgb(200, 100, 150)',    // Dark pink\n                white: 'rgb(255, 255, 255)',   // White\n                black: 'rgb(0, 0, 0)'\n            },\n            pattern: [\n                '................',\n                '..LLLLLLLL......',\n                '.LLLLLLLLLLL....',\n                '.LLLMMMMMLL....',\n                '.LLMMWWMML.....',\n                '.LLMMWWMML.....',\n                '.LLLMMMMLL....',\n                '.LLLLMMML......',\n                '..LLLLL.........',\n                '................',\n                '................',\n                '................'\n            ]\n        }\n    };\n}\n\nconst eeveelutions = [\n    { name: 'Eevee', emoji: '🐹' },\n    { name: 'Vaporeon', emoji: '💧' },\n    { name: 'Jolteon', emoji: '⚡' },\n    { name: 'Flareon', emoji: '🔥' },\n    { name: 'Espeon', emoji: '✨' },\n    { name: 'Umbreon', emoji: '🌙' },\n    { name: 'Leafeon', emoji: '🍃' },\n    { name: 'Glaceon', emoji: '❄️' },\n    { name: 'Sylveon', emoji: '🎀' }\n];\n\nfunction renderEeveelutionGallery() {\n    const grid = document.getElementById('eeveelutionGrid');\n    grid.innerHTML = '';\n    \n    eeveelutions.forEach((eevee, index) => {\n        const item = document.createElement('div');\n        item.className = 'eeveelution-item';\n        item.innerHTML = `\n            <div class=\"eeveelution-preview\">${eevee.emoji}</div>\n            <div class=\"eeveelution-name\">${eevee.name}</div>\n        `;\n        item.addEventListener('click', () => {\n            copyEeveelution(eevee);\n            document.getElementById('eeveelutionGallery').classList.remove('active');\n        });\n        grid.appendChild(item);\n    });\n}\n\nfunction copyEeveelution(eevee) {\n    state.history.push({...state.pixelData});\n    const patterns = createEeveelutionPatterns();\n    const pattern = patterns[eevee.name];\n    \n    if (pattern) {\n        // Create pixel art from pattern\n        state.pixelData = [];\n        const colors = pattern.colors;\n        \n        for (let row = 0; row < state.gridSize; row++) {\n            for (let col = 0; col < state.gridSize; col++) {\n                if (row < pattern.pattern.length && col < pattern.pattern[0].length) {\n                    const char = pattern.pattern[row][col];\n                    let color = 'white';\n                    \n                    if (char === 'M') color = colors.main;\n                    else if (char === 'L') color = colors.light;\n                    else if (char === 'D') color = colors.dark;\n                    else if (char === 'W') color = colors.white;\n                    else if (char === 'B') color = colors.black;\n                    \n                    state.pixelData[getPixelIndex(row, col)] = color;\n                } else {\n                    state.pixelData[getPixelIndex(row, col)] = 'white';\n                }\n            }\n        }\n    }\n    createPixelCanvas();\n}\n\nfunction loadSavedArtworks() {\n    const list = document.getElementById('savedArtworksList');\n    list.innerHTML = '';\n    \n    if (Object.keys(state.savedArtworks).length === 0) {\n        list.innerHTML = '<p class=\"empty-message\">No saved artworks yet!</p>';\n        return;\n    }\n    \n    Object.entries(state.savedArtworks).forEach(([id, artwork]) => {\n        const item = document.createElement('div');\n        item.className = 'saved-artwork-item';\n        item.innerHTML = `\n            <div class=\"artwork-name\">${artwork.name}</div>\n            <div class=\"artwork-date\">${artwork.date}</div>\n        `;\n        item.addEventListener('click', () => loadArtwork(id, artwork));\n        list.appendChild(item);\n    });\n}\n\nfunction loadArtwork(id, artwork) {\n    state.gridSize = artwork.gridSize;\n    state.pixelData = [...artwork.data];\n    state.history = [];\n    document.getElementById('gridSizeSelect').value = state.gridSize;\n    createPixelCanvas();\n}\n\nfunction saveCurrentArtwork() {\n    if (state.currentUser) {\n        localStorage.setItem(`pixelart_current_${state.currentUser}`, JSON.stringify(state.pixelData));\n    }\n}\n\n// Save before leaving\nwindow.addEventListener('beforeunload', () => {\n    if (state.currentUser) {\n        saveCurrentArtwork();\n    }\n});\n\n// ===== EVENT LISTENERS =====\nfunction setupEventListeners() {\n    // Additional event listeners can go here\n}