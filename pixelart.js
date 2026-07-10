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
// Create simple pixel art patterns for each eeveelution
function createEeveelutionPatterns() {
    return {
        'Eevee': {
            colors: {
                main: 'rgb(200, 150, 100)',    // Brown
                light: 'rgb(230, 190, 140)',   // Light brown
                dark: 'rgb(150, 100, 50)',     // Dark brown
                white: 'rgb(255, 255, 255)',   // White
                black: 'rgb(0, 0, 0)'          // Black
            },
            pattern: [
                '................',
                '..LLLLLLLLLL....',
                '.LLLLLLLLLLLL...',
                '.LLLMMMMMMLLL...',
                '.LLMMMWWMMML...',
                '.LLMMWWWWMMLL..',
                '.LLMMWBBWMML...',
                '.LLLMMMMMMLLL..',
                '.LLLLMMMMLL....',
                '..LLMMMLL......',
                '..LLLL.........',
                '................'
            ]
        },
        'Vaporeon': {
            colors: {
                main: 'rgb(100, 150, 220)',     // Blue
                light: 'rgb(150, 200, 255)',   // Light blue
                dark: 'rgb(50, 100, 180)',     // Dark blue
                white: 'rgb(200, 230, 255)',   // White-ish
                black: 'rgb(0, 0, 0)'
            },
            pattern: [
                '................',
                '..LLLLLLLL......',
                '.LLLLLLLLLLL....',
                '.LLLMMMMMLL....',
                '.LLMMWWMML.....',
                '.LLMMWWMML.....',
                '.LLLMMMMMLL....',
                '.LLLLMMMLLL....',
                '..LLLMMLL......',
                '..LLLL.........',
                '................',
                '................'
            ]
        },
        'Jolteon': {
            colors: {
                main: 'rgb(255, 220, 100)',     // Yellow
                light: 'rgb(255, 240, 150)',   // Light yellow
                dark: 'rgb(200, 170, 50)',     // Dark yellow
                white: 'rgb(255, 255, 200)',   // White-ish
                black: 'rgb(0, 0, 0)'
            },
            pattern: [
                '................',
                '..L.LLL.LLL....',
                '.LL.LLLLLLL....',
                '.LLLMMMMMLL....',
                '.LLMMWWMML.....',
                '.LLMMWWMML.....',
                '.LLLMMMMLL.....',
                '..LLMMLLLL.....',
                '.L.LLML........',
                '.L.LLL.........',
                '................',
                '................'
            ]
        },
        'Flareon': {
            colors: {
                main: 'rgb(255, 150, 100)',     // Orange-red
                light: 'rgb(255, 200, 150)',   // Light orange
                dark: 'rgb(200, 100, 50)',     // Dark orange
                white: 'rgb(255, 255, 200)',   // White-ish
                black: 'rgb(0, 0, 0)'
            },
            pattern: [
                '................',
                '..LLLLLLLL......',
                '.LLLLLLLLLLL....',
                '.LLLMMMMMLL....',
                '.LLMMWWMML.....',
                '.LLMMWWMML.....',
                '.LLLMMMMLL....',
                '.LLLLMMML......',
                '..LLLLL.........',
                '................',
                '................',
                '................'
            ]
        },
        'Espeon': {
            colors: {
                main: 'rgb(200, 150, 255)',     // Purple
                light: 'rgb(230, 190, 255)',   // Light purple
                dark: 'rgb(150, 100, 200)',    // Dark purple
                white: 'rgb(255, 255, 255)',   // White
                black: 'rgb(0, 0, 0)'
            },
            pattern: [
                '................',
                '..LLLLLLLL......',
                '.LLLLLLLLLLL....',
                '.LLLMMMMMLL....',
                '.LLMMWWMML.....',
                '.LLMMWWMML.....',
                '.LLLMMMMLL....',
                '.LLLLMMML......',
                '..LLLLL.........',
                '................',
                '................',
                '................'
            ]
        },
        'Umbreon': {
            colors: {
                main: 'rgb(50, 50, 100)',       // Dark blue
                light: 'rgb(100, 100, 150)',   // Light blue
                dark: 'rgb(20, 20, 50)',       // Very dark
                white: 'rgb(255, 255, 100)',   // Yellow rings
                black: 'rgb(0, 0, 0)'
            },
            pattern: [
                '................',
                '..LLLLLLLL......',
                '.LLLLLLLLLLL....',
                '.LLLMMMMMLL....',
                '.LLMMWWMML.....',
                '.LLMMWWMML.....',
                '.LLLMMMMLL....',
                '.LLLLMMML......',
                '..LLLLL.........',
                '................',
                '................',
                '................'
            ]
        },
        'Leafeon': {
            colors: {
                main: 'rgb(100, 200, 100)',     // Green
                light: 'rgb(150, 230, 150)',   // Light green
                dark: 'rgb(50, 150, 50)',      // Dark green
                white: 'rgb(200, 255, 200)',   // White-ish
                black: 'rgb(0, 0, 0)'
            },
            pattern: [
                '................',
                '..LLLLLLLL......',
                '.LLLLLLLLLLL....',
                '.LLLMMMMMLL....',
                '.LLMMWWMML.....',
                '.LLMMWWMML.....',
                '.LLLMMMMLL....',
                '.LLLLMMML......',
                '..LLLLL.........',
                '................',
                '................',
                '................'
            ]
        },
        'Glaceon': {
            colors: {
                main: 'rgb(150, 200, 255)',     // Light blue
                light: 'rgb(200, 230, 255)',   // Very light blue
                dark: 'rgb(100, 150, 220)',    // Dark blue
                white: 'rgb(220, 240, 255)',   // Icy white
                black: 'rgb(0, 0, 0)'
            },
            pattern: [
                '................',
                '..LLLLLLLL......',
                '.LLLLLLLLLLL....',
                '.LLLMMMMMLL....',
                '.LLMMWWMML.....',
                '.LLMMWWMML.....',
                '.LLLMMMMLL....',
                '.LLLLMMML......',
                '..LLLLL.........',
                '................',
                '................',
                '................'
            ]
        },
        'Sylveon': {
            colors: {
                main: 'rgb(255, 150, 200)',     // Pink
                light: 'rgb(255, 200, 230)',   // Light pink
                dark: 'rgb(200, 100, 150)',    // Dark pink
                white: 'rgb(255, 255, 255)',   // White
                black: 'rgb(0, 0, 0)'
            },
            pattern: [
                '................',
                '..LLLLLLLL......',
                '.LLLLLLLLLLL....',
                '.LLLMMMMMLL....',
                '.LLMMWWMML.....',
                '.LLMMWWMML.....',
                '.LLLMMMMLL....',
                '.LLLLMMML......',
                '..LLLLL.........',
                '................',
                '................',
                '................'
            ]
        }
    };
}

const eeveelutions = [
    { name: 'Eevee', emoji: '🐹' },
    { name: 'Vaporeon', emoji: '💧' },
    { name: 'Jolteon', emoji: '⚡' },
    { name: 'Flareon', emoji: '🔥' },
    { name: 'Espeon', emoji: '✨' },
    { name: 'Umbreon', emoji: '🌙' },
    { name: 'Leafeon', emoji: '🍃' },
    { name: 'Glaceon', emoji: '❄️' },
    { name: 'Sylveon', emoji: '🎀' }
];

function renderEeveelutionGallery() {
    const grid = document.getElementById('eeveelutionGrid');
    grid.innerHTML = '';
    
    eeveelutions.forEach((eevee, index) => {
        const item = document.createElement('div');
        item.className = 'eeveelution-item';
        item.innerHTML = `
            <div class="eeveelution-preview">${eevee.emoji}</div>
            <div class="eeveelution-name">${eevee.name}</div>
        `;
        item.addEventListener('click', () => {
            copyEeveelution(eevee);
            document.getElementById('eeveelutionGallery').classList.remove('active');
        });
        grid.appendChild(item);
    });
}

function copyEeveelution(eevee) {
    state.history.push({...state.pixelData});
    const patterns = createEeveelutionPatterns();
    const pattern = patterns[eevee.name];
    
    if (pattern) {
        // Create pixel art from pattern
        state.pixelData = [];
        const colors = pattern.colors;
        
        for (let row = 0; row < state.gridSize; row++) {
            for (let col = 0; col < state.gridSize; col++) {
                if (row < pattern.pattern.length && col < pattern.pattern[0].length) {
                    const char = pattern.pattern[row][col];
                    let color = 'white';
                    
                    if (char === 'M') color = colors.main;
                    else if (char === 'L') color = colors.light;
                    else if (char === 'D') color = colors.dark;
                    else if (char === 'W') color = colors.white;
                    else if (char === 'B') color = colors.black;
                    
                    state.pixelData[getPixelIndex(row, col)] = color;
                } else {
                    state.pixelData[getPixelIndex(row, col)] = 'white';
                }
            }
        }
    }
    createPixelCanvas();
}

function loadSavedArtworks() {
    const list = document.getElementById('savedArtworksList');
    list.innerHTML = '';
    
    if (Object.keys(state.savedArtworks).length === 0) {
        list.innerHTML = '<p class="empty-message">No saved artworks yet!</p>';
        return;
    }
    
    Object.entries(state.savedArtworks).forEach(([id, artwork]) => {
        const item = document.createElement('div');
        item.className = 'saved-artwork-item';
        item.innerHTML = `
            <div class="artwork-name">${artwork.name}</div>
            <div class="artwork-date">${artwork.date}</div>
        `;
        item.addEventListener('click', () => loadArtwork(id, artwork));
        list.appendChild(item);
    });
}

function loadArtwork(id, artwork) {
    state.gridSize = artwork.gridSize;
    state.pixelData = [...artwork.data];
    state.history = [];
    document.getElementById('gridSizeSelect').value = state.gridSize;
    createPixelCanvas();
}

function saveCurrentArtwork() {
    if (state.currentUser) {
        localStorage.setItem(`pixelart_current_${state.currentUser}`, JSON.stringify(state.pixelData));
    }
}

// Save before leaving
window.addEventListener('beforeunload', () => {
    if (state.currentUser) {
        saveCurrentArtwork();
    }
});

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Additional event listeners can go here
}
