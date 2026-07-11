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

// ===== EEVEELUTION PIXEL ART DATA =====
const eeveelutions = [
    { 
        name: 'Eevee', 
        emoji: '🐹',
        colors: {
            brown: 'rgb(180, 140, 90)',
            dark: 'rgb(120, 80, 40)',
            cream: 'rgb(220, 180, 130)',
            white: 'rgb(255, 255, 255)',
            black: 'rgb(0, 0, 0)',
            pink: 'rgb(255, 100, 150)'
        }
    },
    { 
        name: 'Vaporeon', 
        emoji: '💧',
        colors: {
            blue: 'rgb(100, 160, 240)',
            dark: 'rgb(60, 110, 180)',
            light: 'rgb(150, 200, 255)',
            white: 'rgb(255, 255, 255)',
            black: 'rgb(0, 0, 0)',
            cyan: 'rgb(100, 220, 240)'
        }
    },
    { 
        name: 'Jolteon', 
        emoji: '⚡',
        colors: {
            yellow: 'rgb(255, 220, 80)',
            dark: 'rgb(200, 160, 40)',
            light: 'rgb(255, 255, 150)',
            white: 'rgb(255, 255, 255)',
            black: 'rgb(0, 0, 0)',
            gold: 'rgb(255, 200, 0)'
        }
    },
    { 
        name: 'Flareon', 
        emoji: '🔥',
        colors: {
            orange: 'rgb(255, 140, 80)',
            red: 'rgb(200, 80, 20)',
            light: 'rgb(255, 200, 150)',
            white: 'rgb(255, 255, 255)',
            black: 'rgb(0, 0, 0)',
            flame: 'rgb(255, 100, 0)'
        }
    },
    { 
        name: 'Espeon', 
        emoji: '✨',
        colors: {
            purple: 'rgb(200, 140, 240)',
            dark: 'rgb(150, 80, 200)',
            light: 'rgb(230, 190, 255)',
            white: 'rgb(255, 255, 255)',
            black: 'rgb(0, 0, 0)',
            magenta: 'rgb(255, 0, 255)'
        }
    },
    { 
        name: 'Umbreon', 
        emoji: '🌙',
        colors: {
            black: 'rgb(50, 50, 80)',
            dark: 'rgb(20, 20, 40)',
            gray: 'rgb(100, 100, 140)',
            white: 'rgb(255, 255, 255)',
            yellow: 'rgb(255, 200, 0)',
            shine: 'rgb(255, 255, 150)'
        }
    },
    { 
        name: 'Leafeon', 
        emoji: '🍃',
        colors: {
            green: 'rgb(100, 180, 100)',
            dark: 'rgb(50, 140, 50)',
            light: 'rgb(150, 220, 150)',
            white: 'rgb(255, 255, 255)',
            black: 'rgb(0, 0, 0)',
            leaf: 'rgb(80, 160, 80)'
        }
    },
    { 
        name: 'Glaceon', 
        emoji: '❄️',
        colors: {
            cyan: 'rgb(150, 210, 255)',
            blue: 'rgb(100, 160, 220)',
            light: 'rgb(200, 240, 255)',
            white: 'rgb(255, 255, 255)',
            black: 'rgb(0, 0, 0)',
            ice: 'rgb(220, 250, 255)'
        }
    },
    { 
        name: 'Sylveon', 
        emoji: '🎀',
        colors: {
            pink: 'rgb(255, 140, 200)',
            dark: 'rgb(200, 80, 150)',
            light: 'rgb(255, 200, 230)',
            white: 'rgb(255, 255, 255)',
            black: 'rgb(0, 0, 0)',
            ribbon: 'rgb(255, 100, 180)'
        }
    }
];

// Better Pixel art pattern - Realistic Pokemon pixel art!
function getPixelArtPattern(colors) {
    return [
        // Row 0
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        // Row 1: Top ears
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        // Row 2: Ears
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
        // Row 3: Head top
        [null, null, null, null, 'brown', 'brown', 'brown', 'brown', 'brown', 'brown', 'brown', 'brown', null, null, null, null],
        // Row 4: Head
        [null, null, null, 'dark', 'brown', 'brown', 'cream', 'brown', 'brown', 'cream', 'brown', 'brown', 'dark', null, null, null],
        // Row 5: Head/Eyes
        [null, null, 'dark', 'brown', 'cream', 'cream', 'cream', 'brown', 'brown', 'cream', 'cream', 'cream', 'brown', 'dark', null, null],
        // Row 6: Eyes
        [null, 'dark', 'brown', 'cream', 'black', 'white', 'brown', 'brown', 'brown', 'black', 'white', 'cream', 'brown', 'dark', null, null],
        // Row 7: Face
        ['dark', 'brown', 'cream', 'cream', 'cream', 'cream', 'brown', 'brown', 'brown', 'cream', 'cream', 'cream', 'cream', 'brown', 'dark', null],
        // Row 8: Nose area
        ['dark', 'brown', 'cream', 'cream', 'cream', 'brown', 'brown', 'pink', 'brown', 'brown', 'cream', 'cream', 'cream', 'brown', 'dark', null],
        // Row 9: Mouth/Body
        [null, 'dark', 'brown', 'brown', 'brown', 'brown', 'brown', 'brown', 'brown', 'brown', 'brown', 'brown', 'brown', 'dark', null, null],
        // Row 10: Body
        [null, null, 'dark', 'brown', 'brown', 'brown', 'brown', 'brown', 'brown', 'brown', 'brown', 'brown', 'dark', null, null, null],
        // Row 11: Body/Legs
        [null, null, 'dark', 'brown', 'brown', 'dark', null, null, null, 'dark', 'brown', 'brown', 'dark', null, null, null],
        // Row 12: Legs
        [null, 'dark', 'brown', 'dark', null, null, null, null, null, null, null, 'dark', 'brown', 'dark', null, null],
        // Row 13: Legs
        [null, 'dark', 'brown', 'dark', null, null, null, null, null, null, null, 'dark', 'brown', 'dark', null, null],
        // Row 14: Tail
        [null, null, 'dark', 'brown', 'brown', 'brown', 'dark', null, null, null, 'dark', 'brown', 'dark', null, null, null],
        // Row 15: Tail end
        [null, null, null, 'dark', 'brown', 'brown', 'brown', 'dark', null, null, null, null, null, null, null, null]
    ];
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
        
        renderPixelArtPreview(previewCanvas, eevee.colors);
        
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

function renderPixelArtPreview(canvas, colors) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const pattern = getPixelArtPattern(colors);
    const pixelSize = 6; // 6px per pixel in preview
    
    pattern.forEach(function(row, rowIdx) {
        row.forEach(function(colorKey, colIdx) {
            if (colorKey && colors[colorKey]) {
                ctx.fillStyle = colors[colorKey];
                ctx.fillRect(colIdx * pixelSize, rowIdx * pixelSize, pixelSize, pixelSize);
            }
        });
    });
}

function copyEeveelution(eevee) {
    state.history.push({...state.pixelData});
    
    // Get pattern and expand it to fit current grid size
    const pattern = getPixelArtPattern(eevee.colors);
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
        
        // Create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-artwork-btn';
        deleteBtn.textContent = '🗑️';
        deleteBtn.title = 'Delete this artwork';
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent loading artwork when clicking delete
            if (confirm('Are you sure you want to delete "' + artwork.name + '"?')) {
                delete state.savedArtworks[id];
                localStorage.setItem(`pixelart_artworks_${state.currentUser}`, JSON.stringify(state.savedArtworks));
                loadSavedArtworks();
                alert('✨ Artwork deleted!');
            }
        });
        
        item.appendChild(infoDiv);
        item.appendChild(deleteBtn);
        
        // Click to load artwork
        infoDiv.addEventListener('click', function() {
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