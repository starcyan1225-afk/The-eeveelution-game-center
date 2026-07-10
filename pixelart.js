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

// Color palette for Eeveelutions
const colors = {
    tan: 'rgb(200, 150, 80)',      // Eevee body
    brown: 'rgb(120, 80, 40)',     // Dark brown
    white: 'rgb(255, 255, 255)',   // White
    black: 'rgb(0, 0, 0)',         // Black
    pink: 'rgb(255, 100, 150)',    // Pink
    
    // Vaporeon
    blue: 'rgb(100, 180, 220)',    // Blue body
    lightblue: 'rgb(150, 200, 240)',
    
    // Jolteon
    yellow: 'rgb(255, 220, 80)',   // Yellow body
    
    // Flareon
    red: 'rgb(240, 120, 80)',      // Red/orange body
    orange: 'rgb(255, 160, 100)',
    
    // Espeon
    purple: 'rgb(200, 150, 255)',  // Purple body
    violet: 'rgb(180, 100, 220)',
    
    // Umbreon
    darkblue: 'rgb(40, 40, 80)',   // Dark blue/black
    gold: 'rgb(255, 200, 80)',     // Gold rings
    
    // Leafeon
    green: 'rgb(100, 180, 80)',    // Green body
    lightgreen: 'rgb(150, 220, 120)',
    
    // Glaceon
    cyan: 'rgb(150, 220, 255)',    // Cyan body
    lightcyan: 'rgb(200, 240, 255)',
    
    // Sylveon
    lightpink: 'rgb(255, 200, 220)',
    magenta: 'rgb(220, 100, 180)'
};

// Eeveelution patterns (16x16 for better detail)
const eeveelutionPatterns = {
    'Eevee': {
        width: 16,
        height: 16,
        data: [
            '................',
            '.......tt.......',
            '....tttttttttt..',
            '..ttttttttttttt.',
            '.tttbbbbbbbttttt',
            '.ttbwwbwwbwbttt.',
            '.ttbwwbwwbwbttt.',
            '.ttbbbbbbbbbttt.',
            '.ttttpppptttttt.',
            '.tttpppppppttt..',
            '..ttpppppptt....',
            '...tttttttt.....',
            '...tt....tt.....',
            '..tt......tt....',
            '.tt........tt...',
            'tt..........tt..'
        ],
        colorMap: {
            't': colors.tan,
            'b': colors.brown,
            'w': colors.white,
            'p': colors.pink,
            '.': 'transparent'
        }
    },
    'Vaporeon': {
        width: 16,
        height: 16,
        data: [
            '................',
            '......uu........',
            '....uuuuuuuu....',
            '..uuuuuuuuuuuu..',
            '.uubbbbbbbuuuuu.',
            '.uubwwbwwbwbuuu.',
            '.uubwwbwwbwbuuu.',
            '.uubbbbbbbbbuuu.',
            '.uuuutttuuuuuuu.',
            '.uuutttttuuuu...',
            '..uutttttuuu....',
            '...uuuuuuu......',
            '....uu..uu......',
            '...uu....uu.....',
            '..uu......uu....',
            '.uu........uu...'
        ],
        colorMap: {
            'u': colors.blue,
            'b': colors.darkblue,
            'w': colors.white,
            't': colors.lightblue,
            '.': 'transparent'
        }
    },
    'Jolteon': {
        width: 16,
        height: 16,
        data: [
            '....yy..yy......',
            '...yyyy..yyyy....',
            '..yyyyyy..yyyy...',
            '.yyyy..yy...yy...',
            'yyybbbbbbbyyyyy.',
            'yybwwbwwbwbyyyy.',
            'yybwwbwwbwbyyyy.',
            'yybbbbbbbbbyyy..',
            'yyyppppppyyyyy..',
            'yyyypppppyyyy...',
            '..yyyppppyy.....',
            '...yyyyyyy......',
            '....yy..yy......',
            '...yy....yy.....',
            '..yy......yy....',
            '.yy........yy...'
        ],
        colorMap: {
            'y': colors.yellow,
            'b': colors.brown,
            'w': colors.white,
            'p': colors.pink,
            '.': 'transparent'
        }
    },
    'Flareon': {
        width: 16,
        height: 16,
        data: [
            '................',
            '.......rr.......',
            '....rrrrrrrrr...',
            '..rrrrrrrrrrrrr.',
            '.rrrbbbbbbbrrrr.',
            '.rrbwwbwwbwbrr..',
            '.rrbwwbwwbwbrr..',
            '.rrbbbbbbbbrr...',
            '.rrrroooorrrrr..',
            '.rrrrooooorooo..',
            '..rrooooooro....',
            '...rrrrrrr......',
            '....rr..rr......',
            '...rr....rr.....',
            '..rr......rr....',
            '.rr........rr...'
        ],
        colorMap: {
            'r': colors.red,
            'b': colors.brown,
            'w': colors.white,
            'o': colors.orange,
            '.': 'transparent'
        }
    },
    'Espeon': {
        width: 16,
        height: 16,
        data: [
            '....pp..pp......',
            '...pppp..pppp...',
            '..pppppp..pppp..',
            '.pppp..pp...pp..',
            'pppbbbbbbpppppp.',
            'ppbwwbwwbwbpppp.',
            'ppbwwbwwbwbpppp.',
            'ppbbbbbbbbbppp..',
            'pppvvvvvvpppppp.',
            'ppppvvvvvppppp..',
            '..ppvvvvvpp.....',
            '...pppppp.......',
            '....pp..pp......',
            '...pp....pp.....',
            '..pp......pp....',
            '.pp........pp...'
        ],
        colorMap: {
            'p': colors.purple,
            'b': colors.brown,
            'w': colors.white,
            'v': colors.violet,
            '.': 'transparent'
        }
    },
    'Umbreon': {
        width: 16,
        height: 16,
        data: [
            '................',
            '.......dd.......',
            '....dddddddddd..',
            '..dddddddddddddd',
            '.dddbbbbbbddddd.',
            '.ddbwwbwwbwbddd.',
            '.ddbwwbwwbwbddd.',
            '.ddbbbbbbbbbddd.',
            '.dddggggggddddd.',
            '.dddggggggdddd..',
            '..dggggggddd....',
            '...dddddddd.....',
            '....gg..gg......',
            '...gg....gg.....',
            '..gg......gg....',
            '.gg........gg...'
        ],
        colorMap: {
            'd': colors.darkblue,
            'b': colors.brown,
            'w': colors.white,
            'g': colors.gold,
            '.': 'transparent'
        }
    },
    'Leafeon': {
        width: 16,
        height: 16,
        data: [
            '....ll..ll......',
            '...llll..llll...',
            '..llllll..llll..',
            '.llll..ll...ll..',
            'lllbbbbbbllllll.',
            'llbwwbwwbwbllll.',
            'llbwwbwwbwbllll.',
            'llbbbbbbbbblll..',
            'llllggggggllll..',
            'lllggggggglll...',
            '..llggggglll....',
            '...lllllll......',
            '....ll..ll......',
            '...ll....ll.....',
            '..ll......ll....',
            '.ll........ll...'
        ],
        colorMap: {
            'l': colors.green,
            'b': colors.brown,
            'w': colors.white,
            'g': colors.lightgreen,
            '.': 'transparent'
        }
    },
    'Glaceon': {
        width: 16,
        height: 16,
        data: [
            '................',
            '.......cc.......',
            '....cccccccccc..',
            '..cccccccccccccc',
            '.cccbbbbbbcccccc',
            '.ccbwwbwwbwbccc.',
            '.ccbwwbwwbwbccc.',
            '.ccbbbbbbbbcccc.',
            '.cccttttttccccc.',
            '.ccctttttcccc...',
            '..cctttttcc.....',
            '...cccccccc.....',
            '....cc..cc......',
            '...cc....cc.....',
            '..cc......cc....',
            '.cc........cc...'
        ],
        colorMap: {
            'c': colors.cyan,
            'b': colors.darkblue,
            'w': colors.white,
            't': colors.lightcyan,
            '.': 'transparent'
        }
    },
    'Sylveon': {
        width: 16,
        height: 16,
        data: [
            '................',
            '.......ff.......',
            '....ffffffff....',
            '..ffffffffff....',
            '.fffbbbbbbffff..',
            '.ffbwwbwwbwbff..',
            '.ffbwwbwwbwbff..',
            '.ffbbbbbbbbff...',
            '.fffmmmmmmffff..',
            '.fffmmmmmfffff..',
            '..ffmmmmfffm....',
            '...ffffffff.....',
            '.mm........mm...',
            'mm..........mm..',
            'mm..........mm..',
            '.mm........mm...'
        ],
        colorMap: {
            'f': colors.lightpink,
            'b': colors.brown,
            'w': colors.white,
            'm': colors.magenta,
            '.': 'transparent'
        }
    }
};

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

// Initialize application
window.addEventListener('load', () => {
    loadUserData();
    updateLoginUI();
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

document.getElementById('loginBtn').addEventListener('click', () => {
    const username = document.getElementById('usernameInput').value.trim();
    if (username) {
        state.currentUser = username;
        localStorage.setItem('pixelart_currentUser', username);
        state.savedArtworks = JSON.parse(localStorage.getItem(`pixelart_artworks_${username}`) || '{}');
        state.pixelData = JSON.parse(localStorage.getItem(`pixelart_current_${username}`) || '[]');
        updateLoginUI();
        document.getElementById('usernameInput').value = '';
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    saveCurrentArtwork();
    state.currentUser = null;
    localStorage.removeItem('pixelart_currentUser');
    state.pixelData = [];
    state.history = [];
    updateLoginUI();
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
        
        pixel.addEventListener('click', () => paintPixel(i, pixel));
        pixel.addEventListener('mouseenter', (e) => {
            if (e.buttons === 1) paintPixel(i, pixel);
        });
        
        canvas.appendChild(pixel);
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

document.getElementById('redSlider').addEventListener('input', updateColorPreview);
document.getElementById('greenSlider').addEventListener('input', updateColorPreview);
document.getElementById('blueSlider').addEventListener('input', updateColorPreview);

// ===== GRID SIZE CHANGE =====
document.getElementById('gridSizeSelect').addEventListener('change', (e) => {
    state.gridSize = parseInt(e.target.value);
    state.pixelData = [];
    state.history = [];
    createPixelCanvas();
});

// ===== TOOLS =====
document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to clear the canvas?')) {
        state.history.push({...state.pixelData});
        state.pixelData = [];
        createPixelCanvas();
    }
});

document.getElementById('undoBtn').addEventListener('click', () => {
    if (state.history.length > 0) {
        state.pixelData = state.history.pop();
        createPixelCanvas();
    }
});

// ===== EEVEELUTION GALLERY =====
document.getElementById('eeveelutionBtn').addEventListener('click', () => {
    document.getElementById('eeveelutionGallery').classList.add('active');
    renderEeveelutionGallery();
});

document.getElementById('closeGalleryBtn').addEventListener('click', () => {
    document.getElementById('eeveelutionGallery').classList.remove('active');
});

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
    const pattern = eeveelutionPatterns[eevee.name];
    
    if (pattern) {
        // Set grid size to 16x16 for Eeveelution patterns
        state.gridSize = pattern.width;
        state.pixelData = [];
        
        // Load pattern data
        for (let row = 0; row < pattern.height; row++) {
            for (let col = 0; col < pattern.width; col++) {
                const char = pattern.data[row].charAt(col);
                const color = pattern.colorMap[char];
                state.pixelData[row * pattern.width + col] = color || 'white';
            }
        }
        
        document.getElementById('gridSizeSelect').value = state.gridSize;
    }
    
    createPixelCanvas();
}

// ===== SAVE/LOAD =====
document.getElementById('saveBtn').addEventListener('click', () => {
    document.getElementById('saveDialog').classList.add('active');
});

document.getElementById('closeSaveDialogBtn').addEventListener('click', () => {
    document.getElementById('saveDialog').classList.remove('active');
});

document.getElementById('cancelSaveBtn').addEventListener('click', () => {
    document.getElementById('saveDialog').classList.remove('active');
});

document.getElementById('confirmSaveBtn').addEventListener('click', () => {
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
    localStorage.setItem(`pixelart_current_${state.currentUser}`, JSON.stringify(state.pixelData));
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
