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

// ===== DETAILED REALISTIC EEVEELUTION PIXEL ART =====
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

// DETAILED REALISTIC PIXEL ART PATTERNS WITH HEAVY SHADING
function getPixelArtPattern(index) {
    const patterns = [
        // Eevee - Browns with shading
        [
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, 'rgb(80, 60, 30)', 'rgb(80, 60, 30)', 'rgb(100, 80, 40)', 'rgb(120, 90, 50)', 'rgb(120, 90, 50)', 'rgb(100, 80, 40)', 'rgb(100, 80, 40)', 'rgb(120, 90, 50)', 'rgb(120, 90, 50)', 'rgb(100, 80, 40)', 'rgb(80, 60, 30)', 'rgb(80, 60, 30)', null, null],
            [null, 'rgb(80, 60, 30)', 'rgb(100, 80, 40)', 'rgb(150, 120, 80)', 'rgb(180, 140, 90)', 'rgb(200, 160, 110)', 'rgb(200, 160, 110)', 'rgb(180, 140, 90)', 'rgb(180, 140, 90)', 'rgb(200, 160, 110)', 'rgb(200, 160, 110)', 'rgb(180, 140, 90)', 'rgb(150, 120, 80)', 'rgb(100, 80, 40)', 'rgb(80, 60, 30)', null],
            ['rgb(80, 60, 30)', 'rgb(120, 90, 50)', 'rgb(170, 130, 80)', 'rgb(200, 160, 110)', 'rgb(220, 180, 130)', 'rgb(240, 200, 150)', 'rgb(240, 200, 150)', 'rgb(220, 180, 130)', 'rgb(220, 180, 130)', 'rgb(240, 200, 150)', 'rgb(240, 200, 150)', 'rgb(220, 180, 130)', 'rgb(200, 160, 110)', 'rgb(170, 130, 80)', 'rgb(120, 90, 50)', 'rgb(80, 60, 30)'],
            ['rgb(80, 60, 30)', 'rgb(120, 90, 50)', 'rgb(170, 130, 80)', 'rgb(200, 160, 110)', 'rgb(220, 180, 130)', 'rgb(240, 200, 150)', 'rgb(240, 200, 150)', 'rgb(220, 180, 130)', 'rgb(220, 180, 130)', 'rgb(240, 200, 150)', 'rgb(240, 200, 150)', 'rgb(220, 180, 130)', 'rgb(200, 160, 110)', 'rgb(170, 130, 80)', 'rgb(120, 90, 50)', 'rgb(80, 60, 30)'],
            ['rgb(80, 60, 30)', 'rgb(120, 90, 50)', 'rgb(170, 130, 80)', 'rgb(200, 160, 110)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(200, 160, 110)', 'rgb(200, 160, 110)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(200, 160, 110)', 'rgb(200, 160, 110)', 'rgb(170, 130, 80)', 'rgb(120, 90, 50)', 'rgb(80, 60, 30)'],
            ['rgb(80, 60, 30)', 'rgb(120, 90, 50)', 'rgb(170, 130, 80)', 'rgb(200, 160, 110)', 'rgb(200, 160, 110)', 'rgb(220, 180, 130)', 'rgb(255, 120, 160)', 'rgb(220, 180, 130)', 'rgb(220, 180, 130)', 'rgb(200, 160, 110)', 'rgb(200, 160, 110)', 'rgb(220, 180, 130)', 'rgb(200, 160, 110)', 'rgb(170, 130, 80)', 'rgb(120, 90, 50)', 'rgb(80, 60, 30)'],
            ['rgb(80, 60, 30)', 'rgb(120, 90, 50)', 'rgb(170, 130, 80)', 'rgb(200, 160, 110)', 'rgb(200, 160, 110)', 'rgb(220, 180, 130)', 'rgb(220, 180, 130)', 'rgb(220, 180, 130)', 'rgb(220, 180, 130)', 'rgb(220, 180, 130)', 'rgb(220, 180, 130)', 'rgb(220, 180, 130)', 'rgb(200, 160, 110)', 'rgb(170, 130, 80)', 'rgb(120, 90, 50)', 'rgb(80, 60, 30)'],
            [null, 'rgb(80, 60, 30)', 'rgb(120, 90, 50)', 'rgb(150, 120, 80)', 'rgb(170, 130, 80)', 'rgb(190, 150, 100)', 'rgb(190, 150, 100)', 'rgb(190, 150, 100)', 'rgb(190, 150, 100)', 'rgb(190, 150, 100)', 'rgb(190, 150, 100)', 'rgb(170, 130, 80)', 'rgb(150, 120, 80)', 'rgb(120, 90, 50)', 'rgb(80, 60, 30)', null],
            [null, null, 'rgb(80, 60, 30)', 'rgb(100, 80, 40)', 'rgb(120, 90, 50)', 'rgb(140, 100, 50)', 'rgb(140, 100, 50)', 'rgb(140, 100, 50)', 'rgb(140, 100, 50)', 'rgb(140, 100, 50)', 'rgb(140, 100, 50)', 'rgb(120, 90, 50)', 'rgb(100, 80, 40)', 'rgb(80, 60, 30)', null, null],
            [null, null, null, 'rgb(80, 60, 30)', 'rgb(100, 80, 40)', 'rgb(120, 90, 50)', 'rgb(120, 90, 50)', 'rgb(120, 90, 50)', 'rgb(120, 90, 50)', 'rgb(120, 90, 50)', 'rgb(120, 90, 50)', 'rgb(100, 80, 40)', 'rgb(80, 60, 30)', null, null, null],
            [null, null, null, null, 'rgb(80, 60, 30)', 'rgb(100, 80, 40)', 'rgb(100, 80, 40)', 'rgb(100, 80, 40)', 'rgb(100, 80, 40)', 'rgb(100, 80, 40)', 'rgb(100, 80, 40)', 'rgb(80, 60, 30)', null, null, null, null],
            [null, null, null, null, null, 'rgb(80, 60, 30)', 'rgb(80, 60, 30)', 'rgb(80, 60, 30)', 'rgb(80, 60, 30)', 'rgb(80, 60, 30)', 'rgb(80, 60, 30)', null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ],
        // Vaporeon - Blues with shading
        [
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, 'rgb(40, 80, 150)', 'rgb(40, 80, 150)', 'rgb(60, 100, 170)', 'rgb(80, 120, 190)', 'rgb(80, 120, 190)', 'rgb(60, 100, 170)', 'rgb(60, 100, 170)', 'rgb(80, 120, 190)', 'rgb(80, 120, 190)', 'rgb(60, 100, 170)', 'rgb(40, 80, 150)', 'rgb(40, 80, 150)', null, null],
            [null, 'rgb(40, 80, 150)', 'rgb(60, 100, 170)', 'rgb(110, 150, 220)', 'rgb(140, 180, 240)', 'rgb(160, 200, 255)', 'rgb(160, 200, 255)', 'rgb(140, 180, 240)', 'rgb(140, 180, 240)', 'rgb(160, 200, 255)', 'rgb(160, 200, 255)', 'rgb(140, 180, 240)', 'rgb(110, 150, 220)', 'rgb(60, 100, 170)', 'rgb(40, 80, 150)', null],
            ['rgb(40, 80, 150)', 'rgb(80, 120, 190)', 'rgb(130, 170, 230)', 'rgb(160, 200, 255)', 'rgb(180, 220, 255)', 'rgb(200, 240, 255)', 'rgb(200, 240, 255)', 'rgb(180, 220, 255)', 'rgb(180, 220, 255)', 'rgb(200, 240, 255)', 'rgb(200, 240, 255)', 'rgb(180, 220, 255)', 'rgb(160, 200, 255)', 'rgb(130, 170, 230)', 'rgb(80, 120, 190)', 'rgb(40, 80, 150)'],
            ['rgb(40, 80, 150)', 'rgb(80, 120, 190)', 'rgb(130, 170, 230)', 'rgb(160, 200, 255)', 'rgb(180, 220, 255)', 'rgb(200, 240, 255)', 'rgb(200, 240, 255)', 'rgb(180, 220, 255)', 'rgb(180, 220, 255)', 'rgb(200, 240, 255)', 'rgb(200, 240, 255)', 'rgb(180, 220, 255)', 'rgb(160, 200, 255)', 'rgb(130, 170, 230)', 'rgb(80, 120, 190)', 'rgb(40, 80, 150)'],
            ['rgb(40, 80, 150)', 'rgb(80, 120, 190)', 'rgb(130, 170, 230)', 'rgb(160, 200, 255)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(160, 200, 255)', 'rgb(160, 200, 255)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(160, 200, 255)', 'rgb(160, 200, 255)', 'rgb(130, 170, 230)', 'rgb(80, 120, 190)', 'rgb(40, 80, 150)'],
            ['rgb(40, 80, 150)', 'rgb(80, 120, 190)', 'rgb(130, 170, 230)', 'rgb(160, 200, 255)', 'rgb(160, 200, 255)', 'rgb(180, 220, 255)', 'rgb(150, 220, 255)', 'rgb(180, 220, 255)', 'rgb(180, 220, 255)', 'rgb(160, 200, 255)', 'rgb(160, 200, 255)', 'rgb(180, 220, 255)', 'rgb(160, 200, 255)', 'rgb(130, 170, 230)', 'rgb(80, 120, 190)', 'rgb(40, 80, 150)'],
            ['rgb(40, 80, 150)', 'rgb(80, 120, 190)', 'rgb(130, 170, 230)', 'rgb(160, 200, 255)', 'rgb(160, 200, 255)', 'rgb(180, 220, 255)', 'rgb(180, 220, 255)', 'rgb(180, 220, 255)', 'rgb(180, 220, 255)', 'rgb(180, 220, 255)', 'rgb(180, 220, 255)', 'rgb(180, 220, 255)', 'rgb(160, 200, 255)', 'rgb(130, 170, 230)', 'rgb(80, 120, 190)', 'rgb(40, 80, 150)'],
            [null, 'rgb(40, 80, 150)', 'rgb(80, 120, 190)', 'rgb(110, 150, 220)', 'rgb(130, 170, 230)', 'rgb(150, 190, 240)', 'rgb(150, 190, 240)', 'rgb(150, 190, 240)', 'rgb(150, 190, 240)', 'rgb(150, 190, 240)', 'rgb(150, 190, 240)', 'rgb(130, 170, 230)', 'rgb(110, 150, 220)', 'rgb(80, 120, 190)', 'rgb(40, 80, 150)', null],
            [null, null, 'rgb(40, 80, 150)', 'rgb(60, 100, 170)', 'rgb(80, 120, 190)', 'rgb(100, 140, 200)', 'rgb(100, 140, 200)', 'rgb(100, 140, 200)', 'rgb(100, 140, 200)', 'rgb(100, 140, 200)', 'rgb(100, 140, 200)', 'rgb(80, 120, 190)', 'rgb(60, 100, 170)', 'rgb(40, 80, 150)', null, null],
            [null, null, null, 'rgb(40, 80, 150)', 'rgb(60, 100, 170)', 'rgb(80, 120, 190)', 'rgb(80, 120, 190)', 'rgb(80, 120, 190)', 'rgb(80, 120, 190)', 'rgb(80, 120, 190)', 'rgb(80, 120, 190)', 'rgb(60, 100, 170)', 'rgb(40, 80, 150)', null, null, null],
            [null, null, null, null, 'rgb(40, 80, 150)', 'rgb(60, 100, 170)', 'rgb(60, 100, 170)', 'rgb(60, 100, 170)', 'rgb(60, 100, 170)', 'rgb(60, 100, 170)', 'rgb(60, 100, 170)', 'rgb(40, 80, 150)', null, null, null, null],
            [null, null, null, null, null, 'rgb(40, 80, 150)', 'rgb(40, 80, 150)', 'rgb(40, 80, 150)', 'rgb(40, 80, 150)', 'rgb(40, 80, 150)', 'rgb(40, 80, 150)', null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ],
        // Jolteon - Yellows with shading
        [
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, 'rgb(160, 120, 20)', 'rgb(160, 120, 20)', 'rgb(180, 140, 40)', 'rgb(200, 160, 60)', 'rgb(200, 160, 60)', 'rgb(180, 140, 40)', 'rgb(180, 140, 40)', 'rgb(200, 160, 60)', 'rgb(200, 160, 60)', 'rgb(180, 140, 40)', 'rgb(160, 120, 20)', 'rgb(160, 120, 20)', null, null],
            [null, 'rgb(160, 120, 20)', 'rgb(180, 140, 40)', 'rgb(230, 190, 80)', 'rgb(255, 220, 100)', 'rgb(255, 240, 130)', 'rgb(255, 240, 130)', 'rgb(255, 220, 100)', 'rgb(255, 220, 100)', 'rgb(255, 240, 130)', 'rgb(255, 240, 130)', 'rgb(255, 220, 100)', 'rgb(230, 190, 80)', 'rgb(180, 140, 40)', 'rgb(160, 120, 20)', null],
            ['rgb(160, 120, 20)', 'rgb(200, 160, 60)', 'rgb(250, 210, 100)', 'rgb(255, 240, 150)', 'rgb(255, 255, 180)', 'rgb(255, 255, 200)', 'rgb(255, 255, 200)', 'rgb(255, 255, 180)', 'rgb(255, 255, 180)', 'rgb(255, 255, 200)', 'rgb(255, 255, 200)', 'rgb(255, 255, 180)', 'rgb(255, 240, 150)', 'rgb(250, 210, 100)', 'rgb(200, 160, 60)', 'rgb(160, 120, 20)'],
            ['rgb(160, 120, 20)', 'rgb(200, 160, 60)', 'rgb(250, 210, 100)', 'rgb(255, 240, 150)', 'rgb(255, 255, 180)', 'rgb(255, 255, 200)', 'rgb(255, 255, 200)', 'rgb(255, 255, 180)', 'rgb(255, 255, 180)', 'rgb(255, 255, 200)', 'rgb(255, 255, 200)', 'rgb(255, 255, 180)', 'rgb(255, 240, 150)', 'rgb(250, 210, 100)', 'rgb(200, 160, 60)', 'rgb(160, 120, 20)'],
            ['rgb(160, 120, 20)', 'rgb(200, 160, 60)', 'rgb(250, 210, 100)', 'rgb(255, 240, 150)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 240, 150)', 'rgb(255, 240, 150)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(255, 240, 150)', 'rgb(255, 240, 150)', 'rgb(250, 210, 100)', 'rgb(200, 160, 60)', 'rgb(160, 120, 20)'],
            ['rgb(160, 120, 20)', 'rgb(200, 160, 60)', 'rgb(250, 210, 100)', 'rgb(255, 240, 150)', 'rgb(255, 240, 150)', 'rgb(255, 255, 180)', 'rgb(255, 200, 0)', 'rgb(255, 255, 180)', 'rgb(255, 255, 180)', 'rgb(255, 240, 150)', 'rgb(255, 240, 150)', 'rgb(255, 255, 180)', 'rgb(255, 240, 150)', 'rgb(250, 210, 100)', 'rgb(200, 160, 60)', 'rgb(160, 120, 20)'],
            ['rgb(160, 120, 20)', 'rgb(200, 160, 60)', 'rgb(250, 210, 100)', 'rgb(255, 240, 150)', 'rgb(255, 240, 150)', 'rgb(255, 255, 180)', 'rgb(255, 255, 180)', 'rgb(255, 255, 180)', 'rgb(255, 255, 180)', 'rgb(255, 255, 180)', 'rgb(255, 255, 180)', 'rgb(255, 255, 180)', 'rgb(255, 240, 150)', 'rgb(250, 210, 100)', 'rgb(200, 160, 60)', 'rgb(160, 120, 20)'],
            [null, 'rgb(160, 120, 20)', 'rgb(200, 160, 60)', 'rgb(230, 190, 80)', 'rgb(250, 210, 100)', 'rgb(255, 230, 120)', 'rgb(255, 230, 120)', 'rgb(255, 230, 120)', 'rgb(255, 230, 120)', 'rgb(255, 230, 120)', 'rgb(255, 230, 120)', 'rgb(250, 210, 100)', 'rgb(230, 190, 80)', 'rgb(200, 160, 60)', 'rgb(160, 120, 20)', null],
            [null, null, 'rgb(160, 120, 20)', 'rgb(180, 140, 40)', 'rgb(200, 160, 60)', 'rgb(220, 180, 80)', 'rgb(220, 180, 80)', 'rgb(220, 180, 80)', 'rgb(220, 180, 80)', 'rgb(220, 180, 80)', 'rgb(220, 180, 80)', 'rgb(200, 160, 60)', 'rgb(180, 140, 40)', 'rgb(160, 120, 20)', null, null],
            [null, null, null, 'rgb(160, 120, 20)', 'rgb(180, 140, 40)', 'rgb(200, 160, 60)', 'rgb(200, 160, 60)', 'rgb(200, 160, 60)', 'rgb(200, 160, 60)', 'rgb(200, 160, 60)', 'rgb(200, 160, 60)', 'rgb(180, 140, 40)', 'rgb(160, 120, 20)', null, null, null],
            [null, null, null, null, 'rgb(160, 120, 20)', 'rgb(180, 140, 40)', 'rgb(180, 140, 40)', 'rgb(180, 140, 40)', 'rgb(180, 140, 40)', 'rgb(180, 140, 40)', 'rgb(180, 140, 40)', 'rgb(160, 120, 20)', null, null, null, null],
            [null, null, null, null, null, 'rgb(160, 120, 20)', 'rgb(160, 120, 20)', 'rgb(160, 120, 20)', 'rgb(160, 120, 20)', 'rgb(160, 120, 20)', 'rgb(160, 120, 20)', null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ],
        // Flareon - Reds/Oranges with shading
        [
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, 'rgb(120, 40, 0)', 'rgb(120, 40, 0)', 'rgb(150, 60, 10)', 'rgb(180, 90, 30)', 'rgb(180, 90, 30)', 'rgb(150, 60, 10)', 'rgb(150, 60, 10)', 'rgb(180, 90, 30)', 'rgb(180, 90, 30)', 'rgb(150, 60, 10)', 'rgb(120, 40, 0)', 'rgb(120, 40, 0)', null, null],
            [null, 'rgb(120, 40, 0)', 'rgb(150, 60, 10)', 'rgb(200, 110, 50)', 'rgb(240, 140, 80)', 'rgb(255, 170, 110)', 'rgb(255, 170, 110)', 'rgb(240, 140, 80)', 'rgb(240, 140, 80)', 'rgb(255, 170, 110)', 'rgb(255, 170, 110)', 'rgb(240, 140, 80)', 'rgb(200, 110, 50)', 'rgb(150, 60, 10)', 'rgb(120, 40, 0)', null],
            ['rgb(120, 40, 0)', 'rgb(180, 90, 30)', 'rgb(220, 130, 70)', 'rgb(255, 170, 110)', 'rgb(255, 200, 150)', 'rgb(255, 220, 170)', 'rgb(255, 220, 170)', 'rgb(255, 200, 150)', 'rgb(255, 200, 150)', 'rgb(255, 220, 170)', 'rgb(255, 220, 170)', 'rgb(255, 200, 150)', 'rgb(255, 170, 110)', 'rgb(220, 130, 70)', 'rgb(180, 90, 30)', 'rgb(120, 40, 0)'],
            ['rgb(120, 40, 0)', 'rgb(180, 90, 30)', 'rgb(220, 130, 70)', 'rgb(255, 170, 110)', 'rgb(255, 200, 150)', 'rgb(255, 220, 170)', 'rgb(255, 220, 170)', 'rgb(255, 200, 150)', 'rgb(255, 200, 150)', 'rgb(255, 220, 170)', 'rgb(255, 220, 170)', 'rgb(255, 200, 150)', 'rgb(255, 170, 110)', 'rgb(220, 130, 70)', 'rgb(180, 90, 30)', 'rgb(120, 40, 0)'],
            ['rgb(120, 40, 0)', 'rgb(180, 90, 30)', 'rgb(220, 130, 70)', 'rgb(255, 170, 110)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 170, 110)', 'rgb(255, 170, 110)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(255, 170, 110)', 'rgb(255, 170, 110)', 'rgb(220, 130, 70)', 'rgb(180, 90, 30)', 'rgb(120, 40, 0)'],
            ['rgb(120, 40, 0)', 'rgb(180, 90, 30)', 'rgb(220, 130, 70)', 'rgb(255, 170, 110)', 'rgb(255, 170, 110)', 'rgb(255, 200, 150)', 'rgb(255, 100, 0)', 'rgb(255, 200, 150)', 'rgb(255, 200, 150)', 'rgb(255, 170, 110)', 'rgb(255, 170, 110)', 'rgb(255, 200, 150)', 'rgb(255, 170, 110)', 'rgb(220, 130, 70)', 'rgb(180, 90, 30)', 'rgb(120, 40, 0)'],
            ['rgb(120, 40, 0)', 'rgb(180, 90, 30)', 'rgb(220, 130, 70)', 'rgb(255, 170, 110)', 'rgb(255, 170, 110)', 'rgb(255, 200, 150)', 'rgb(255, 200, 150)', 'rgb(255, 200, 150)', 'rgb(255, 200, 150)', 'rgb(255, 200, 150)', 'rgb(255, 200, 150)', 'rgb(255, 200, 150)', 'rgb(255, 170, 110)', 'rgb(220, 130, 70)', 'rgb(180, 90, 30)', 'rgb(120, 40, 0)'],
            [null, 'rgb(120, 40, 0)', 'rgb(180, 90, 30)', 'rgb(200, 110, 50)', 'rgb(220, 130, 70)', 'rgb(240, 150, 90)', 'rgb(240, 150, 90)', 'rgb(240, 150, 90)', 'rgb(240, 150, 90)', 'rgb(240, 150, 90)', 'rgb(240, 150, 90)', 'rgb(220, 130, 70)', 'rgb(200, 110, 50)', 'rgb(180, 90, 30)', 'rgb(120, 40, 0)', null],
            [null, null, 'rgb(120, 40, 0)', 'rgb(150, 60, 10)', 'rgb(180, 90, 30)', 'rgb(200, 110, 50)', 'rgb(200, 110, 50)', 'rgb(200, 110, 50)', 'rgb(200, 110, 50)', 'rgb(200, 110, 50)', 'rgb(200, 110, 50)', 'rgb(180, 90, 30)', 'rgb(150, 60, 10)', 'rgb(120, 40, 0)', null, null],
            [null, null, null, 'rgb(120, 40, 0)', 'rgb(150, 60, 10)', 'rgb(180, 90, 30)', 'rgb(180, 90, 30)', 'rgb(180, 90, 30)', 'rgb(180, 90, 30)', 'rgb(180, 90, 30)', 'rgb(180, 90, 30)', 'rgb(150, 60, 10)', 'rgb(120, 40, 0)', null, null, null],
            [null, null, null, null, 'rgb(120, 40, 0)', 'rgb(150, 60, 10)', 'rgb(150, 60, 10)', 'rgb(150, 60, 10)', 'rgb(150, 60, 10)', 'rgb(150, 60, 10)', 'rgb(150, 60, 10)', 'rgb(120, 40, 0)', null, null, null, null],
            [null, null, null, null, null, 'rgb(120, 40, 0)', 'rgb(120, 40, 0)', 'rgb(120, 40, 0)', 'rgb(120, 40, 0)', 'rgb(120, 40, 0)', 'rgb(120, 40, 0)', null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ],
        // Espeon - Purples with shading
        [
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, 'rgb(80, 20, 130)', 'rgb(80, 20, 130)', 'rgb(110, 40, 160)', 'rgb(140, 70, 190)', 'rgb(140, 70, 190)', 'rgb(110, 40, 160)', 'rgb(110, 40, 160)', 'rgb(140, 70, 190)', 'rgb(140, 70, 190)', 'rgb(110, 40, 160)', 'rgb(80, 20, 130)', 'rgb(80, 20, 130)', null, null],
            [null, 'rgb(80, 20, 130)', 'rgb(110, 40, 160)', 'rgb(160, 90, 210)', 'rgb(190, 130, 240)', 'rgb(220, 170, 255)', 'rgb(220, 170, 255)', 'rgb(190, 130, 240)', 'rgb(190, 130, 240)', 'rgb(220, 170, 255)', 'rgb(220, 170, 255)', 'rgb(190, 130, 240)', 'rgb(160, 90, 210)', 'rgb(110, 40, 160)', 'rgb(80, 20, 130)', null],
            ['rgb(80, 20, 130)', 'rgb(140, 70, 190)', 'rgb(180, 110, 230)', 'rgb(220, 170, 255)', 'rgb(240, 200, 255)', 'rgb(255, 230, 255)', 'rgb(255, 230, 255)', 'rgb(240, 200, 255)', 'rgb(240, 200, 255)', 'rgb(255, 230, 255)', 'rgb(255, 230, 255)', 'rgb(240, 200, 255)', 'rgb(220, 170, 255)', 'rgb(180, 110, 230)', 'rgb(140, 70, 190)', 'rgb(80, 20, 130)'],
            ['rgb(80, 20, 130)', 'rgb(140, 70, 190)', 'rgb(180, 110, 230)', 'rgb(220, 170, 255)', 'rgb(240, 200, 255)', 'rgb(255, 230, 255)', 'rgb(255, 230, 255)', 'rgb(240, 200, 255)', 'rgb(240, 200, 255)', 'rgb(255, 230, 255)', 'rgb(255, 230, 255)', 'rgb(240, 200, 255)', 'rgb(220, 170, 255)', 'rgb(180, 110, 230)', 'rgb(140, 70, 190)', 'rgb(80, 20, 130)'],
            ['rgb(80, 20, 130)', 'rgb(140, 70, 190)', 'rgb(180, 110, 230)', 'rgb(220, 170, 255)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(220, 170, 255)', 'rgb(220, 170, 255)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(220, 170, 255)', 'rgb(220, 170, 255)', 'rgb(180, 110, 230)', 'rgb(140, 70, 190)', 'rgb(80, 20, 130)'],
            ['rgb(80, 20, 130)', 'rgb(140, 70, 190)', 'rgb(180, 110, 230)', 'rgb(220, 170, 255)', 'rgb(220, 170, 255)', 'rgb(240, 200, 255)', 'rgb(255, 100, 255)', 'rgb(240, 200, 255)', 'rgb(240, 200, 255)', 'rgb(220, 170, 255)', 'rgb(220, 170, 255)', 'rgb(240, 200, 255)', 'rgb(220, 170, 255)', 'rgb(180, 110, 230)', 'rgb(140, 70, 190)', 'rgb(80, 20, 130)'],
            ['rgb(80, 20, 130)', 'rgb(140, 70, 190)', 'rgb(180, 110, 230)', 'rgb(220, 170, 255)', 'rgb(220, 170, 255)', 'rgb(240, 200, 255)', 'rgb(240, 200, 255)', 'rgb(240, 200, 255)', 'rgb(240, 200, 255)', 'rgb(240, 200, 255)', 'rgb(240, 200, 255)', 'rgb(240, 200, 255)', 'rgb(220, 170, 255)', 'rgb(180, 110, 230)', 'rgb(140, 70, 190)', 'rgb(80, 20, 130)'],
            [null, 'rgb(80, 20, 130)', 'rgb(140, 70, 190)', 'rgb(160, 90, 210)', 'rgb(180, 110, 230)', 'rgb(200, 140, 240)', 'rgb(200, 140, 240)', 'rgb(200, 140, 240)', 'rgb(200, 140, 240)', 'rgb(200, 140, 240)', 'rgb(200, 140, 240)', 'rgb(180, 110, 230)', 'rgb(160, 90, 210)', 'rgb(140, 70, 190)', 'rgb(80, 20, 130)', null],
            [null, null, 'rgb(80, 20, 130)', 'rgb(110, 40, 160)', 'rgb(140, 70, 190)', 'rgb(160, 90, 210)', 'rgb(160, 90, 210)', 'rgb(160, 90, 210)', 'rgb(160, 90, 210)', 'rgb(160, 90, 210)', 'rgb(160, 90, 210)', 'rgb(140, 70, 190)', 'rgb(110, 40, 160)', 'rgb(80, 20, 130)', null, null],
            [null, null, null, 'rgb(80, 20, 130)', 'rgb(110, 40, 160)', 'rgb(140, 70, 190)', 'rgb(140, 70, 190)', 'rgb(140, 70, 190)', 'rgb(140, 70, 190)', 'rgb(140, 70, 190)', 'rgb(140, 70, 190)', 'rgb(110, 40, 160)', 'rgb(80, 20, 130)', null, null, null],
            [null, null, null, null, 'rgb(80, 20, 130)', 'rgb(110, 40, 160)', 'rgb(110, 40, 160)', 'rgb(110, 40, 160)', 'rgb(110, 40, 160)', 'rgb(110, 40, 160)', 'rgb(110, 40, 160)', 'rgb(80, 20, 130)', null, null, null, null],
            [null, null, null, null, null, 'rgb(80, 20, 130)', 'rgb(80, 20, 130)', 'rgb(80, 20, 130)', 'rgb(80, 20, 130)', 'rgb(80, 20, 130)', 'rgb(80, 20, 130)', null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ],
        // Umbreon - Dark with yellow shading
        [
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, 'rgb(10, 10, 30)', 'rgb(10, 10, 30)', 'rgb(30, 30, 60)', 'rgb(50, 50, 90)', 'rgb(50, 50, 90)', 'rgb(30, 30, 60)', 'rgb(30, 30, 60)', 'rgb(50, 50, 90)', 'rgb(50, 50, 90)', 'rgb(30, 30, 60)', 'rgb(10, 10, 30)', 'rgb(10, 10, 30)', null, null],
            [null, 'rgb(10, 10, 30)', 'rgb(30, 30, 60)', 'rgb(60, 60, 100)', 'rgb(90, 90, 140)', 'rgb(110, 110, 160)', 'rgb(110, 110, 160)', 'rgb(90, 90, 140)', 'rgb(90, 90, 140)', 'rgb(110, 110, 160)', 'rgb(110, 110, 160)', 'rgb(90, 90, 140)', 'rgb(60, 60, 100)', 'rgb(30, 30, 60)', 'rgb(10, 10, 30)', null],
            ['rgb(10, 10, 30)', 'rgb(50, 50, 90)', 'rgb(80, 80, 130)', 'rgb(110, 110, 160)', 'rgb(130, 130, 180)', 'rgb(150, 150, 200)', 'rgb(150, 150, 200)', 'rgb(130, 130, 180)', 'rgb(130, 130, 180)', 'rgb(150, 150, 200)', 'rgb(150, 150, 200)', 'rgb(130, 130, 180)', 'rgb(110, 110, 160)', 'rgb(80, 80, 130)', 'rgb(50, 50, 90)', 'rgb(10, 10, 30)'],
            ['rgb(10, 10, 30)', 'rgb(50, 50, 90)', 'rgb(80, 80, 130)', 'rgb(110, 110, 160)', 'rgb(130, 130, 180)', 'rgb(150, 150, 200)', 'rgb(150, 150, 200)', 'rgb(130, 130, 180)', 'rgb(130, 130, 180)', 'rgb(150, 150, 200)', 'rgb(150, 150, 200)', 'rgb(130, 130, 180)', 'rgb(110, 110, 160)', 'rgb(80, 80, 130)', 'rgb(50, 50, 90)', 'rgb(10, 10, 30)'],
            ['rgb(10, 10, 30)', 'rgb(50, 50, 90)', 'rgb(80, 80, 130)', 'rgb(110, 110, 160)', 'rgb(255, 220, 0)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(110, 110, 160)', 'rgb(110, 110, 160)', 'rgb(255, 220, 0)', 'rgb(255, 255, 255)', 'rgb(110, 110, 160)', 'rgb(110, 110, 160)', 'rgb(80, 80, 130)', 'rgb(50, 50, 90)', 'rgb(10, 10, 30)'],
            ['rgb(10, 10, 30)', 'rgb(50, 50, 90)', 'rgb(80, 80, 130)', 'rgb(110, 110, 160)', 'rgb(110, 110, 160)', 'rgb(130, 130, 180)', 'rgb(255, 220, 0)', 'rgb(130, 130, 180)', 'rgb(130, 130, 180)', 'rgb(110, 110, 160)', 'rgb(110, 110, 160)', 'rgb(130, 130, 180)', 'rgb(110, 110, 160)', 'rgb(80, 80, 130)', 'rgb(50, 50, 90)', 'rgb(10, 10, 30)'],
            ['rgb(10, 10, 30)', 'rgb(50, 50, 90)', 'rgb(80, 80, 130)', 'rgb(110, 110, 160)', 'rgb(110, 110, 160)', 'rgb(130, 130, 180)', 'rgb(130, 130, 180)', 'rgb(130, 130, 180)', 'rgb(130, 130, 180)', 'rgb(130, 130, 180)', 'rgb(130, 130, 180)', 'rgb(130, 130, 180)', 'rgb(110, 110, 160)', 'rgb(80, 80, 130)', 'rgb(50, 50, 90)', 'rgb(10, 10, 30)'],
            [null, 'rgb(10, 10, 30)', 'rgb(50, 50, 90)', 'rgb(60, 60, 100)', 'rgb(80, 80, 130)', 'rgb(100, 100, 150)', 'rgb(100, 100, 150)', 'rgb(100, 100, 150)', 'rgb(100, 100, 150)', 'rgb(100, 100, 150)', 'rgb(100, 100, 150)', 'rgb(80, 80, 130)', 'rgb(60, 60, 100)', 'rgb(50, 50, 90)', 'rgb(10, 10, 30)', null],
            [null, null, 'rgb(10, 10, 30)', 'rgb(30, 30, 60)', 'rgb(50, 50, 90)', 'rgb(70, 70, 110)', 'rgb(70, 70, 110)', 'rgb(70, 70, 110)', 'rgb(70, 70, 110)', 'rgb(70, 70, 110)', 'rgb(70, 70, 110)', 'rgb(50, 50, 90)', 'rgb(30, 30, 60)', 'rgb(10, 10, 30)', null, null],
            [null, null, null, 'rgb(10, 10, 30)', 'rgb(30, 30, 60)', 'rgb(50, 50, 90)', 'rgb(50, 50, 90)', 'rgb(50, 50, 90)', 'rgb(50, 50, 90)', 'rgb(50, 50, 90)', 'rgb(50, 50, 90)', 'rgb(30, 30, 60)', 'rgb(10, 10, 30)', null, null, null],
            [null, null, null, null, 'rgb(10, 10, 30)', 'rgb(30, 30, 60)', 'rgb(30, 30, 60)', 'rgb(30, 30, 60)', 'rgb(30, 30, 60)', 'rgb(30, 30, 60)', 'rgb(30, 30, 60)', 'rgb(10, 10, 30)', null, null, null, null],
            [null, null, null, null, null, 'rgb(10, 10, 30)', 'rgb(10, 10, 30)', 'rgb(10, 10, 30)', 'rgb(10, 10, 30)', 'rgb(10, 10, 30)', 'rgb(10, 10, 30)', null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ],
        // Leafeon - Greens with shading
        [
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, 'rgb(20, 80, 20)', 'rgb(20, 80, 20)', 'rgb(50, 110, 50)', 'rgb(80, 140, 80)', 'rgb(80, 140, 80)', 'rgb(50, 110, 50)', 'rgb(50, 110, 50)', 'rgb(80, 140, 80)', 'rgb(80, 140, 80)', 'rgb(50, 110, 50)', 'rgb(20, 80, 20)', 'rgb(20, 80, 20)', null, null],
            [null, 'rgb(20, 80, 20)', 'rgb(50, 110, 50)', 'rgb(110, 170, 110)', 'rgb(140, 200, 140)', 'rgb(160, 220, 160)', 'rgb(160, 220, 160)', 'rgb(140, 200, 140)', 'rgb(140, 200, 140)', 'rgb(160, 220, 160)', 'rgb(160, 220, 160)', 'rgb(140, 200, 140)', 'rgb(110, 170, 110)', 'rgb(50, 110, 50)', 'rgb(20, 80, 20)', null],
            ['rgb(20, 80, 20)', 'rgb(80, 140, 80)', 'rgb(130, 190, 130)', 'rgb(160, 220, 160)', 'rgb(180, 240, 180)', 'rgb(200, 255, 200)', 'rgb(200, 255, 200)', 'rgb(180, 240, 180)', 'rgb(180, 240, 180)', 'rgb(200, 255, 200)', 'rgb(200, 255, 200)', 'rgb(180, 240, 180)', 'rgb(160, 220, 160)', 'rgb(130, 190, 130)', 'rgb(80, 140, 80)', 'rgb(20, 80, 20)'],
            ['rgb(20, 80, 20)', 'rgb(80, 140, 80)', 'rgb(130, 190, 130)', 'rgb(160, 220, 160)', 'rgb(180, 240, 180)', 'rgb(200, 255, 200)', 'rgb(200, 255, 200)', 'rgb(180, 240, 180)', 'rgb(180, 240, 180)', 'rgb(200, 255, 200)', 'rgb(200, 255, 200)', 'rgb(180, 240, 180)', 'rgb(160, 220, 160)', 'rgb(130, 190, 130)', 'rgb(80, 140, 80)', 'rgb(20, 80, 20)'],
            ['rgb(20, 80, 20)', 'rgb(80, 140, 80)', 'rgb(130, 190, 130)', 'rgb(160, 220, 160)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(160, 220, 160)', 'rgb(160, 220, 160)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(160, 220, 160)', 'rgb(160, 220, 160)', 'rgb(130, 190, 130)', 'rgb(80, 140, 80)', 'rgb(20, 80, 20)'],
            ['rgb(20, 80, 20)', 'rgb(80, 140, 80)', 'rgb(130, 190, 130)', 'rgb(160, 220, 160)', 'rgb(160, 220, 160)', 'rgb(180, 240, 180)', 'rgb(80, 160, 80)', 'rgb(180, 240, 180)', 'rgb(180, 240, 180)', 'rgb(160, 220, 160)', 'rgb(160, 220, 160)', 'rgb(180, 240, 180)', 'rgb(160, 220, 160)', 'rgb(130, 190, 130)', 'rgb(80, 140, 80)', 'rgb(20, 80, 20)'],
            ['rgb(20, 80, 20)', 'rgb(80, 140, 80)', 'rgb(130, 190, 130)', 'rgb(160, 220, 160)', 'rgb(160, 220, 160)', 'rgb(180, 240, 180)', 'rgb(180, 240, 180)', 'rgb(180, 240, 180)', 'rgb(180, 240, 180)', 'rgb(180, 240, 180)', 'rgb(180, 240, 180)', 'rgb(180, 240, 180)', 'rgb(160, 220, 160)', 'rgb(130, 190, 130)', 'rgb(80, 140, 80)', 'rgb(20, 80, 20)'],
            [null, 'rgb(20, 80, 20)', 'rgb(80, 140, 80)', 'rgb(110, 170, 110)', 'rgb(130, 190, 130)', 'rgb(150, 210, 150)', 'rgb(150, 210, 150)', 'rgb(150, 210, 150)', 'rgb(150, 210, 150)', 'rgb(150, 210, 150)', 'rgb(150, 210, 150)', 'rgb(130, 190, 130)', 'rgb(110, 170, 110)', 'rgb(80, 140, 80)', 'rgb(20, 80, 20)', null],
            [null, null, 'rgb(20, 80, 20)', 'rgb(50, 110, 50)', 'rgb(80, 140, 80)', 'rgb(100, 160, 100)', 'rgb(100, 160, 100)', 'rgb(100, 160, 100)', 'rgb(100, 160, 100)', 'rgb(100, 160, 100)', 'rgb(100, 160, 100)', 'rgb(80, 140, 80)', 'rgb(50, 110, 50)', 'rgb(20, 80, 20)', null, null],
            [null, null, null, 'rgb(20, 80, 20)', 'rgb(50, 110, 50)', 'rgb(80, 140, 80)', 'rgb(80, 140, 80)', 'rgb(80, 140, 80)', 'rgb(80, 140, 80)', 'rgb(80, 140, 80)', 'rgb(80, 140, 80)', 'rgb(50, 110, 50)', 'rgb(20, 80, 20)', null, null, null],
            [null, null, null, null, 'rgb(20, 80, 20)', 'rgb(50, 110, 50)', 'rgb(50, 110, 50)', 'rgb(50, 110, 50)', 'rgb(50, 110, 50)', 'rgb(50, 110, 50)', 'rgb(50, 110, 50)', 'rgb(20, 80, 20)', null, null, null, null],
            [null, null, null, null, null, 'rgb(20, 80, 20)', 'rgb(20, 80, 20)', 'rgb(20, 80, 20)', 'rgb(20, 80, 20)', 'rgb(20, 80, 20)', 'rgb(20, 80, 20)', null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ],
        // Glaceon - Cyans with shading
        [
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, 'rgb(80, 150, 200)', 'rgb(80, 150, 200)', 'rgb(100, 170, 220)', 'rgb(120, 190, 240)', 'rgb(120, 190, 240)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(120, 190, 240)', 'rgb(120, 190, 240)', 'rgb(100, 170, 220)', 'rgb(80, 150, 200)', 'rgb(80, 150, 200)', null, null],
            [null, 'rgb(80, 150, 200)', 'rgb(100, 170, 220)', 'rgb(150, 210, 255)', 'rgb(180, 230, 255)', 'rgb(200, 250, 255)', 'rgb(200, 250, 255)', 'rgb(180, 230, 255)', 'rgb(180, 230, 255)', 'rgb(200, 250, 255)', 'rgb(200, 250, 255)', 'rgb(180, 230, 255)', 'rgb(150, 210, 255)', 'rgb(100, 170, 220)', 'rgb(80, 150, 200)', null],
            ['rgb(80, 150, 200)', 'rgb(120, 190, 240)', 'rgb(160, 220, 255)', 'rgb(200, 250, 255)', 'rgb(220, 255, 255)', 'rgb(240, 255, 255)', 'rgb(240, 255, 255)', 'rgb(220, 255, 255)', 'rgb(220, 255, 255)', 'rgb(240, 255, 255)', 'rgb(240, 255, 255)', 'rgb(220, 255, 255)', 'rgb(200, 250, 255)', 'rgb(160, 220, 255)', 'rgb(120, 190, 240)', 'rgb(80, 150, 200)'],
            ['rgb(80, 150, 200)', 'rgb(120, 190, 240)', 'rgb(160, 220, 255)', 'rgb(200, 250, 255)', 'rgb(220, 255, 255)', 'rgb(240, 255, 255)', 'rgb(240, 255, 255)', 'rgb(220, 255, 255)', 'rgb(220, 255, 255)', 'rgb(240, 255, 255)', 'rgb(240, 255, 255)', 'rgb(220, 255, 255)', 'rgb(200, 250, 255)', 'rgb(160, 220, 255)', 'rgb(120, 190, 240)', 'rgb(80, 150, 200)'],
            ['rgb(80, 150, 200)', 'rgb(120, 190, 240)', 'rgb(160, 220, 255)', 'rgb(200, 250, 255)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(200, 250, 255)', 'rgb(200, 250, 255)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(200, 250, 255)', 'rgb(200, 250, 255)', 'rgb(160, 220, 255)', 'rgb(120, 190, 240)', 'rgb(80, 150, 200)'],
            ['rgb(80, 150, 200)', 'rgb(120, 190, 240)', 'rgb(160, 220, 255)', 'rgb(200, 250, 255)', 'rgb(200, 250, 255)', 'rgb(220, 255, 255)', 'rgb(220, 250, 255)', 'rgb(220, 255, 255)', 'rgb(220, 255, 255)', 'rgb(200, 250, 255)', 'rgb(200, 250, 255)', 'rgb(220, 255, 255)', 'rgb(200, 250, 255)', 'rgb(160, 220, 255)', 'rgb(120, 190, 240)', 'rgb(80, 150, 200)'],
            ['rgb(80, 150, 200)', 'rgb(120, 190, 240)', 'rgb(160, 220, 255)', 'rgb(200, 250, 255)', 'rgb(200, 250, 255)', 'rgb(220, 255, 255)', 'rgb(220, 255, 255)', 'rgb(220, 255, 255)', 'rgb(220, 255, 255)', 'rgb(220, 255, 255)', 'rgb(220, 255, 255)', 'rgb(220, 255, 255)', 'rgb(200, 250, 255)', 'rgb(160, 220, 255)', 'rgb(120, 190, 240)', 'rgb(80, 150, 200)'],
            [null, 'rgb(80, 150, 200)', 'rgb(120, 190, 240)', 'rgb(150, 210, 255)', 'rgb(160, 220, 255)', 'rgb(180, 240, 255)', 'rgb(180, 240, 255)', 'rgb(180, 240, 255)', 'rgb(180, 240, 255)', 'rgb(180, 240, 255)', 'rgb(180, 240, 255)', 'rgb(160, 220, 255)', 'rgb(150, 210, 255)', 'rgb(120, 190, 240)', 'rgb(80, 150, 200)', null],
            [null, null, 'rgb(80, 150, 200)', 'rgb(100, 170, 220)', 'rgb(120, 190, 240)', 'rgb(140, 210, 255)', 'rgb(140, 210, 255)', 'rgb(140, 210, 255)', 'rgb(140, 210, 255)', 'rgb(140, 210, 255)', 'rgb(140, 210, 255)', 'rgb(120, 190, 240)', 'rgb(100, 170, 220)', 'rgb(80, 150, 200)', null, null],
            [null, null, null, 'rgb(80, 150, 200)', 'rgb(100, 170, 220)', 'rgb(120, 190, 240)', 'rgb(120, 190, 240)', 'rgb(120, 190, 240)', 'rgb(120, 190, 240)', 'rgb(120, 190, 240)', 'rgb(120, 190, 240)', 'rgb(100, 170, 220)', 'rgb(80, 150, 200)', null, null, null],
            [null, null, null, null, 'rgb(80, 150, 200)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(100, 170, 220)', 'rgb(80, 150, 200)', null, null, null, null],
            [null, null, null, null, null, 'rgb(80, 150, 200)', 'rgb(80, 150, 200)', 'rgb(80, 150, 200)', 'rgb(80, 150, 200)', 'rgb(80, 150, 200)', 'rgb(80, 150, 200)', null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ],
        // Sylveon - Pinks with shading
        [
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, 'rgb(140, 40, 100)', 'rgb(140, 40, 100)', 'rgb(170, 70, 130)', 'rgb(200, 110, 160)', 'rgb(200, 110, 160)', 'rgb(170, 70, 130)', 'rgb(170, 70, 130)', 'rgb(200, 110, 160)', 'rgb(200, 110, 160)', 'rgb(170, 70, 130)', 'rgb(140, 40, 100)', 'rgb(140, 40, 100)', null, null],
            [null, 'rgb(140, 40, 100)', 'rgb(170, 70, 130)', 'rgb(220, 120, 180)', 'rgb(240, 150, 200)', 'rgb(255, 200, 230)', 'rgb(255, 200, 230)', 'rgb(240, 150, 200)', 'rgb(240, 150, 200)', 'rgb(255, 200, 230)', 'rgb(255, 200, 230)', 'rgb(240, 150, 200)', 'rgb(220, 120, 180)', 'rgb(170, 70, 130)', 'rgb(140, 40, 100)', null],
            ['rgb(140, 40, 100)', 'rgb(200, 110, 160)', 'rgb(240, 150, 200)', 'rgb(255, 200, 230)', 'rgb(255, 220, 240)', 'rgb(255, 240, 250)', 'rgb(255, 240, 250)', 'rgb(255, 220, 240)', 'rgb(255, 220, 240)', 'rgb(255, 240, 250)', 'rgb(255, 240, 250)', 'rgb(255, 220, 240)', 'rgb(255, 200, 230)', 'rgb(240, 150, 200)', 'rgb(200, 110, 160)', 'rgb(140, 40, 100)'],
            ['rgb(140, 40, 100)', 'rgb(200, 110, 160)', 'rgb(240, 150, 200)', 'rgb(255, 200, 230)', 'rgb(255, 220, 240)', 'rgb(255, 240, 250)', 'rgb(255, 240, 250)', 'rgb(255, 220, 240)', 'rgb(255, 220, 240)', 'rgb(255, 240, 250)', 'rgb(255, 240, 250)', 'rgb(255, 220, 240)', 'rgb(255, 200, 230)', 'rgb(240, 150, 200)', 'rgb(200, 110, 160)', 'rgb(140, 40, 100)'],
            ['rgb(140, 40, 100)', 'rgb(200, 110, 160)', 'rgb(240, 150, 200)', 'rgb(255, 200, 230)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 200, 230)', 'rgb(255, 200, 230)', 'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(255, 200, 230)', 'rgb(255, 200, 230)', 'rgb(240, 150, 200)', 'rgb(200, 110, 160)', 'rgb(140, 40, 100)'],
            ['rgb(140, 40, 100)', 'rgb(200, 110, 160)', 'rgb(240, 150, 200)', 'rgb(255, 200, 230)', 'rgb(255, 200, 230)', 'rgb(255, 220, 240)', 'rgb(255, 100, 180)', 'rgb(255, 220, 240)', 'rgb(255, 220, 240)', 'rgb(255, 200, 230)', 'rgb(255, 200, 230)', 'rgb(255, 220, 240)', 'rgb(255, 200, 230)', 'rgb(240, 150, 200)', 'rgb(200, 110, 160)', 'rgb(140, 40, 100)'],
            ['rgb(140, 40, 100)', 'rgb(200, 110, 160)', 'rgb(240, 150, 200)', 'rgb(255, 200, 230)', 'rgb(255, 200, 230)', 'rgb(255, 220, 240)', 'rgb(255, 220, 240)', 'rgb(255, 220, 240)', 'rgb(255, 220, 240)', 'rgb(255, 220, 240)', 'rgb(255, 220, 240)', 'rgb(255, 220, 240)', 'rgb(255, 200, 230)', 'rgb(240, 150, 200)', 'rgb(200, 110, 160)', 'rgb(140, 40, 100)'],
            [null, 'rgb(140, 40, 100)', 'rgb(200, 110, 160)', 'rgb(220, 120, 180)', 'rgb(240, 150, 200)', 'rgb(255, 180, 220)', 'rgb(255, 180, 220)', 'rgb(255, 180, 220)', 'rgb(255, 180, 220)', 'rgb(255, 180, 220)', 'rgb(255, 180, 220)', 'rgb(240, 150, 200)', 'rgb(220, 120, 180)', 'rgb(200, 110, 160)', 'rgb(140, 40, 100)', null],
            [null, null, 'rgb(140, 40, 100)', 'rgb(170, 70, 130)', 'rgb(200, 110, 160)', 'rgb(220, 140, 180)', 'rgb(220, 140, 180)', 'rgb(220, 140, 180)', 'rgb(220, 140, 180)', 'rgb(220, 140, 180)', 'rgb(220, 140, 180)', 'rgb(200, 110, 160)', 'rgb(170, 70, 130)', 'rgb(140, 40, 100)', null, null],
            [null, null, null, 'rgb(140, 40, 100)', 'rgb(170, 70, 130)', 'rgb(200, 110, 160)', 'rgb(200, 110, 160)', 'rgb(200, 110, 160)', 'rgb(200, 110, 160)', 'rgb(200, 110, 160)', 'rgb(200, 110, 160)', 'rgb(170, 70, 130)', 'rgb(140, 40, 100)', null, null, null],
            [null, null, null, null, 'rgb(140, 40, 100)', 'rgb(170, 70, 130)', 'rgb(170, 70, 130)', 'rgb(170, 70, 130)', 'rgb(170, 70, 130)', 'rgb(170, 70, 130)', 'rgb(170, 70, 130)', 'rgb(140, 40, 100)', null, null, null, null],
            [null, null, null, null, null, 'rgb(140, 40, 100)', 'rgb(140, 40, 100)', 'rgb(140, 40, 100)', 'rgb(140, 40, 100)', 'rgb(140, 40, 100)', 'rgb(140, 40, 100)', null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
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
    state.pixelData = new Array(state.gridSize * state.gridSize).fill('rgb(255, 255, 255)');
    
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