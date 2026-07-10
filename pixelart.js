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
        loginBtn.addEventListener('click', function() {
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

    // LOGOUT BUTTON
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            saveCurrentArtwork();
            state.currentUser = null;
            localStorage.removeItem('pixelart_currentUser');
            state.pixelData = [];
            state.history = [];
            updateLoginUI();
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

// ===== EEVEELUTION GALLERY =====
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

const eeveelutionColors = {
    'Eevee': 'rgb(200, 150, 100)',
    'Vaporeon': 'rgb(100, 150, 220)',
    'Jolteon': 'rgb(255, 220, 100)',
    'Flareon': 'rgb(255, 150, 100)',
    'Espeon': 'rgb(200, 150, 255)',
    'Umbreon': 'rgb(50, 50, 100)',
    'Leafeon': 'rgb(100, 200, 100)',
    'Glaceon': 'rgb(150, 200, 255)',
    'Sylveon': 'rgb(255, 150, 200)'
};

function renderEeveelutionGallery() {
    const grid = document.getElementById('eeveelutionGrid');
    grid.innerHTML = '';
    
    eeveelutions.forEach(function(eevee) {
        const item = document.createElement('div');
        item.className = 'eeveelution-item';
        item.innerHTML = '<div class="eeveelution-preview">' + eevee.emoji + '</div><div class="eeveelution-name">' + eevee.name + '</div>';
        item.addEventListener('click', function() {
            copyEeveelution(eevee);
            document.getElementById('eeveelutionGallery').classList.remove('active');
        });
        grid.appendChild(item);
    });
}

function copyEeveelution(eevee) {
    state.history.push({...state.pixelData});
    const color = eeveelutionColors[eevee.name];
    state.pixelData = [];
    
    for (let i = 0; i < state.gridSize * state.gridSize; i++) {
        state.pixelData[i] = color;
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
    
    Object.entries(state.savedArtworks).forEach(function(entry) {
        const id = entry[0];
        const artwork = entry[1];
        const item = document.createElement('div');
        item.className = 'saved-artwork-item';
        item.innerHTML = '<div class="artwork-name">' + artwork.name + '</div><div class="artwork-date">' + artwork.date + '</div>';
        item.addEventListener('click', function() {
            loadArtwork(id, artwork);
        });
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
        localStorage.setItem('pixelart_current_' + state.currentUser, JSON.stringify(state.pixelData));
    }
}

window.addEventListener('beforeunload', function() {
    if (state.currentUser) {
        saveCurrentArtwork();
    }
});
