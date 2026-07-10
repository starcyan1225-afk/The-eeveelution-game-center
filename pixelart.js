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
            console.log('Eeveelution button clicked');
            const gallery = document.getElementById('eeveelutionGallery');
            if (gallery) {
                gallery.classList.add('active');
                renderEeveelutionGallery();
            } else {
                console.error('Gallery not found');
            }
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
function createEeveelutionPatterns() {
    const patterns = {};
    
    // 16x16 designs with detailed features
    
    // EEVEE - Classic brown Pokémon with ears and tail
    patterns['Eevee'] = {
        width: 16,
        height: 16,
        pixels: [
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
            [0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,0],
            [0,0,0,1,2,1,0,0,0,1,2,1,0,0,0,0],
            [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],
            [0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
            [0,1,2,2,2,2,2,2,2,2,2,1,0,0,0,0],
            [0,1,2,2,2,3,2,2,3,2,2,1,0,0,0,0],
            [0,1,2,2,2,2,2,2,2,2,2,1,0,1,1,0],
            [0,1,2,2,2,2,2,2,2,2,2,1,1,1,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,0,1,2,2,2,2,2,2,2,2,2,2,1,1,0],
            [0,0,1,2,2,2,2,2,2,2,2,2,1,1,0,0],
            [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ],
        colors: ['white', 'rgb(165, 105, 65)', 'rgb(200, 140, 100)', 'rgb(0,0,0)']
    };
    
    // VAPOREON - Blue water form with fin-like ears
    patterns['Vaporeon'] = {
        width: 16,
        height: 16,
        pixels: [
            [0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0],
            [0,0,0,1,1,1,1,0,0,0,1,1,1,1,0,0],
            [0,0,1,1,2,2,1,1,0,1,1,2,2,1,1,0],
            [0,0,1,2,2,2,2,1,0,1,2,2,2,2,1,0],
            [0,0,1,2,2,2,2,1,0,1,2,2,2,2,1,0],
            [0,1,1,2,2,2,2,1,1,1,2,2,2,2,1,1],
            [0,1,2,2,2,3,2,2,2,2,2,3,2,2,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,0,1,2,2,2,2,2,2,2,2,2,2,2,1,0],
            [0,0,1,1,2,2,2,2,2,2,2,2,2,1,1,0],
            [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ],
        colors: ['white', 'rgb(70, 160, 220)', 'rgb(150, 210, 240)', 'rgb(0,0,0)']
    };
    
    // JOLTEON - Yellow spiky form
    patterns['Jolteon'] = {
        width: 16,
        height: 16,
        pixels: [
            [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0],
            [0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0],
            [0,1,1,2,2,1,1,0,0,1,1,2,2,1,1,0],
            [0,1,2,2,2,2,1,0,0,1,2,2,2,2,1,0],
            [1,1,2,2,2,2,1,1,1,1,2,2,2,2,1,1],
            [1,2,2,2,3,2,2,2,2,2,2,3,2,2,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,1,0],
            [0,0,1,2,2,2,2,2,2,2,2,2,2,1,0,0],
            [0,0,1,1,2,2,2,2,2,2,2,2,1,1,0,0],
            [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ],
        colors: ['white', 'rgb(255, 220, 70)', 'rgb(255, 240, 120)', 'rgb(0,0,0)']
    };
    
    // FLAREON - Orange fluffy form with fire-like tail
    patterns['Flareon'] = {
        width: 16,
        height: 16,
        pixels: [
            [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
            [0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,0],
            [0,0,0,1,2,1,0,0,0,1,2,1,0,0,0,0],
            [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
            [0,1,2,2,2,2,2,2,2,2,2,1,0,1,1,0],
            [0,1,2,2,2,3,2,2,3,2,2,1,1,1,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,0,1,2,2,2,2,2,2,2,2,2,2,2,1,0],
            [0,0,1,1,2,2,2,2,2,2,2,2,2,1,1,0],
            [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ],
        colors: ['white', 'rgb(255, 140, 40)', 'rgb(255, 180, 100)', 'rgb(0,0,0)']
    };
    
    // ESPEON - Purple with psychic third eye
    patterns['Espeon'] = {
        width: 16,
        height: 16,
        pixels: [
            [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
            [0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,0],
            [0,0,0,1,2,1,0,0,0,1,2,1,0,0,0,0],
            [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],
            [0,0,1,1,4,1,1,1,1,1,4,1,1,0,0,0],
            [0,1,2,2,2,2,2,2,2,2,2,2,1,0,0,0],
            [0,1,2,2,2,3,2,2,3,2,2,2,1,0,0,0],
            [0,1,2,2,2,2,2,2,2,2,2,2,1,0,0,0],
            [0,1,2,2,2,2,2,2,2,2,2,2,1,0,0,0],
            [0,1,2,2,2,2,2,2,2,2,2,2,1,0,0,0],
            [0,1,2,2,2,2,2,2,2,2,2,2,1,0,0,0],
            [0,0,1,2,2,2,2,2,2,2,2,2,1,0,0,0],
            [0,0,1,1,2,2,2,2,2,2,2,1,1,0,0,0],
            [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ],
        colors: ['white', 'rgb(180, 100, 220)', 'rgb(220, 150, 250)', 'rgb(0,0,0)', 'rgb(200, 100, 240)']
    };
    
    // UMBREON - Dark with yellow rings
    patterns['Umbreon'] = {
        width: 16,
        height: 16,
        pixels: [
            [0,0,0,0,4,4,0,0,0,0,4,4,0,0,0,0],
            [0,0,0,4,4,4,0,0,0,4,4,4,0,0,0,0],
            [0,0,0,4,1,4,0,0,0,4,1,4,0,0,0,0],
            [0,0,0,0,4,0,0,0,0,0,4,0,0,0,0,0],
            [0,0,4,4,1,4,4,4,4,4,1,4,4,0,0,0],
            [0,4,1,1,1,1,1,1,1,1,1,1,4,0,0,0],
            [0,4,1,1,1,3,1,1,3,1,1,1,4,0,0,0],
            [0,4,1,1,1,1,1,1,1,1,1,1,4,0,0,0],
            [0,4,1,1,1,1,1,1,1,1,1,1,4,0,0,0],
            [0,4,1,1,1,1,1,1,1,1,1,1,4,0,0,0],
            [0,4,1,1,1,1,1,1,1,1,1,1,4,0,0,0],
            [0,0,4,1,1,1,1,1,1,1,1,1,4,0,0,0],
            [0,0,4,4,1,1,1,1,1,1,1,4,4,0,0,0],
            [0,0,0,4,4,4,4,4,4,4,4,4,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ],
        colors: ['white', 'rgb(40, 40, 50)', 'rgb(100, 100, 120)', 'rgb(0,0,0)', 'rgb(255, 220, 0)']
    };
    
    // LEAFEON - Green with leaf-like features
    patterns['Leafeon'] = {
        width: 16,
        height: 16,
        pixels: [
            [0,0,0,0,5,5,0,0,0,0,5,5,0,0,0,0],
            [0,0,0,5,5,5,0,0,0,5,5,5,0,0,0,0],
            [0,0,0,5,1,5,0,0,0,5,1,5,0,0,0,0],
            [0,0,0,0,5,0,0,0,0,0,5,0,0,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
            [0,1,2,2,2,2,2,2,2,2,2,1,0,1,1,0],
            [0,1,2,2,2,3,2,2,3,2,2,1,1,1,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,0,1,2,2,2,2,2,2,2,2,2,2,2,1,0],
            [0,0,1,1,2,2,2,2,2,2,2,2,2,1,1,0],
            [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ],
        colors: ['white', 'rgb(100, 180, 80)', 'rgb(150, 220, 120)', 'rgb(0,0,0)', 'rgb(80, 140, 40)', 'rgb(120, 200, 100)']
    };
    
    // GLACEON - Ice blue with crystal spikes
    patterns['Glaceon'] = {
        width: 16,
        height: 16,
        pixels: [
            [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
            [0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,0],
            [0,0,0,1,2,1,0,0,0,1,2,1,0,0,0,0],
            [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],
            [0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
            [0,1,2,2,2,2,2,2,2,2,2,1,0,1,1,0],
            [0,1,2,2,2,3,2,2,3,2,2,1,1,1,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [0,0,1,2,2,2,2,2,2,2,2,2,2,2,1,0],
            [0,0,1,1,2,2,2,2,2,2,2,2,2,1,1,0],
            [0,0,0,1,1,1,1,1,1,1,1,1,1,1,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ],
        colors: ['white', 'rgb(150, 220, 240)', 'rgb(200, 240, 255)', 'rgb(0,0,0)']
    };
    
    // SYLVEON - Pink ribbon Eeveelution
    patterns['Sylveon'] = {
        width: 16,
        height: 16,
        pixels: [
            [0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0],
            [0,0,0,1,1,1,0,0,0,1,1,1,0,0,0,0],
            [0,0,0,1,2,1,0,0,0,1,2,1,0,0,0,0],
            [0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],
            [0,4,1,1,1,1,1,1,1,1,1,1,1,4,0,0],
            [0,4,2,2,2,2,2,2,2,2,2,2,2,4,0,0],
            [0,4,2,2,2,3,2,2,3,2,2,2,2,4,0,0],
            [0,4,2,2,2,2,2,2,2,2,2,2,2,4,0,0],
            [0,4,2,2,2,2,2,2,2,2,2,2,2,4,0,0],
            [0,4,2,2,2,2,2,2,2,2,2,2,2,4,0,0],
            [0,4,2,2,2,2,2,2,2,2,2,2,2,4,0,0],
            [0,0,4,2,2,2,2,2,2,2,2,2,2,4,0,0],
            [0,0,4,4,2,2,2,2,2,2,2,2,4,4,0,0],
            [0,0,0,4,4,4,4,4,4,4,4,4,4,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
        ],
        colors: ['white', 'rgb(220, 100, 180)', 'rgb(240, 150, 220)', 'rgb(0,0,0)', 'rgb(255, 180, 220)']
    };
    
    return patterns;
}

function renderEeveelutionGallery() {
    const patterns = createEeveelutionPatterns();
    const grid = document.getElementById('eeveelutionGrid');
    if (!grid) {
        console.error('eeveelutionGrid not found');
        return;
    }
    
    grid.innerHTML = '';
    
    Object.entries(patterns).forEach(([name, pattern]) => {
        const card = document.createElement('div');
        card.className = 'eeveelution-card';
        
        const canvas = document.createElement('canvas');
        const pixelSize = 20;
        canvas.width = pattern.width * pixelSize;
        canvas.height = pattern.height * pixelSize;
        const ctx = canvas.getContext('2d');
        
        // Draw the pixel art
        for (let y = 0; y < pattern.height; y++) {
            for (let x = 0; x < pattern.width; x++) {
                const colorIndex = pattern.pixels[y][x];
                const color = pattern.colors[colorIndex];
                ctx.fillStyle = color;
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                
                // Add grid lines for clarity
                ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                ctx.lineWidth = 0.5;
                ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }
        
        card.appendChild(canvas);
        const label = document.createElement('h4');
        label.textContent = name;
        card.appendChild(label);
        
        card.addEventListener('click', () => {
            loadEeveelutionPattern(name, pattern);
            document.getElementById('eeveelutionGallery').classList.remove('active');
        });
        
        grid.appendChild(card);
    });
}

function loadEeveelutionPattern(name, pattern) {
    state.history.push({...state.pixelData});
    state.pixelData = [];
    state.gridSize = 24; // Reset to default grid size
    
    // Convert pattern to 24x24 grid (centered with padding)
    const canvasData = new Array(24 * 24).fill(null);
    
    // Center the pattern
    const startX = Math.floor((24 - pattern.width) / 2);
    const startY = Math.floor((24 - pattern.height) / 2);
    
    for (let y = 0; y < pattern.height; y++) {
        for (let x = 0; x < pattern.width; x++) {
            const colorIndex = pattern.pixels[y][x];
            if (colorIndex !== 0) {
                const color = pattern.colors[colorIndex];
                const canvasIndex = (startY + y) * 24 + (startX + x);
                canvasData[canvasIndex] = color;
            }
        }
    }
    
    state.pixelData = canvasData;
    createPixelCanvas();
    alert(`🐹 Loaded ${name}! Ready to customize!`);
}

function loadSavedArtworks() {
    const container = document.getElementById('savedArtworksList');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (Object.keys(state.savedArtworks).length === 0) {
        container.innerHTML = '<p class="empty-message">No saved artworks yet!</p>';
        return;
    }
    
    Object.entries(state.savedArtworks).forEach(([id, artwork]) => {
        const item = document.createElement('div');
        item.className = 'saved-artwork-item';
        
        const title = document.createElement('h4');
        title.textContent = artwork.name;
        
        const date = document.createElement('p');
        date.textContent = artwork.date;
        date.className = 'artwork-date';
        
        const canvas = document.createElement('canvas');
        canvas.width = artwork.gridSize * 8;
        canvas.height = artwork.gridSize * 8;
        const ctx = canvas.getContext('2d');
        
        let index = 0;
        for (let i = 0; i < artwork.gridSize; i++) {
            for (let j = 0; j < artwork.gridSize; j++) {
                const color = artwork.data[index] || 'white';
                ctx.fillStyle = color;
                ctx.fillRect(j * 8, i * 8, 8, 8);
                index++;
            }
        }
        
        const buttons = document.createElement('div');
        buttons.className = 'artwork-buttons';
        
        const loadBtn = document.createElement('button');
        loadBtn.textContent = '📂 Load';
        loadBtn.className = 'btn-secondary';
        loadBtn.addEventListener('click', () => {
            state.pixelData = [...artwork.data];
            state.gridSize = artwork.gridSize;
            createPixelCanvas();
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️ Delete';
        deleteBtn.className = 'btn-warning';
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Delete "${artwork.name}"?`)) {
                delete state.savedArtworks[id];
                localStorage.setItem(`pixelart_artworks_${state.currentUser}`, JSON.stringify(state.savedArtworks));
                loadSavedArtworks();
            }
        });
        
        buttons.appendChild(loadBtn);
        buttons.appendChild(deleteBtn);
        
        item.appendChild(title);
        item.appendChild(date);
        item.appendChild(canvas);
        item.appendChild(buttons);
        container.appendChild(item);
    });
}

function saveCurrentArtwork() {
    if (state.pixelData.length > 0) {
        const id = Date.now();
        state.savedArtworks[id] = {
            name: 'Untitled',
            data: [...state.pixelData],
            date: new Date().toLocaleDateString(),
            gridSize: state.gridSize
        };
        localStorage.setItem(`pixelart_artworks_${state.currentUser}`, JSON.stringify(state.savedArtworks));
    }
}

function setupEventListeners() {
    // Setup event listeners for pixel canvas
}
