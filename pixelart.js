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
function createEeveelutionPatterns() {
    return {
        'Eevee': {
            width: 16,
            height: 16,
            data: [
                'white','white','white','brown','brown','white','white','white','white','white','white','white','white','white','white','white',
                'white','white','brown','brown','brown','brown','white','white','white','white','white','white','white','white','white','white',
                'white','brown','brown','tan','tan','brown','brown','white','white','white','white','white','white','white','white','white',
                'white','brown','tan','tan','tan','tan','brown','white','white','white','white','white','white','white','white','white',
                'brown','brown','tan','black','black','tan','brown','brown','white','white','white','white','white','white','white','white',
                'brown','tan','tan','black','black','tan','tan','brown','white','white','white','white','white','white','white','white',
                'white','brown','tan','tan','tan','tan','brown','white','white','white','brown','brown','white','white','white','white',
                'white','brown','brown','tan','tan','brown','brown','white','white','brown','brown','brown','brown','white','white','white',
                'white','white','brown','brown','brown','brown','white','white','brown','brown','tan','tan','brown','brown','white','white',
                'white','white','white','brown','brown','white','white','white','brown','tan','tan','tan','tan','brown','white','white',
                'white','white','white','white','white','white','white','white','brown','tan','tan','tan','tan','brown','white','white',
                'white','white','white','white','white','white','white','white','brown','brown','tan','tan','brown','brown','white','white',
                'white','white','white','white','white','white','white','white','white','brown','brown','brown','brown','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','brown','brown','white','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','white','white','white','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','white','white','white','white','white','white'
            ],
            colors: {
                'white': 'rgb(255, 255, 255)',
                'brown': 'rgb(165, 105, 65)',
                'tan': 'rgb(220, 180, 130)',
                'black': 'rgb(0, 0, 0)'
            }
        },
        'Vaporeon': {
            width: 16,
            height: 16,
            data: [
                'white','white','white','cyan','cyan','white','white','white','white','white','white','white','white','white','white','white',
                'white','white','cyan','cyan','cyan','cyan','white','white','white','white','white','white','white','white','white','white',
                'white','cyan','cyan','lightblue','lightblue','cyan','cyan','white','white','white','white','white','white','white','white','white',
                'white','cyan','lightblue','lightblue','lightblue','lightblue','cyan','white','white','white','white','white','white','white','white','white',
                'cyan','cyan','lightblue','black','black','lightblue','cyan','cyan','white','white','white','white','white','white','white','white',
                'cyan','lightblue','lightblue','black','black','lightblue','lightblue','cyan','white','white','white','white','white','white','white','white',
                'white','cyan','lightblue','lightblue','lightblue','lightblue','cyan','white','white','white','cyan','cyan','white','white','white','white',
                'white','cyan','cyan','lightblue','lightblue','cyan','cyan','white','white','cyan','cyan','cyan','cyan','white','white','white',
                'white','white','cyan','cyan','cyan','cyan','white','white','cyan','cyan','lightblue','lightblue','cyan','cyan','white','white',
                'white','white','white','cyan','cyan','white','white','white','cyan','lightblue','lightblue','lightblue','lightblue','cyan','white','white',
                'white','white','white','white','white','white','white','white','cyan','lightblue','lightblue','lightblue','lightblue','cyan','white','white',
                'white','white','white','white','white','white','white','white','cyan','cyan','lightblue','lightblue','cyan','cyan','white','white',
                'white','white','white','white','white','white','white','white','white','cyan','cyan','cyan','cyan','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','cyan','cyan','white','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','white','white','white','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','white','white','white','white','white','white'
            ],
            colors: {
                'white': 'rgb(255, 255, 255)',
                'cyan': 'rgb(100, 200, 220)',
                'lightblue': 'rgb(150, 220, 240)',
                'black': 'rgb(0, 0, 0)'
            }
        },
        'Jolteon': {
            width: 16,
            height: 16,
            data: [
                'white','white','white','yellow','yellow','white','white','white','white','white','white','white','white','white','white','white',
                'white','white','yellow','yellow','yellow','yellow','white','white','white','white','white','white','white','white','white','white',
                'white','yellow','yellow','lightyellow','lightyellow','yellow','yellow','white','white','white','white','white','white','white','white','white',
                'white','yellow','lightyellow','lightyellow','lightyellow','lightyellow','yellow','white','white','white','white','white','white','white','white','white',
                'yellow','yellow','lightyellow','black','black','lightyellow','yellow','yellow','white','white','white','white','white','white','white','white',
                'yellow','lightyellow','lightyellow','black','black','lightyellow','lightyellow','yellow','white','white','white','white','white','white','white','white',
                'white','yellow','lightyellow','lightyellow','lightyellow','lightyellow','yellow','white','white','white','yellow','yellow','white','white','white','white',
                'white','yellow','yellow','lightyellow','lightyellow','yellow','yellow','white','white','yellow','yellow','yellow','yellow','white','white','white',
                'white','white','yellow','yellow','yellow','yellow','white','white','yellow','yellow','lightyellow','lightyellow','yellow','yellow','white','white',
                'white','white','white','yellow','yellow','white','white','white','yellow','lightyellow','lightyellow','lightyellow','lightyellow','yellow','white','white',
                'white','white','white','white','white','white','white','white','yellow','lightyellow','lightyellow','lightyellow','lightyellow','yellow','white','white',
                'white','white','white','white','white','white','white','white','yellow','yellow','lightyellow','lightyellow','yellow','yellow','white','white',
                'white','white','white','white','white','white','white','white','white','yellow','yellow','yellow','yellow','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','yellow','yellow','white','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','white','white','white','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','white','white','white','white','white','white'
            ],
            colors: {
                'white': 'rgb(255, 255, 255)',
                'yellow': 'rgb(255, 220, 0)',
                'lightyellow': 'rgb(255, 240, 100)',
                'black': 'rgb(0, 0, 0)'
            }
        },
        'Flareon': {
            width: 16,
            height: 16,
            data: [
                'white','white','white','orange','orange','white','white','white','white','white','white','white','white','white','white','white',
                'white','white','orange','orange','orange','orange','white','white','white','white','white','white','white','white','white','white',
                'white','orange','orange','lightorange','lightorange','orange','orange','white','white','white','white','white','white','white','white','white',
                'white','orange','lightorange','lightorange','lightorange','lightorange','orange','white','white','white','white','white','white','white','white','white',
                'orange','orange','lightorange','black','black','lightorange','orange','orange','white','white','white','white','white','white','white','white',
                'orange','lightorange','lightorange','black','black','lightorange','lightorange','orange','white','white','white','white','white','white','white','white',
                'white','orange','lightorange','lightorange','lightorange','lightorange','orange','white','white','white','orange','orange','white','white','white','white',
                'white','orange','orange','lightorange','lightorange','orange','orange','white','white','orange','orange','orange','orange','white','white','white',
                'white','white','orange','orange','orange','orange','white','white','orange','orange','lightorange','lightorange','orange','orange','white','white',
                'white','white','white','orange','orange','white','white','white','orange','lightorange','lightorange','lightorange','lightorange','orange','white','white',
                'white','white','white','white','white','white','white','white','orange','lightorange','lightorange','lightorange','lightorange','orange','white','white',
                'white','white','white','white','white','white','white','white','orange','orange','lightorange','lightorange','orange','orange','white','white',
                'white','white','white','white','white','white','white','white','white','orange','orange','orange','orange','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','orange','orange','white','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','white','white','white','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','white','white','white','white','white','white'
            ],
            colors: {
                'white': 'rgb(255, 255, 255)',
                'orange': 'rgb(255, 140, 0)',
                'lightorange': 'rgb(255, 180, 80)',
                'black': 'rgb(0, 0, 0)'
            }
        },
        'Espeon': {
            width: 16,
            height: 16,
            data: [
                'white','white','white','purple','purple','white','white','white','white','white','white','white','white','white','white','white',
                'white','white','purple','purple','purple','purple','white','white','white','white','white','white','white','white','white','white',
                'white','purple','purple','lightpurple','lightpurple','purple','purple','white','white','white','white','white','white','white','white','white',
                'white','purple','lightpurple','lightpurple','lightpurple','lightpurple','purple','white','white','white','white','white','white','white','white','white',
                'purple','purple','lightpurple','black','black','lightpurple','purple','purple','white','white','white','white','white','white','white','white',
                'purple','lightpurple','lightpurple','black','black','lightpurple','lightpurple','purple','white','white','white','white','white','white','white','white',
                'white','purple','lightpurple','lightpurple','lightpurple','lightpurple','purple','white','white','white','purple','purple','white','white','white','white',
                'white','purple','purple','lightpurple','lightpurple','purple','purple','white','white','purple','purple','purple','purple','white','white','white',
                'white','white','purple','purple','purple','purple','white','white','purple','purple','lightpurple','lightpurple','purple','purple','white','white',
                'white','white','white','purple','purple','white','white','white','purple','lightpurple','lightpurple','lightpurple','lightpurple','purple','white','white',
                'white','white','white','white','white','white','white','white','purple','lightpurple','lightpurple','lightpurple','lightpurple','purple','white','white',
                'white','white','white','white','white','white','white','white','purple','purple','lightpurple','lightpurple','purple','purple','white','white',
                'white','white','white','white','white','white','white','white','white','purple','purple','purple','purple','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','purple','purple','white','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','white','white','white','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','white','white','white','white','white','white'
            ],
            colors: {
                'white': 'rgb(255, 255, 255)',
                'purple': 'rgb(180, 100, 200)',
                'lightpurple': 'rgb(220, 150, 240)',
                'black': 'rgb(0, 0, 0)'
            }
        },
        'Umbreon': {
            width: 16,
            height: 16,
            data: [
                'white','white','white','black','black','white','white','white','white','white','white','white','white','white','white','white',
                'white','white','black','black','black','black','white','white','white','white','white','white','white','white','white','white',
                'white','black','black','darkgray','darkgray','black','black','white','white','white','white','white','white','white','white','white',
                'white','black','darkgray','darkgray','darkgray','darkgray','black','white','white','white','white','white','white','white','white','white',
                'black','black','darkgray','yellow','yellow','darkgray','black','black','white','white','white','white','white','white','white','white',
                'black','darkgray','darkgray','yellow','yellow','darkgray','darkgray','black','white','white','white','white','white','white','white','white',
                'white','black','darkgray','darkgray','darkgray','darkgray','black','white','white','white','black','black','white','white','white','white',
                'white','black','black','darkgray','darkgray','black','black','white','white','black','black','black','black','white','white','white',
                'white','white','black','black','black','black','white','white','black','black','darkgray','darkgray','black','black','white','white',
                'white','white','white','black','black','white','white','white','black','darkgray','darkgray','darkgray','darkgray','black','white','white',
                'white','white','white','white','white','white','white','white','black','darkgray','darkgray','darkgray','darkgray','black','white','white',
                'white','white','white','white','white','white','white','white','black','black','darkgray','darkgray','black','black','white','white',
                'white','white','white','white','white','white','white','white','white','black','black','black','black','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','black','black','white','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','white','white','white','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','white','white','white','white','white','white'
            ],
            colors: {
                'white': 'rgb(255, 255, 255)',
                'black': 'rgb(40, 40, 50)',
                'darkgray': 'rgb(100, 100, 120)',
                'yellow': 'rgb(255, 220, 0)'
            }
        },
        'Leafeon': {
            width: 16,
            height: 16,
            data: [
                'white','white','white','green','green','white','white','white','white','white','white','white','white','white','white','white',
                'white','white','green','green','green','green','white','white','white','white','white','white','white','white','white','white',
                'white','green','green','lightgreen','lightgreen','green','green','white','white','white','white','white','white','white','white','white',
                'white','green','lightgreen','lightgreen','lightgreen','lightgreen','green','white','white','white','white','white','white','white','white','white',
                'green','green','lightgreen','black','black','lightgreen','green','green','white','white','white','white','white','white','white','white',
                'green','lightgreen','lightgreen','black','black','lightgreen','lightgreen','green','white','white','white','white','white','white','white','white',
                'white','green','lightgreen','lightgreen','lightgreen','lightgreen','green','white','white','white','green','green','white','white','white','white',
                'white','green','green','lightgreen','lightgreen','green','green','white','white','green','green','green','green','white','white','white',
                'white','white','green','green','green','green','white','white','green','green','lightgreen','lightgreen','green','green','white','white',
                'white','white','white','green','green','white','white','white','green','lightgreen','lightgreen','lightgreen','lightgreen','green','white','white',
                'white','white','white','white','white','white','white','white','green','lightgreen','lightgreen','lightgreen','lightgreen','green','white','white',
                'white','white','white','white','white','white','white','white','green','green','lightgreen','lightgreen','green','green','white','white',
                'white','white','white','white','white','white','white','white','white','green','green','green','green','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','green','green','white','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','white','white','white','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','white','white','white','white','white','white'
            ],
            colors: {
                'white': 'rgb(255, 255, 255)',
                'green': 'rgb(100, 180, 80)',
                'lightgreen': 'rgb(150, 220, 120)',
                'black': 'rgb(0, 0, 0)'
            }
        },
        'Glaceon': {
            width: 16,
            height: 16,
            data: [
                'white','white','white','ice','ice','white','white','white','white','white','white','white','white','white','white','white',
                'white','white','ice','ice','ice','ice','white','white','white','white','white','white','white','white','white','white',
                'white','ice','ice','lightice','lightice','ice','ice','white','white','white','white','white','white','white','white','white',
                'white','ice','lightice','lightice','lightice','lightice','ice','white','white','white','white','white','white','white','white','white',
                'ice','ice','lightice','black','black','lightice','ice','ice','white','white','white','white','white','white','white','white',
                'ice','lightice','lightice','black','black','lightice','lightice','ice','white','white','white','white','white','white','white','white',
                'white','ice','lightice','lightice','lightice','lightice','ice','white','white','white','ice','ice','white','white','white','white',
                'white','ice','ice','lightice','lightice','ice','ice','white','white','ice','ice','ice','ice','white','white','white',
                'white','white','ice','ice','ice','ice','white','white','ice','ice','lightice','lightice','ice','ice','white','white',
                'white','white','white','ice','ice','white','white','white','ice','lightice','lightice','lightice','lightice','ice','white','white',
                'white','white','white','white','white','white','white','white','ice','lightice','lightice','lightice','lightice','ice','white','white',
                'white','white','white','white','white','white','white','white','ice','ice','lightice','lightice','ice','ice','white','white',
                'white','white','white','white','white','white','white','white','white','ice','ice','ice','ice','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','ice','ice','white','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','white','white','white','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','white','white','white','white','white','white'
            ],
            colors: {
                'white': 'rgb(255, 255, 255)',
                'ice': 'rgb(150, 220, 240)',
                'lightice': 'rgb(200, 240, 255)',
                'black': 'rgb(0, 0, 0)'
            }
        },
        'Sylveon': {
            width: 16,
            height: 16,
            data: [
                'white','white','white','pink','pink','white','white','white','white','white','white','white','white','white','white','white',
                'white','white','pink','pink','pink','pink','white','white','white','white','white','white','white','white','white','white',
                'white','pink','pink','lightpink','lightpink','pink','pink','white','white','white','white','white','white','white','white','white',
                'white','pink','lightpink','lightpink','lightpink','lightpink','pink','white','white','white','white','white','white','white','white','white',
                'pink','pink','lightpink','black','black','lightpink','pink','pink','white','white','white','white','white','white','white','white',
                'pink','lightpink','lightpink','black','black','lightpink','lightpink','pink','white','white','white','white','white','white','white','white',
                'white','pink','lightpink','lightpink','lightpink','lightpink','pink','white','white','white','pink','pink','white','white','white','white',
                'white','pink','pink','lightpink','lightpink','pink','pink','white','white','pink','pink','pink','pink','white','white','white',
                'white','white','pink','pink','pink','pink','white','white','pink','pink','lightpink','lightpink','pink','pink','white','white',
                'white','white','white','pink','pink','white','white','white','pink','lightpink','lightpink','lightpink','lightpink','pink','white','white',
                'white','white','white','white','white','white','white','white','pink','lightpink','lightpink','lightpink','lightpink','pink','white','white',
                'white','white','white','white','white','white','white','white','pink','pink','lightpink','lightpink','pink','pink','white','white',
                'white','white','white','white','white','white','white','white','white','pink','pink','pink','pink','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','pink','pink','white','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','white','white','white','white','white','white',
                'white','white','white','white','white','white','white','white','white','white','white','white','white','white','white','white'
            ],
            colors: {
                'white': 'rgb(255, 255, 255)',
                'pink': 'rgb(220, 100, 180)',
                'lightpink': 'rgb(240, 150, 220)',
                'black': 'rgb(0, 0, 0)'
            }
        }
    };
}

function renderEeveelutionGallery() {
    const patterns = createEeveelutionPatterns();
    const grid = document.getElementById('eeveelutionGrid');
    grid.innerHTML = '';
    
    Object.entries(patterns).forEach(([name, pattern]) => {
        const card = document.createElement('div');
        card.className = 'eeveelution-card';
        
        const canvas = document.createElement('canvas');
        canvas.width = pattern.width * 10;
        canvas.height = pattern.height * 10;
        const ctx = canvas.getContext('2d');
        
        // Draw the pixel art
        let pixelIndex = 0;
        for (let y = 0; y < pattern.height; y++) {
            for (let x = 0; x < pattern.width; x++) {
                const colorKey = pattern.data[pixelIndex];
                const color = pattern.colors[colorKey];
                ctx.fillStyle = color;
                ctx.fillRect(x * 10, y * 10, 10, 10);
                pixelIndex++;
            }
        }
        
        card.appendChild(canvas);
        const label = document.createElement('h4');
        label.textContent = name;
        card.appendChild(label);
        
        card.addEventListener('click', () => {
            loadEeveelutionPattern(pattern);
            document.getElementById('eeveelutionGallery').classList.remove('active');
        });
        
        grid.appendChild(card);
    });
}

function loadEeveelutionPattern(pattern) {
    state.history.push({...state.pixelData});
    state.pixelData = [];
    
    let pixelIndex = 0;
    for (let y = 0; y < pattern.height; y++) {
        for (let x = 0; x < pattern.width; x++) {
            const colorKey = pattern.data[pixelIndex];
            const color = pattern.colors[colorKey];
            if (colorKey !== 'white') {
                state.pixelData.push(color);
            } else {
                state.pixelData.push(null);
            }
            pixelIndex++;
        }
    }
    
    createPixelCanvas();
    alert(`🐹 Loaded ${name}! Ready to customize!`);
}

function loadSavedArtworks() {
    const container = document.getElementById('savedArtworksList');
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
