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

// Initialize application when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, initializing...');
    loadUserData();
    updateLoginUI();
    setupAllListeners();
});

// ===== LOGIN SYSTEM =====
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

function setupAllListeners() {
    // LOGIN BUTTON
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }

    // LOGOUT BUTTON
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            saveCurrentArtwork();
            state.currentUser = null;
            localStorage.removeItem('pixelart_currentUser');
            state.pixelData = [];
            state.history = [];
            document.getElementById('usernameInput').value = '';
            document.getElementById('passwordInput').value = '';
            updateLoginUI();
        });
    }

    // Enter key for login
    const usernameInput = document.getElementById('usernameInput');
    const passwordInput = document.getElementById('passwordInput');
    if (usernameInput && passwordInput) {
        usernameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleLogin();
        });
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') handleLogin();
        });
    }

    // COLOR SLIDERS
    const redSlider = document.getElementById('redSlider');
    const greenSlider = document.getElementById('greenSlider');
    const blueSlider = document.getElementById('blueSlider');
    
    if (redSlider) redSlider.addEventListener('input', updateColorPreview);
    if (greenSlider) greenSlider.addEventListener('input', updateColorPreview);
    if (blueSlider) blueSlider.addEventListener('input', updateColorPreview);

    // BRUSH MODE
    const brushMode = document.getElementById('brushMode');
    if (brushMode) {
        brushMode.addEventListener('change', function(e) {
            state.currentBrush = e.target.value;
        });
    }

    // GRID SIZE
    const gridSizeSelect = document.getElementById('gridSizeSelect');
    if (gridSizeSelect) {
        gridSizeSelect.addEventListener('change', function(e) {
            state.gridSize = parseInt(e.target.value);
            state.pixelData = [];
            state.history = [];
            createPixelCanvas();
        });
    }

    // CLEAR BUTTON
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear the canvas?')) {
                state.history.push({...state.pixelData});
                state.pixelData = [];
                createPixelCanvas();
            }
        });
    }

    // UNDO BUTTON
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.addEventListener('click', function() {
            if (state.history.length > 0) {
                state.pixelData = state.history.pop();
                createPixelCanvas();
            }
        });
    }

    // EEVEELUTION BUTTON
    const eeveelutionBtn = document.getElementById('eeveelutionBtn');
    if (eeveelutionBtn) {
        eeveelutionBtn.addEventListener('click', function() {
            document.getElementById('eeveelutionGallery').classList.add('active');
            renderEeveelutionGallery();
        });
    }

    // CLOSE GALLERY
    const closeGalleryBtn = document.getElementById('closeGalleryBtn');
    if (closeGalleryBtn) {
        closeGalleryBtn.addEventListener('click', function() {
            document.getElementById('eeveelutionGallery').classList.remove('active');
        });
    }

    // SAVE BUTTON
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            document.getElementById('saveDialog').classList.add('active');
        });
    }

    // CLOSE SAVE DIALOG
    const closeSaveDialogBtn = document.getElementById('closeSaveDialogBtn');
    if (closeSaveDialogBtn) {
        closeSaveDialogBtn.addEventListener('click', function() {
            document.getElementById('saveDialog').classList.remove('active');
        });
    }

    // CANCEL SAVE
    const cancelSaveBtn = document.getElementById('cancelSaveBtn');
    if (cancelSaveBtn) {
        cancelSaveBtn.addEventListener('click', function() {
            document.getElementById('saveDialog').classList.remove('active');
        });
    }

    // CONFIRM SAVE
    const confirmSaveBtn = document.getElementById('confirmSaveBtn');
    if (confirmSaveBtn) {
        confirmSaveBtn.addEventListener('click', function() {
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

// ===== HANDLE LOGIN WITH PASSWORD =====
function handleLogin() {
    const username = document.getElementById('usernameInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    
    if (!username) {
        alert('Please enter a username!');
        return;
    }
    
    if (!password) {
        alert('Please enter a password!');
        return;
    }
    
    if (password.length < 3) {
        alert('Password must be at least 3 characters!');
        return;
    }
    
    // Get stored credentials
    const storedPassword = localStorage.getItem(`pixelart_password_${username}`);
    
    if (storedPassword && storedPassword !== password) {
        // User exists but wrong password
        alert('❌ Wrong password! Try again.');
        document.getElementById('passwordInput').value = '';
        return;
    }
    
    // Store password for this user (only if new account)
    if (!storedPassword) {
        localStorage.setItem(`pixelart_password_${username}`, password);
    }
    
    // Login successful
    state.currentUser = username;
    localStorage.setItem('pixelart_currentUser', username);
    state.savedArtworks = JSON.parse(localStorage.getItem(`pixelart_artworks_${username}`) || '{}');
    state.pixelData = JSON.parse(localStorage.getItem(`pixelart_current_${username}`) || '[]');
    updateLoginUI();
    document.getElementById('usernameInput').value = '';
    document.getElementById('passwordInput').value = '';
}

// ===== CREATOR INITIALIZATION =====
function initializeCreator() {
    createPixelCanvas();
    updateColorPreview();
}

function createPixelCanvas() {
    const canvas = document.getElementById('pixelCanvas');
    canvas.innerHTML = '';
    const size = state.gridSize;
    canvas.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    canvas.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    
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
        
        pixel.addEventListener('click', function() {
            onPixelClick(i, pixel);
        });
        pixel.addEventListener('mouseenter', function(e) {
            if (e.buttons === 1) onPixelClick(i, pixel);
        });
        
        canvas.appendChild(pixel);
    }
}

function getPixelIndex(row, col) {
    return row * state.gridSize + col;
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

function paintPixel(index, pixelElement) {
    const oldColor = state.pixelData[index] || 'white';
    const newColor = state.currentColor;
    
    if (oldColor !== newColor) {
        state.history.push({...state.pixelData});
        state.pixelData[index] = newColor;
        pixelElement.style.background = newColor;
    }
}

// ===== SPARKLE BRUSH =====
function paintSparkle(centerIndex) {
    state.history.push({...state.pixelData});
    const row = Math.floor(centerIndex / state.gridSize);
    const col = centerIndex % state.gridSize;
    
    const sparkleColors = [
        state.currentColor,
        'rgb(255, 255, 150)',
        'rgb(255, 240, 100)'
    ];
    
    const offsets = [
        {r: 0, c: 0, color: sparkleColors[0]},
        {r: -1, c: 0, color: sparkleColors[1]},
        {r: 1, c: 0, color: sparkleColors[1]},
        {r: 0, c: -1, color: sparkleColors[1]},
        {r: 0, c: 1, color: sparkleColors[1]},
        {r: -1, c: -1, color: sparkleColors[2]},
        {r: -1, c: 1, color: sparkleColors[2]},
        {r: 1, c: -1, color: sparkleColors[2]},
        {r: 1, c: 1, color: sparkleColors[2]}
    ];
    
    offsets.forEach(function(offset) {
        const newRow = row + offset.r;
        const newCol = col + offset.c;
        
        if (newRow >= 0 && newRow < state.gridSize && newCol >= 0 && newCol < state.gridSize) {
            const idx = getPixelIndex(newRow, newCol);
            state.pixelData[idx] = offset.color;
            const pixel = document.querySelector('[data-index="' + idx + '"]');
            if (pixel) pixel.style.background = offset.color;
        }
    });
}

// ===== HEART BRUSH =====
function paintHeart(centerIndex) {
    state.history.push({...state.pixelData});
    const row = Math.floor(centerIndex / state.gridSize);
    const col = centerIndex % state.gridSize;
    
    const heartPattern = [
        {r: 0, c: 0},
        {r: -1, c: -1}, {r: -1, c: 0}, {r: -1, c: 1},
        {r: 0, c: -1}, {r: 0, c: 1},
        {r: 1, c: -1}, {r: 1, c: 0}, {r: 1, c: 1}
    ];
    
    const heartColors = [
        state.currentColor,
        'rgb(255, 200, 220)'
    ];
    
    heartPattern.forEach(function(offset, idx) {
        const newRow = row + offset.r;
        const newCol = col + offset.c;
        
        if (newRow >= 0 && newRow < state.gridSize && newCol >= 0 && newCol < state.gridSize) {
            const pixelIdx = getPixelIndex(newRow, newCol);
            const color = idx === 0 ? heartColors[0] : heartColors[1];
            state.pixelData[pixelIdx] = color;
            const pixel = document.querySelector('[data-index="' + pixelIdx + '"]');
            if (pixel) pixel.style.background = color;
        }
    });
}

// ===== COLOR PICKER =====
function updateColorPreview() {
    const red = document.getElementById('redSlider').value;
    const green = document.getElementById('greenSlider').value;
    const blue = document.getElementById('blueSlider').value;
    
    state.currentColor = 'rgb(' + red + ', ' + green + ', ' + blue + ')';
    document.getElementById('colorPreview').style.background = state.currentColor;
    
    document.getElementById('redValue').textContent = red;
    document.getElementById('greenValue').textContent = green;
    document.getElementById('blueValue').textContent = blue;
}

// ===== EEVEELUTION PIXEL ART =====
const eeveelutions = [
    { 
        name: 'Eevee', 
        emoji: '🐹'
    },
    { 
        name: 'Vaporeon', 
        emoji: '💧'
    },
    { 
        name: 'Jolteon', 
        emoji: '⚡'
    },
    { 
        name: 'Flareon', 
        emoji: '🔥'
    },
    { 
        name: 'Espeon', 
        emoji: '✨'
    },
    { 
        name: 'Umbreon', 
        emoji: '🌙'
    },
    { 
        name: 'Leafeon', 
        emoji: '🍃'
    },
    { 
        name: 'Glaceon', 
        emoji: '❄️'
    },
    { 
        name: 'Sylveon', 
        emoji: '🎀'
    }
];

const BK = null; // Black outline
const TAN = 'rgb(210, 180, 140)'; // Tan/light brown
const BROWN = 'rgb(160, 120, 80)'; // Brown
const DKBROWN = 'rgb(100, 70, 40)'; // Dark brown
const CREAM = 'rgb(240, 230, 210)'; // Cream/highlight
const WHITE = 'rgb(255, 255, 255)'; // White
const GREY = 'rgb(80, 80, 80)'; // Grey

function getPixelArtPattern(index) {
    const patterns = [
        // Eevee - Detailed realistic version
        [
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, BK, BK, BK, BK, BK, BK, BK, BK, null, null, null, null],
            [null, null, null, BK, BK, CREAM, CREAM, TAN, TAN, CREAM, CREAM, BK, BK, null, null, null],
            [null, null, BK, BK, BROWN, TAN, TAN, BROWN, BROWN, TAN, TAN, BROWN, BK, BK, null, null],
            [null, null, BK, BROWN, BROWN, BROWN, DKBROWN, BROWN, BROWN, DKBROWN, BROWN, BROWN, BK, null, null, null],
            [null, BK, BK, BROWN, TAN, TAN, TAN, TAN, TAN, TAN, TAN, BROWN, BK, BK, null, null],
            [null, BK, BROWN, TAN, TAN, TAN, TAN, TAN, TAN, TAN, TAN, TAN, BROWN, BK, null, null],
            [BK, BK, BROWN, TAN, BK, BK, TAN, TAN, TAN, TAN, BK, BK, TAN, BROWN, BK, BK],
            [BK, BROWN, TAN, TAN, BK, BK, TAN, CREAM, CREAM, TAN, BK, BK, TAN, TAN, BROWN, BK],
            [BK, BROWN, TAN, TAN, BK, BK, TAN, CREAM, CREAM, TAN, BK, BK, TAN, TAN, BROWN, BK],
            [BK, BROWN, TAN, TAN, TAN, TAN, TAN, TAN, TAN, TAN, TAN, TAN, TAN, TAN, BROWN, BK],
            [BK, BROWN, TAN, TAN, TAN, TAN, DKBROWN, DKBROWN, DKBROWN, DKBROWN, TAN, TAN, TAN, TAN, BROWN, BK],
            [null, BK, BROWN, TAN, BROWN, DKBROWN, DKBROWN, BROWN, BROWN, DKBROWN, DKBROWN, BROWN, TAN, BROWN, BK, null],
            [null, null, BK, DKBROWN, DKBROWN, DKBROWN, DKBROWN, DKBROWN, DKBROWN, DKBROWN, DKBROWN, DKBROWN, DKBROWN, BK, null, null],
            [null, null, null, BK, BK, BK, BK, BK, BK, BK, BK, BK, BK, null, null, null]
        ],
        // Vaporeon
        [
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, BK, BK, BK, BK, BK, BK, BK, BK, null, null, null, null],
            [null, null, null, BK, BK, 'rgb(100, 180, 255)', 'rgb(100, 180, 255)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(100, 180, 255)', 'rgb(100, 180, 255)', BK, BK, null, null, null],
            [null, null, BK, BK, 'rgb(60, 140, 220)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(60, 140, 220)', 'rgb(60, 140, 220)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(60, 140, 220)', BK, BK, null, null],
            [null, null, BK, 'rgb(60, 140, 220)', 'rgb(60, 140, 220)', 'rgb(60, 140, 220)', 'rgb(40, 100, 200)', 'rgb(60, 140, 220)', 'rgb(60, 140, 220)', 'rgb(40, 100, 200)', 'rgb(60, 140, 220)', 'rgb(60, 140, 220)', BK, null, null, null],
            [null, BK, BK, 'rgb(60, 140, 220)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(60, 140, 220)', BK, BK, null, null],
            [null, BK, 'rgb(60, 140, 220)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(60, 140, 220)', BK, null, null],
            [BK, BK, 'rgb(60, 140, 220)', 'rgb(80, 160, 240)', BK, BK, 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', BK, BK, 'rgb(80, 160, 240)', 'rgb(60, 140, 220)', BK, BK],
            [BK, 'rgb(60, 140, 220)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', BK, BK, 'rgb(80, 160, 240)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(80, 160, 240)', BK, BK, 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(60, 140, 220)', BK],
            [BK, 'rgb(60, 140, 220)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', BK, BK, 'rgb(80, 160, 240)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(80, 160, 240)', BK, BK, 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(60, 140, 220)', BK],
            [BK, 'rgb(60, 140, 220)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(60, 140, 220)', BK],
            [BK, 'rgb(60, 140, 220)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(40, 100, 200)', 'rgb(40, 100, 200)', 'rgb(40, 100, 200)', 'rgb(40, 100, 200)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(80, 160, 240)', 'rgb(60, 140, 220)', BK],
            [null, BK, 'rgb(60, 140, 220)', 'rgb(80, 160, 240)', 'rgb(60, 140, 220)', 'rgb(40, 100, 200)', 'rgb(40, 100, 200)', 'rgb(60, 140, 220)', 'rgb(60, 140, 220)', 'rgb(40, 100, 200)', 'rgb(40, 100, 200)', 'rgb(60, 140, 220)', 'rgb(80, 160, 240)', 'rgb(60, 140, 220)', BK, null],
            [null, null, BK, 'rgb(40, 100, 200)', 'rgb(40, 100, 200)', 'rgb(40, 100, 200)', 'rgb(40, 100, 200)', 'rgb(40, 100, 200)', 'rgb(40, 100, 200)', 'rgb(40, 100, 200)', 'rgb(40, 100, 200)', 'rgb(40, 100, 200)', 'rgb(40, 100, 200)', BK, null, null],
            [null, null, null, BK, BK, BK, BK, BK, BK, BK, BK, BK, BK, null, null, null]
        ],
        // Jolteon
        [
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, BK, BK, BK, BK, BK, BK, BK, BK, null, null, null, null],
            [null, null, null, BK, BK, 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 200, 60)', 'rgb(255, 200, 60)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', BK, BK, null, null, null],
            [null, null, BK, BK, 'rgb(255, 200, 60)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 200, 60)', 'rgb(255, 200, 60)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 200, 60)', BK, BK, null, null],
            [null, null, BK, 'rgb(255, 200, 60)', 'rgb(255, 200, 60)', 'rgb(255, 200, 60)', 'rgb(255, 160, 0)', 'rgb(255, 200, 60)', 'rgb(255, 200, 60)', 'rgb(255, 160, 0)', 'rgb(255, 200, 60)', 'rgb(255, 200, 60)', BK, null, null, null],
            [null, BK, BK, 'rgb(255, 200, 60)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 200, 60)', BK, BK, null, null],
            [null, BK, 'rgb(255, 200, 60)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 200, 60)', BK, null, null],
            [BK, BK, 'rgb(255, 200, 60)', 'rgb(255, 220, 80)', BK, BK, 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', BK, BK, 'rgb(255, 220, 80)', 'rgb(255, 200, 60)', BK, BK],
            [BK, 'rgb(255, 200, 60)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', BK, BK, 'rgb(255, 220, 80)', 'rgb(255, 255, 150)', 'rgb(255, 255, 150)', 'rgb(255, 220, 80)', BK, BK, 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 200, 60)', BK],
            [BK, 'rgb(255, 200, 60)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', BK, BK, 'rgb(255, 220, 80)', 'rgb(255, 255, 150)', 'rgb(255, 255, 150)', 'rgb(255, 220, 80)', BK, BK, 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 200, 60)', BK],
            [BK, 'rgb(255, 200, 60)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 200, 60)', BK],
            [BK, 'rgb(255, 200, 60)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 160, 0)', 'rgb(255, 160, 0)', 'rgb(255, 160, 0)', 'rgb(255, 160, 0)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 220, 80)', 'rgb(255, 200, 60)', BK],
            [null, BK, 'rgb(255, 200, 60)', 'rgb(255, 220, 80)', 'rgb(255, 200, 60)', 'rgb(255, 160, 0)', 'rgb(255, 160, 0)', 'rgb(255, 200, 60)', 'rgb(255, 200, 60)', 'rgb(255, 160, 0)', 'rgb(255, 160, 0)', 'rgb(255, 200, 60)', 'rgb(255, 220, 80)', 'rgb(255, 200, 60)', BK, null],
            [null, null, BK, 'rgb(255, 160, 0)', 'rgb(255, 160, 0)', 'rgb(255, 160, 0)', 'rgb(255, 160, 0)', 'rgb(255, 160, 0)', 'rgb(255, 160, 0)', 'rgb(255, 160, 0)', 'rgb(255, 160, 0)', 'rgb(255, 160, 0)', 'rgb(255, 160, 0)', BK, null, null],
            [null, null, null, BK, BK, BK, BK, BK, BK, BK, BK, BK, BK, null, null, null]
        ],
        // Flareon
        [
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, BK, BK, BK, BK, BK, BK, BK, BK, null, null, null, null],
            [null, null, null, BK, BK, 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 100, 60)', 'rgb(255, 100, 60)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', BK, BK, null, null, null],
            [null, null, BK, BK, 'rgb(255, 100, 60)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 100, 60)', 'rgb(255, 100, 60)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 100, 60)', BK, BK, null, null],
            [null, null, BK, 'rgb(255, 100, 60)', 'rgb(255, 100, 60)', 'rgb(255, 100, 60)', 'rgb(200, 50, 0)', 'rgb(255, 100, 60)', 'rgb(255, 100, 60)', 'rgb(200, 50, 0)', 'rgb(255, 100, 60)', 'rgb(255, 100, 60)', BK, null, null, null],
            [null, BK, BK, 'rgb(255, 100, 60)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 100, 60)', BK, BK, null, null],
            [null, BK, 'rgb(255, 100, 60)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 100, 60)', BK, null, null],
            [BK, BK, 'rgb(255, 100, 60)', 'rgb(255, 140, 80)', BK, BK, 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', BK, BK, 'rgb(255, 140, 80)', 'rgb(255, 100, 60)', BK, BK],
            [BK, 'rgb(255, 100, 60)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', BK, BK, 'rgb(255, 140, 80)', 'rgb(255, 200, 150)', 'rgb(255, 200, 150)', 'rgb(255, 140, 80)', BK, BK, 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 100, 60)', BK],
            [BK, 'rgb(255, 100, 60)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', BK, BK, 'rgb(255, 140, 80)', 'rgb(255, 200, 150)', 'rgb(255, 200, 150)', 'rgb(255, 140, 80)', BK, BK, 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 100, 60)', BK],
            [BK, 'rgb(255, 100, 60)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 100, 60)', BK],
            [BK, 'rgb(255, 100, 60)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(200, 50, 0)', 'rgb(200, 50, 0)', 'rgb(200, 50, 0)', 'rgb(200, 50, 0)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 140, 80)', 'rgb(255, 100, 60)', BK],
            [null, BK, 'rgb(255, 100, 60)', 'rgb(255, 140, 80)', 'rgb(255, 100, 60)', 'rgb(200, 50, 0)', 'rgb(200, 50, 0)', 'rgb(255, 100, 60)', 'rgb(255, 100, 60)', 'rgb(200, 50, 0)', 'rgb(200, 50, 0)', 'rgb(255, 100, 60)', 'rgb(255, 140, 80)', 'rgb(255, 100, 60)', BK, null],
            [null, null, BK, 'rgb(200, 50, 0)', 'rgb(200, 50, 0)', 'rgb(200, 50, 0)', 'rgb(200, 50, 0)', 'rgb(200, 50, 0)', 'rgb(200, 50, 0)', 'rgb(200, 50, 0)', 'rgb(200, 50, 0)', 'rgb(200, 50, 0)', 'rgb(200, 50, 0)', BK, null, null],
            [null, null, null, BK, BK, BK, BK, BK, BK, BK, BK, BK, BK, null, null, null]
        ],
        // Espeon
        [
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, BK, BK, BK, BK, BK, BK, BK, BK, null, null, null, null],
            [null, null, null, BK, BK, 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(160, 100, 200)', 'rgb(160, 100, 200)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', BK, BK, null, null, null],
            [null, null, BK, BK, 'rgb(160, 100, 200)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(160, 100, 200)', 'rgb(160, 100, 200)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(160, 100, 200)', BK, BK, null, null],
            [null, null, BK, 'rgb(160, 100, 200)', 'rgb(160, 100, 200)', 'rgb(160, 100, 200)', 'rgb(120, 60, 160)', 'rgb(160, 100, 200)', 'rgb(160, 100, 200)', 'rgb(120, 60, 160)', 'rgb(160, 100, 200)', 'rgb(160, 100, 200)', BK, null, null, null],
            [null, BK, BK, 'rgb(160, 100, 200)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(160, 100, 200)', BK, BK, null, null],
            [null, BK, 'rgb(160, 100, 200)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(160, 100, 200)', BK, null, null],
            [BK, BK, 'rgb(160, 100, 200)', 'rgb(180, 120, 220)', BK, BK, 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', BK, BK, 'rgb(180, 120, 220)', 'rgb(160, 100, 200)', BK, BK],
            [BK, 'rgb(160, 100, 200)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', BK, BK, 'rgb(180, 120, 220)', 'rgb(220, 180, 255)', 'rgb(220, 180, 255)', 'rgb(180, 120, 220)', BK, BK, 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(160, 100, 200)', BK],
            [BK, 'rgb(160, 100, 200)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', BK, BK, 'rgb(180, 120, 220)', 'rgb(220, 180, 255)', 'rgb(220, 180, 255)', 'rgb(180, 120, 220)', BK, BK, 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(160, 100, 200)', BK],
            [BK, 'rgb(160, 100, 200)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(160, 100, 200)', BK],
            [BK, 'rgb(160, 100, 200)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(120, 60, 160)', 'rgb(120, 60, 160)', 'rgb(120, 60, 160)', 'rgb(120, 60, 160)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(180, 120, 220)', 'rgb(160, 100, 200)', BK],
            [null, BK, 'rgb(160, 100, 200)', 'rgb(180, 120, 220)', 'rgb(160, 100, 200)', 'rgb(120, 60, 160)', 'rgb(120, 60, 160)', 'rgb(160, 100, 200)', 'rgb(160, 100, 200)', 'rgb(120, 60, 160)', 'rgb(120, 60, 160)', 'rgb(160, 100, 200)', 'rgb(180, 120, 220)', 'rgb(160, 100, 200)', BK, null],
            [null, null, BK, 'rgb(120, 60, 160)', 'rgb(120, 60, 160)', 'rgb(120, 60, 160)', 'rgb(120, 60, 160)', 'rgb(120, 60, 160)', 'rgb(120, 60, 160)', 'rgb(120, 60, 160)', 'rgb(120, 60, 160)', 'rgb(120, 60, 160)', 'rgb(120, 60, 160)', BK, null, null],
            [null, null, null, BK, BK, BK, BK, BK, BK, BK, BK, BK, BK, null, null, null]
        ],
        // Umbreon
        [
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, BK, BK, BK, BK, BK, BK, BK, BK, null, null, null, null],
            [null, null, null, BK, BK, 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(20, 10, 60)', 'rgb(20, 10, 60)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', BK, BK, null, null, null],
            [null, null, BK, BK, 'rgb(20, 10, 60)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(20, 10, 60)', 'rgb(20, 10, 60)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(20, 10, 60)', BK, BK, null, null],
            [null, null, BK, 'rgb(20, 10, 60)', 'rgb(20, 10, 60)', 'rgb(20, 10, 60)', 'rgb(10, 0, 40)', 'rgb(20, 10, 60)', 'rgb(20, 10, 60)', 'rgb(10, 0, 40)', 'rgb(20, 10, 60)', 'rgb(20, 10, 60)', BK, null, null, null],
            [null, BK, BK, 'rgb(20, 10, 60)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(20, 10, 60)', BK, BK, null, null],
            [null, BK, 'rgb(20, 10, 60)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(20, 10, 60)', BK, null, null],
            [BK, BK, 'rgb(20, 10, 60)', 'rgb(40, 30, 80)', BK, BK, 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', BK, BK, 'rgb(40, 30, 80)', 'rgb(20, 10, 60)', BK, BK],
            [BK, 'rgb(20, 10, 60)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', BK, BK, 'rgb(40, 30, 80)', 'rgb(255, 220, 0)', 'rgb(255, 220, 0)', 'rgb(40, 30, 80)', BK, BK, 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(20, 10, 60)', BK],
            [BK, 'rgb(20, 10, 60)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', BK, BK, 'rgb(40, 30, 80)', 'rgb(255, 220, 0)', 'rgb(255, 220, 0)', 'rgb(40, 30, 80)', BK, BK, 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(20, 10, 60)', BK],
            [BK, 'rgb(20, 10, 60)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(20, 10, 60)', BK],
            [BK, 'rgb(20, 10, 60)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(10, 0, 40)', 'rgb(10, 0, 40)', 'rgb(10, 0, 40)', 'rgb(10, 0, 40)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(40, 30, 80)', 'rgb(20, 10, 60)', BK],
            [null, BK, 'rgb(20, 10, 60)', 'rgb(40, 30, 80)', 'rgb(20, 10, 60)', 'rgb(10, 0, 40)', 'rgb(10, 0, 40)', 'rgb(20, 10, 60)', 'rgb(20, 10, 60)', 'rgb(10, 0, 40)', 'rgb(10, 0, 40)', 'rgb(20, 10, 60)', 'rgb(40, 30, 80)', 'rgb(20, 10, 60)', BK, null],
            [null, null, BK, 'rgb(10, 0, 40)', 'rgb(10, 0, 40)', 'rgb(10, 0, 40)', 'rgb(10, 0, 40)', 'rgb(10, 0, 40)', 'rgb(10, 0, 40)', 'rgb(10, 0, 40)', 'rgb(10, 0, 40)', 'rgb(10, 0, 40)', 'rgb(10, 0, 40)', BK, null, null],
            [null, null, null, BK, BK, BK, BK, BK, BK, BK, BK, BK, BK, null, null, null]
        ],
        // Leafeon
        [
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, BK, BK, BK, BK, BK, BK, BK, BK, null, null, null, null],
            [null, null, null, BK, BK, 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(80, 160, 80)', 'rgb(80, 160, 80)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', BK, BK, null, null, null],
            [null, null, BK, BK, 'rgb(80, 160, 80)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(80, 160, 80)', 'rgb(80, 160, 80)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(80, 160, 80)', BK, BK, null, null],
            [null, null, BK, 'rgb(80, 160, 80)', 'rgb(80, 160, 80)', 'rgb(80, 160, 80)', 'rgb(40, 120, 40)', 'rgb(80, 160, 80)', 'rgb(80, 160, 80)', 'rgb(40, 120, 40)', 'rgb(80, 160, 80)', 'rgb(80, 160, 80)', BK, null, null, null],
            [null, BK, BK, 'rgb(80, 160, 80)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(80, 160, 80)', BK, BK, null, null],
            [null, BK, 'rgb(80, 160, 80)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(80, 160, 80)', BK, null, null],
            [BK, BK, 'rgb(80, 160, 80)', 'rgb(100, 180, 100)', BK, BK, 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', BK, BK, 'rgb(100, 180, 100)', 'rgb(80, 160, 80)', BK, BK],
            [BK, 'rgb(80, 160, 80)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', BK, BK, 'rgb(100, 180, 100)', 'rgb(180, 255, 180)', 'rgb(180, 255, 180)', 'rgb(100, 180, 100)', BK, BK, 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(80, 160, 80)', BK],
            [BK, 'rgb(80, 160, 80)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', BK, BK, 'rgb(100, 180, 100)', 'rgb(180, 255, 180)', 'rgb(180, 255, 180)', 'rgb(100, 180, 100)', BK, BK, 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(80, 160, 80)', BK],
            [BK, 'rgb(80, 160, 80)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(80, 160, 80)', BK],
            [BK, 'rgb(80, 160, 80)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(40, 120, 40)', 'rgb(40, 120, 40)', 'rgb(40, 120, 40)', 'rgb(40, 120, 40)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(100, 180, 100)', 'rgb(80, 160, 80)', BK],
            [null, BK, 'rgb(80, 160, 80)', 'rgb(100, 180, 100)', 'rgb(80, 160, 80)', 'rgb(40, 120, 40)', 'rgb(40, 120, 40)', 'rgb(80, 160, 80)', 'rgb(80, 160, 80)', 'rgb(40, 120, 40)', 'rgb(40, 120, 40)', 'rgb(80, 160, 80)', 'rgb(100, 180, 100)', 'rgb(80, 160, 80)', BK, null],
            [null, null, BK, 'rgb(40, 120, 40)', 'rgb(40, 120, 40)', 'rgb(40, 120, 40)', 'rgb(40, 120, 40)', 'rgb(40, 120, 40)', 'rgb(40, 120, 40)', 'rgb(40, 120, 40)', 'rgb(40, 120, 40)', 'rgb(40, 120, 40)', 'rgb(40, 120, 40)', BK, null, null],
            [null, null, null, BK, BK, BK, BK, BK, BK, BK, BK, BK, BK, null, null, null]
        ],
        // Glaceon
        [
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, BK, BK, BK, BK, BK, BK, BK, BK, null, null, null, null],
            [null, null, null, BK, BK, 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(130, 200, 240)', 'rgb(130, 200, 240)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', BK, BK, null, null, null],
            [null, null, BK, BK, 'rgb(130, 200, 240)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(130, 200, 240)', 'rgb(130, 200, 240)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(130, 200, 240)', BK, BK, null, null],
            [null, null, BK, 'rgb(130, 200, 240)', 'rgb(130, 200, 240)', 'rgb(130, 200, 240)', 'rgb(100, 170, 220)', 'rgb(130, 200, 240)', 'rgb(130, 200, 240)', 'rgb(100, 170, 220)', 'rgb(130, 200, 240)', 'rgb(130, 200, 240)', BK, null, null, null],
            [null, BK, BK, 'rgb(130, 200, 240)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(130, 200, 240)', BK, BK, null, null],
            [null, BK, 'rgb(130, 200, 240)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(130, 200, 240)', BK, null, null],
            [BK, BK, 'rgb(130, 200, 240)', 'rgb(150, 220, 255)', BK, BK, 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', BK, BK, 'rgb(150, 220, 255)', 'rgb(130, 200, 240)', BK, BK],
            [BK, 'rgb(130, 200, 240)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', BK, BK, 'rgb(150, 220, 255)', 'rgb(220, 255, 255)', 'rgb(220, 255, 255)', 'rgb(150, 220, 255)', BK, BK, 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(130, 200, 240)', BK],
            [BK, 'rgb(130, 200, 240)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', BK, BK, 'rgb(150, 220, 255)', 'rgb(220, 255, 255)', 'rgb(220, 255, 255)', 'rgb(150, 220, 255)', BK, BK, 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(130, 200, 240)', BK],
            [BK, 'rgb(130, 200, 240)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(130, 200, 240)', BK],
            [BK, 'rgb(130, 200, 240)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(150, 220, 255)', 'rgb(130, 200, 240)', BK],
            [null, BK, 'rgb(130, 200, 240)', 'rgb(150, 220, 255)', 'rgb(130, 200, 240)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(130, 200, 240)', 'rgb(130, 200, 240)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(130, 200, 240)', 'rgb(150, 220, 255)', 'rgb(130, 200, 240)', BK, null],
            [null, null, BK, 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', BK, null, null],
            [null, null, null, BK, BK, BK, BK, BK, BK, BK, BK, BK, BK, null, null, null]
        ],
        // Sylveon
        [
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, BK, BK, BK, BK, BK, BK, BK, BK, null, null, null, null],
            [null, null, null, BK, BK, 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(210, 130, 180)', 'rgb(210, 130, 180)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', BK, BK, null, null, null],
            [null, null, BK, BK, 'rgb(210, 130, 180)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(210, 130, 180)', 'rgb(210, 130, 180)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(210, 130, 180)', BK, BK, null, null],
            [null, null, BK, 'rgb(210, 130, 180)', 'rgb(210, 130, 180)', 'rgb(210, 130, 180)', 'rgb(180, 100, 150)', 'rgb(210, 130, 180)', 'rgb(210, 130, 180)', 'rgb(180, 100, 150)', 'rgb(210, 130, 180)', 'rgb(210, 130, 180)', BK, null, null, null],
            [null, BK, BK, 'rgb(210, 130, 180)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(210, 130, 180)', BK, BK, null, null],
            [null, BK, 'rgb(210, 130, 180)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(210, 130, 180)', BK, null, null],
            [BK, BK, 'rgb(210, 130, 180)', 'rgb(230, 150, 200)', BK, BK, 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', BK, BK, 'rgb(230, 150, 200)', 'rgb(210, 130, 180)', BK, BK],
            [BK, 'rgb(210, 130, 180)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', BK, BK, 'rgb(230, 150, 200)', 'rgb(255, 220, 240)', 'rgb(255, 220, 240)', 'rgb(230, 150, 200)', BK, BK, 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(210, 130, 180)', BK],
            [BK, 'rgb(210, 130, 180)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', BK, BK, 'rgb(230, 150, 200)', 'rgb(255, 220, 240)', 'rgb(255, 220, 240)', 'rgb(230, 150, 200)', BK, BK, 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(210, 130, 180)', BK],
            [BK, 'rgb(210, 130, 180)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(210, 130, 180)', BK],
            [BK, 'rgb(210, 130, 180)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(180, 100, 150)', 'rgb(180, 100, 150)', 'rgb(180, 100, 150)', 'rgb(180, 100, 150)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(230, 150, 200)', 'rgb(210, 130, 180)', BK],
            [null, BK, 'rgb(210, 130, 180)', 'rgb(230, 150, 200)', 'rgb(210, 130, 180)', 'rgb(180, 100, 150)', 'rgb(180, 100, 150)', 'rgb(210, 130, 180)', 'rgb(210, 130, 180)', 'rgb(180, 100, 150)', 'rgb(180, 100, 150)', 'rgb(210, 130, 180)', 'rgb(230, 150, 200)', 'rgb(210, 130, 180)', BK, null],
            [null, null, BK, 'rgb(180, 100, 150)', 'rgb(180, 100, 150)', 'rgb(180, 100, 150)', 'rgb(180, 100, 150)', 'rgb(180, 100, 150)', 'rgb(180, 100, 150)', 'rgb(180, 100, 150)', 'rgb(180, 100, 150)', 'rgb(180, 100, 150)', 'rgb(180, 100, 150)', BK, null, null],
            [null, null, null, BK, BK, BK, BK, BK, BK, BK, BK, BK, BK, null, null, null]
        ]
    ];
    
    return patterns[index] || patterns[0];
}

function renderEeveelutionGallery() {
    const grid = document.getElementById('eeveelutionGrid');
    grid.innerHTML = '';
    
    eeveelutions.forEach(function(eevee, idx) {
        const item = document.createElement('div');
        item.className = 'eeveelution-item';
        
        // Create a small preview canvas
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = 100;
        previewCanvas.height = 100;
        previewCanvas.className = 'eeveelution-preview-canvas';
        
        renderPixelArtPreview(previewCanvas, idx);
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'eeveelution-name';
        nameDiv.textContent = eevee.name + ' ' + eevee.emoji;
        
        item.appendChild(previewCanvas);
        item.appendChild(nameDiv);
        
        item.addEventListener('click', function() {
            copyEeveelution(idx);
            document.getElementById('eeveelutionGallery').classList.remove('active');
        });
        
        grid.appendChild(item);
    });
}

function renderPixelArtPreview(canvas, index) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const pattern = getPixelArtPattern(index);
    const pixelSize = 6; // 6px per pixel in preview
    
    pattern.forEach(function(row, rowIdx) {
        row.forEach(function(colorStr, colIdx) {
            if (colorStr) {
                ctx.fillStyle = colorStr;
                ctx.fillRect(colIdx * pixelSize, rowIdx * pixelSize, pixelSize, pixelSize);
            }
        });
    });
}

function copyEeveelution(index) {
    state.history.push({...state.pixelData});
    
    // Get pattern
    const pattern = getPixelArtPattern(index);
    const patternWidth = 16;
    const patternHeight = 16;
    
    // Clear canvas
    state.pixelData = new Array(state.gridSize * state.gridSize).fill(null);
    
    // Center the pattern on canvas
    const offsetX = Math.floor((state.gridSize - patternWidth) / 2);
    const offsetY = Math.floor((state.gridSize - patternHeight) / 2);
    
    // Apply pattern
    pattern.forEach(function(row, patternY) {
        row.forEach(function(colorStr, patternX) {
            if (colorStr && patternY + offsetY >= 0 && patternY + offsetY < state.gridSize &&
                patternX + offsetX >= 0 && patternX + offsetX < state.gridSize) {
                const idx = (patternY + offsetY) * state.gridSize + (patternX + offsetX);
                state.pixelData[idx] = colorStr;
            }
        });
    });
    
    createPixelCanvas();
    alert('✨ ' + eeveelutions[index].name + ' added to your canvas! You can now edit it! ✨');
}

function loadSavedArtworks() {
    const list = document.getElementById('savedArtworksList');
    list.innerHTML = '';
    
    if (Object.keys(state.savedArtworks).length === 0) {
        list.innerHTML = '<p class="empty-message">No saved artworks yet!</p>';
        return;
    }
    
    Object.entries(state.savedArtworks).forEach(function(entry) {
        const id = entry[0];
        const artwork = entry[1];
        const item = document.createElement('div');
        item.className = 'saved-artwork-item';
        
        // Create wrapper with info
        const infoDiv = document.createElement('div');
        infoDiv.className = 'artwork-info';
        infoDiv.innerHTML = '<div class="artwork-name">' + artwork.name + '</div><div class="artwork-date">' + artwork.date + '</div>';
        
        // Create button container
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'artwork-buttons';
        
        // Create rename button
        const renameBtn = document.createElement('button');
        renameBtn.className = 'rename-artwork-btn';
        renameBtn.textContent = '✏️';
        renameBtn.title = 'Rename this artwork';
        renameBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            renameArtwork(id, artwork);
        });
        
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-artwork-btn';
        deleteBtn.textContent = '🗑️';
        deleteBtn.title = 'Delete this artwork';
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete "' + artwork.name + '"?')) {
                delete state.savedArtworks[id];
                localStorage.setItem(`pixelart_artworks_${state.currentUser}`, JSON.stringify(state.savedArtworks));
                loadSavedArtworks();
                alert('✨ Artwork deleted!');
            }
        });
        
        buttonsDiv.appendChild(renameBtn);
        buttonsDiv.appendChild(deleteBtn);
        
        item.appendChild(infoDiv);
        item.appendChild(buttonsDiv);
        
        // Click to load artwork
        infoDiv.addEventListener('click', function() {
            loadArtwork(id, artwork);
        });
        
        list.appendChild(item);
    });
}

function renameArtwork(id, artwork) {
    const newName = prompt('Enter new name for "' + artwork.name + '":', artwork.name);
    
    if (newName && newName.trim()) {
        artwork.name = newName.trim();
        state.savedArtworks[id] = artwork;
        localStorage.setItem(`pixelart_artworks_${state.currentUser}`, JSON.stringify(state.savedArtworks));
        loadSavedArtworks();
        alert('✨ Artwork renamed!');
    }
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
        localStorage.setItem('pixelart_current_' + state.currentUser, JSON.stringify(state.pixelData));
    }
}

window.addEventListener('beforeunload', function() {
    if (state.currentUser) {
        saveCurrentArtwork();
    }
});