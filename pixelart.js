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

// ===== ULTRA-DETAILED EEVEELUTION PIXEL ART DATA =====
const eeveelutions = [
    { 
        name: 'Eevee', 
        emoji: '🐹',
        colors: {
            'br': 'rgb(180, 140, 90)',
            'da': 'rgb(120, 80, 40)',
            'li': 'rgb(220, 180, 130)',
            'wh': 'rgb(255, 255, 255)',
            'bk': 'rgb(0, 0, 0)',
            'pk': 'rgb(255, 100, 150)'
        }
    },
    { 
        name: 'Vaporeon', 
        emoji: '💧',
        colors: {
            'bl': 'rgb(100, 160, 240)',
            'db': 'rgb(60, 110, 180)',
            'lb': 'rgb(150, 200, 255)',
            'wh': 'rgb(255, 255, 255)',
            'bk': 'rgb(0, 0, 0)',
            'cy': 'rgb(100, 220, 240)'
        }
    },
    { 
        name: 'Jolteon', 
        emoji: '⚡',
        colors: {
            'ye': 'rgb(255, 220, 80)',
            'dy': 'rgb(200, 160, 40)',
            'ly': 'rgb(255, 255, 150)',
            'wh': 'rgb(255, 255, 255)',
            'bk': 'rgb(0, 0, 0)',
            'go': 'rgb(255, 200, 0)'
        }
    },
    { 
        name: 'Flareon', 
        emoji: '🔥',
        colors: {
            'or': 'rgb(255, 140, 80)',
            're': 'rgb(200, 80, 20)',
            'lo': 'rgb(255, 200, 150)',
            'wh': 'rgb(255, 255, 255)',
            'bk': 'rgb(0, 0, 0)',
            'fl': 'rgb(255, 100, 0)'
        }
    },
    { 
        name: 'Espeon', 
        emoji: '✨',
        colors: {
            'pu': 'rgb(200, 140, 240)',
            'dp': 'rgb(150, 80, 200)',
            'lp': 'rgb(230, 190, 255)',
            'wh': 'rgb(255, 255, 255)',
            'bk': 'rgb(0, 0, 0)',
            'ma': 'rgb(255, 0, 255)'
        }
    },
    { 
        name: 'Umbreon', 
        emoji: '🌙',
        colors: {
            'bk': 'rgb(50, 50, 80)',
            'dk': 'rgb(20, 20, 40)',
            'gr': 'rgb(100, 100, 140)',
            'wh': 'rgb(255, 255, 255)',
            'ye': 'rgb(255, 200, 0)',
            'sh': 'rgb(255, 255, 150)'
        }
    },
    { 
        name: 'Leafeon', 
        emoji: '🍃',
        colors: {
            'gr': 'rgb(100, 180, 100)',
            'dg': 'rgb(50, 140, 50)',
            'lg': 'rgb(150, 220, 150)',
            'wh': 'rgb(255, 255, 255)',
            'bk': 'rgb(0, 0, 0)',
            'le': 'rgb(80, 160, 80)'
        }
    },
    { 
        name: 'Glaceon', 
        emoji: '❄️',
        colors: {
            'cy': 'rgb(150, 210, 255)',
            'db': 'rgb(100, 160, 220)',
            'lb': 'rgb(200, 240, 255)',
            'wh': 'rgb(255, 255, 255)',
            'bk': 'rgb(0, 0, 0)',
            'ic': 'rgb(220, 250, 255)'
        }
    },
    { 
        name: 'Sylveon', 
        emoji: '🎀',
        colors: {
            'pk': 'rgb(255, 140, 200)',
            'dp': 'rgb(200, 80, 150)',
            'lp': 'rgb(255, 200, 230)',
            'wh': 'rgb(255, 255, 255)',
            'bk': 'rgb(0, 0, 0)',
            'rb': 'rgb(255, 100, 180)'
        }
    }
];

// ULTRA-DETAILED Pixel Art Patterns with BIG EARS and REALISTIC BODY
function getPixelArtPattern(eevee) {
    if (eevee.name === 'Eevee') {
        return [
            [null, null, 'da', 'da', null, null, null, null, null, null, null, 'da', 'da', null, null, null],
            [null, 'da', 'br', 'br', 'da', null, null, null, null, null, 'da', 'br', 'br', 'da', null, null],
            ['da', 'br', 'li', 'li', 'br', 'da', null, null, null, 'da', 'br', 'li', 'li', 'br', 'da', null],
            ['da', 'br', 'li', 'li', 'br', 'br', null, null, null, 'br', 'br', 'li', 'li', 'br', 'da', null],
            ['da', 'br', 'br', 'br', 'br', 'br', 'br', null, 'br', 'br', 'br', 'br', 'br', 'br', 'da', null],
            [null, 'da', 'br', 'br', 'br', 'br', 'br', 'br', 'br', 'br', 'br', 'br', 'br', 'da', null, null],
            [null, 'da', 'br', 'bk', 'wh', 'br', 'br', 'br', 'br', 'br', 'bk', 'wh', 'br', 'da', null, null],
            [null, 'da', 'br', 'br', 'li', 'br', 'br', 'pk', 'br', 'li', 'br', 'br', 'br', 'da', null, null],
            [null, 'da', 'br', 'br', 'br', 'br', 'br', 'br', 'br', 'br', 'br', 'br', 'br', 'da', null, null],
            [null, null, 'da', 'br', 'br', 'br', 'br', 'br', 'br', 'br', 'br', 'br', 'da', null, null, null],
            [null, null, 'da', 'br', 'br', 'br', 'da', null, null, 'da', 'br', 'br', 'da', null, null, null],
            [null, 'da', 'br', 'br', 'br', 'da', null, null, null, null, 'da', 'br', 'br', 'da', null, null],
            ['da', 'br', 'br', 'br', 'da', null, null, null, null, null, null, 'da', 'br', 'br', 'da', null],
            ['da', 'br', 'br', 'da', null, null, null, null, null, null, null, null, 'da', 'br', 'br', 'da'],
            [null, 'da', 'da', null, null, null, null, null, null, null, null, null, null, 'da', 'da', null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ];
    } else if (eevee.name === 'Vaporeon') {
        return [
            [null, null, 'db', 'db', null, null, null, null, null, null, null, 'db', 'db', null, null, null],
            [null, 'db', 'bl', 'bl', 'db', null, null, null, null, null, 'db', 'bl', 'bl', 'db', null, null],
            ['db', 'bl', 'lb', 'lb', 'bl', 'db', null, null, null, 'db', 'bl', 'lb', 'lb', 'bl', 'db', null],
            ['db', 'bl', 'lb', 'lb', 'bl', 'bl', null, null, null, 'bl', 'bl', 'lb', 'lb', 'bl', 'db', null],
            ['db', 'bl', 'bl', 'bl', 'bl', 'bl', 'bl', null, 'bl', 'bl', 'bl', 'bl', 'bl', 'bl', 'db', null],
            [null, 'db', 'bl', 'bl', 'bl', 'bl', 'bl', 'bl', 'bl', 'bl', 'bl', 'bl', 'bl', 'db', null, null],
            [null, 'db', 'bl', 'bk', 'wh', 'bl', 'bl', 'bl', 'bl', 'bl', 'bk', 'wh', 'bl', 'db', null, null],
            [null, 'db', 'bl', 'bl', 'cy', 'bl', 'bl', 'cy', 'bl', 'cy', 'bl', 'bl', 'bl', 'db', null, null],
            [null, 'db', 'bl', 'bl', 'bl', 'bl', 'bl', 'bl', 'bl', 'bl', 'bl', 'bl', 'bl', 'db', null, null],
            [null, null, 'db', 'bl', 'bl', 'bl', 'bl', 'bl', 'bl', 'bl', 'bl', 'bl', 'db', null, null, null],
            [null, null, 'db', 'bl', 'bl', 'bl', 'db', null, null, 'db', 'bl', 'bl', 'db', null, null, null],
            [null, 'db', 'bl', 'bl', 'bl', 'db', null, null, null, null, 'db', 'bl', 'bl', 'db', null, null],
            ['db', 'bl', 'bl', 'bl', 'db', null, null, null, null, null, null, 'db', 'bl', 'bl', 'db', null],
            ['db', 'bl', 'bl', 'db', null, null, null, null, null, null, null, null, 'db', 'bl', 'bl', 'db'],
            [null, 'db', 'db', null, null, null, null, null, null, null, null, null, null, 'db', 'db', null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ];
    } else if (eevee.name === 'Jolteon') {
        return [
            [null, null, 'dy', 'dy', null, null, null, null, null, null, null, 'dy', 'dy', null, null, null],
            [null, 'dy', 'ye', 'ye', 'dy', null, null, null, null, null, 'dy', 'ye', 'ye', 'dy', null, null],
            ['dy', 'ye', 'ly', 'ly', 'ye', 'dy', null, null, null, 'dy', 'ye', 'ly', 'ly', 'ye', 'dy', null],
            ['dy', 'ye', 'ly', 'ly', 'ye', 'ye', null, null, null, 'ye', 'ye', 'ly', 'ly', 'ye', 'dy', null],
            ['dy', 'ye', 'ye', 'ye', 'ye', 'ye', 'ye', null, 'ye', 'ye', 'ye', 'ye', 'ye', 'ye', 'dy', null],
            [null, 'dy', 'ye', 'ye', 'ye', 'ye', 'ye', 'ye', 'ye', 'ye', 'ye', 'ye', 'ye', 'dy', null, null],
            [null, 'dy', 'ye', 'bk', 'wh', 'ye', 'ye', 'ye', 'ye', 'ye', 'bk', 'wh', 'ye', 'dy', null, null],
            [null, 'dy', 'ye', 'ye', 'go', 'ye', 'ye', 'go', 'ye', 'go', 'ye', 'ye', 'ye', 'dy', null, null],
            [null, 'dy', 'ye', 'ye', 'ye', 'ye', 'ye', 'ye', 'ye', 'ye', 'ye', 'ye', 'ye', 'dy', null, null],
            [null, null, 'dy', 'ye', 'ye', 'ye', 'ye', 'ye', 'ye', 'ye', 'ye', 'ye', 'dy', null, null, null],
            [null, null, 'dy', 'ye', 'ye', 'ye', 'dy', null, null, 'dy', 'ye', 'ye', 'dy', null, null, null],
            [null, 'dy', 'ye', 'ye', 'ye', 'dy', null, null, null, null, 'dy', 'ye', 'ye', 'dy', null, null],
            ['dy', 'ye', 'ye', 'ye', 'dy', null, null, null, null, null, null, 'dy', 'ye', 'ye', 'dy', null],
            ['dy', 'ye', 'ye', 'dy', null, null, null, null, null, null, null, null, 'dy', 'ye', 'ye', 'dy'],
            [null, 'dy', 'dy', null, null, null, null, null, null, null, null, null, null, 'dy', 'dy', null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ];
    } else if (eevee.name === 'Flareon') {
        return [
            [null, null, 're', 're', null, null, null, null, null, null, null, 're', 're', null, null, null],
            [null, 're', 'or', 'or', 're', null, null, null, null, null, 're', 'or', 'or', 're', null, null],
            ['re', 'or', 'lo', 'lo', 'or', 're', null, null, null, 're', 'or', 'lo', 'lo', 'or', 're', null],
            ['re', 'or', 'lo', 'lo', 'or', 'or', null, null, null, 'or', 'or', 'lo', 'lo', 'or', 're', null],
            ['re', 'or', 'or', 'or', 'or', 'or', 'or', null, 'or', 'or', 'or', 'or', 'or', 'or', 're', null],
            [null, 're', 'or', 'or', 'or', 'or', 'or', 'or', 'or', 'or', 'or', 'or', 'or', 're', null, null],
            [null, 're', 'or', 'bk', 'wh', 'or', 'or', 'or', 'or', 'or', 'bk', 'wh', 'or', 're', null, null],
            [null, 're', 'or', 'or', 'fl', 'or', 'or', 'fl', 'or', 'fl', 'or', 'or', 'or', 're', null, null],
            [null, 're', 'or', 'or', 'or', 'or', 'or', 'or', 'or', 'or', 'or', 'or', 'or', 're', null, null],
            [null, null, 're', 'or', 'or', 'or', 'or', 'or', 'or', 'or', 'or', 'or', 're', null, null, null],
            [null, null, 're', 'or', 'or', 'or', 're', null, null, 're', 'or', 'or', 're', null, null, null],
            [null, 're', 'or', 'or', 'or', 're', null, null, null, null, 're', 'or', 'or', 're', null, null],
            ['re', 'or', 'or', 'or', 're', null, null, null, null, null, null, 're', 'or', 'or', 're', null],
            ['re', 'or', 'or', 're', null, null, null, null, null, null, null, null, 're', 'or', 'or', 're'],
            [null, 're', 're', null, null, null, null, null, null, null, null, null, null, 're', 're', null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ];
    } else if (eevee.name === 'Espeon') {
        return [
            [null, null, 'dp', 'dp', null, null, null, null, null, null, null, 'dp', 'dp', null, null, null],
            [null, 'dp', 'pu', 'pu', 'dp', null, null, null, null, null, 'dp', 'pu', 'pu', 'dp', null, null],
            ['dp', 'pu', 'lp', 'lp', 'pu', 'dp', null, null, null, 'dp', 'pu', 'lp', 'lp', 'pu', 'dp', null],
            ['dp', 'pu', 'lp', 'lp', 'pu', 'pu', null, null, null, 'pu', 'pu', 'lp', 'lp', 'pu', 'dp', null],
            ['dp', 'pu', 'pu', 'pu', 'pu', 'pu', 'pu', null, 'pu', 'pu', 'pu', 'pu', 'pu', 'pu', 'dp', null],
            [null, 'dp', 'pu', 'pu', 'pu', 'pu', 'pu', 'pu', 'pu', 'pu', 'pu', 'pu', 'pu', 'dp', null, null],
            [null, 'dp', 'pu', 'bk', 'wh', 'pu', 'pu', 'pu', 'pu', 'pu', 'bk', 'wh', 'pu', 'dp', null, null],
            [null, 'dp', 'pu', 'pu', 'ma', 'pu', 'pu', 'ma', 'pu', 'ma', 'pu', 'pu', 'pu', 'dp', null, null],
            [null, 'dp', 'pu', 'pu', 'pu', 'pu', 'pu', 'pu', 'pu', 'pu', 'pu', 'pu', 'pu', 'dp', null, null],
            [null, null, 'dp', 'pu', 'pu', 'pu', 'pu', 'pu', 'pu', 'pu', 'pu', 'pu', 'dp', null, null, null],
            [null, null, 'dp', 'pu', 'pu', 'pu', 'dp', null, null, 'dp', 'pu', 'pu', 'dp', null, null, null],
            [null, 'dp', 'pu', 'pu', 'pu', 'dp', null, null, null, null, 'dp', 'pu', 'pu', 'dp', null, null],
            ['dp', 'pu', 'pu', 'pu', 'dp', null, null, null, null, null, null, 'dp', 'pu', 'pu', 'dp', null],
            ['dp', 'pu', 'pu', 'dp', null, null, null, null, null, null, null, null, 'dp', 'pu', 'pu', 'dp'],
            [null, 'dp', 'dp', null, null, null, null, null, null, null, null, null, null, 'dp', 'dp', null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ];
    } else if (eevee.name === 'Umbreon') {
        return [
            [null, null, 'dk', 'dk', null, null, null, null, null, null, null, 'dk', 'dk', null, null, null],
            [null, 'dk', 'bk', 'bk', 'dk', null, null, null, null, null, 'dk', 'bk', 'bk', 'dk', null, null],
            ['dk', 'bk', 'gr', 'gr', 'bk', 'dk', null, null, null, 'dk', 'bk', 'gr', 'gr', 'bk', 'dk', null],
            ['dk', 'bk', 'gr', 'gr', 'bk', 'bk', null, null, null, 'bk', 'bk', 'gr', 'gr', 'bk', 'dk', null],
            ['dk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', null, 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'dk', null],
            [null, 'dk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'dk', null, null],
            [null, 'dk', 'bk', 'ye', 'wh', 'bk', 'bk', 'bk', 'bk', 'bk', 'ye', 'wh', 'bk', 'dk', null, null],
            [null, 'dk', 'bk', 'bk', 'ye', 'bk', 'bk', 'ye', 'bk', 'ye', 'bk', 'bk', 'bk', 'dk', null, null],
            [null, 'dk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'dk', null, null],
            [null, null, 'dk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'bk', 'dk', null, null, null],
            [null, null, 'dk', 'bk', 'bk', 'bk', 'dk', null, null, 'dk', 'bk', 'bk', 'dk', null, null, null],
            [null, 'dk', 'bk', 'bk', 'bk', 'dk', null, null, null, null, 'dk', 'bk', 'bk', 'dk', null, null],
            ['dk', 'bk', 'bk', 'bk', 'dk', null, null, null, null, null, null, 'dk', 'bk', 'bk', 'dk', null],
            ['dk', 'bk', 'bk', 'dk', null, null, null, null, null, null, null, null, 'dk', 'bk', 'bk', 'dk'],
            [null, 'dk', 'dk', null, null, null, null, null, null, null, null, null, null, 'dk', 'dk', null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ];
    } else if (eevee.name === 'Leafeon') {
        return [
            [null, null, 'dg', 'dg', null, null, null, null, null, null, null, 'dg', 'dg', null, null, null],
            [null, 'dg', 'gr', 'gr', 'dg', null, null, null, null, null, 'dg', 'gr', 'gr', 'dg', null, null],
            ['dg', 'gr', 'lg', 'lg', 'gr', 'dg', null, null, null, 'dg', 'gr', 'lg', 'lg', 'gr', 'dg', null],
            ['dg', 'gr', 'lg', 'lg', 'gr', 'gr', null, null, null, 'gr', 'gr', 'lg', 'lg', 'gr', 'dg', null],
            ['dg', 'gr', 'gr', 'gr', 'gr', 'gr', 'gr', null, 'gr', 'gr', 'gr', 'gr', 'gr', 'gr', 'dg', null],
            [null, 'dg', 'gr', 'gr', 'gr', 'gr', 'gr', 'gr', 'gr', 'gr', 'gr', 'gr', 'gr', 'dg', null, null],
            [null, 'dg', 'gr', 'bk', 'wh', 'gr', 'gr', 'gr', 'gr', 'gr', 'bk', 'wh', 'gr', 'dg', null, null],
            [null, 'dg', 'gr', 'gr', 'le', 'gr', 'gr', 'le', 'gr', 'le', 'gr', 'gr', 'gr', 'dg', null, null],
            [null, 'dg', 'gr', 'gr', 'gr', 'gr', 'gr', 'gr', 'gr', 'gr', 'gr', 'gr', 'gr', 'dg', null, null],
            [null, null, 'dg', 'gr', 'gr', 'gr', 'gr', 'gr', 'gr', 'gr', 'gr', 'gr', 'dg', null, null, null],
            [null, null, 'dg', 'gr', 'gr', 'gr', 'dg', null, null, 'dg', 'gr', 'gr', 'dg', null, null, null],
            [null, 'dg', 'gr', 'gr', 'gr', 'dg', null, null, null, null, 'dg', 'gr', 'gr', 'dg', null, null],
            ['dg', 'gr', 'gr', 'gr', 'dg', null, null, null, null, null, null, 'dg', 'gr', 'gr', 'dg', null],
            ['dg', 'gr', 'gr', 'dg', null, null, null, null, null, null, null, null, 'dg', 'gr', 'gr', 'dg'],
            [null, 'dg', 'dg', null, null, null, null, null, null, null, null, null, null, 'dg', 'dg', null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ];
    } else if (eevee.name === 'Glaceon') {
        return [
            [null, null, 'db', 'db', null, null, null, null, null, null, null, 'db', 'db', null, null, null],
            [null, 'db', 'cy', 'cy', 'db', null, null, null, null, null, 'db', 'cy', 'cy', 'db', null, null],
            ['db', 'cy', 'lb', 'lb', 'cy', 'db', null, null, null, 'db', 'cy', 'lb', 'lb', 'cy', 'db', null],
            ['db', 'cy', 'lb', 'lb', 'cy', 'cy', null, null, null, 'cy', 'cy', 'lb', 'lb', 'cy', 'db', null],
            ['db', 'cy', 'cy', 'cy', 'cy', 'cy', 'cy', null, 'cy', 'cy', 'cy', 'cy', 'cy', 'cy', 'db', null],
            [null, 'db', 'cy', 'cy', 'cy', 'cy', 'cy', 'cy', 'cy', 'cy', 'cy', 'cy', 'cy', 'db', null, null],
            [null, 'db', 'cy', 'bk', 'wh', 'cy', 'cy', 'cy', 'cy', 'cy', 'bk', 'wh', 'cy', 'db', null, null],
            [null, 'db', 'cy', 'cy', 'ic', 'cy', 'cy', 'ic', 'cy', 'ic', 'cy', 'cy', 'cy', 'db', null, null],
            [null, 'db', 'cy', 'cy', 'cy', 'cy', 'cy', 'cy', 'cy', 'cy', 'cy', 'cy', 'cy', 'db', null, null],
            [null, null, 'db', 'cy', 'cy', 'cy', 'cy', 'cy', 'cy', 'cy', 'cy', 'cy', 'db', null, null, null],
            [null, null, 'db', 'cy', 'cy', 'cy', 'db', null, null, 'db', 'cy', 'cy', 'db', null, null, null],
            [null, 'db', 'cy', 'cy', 'cy', 'db', null, null, null, null, 'db', 'cy', 'cy', 'db', null, null],
            ['db', 'cy', 'cy', 'cy', 'db', null, null, null, null, null, null, 'db', 'cy', 'cy', 'db', null],
            ['db', 'cy', 'cy', 'db', null, null, null, null, null, null, null, null, 'db', 'cy', 'cy', 'db'],
            [null, 'db', 'db', null, null, null, null, null, null, null, null, null, null, 'db', 'db', null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ];
    } else if (eevee.name === 'Sylveon') {
        return [
            [null, null, 'dp', 'dp', null, null, null, null, null, null, null, 'dp', 'dp', null, null, null],
            [null, 'dp', 'pk', 'pk', 'dp', null, null, null, null, null, 'dp', 'pk', 'pk', 'dp', null, null],
            ['dp', 'pk', 'lp', 'lp', 'pk', 'dp', null, null, null, 'dp', 'pk', 'lp', 'lp', 'pk', 'dp', null],
            ['dp', 'pk', 'lp', 'lp', 'pk', 'pk', null, null, null, 'pk', 'pk', 'lp', 'lp', 'pk', 'dp', null],
            ['dp', 'pk', 'pk', 'pk', 'pk', 'pk', 'pk', null, 'pk', 'pk', 'pk', 'pk', 'pk', 'pk', 'dp', null],
            [null, 'dp', 'pk', 'pk', 'pk', 'pk', 'pk', 'pk', 'pk', 'pk', 'pk', 'pk', 'pk', 'dp', null, null],
            [null, 'dp', 'pk', 'bk', 'wh', 'pk', 'pk', 'pk', 'pk', 'pk', 'bk', 'wh', 'pk', 'dp', null, null],
            [null, 'dp', 'pk', 'pk', 'rb', 'pk', 'pk', 'rb', 'pk', 'rb', 'pk', 'pk', 'pk', 'dp', null, null],
            [null, 'dp', 'pk', 'pk', 'pk', 'pk', 'pk', 'pk', 'pk', 'pk', 'pk', 'pk', 'pk', 'dp', null, null],
            [null, null, 'dp', 'pk', 'pk', 'pk', 'pk', 'pk', 'pk', 'pk', 'pk', 'pk', 'dp', null, null, null],
            [null, null, 'dp', 'pk', 'pk', 'pk', 'dp', null, null, 'dp', 'pk', 'pk', 'dp', null, null, null],
            [null, 'dp', 'pk', 'pk', 'pk', 'dp', null, null, null, null, 'dp', 'pk', 'pk', 'dp', null, null],
            ['dp', 'pk', 'pk', 'pk', 'dp', null, null, null, null, null, null, 'dp', 'pk', 'pk', 'dp', null],
            ['dp', 'pk', 'pk', 'dp', null, null, null, null, null, null, null, null, 'dp', 'pk', 'pk', 'dp'],
            [null, 'dp', 'dp', null, null, null, null, null, null, null, null, null, null, 'dp', 'dp', null],
            [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
        ];
    }
    
    // Default pattern
    return getPixelArtPattern(eeveelutions[0]);
}

function renderEeveelutionGallery() {
    const grid = document.getElementById('eeveelutionGrid');
    grid.innerHTML = '';
    
    eeveelutions.forEach(function(eevee) {
        const item = document.createElement('div');
        item.className = 'eeveelution-item';
        
        // Create a small preview canvas
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = 100;
        previewCanvas.height = 100;
        previewCanvas.className = 'eeveelution-preview-canvas';
        
        renderPixelArtPreview(previewCanvas, eevee);
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'eeveelution-name';
        nameDiv.textContent = eevee.name + ' ' + eevee.emoji;
        
        item.appendChild(previewCanvas);
        item.appendChild(nameDiv);
        
        item.addEventListener('click', function() {
            copyEeveelution(eevee);
            document.getElementById('eeveelutionGallery').classList.remove('active');
        });
        
        grid.appendChild(item);
    });
}

function renderPixelArtPreview(canvas, eevee) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const pattern = getPixelArtPattern(eevee);
    const pixelSize = 6; // 6px per pixel in preview
    
    pattern.forEach(function(row, rowIdx) {
        row.forEach(function(colorKey, colIdx) {
            if (colorKey && eevee.colors[colorKey]) {
                ctx.fillStyle = eevee.colors[colorKey];
                ctx.fillRect(colIdx * pixelSize, rowIdx * pixelSize, pixelSize, pixelSize);
            }
        });
    });
}

function copyEeveelution(eevee) {
    state.history.push({...state.pixelData});
    
    // Get pattern
    const pattern = getPixelArtPattern(eevee);
    const patternWidth = 16;
    const patternHeight = 16;
    
    // Clear canvas
    state.pixelData = new Array(state.gridSize * state.gridSize).fill('rgb(255, 255, 255)');
    
    // Center the pattern on canvas
    const offsetX = Math.floor((state.gridSize - patternWidth) / 2);
    const offsetY = Math.floor((state.gridSize - patternHeight) / 2);
    
    // Apply pattern
    pattern.forEach(function(row, patternY) {
        row.forEach(function(colorKey, patternX) {
            if (colorKey && eevee.colors[colorKey] && patternY + offsetY >= 0 && patternY + offsetY < state.gridSize &&
                patternX + offsetX >= 0 && patternX + offsetX < state.gridSize) {
                const index = (patternY + offsetY) * state.gridSize + (patternX + offsetX);
                state.pixelData[index] = eevee.colors[colorKey];
            }
        });
    });
    
    createPixelCanvas();
    alert('✨ ' + eevee.name + ' added to your canvas! You can now edit it! ✨');
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