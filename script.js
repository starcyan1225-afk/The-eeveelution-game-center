/* ===== JAVASCRIPT FILE - Add interactive features to your website ===== */

// ===== WELCOME MESSAGE FUNCTION - Show a fun message when the page loads =====
function showWelcome() {
    console.log("🌟 Welcome to Shelley's Personal Website! 🌟");
    console.log("Thanks for visiting!");
}

// Call the welcome message when the page loads
showWelcome();

// ===== SMOOTH SCROLLING - Makes navigation smooth when clicking links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ===== FALLING CHERRY BLOSSOM PETALS - Rain from the sky =====
class FallingPetal {
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = 0; // Start at the very top of screen
        this.element = document.createElement('div');
        this.element.className = 'falling-petal';
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        // Random rotation and size
        this.rotation = Math.random() * 360;
        this.size = 0.7 + Math.random() * 0.6;
        this.element.style.transform = `scale(${this.size})`;
        
        document.body.appendChild(this.element);
        
        this.life = 1;
        this.vx = (Math.random() - 0.5) * 1.5; // Slow horizontal drift
        this.vy = 0.5 + Math.random() * 1; // Slow fall speed
        this.animate();
    }
    
    animate() {
        this.life -= 0.0005;
        this.element.style.opacity = this.life;
        
        // Move the petal
        this.x += this.vx;
        this.y += this.vy;
        
        // Gentle rotation
        this.rotation += 2;
        
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        this.element.style.transform = `scale(${this.size}) rotate(${this.rotation}deg)`;
        
        if (this.life > 0 && this.y < window.innerHeight) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.element.remove();
        }
    }
}

// Create falling petals more frequently (one every 0.6-1 second)
function startFallingPetals() {
    setInterval(() => {
        new FallingPetal();
    }, 600 + Math.random() * 400);
}

// Start the falling petals when page loads
window.addEventListener('load', startFallingPetals);
if (document.readyState === 'complete') startFallingPetals();

// ===== CHERRY BLOSSOM PETAL TRAIL - Follows your cursor and fades away =====
class CursorBlossomPetal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.element = document.createElement('div');
        this.element.className = 'cursor-blossom-petal';
        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
        
        // Random rotation for variety
        this.rotation = Math.random() * 360;
        this.element.style.transform = `translate(-50%, -50%) rotate(${this.rotation}deg)`;
        
        document.body.appendChild(this.element);
        
        this.life = 1; // 1 = fully visible, 0 = invisible
        this.vx = (Math.random() - 0.5) * 2; // Random horizontal drift
        this.vy = Math.random() * 2; // Downward movement
        this.animate();
    }
    
    animate() {
        this.life -= 0.015;
        this.element.style.opacity = this.life;
        
        // Move the petal
        this.x += this.vx;
        this.y += this.vy;
        
        // Rotate as it falls
        this.rotation += 5;
        this.element.style.transform = `translate(calc(-50% + ${this.x - this.x}px), calc(-50% + ${this.y - this.y}px)) rotate(${this.rotation}deg)`;
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        if (this.life > 0) {
            requestAnimationFrame(() => this.animate());
        } else {
            this.element.remove();
        }
    }
}

// Track cursor position and create petal blossoms
let lastTime = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    // Create a new petal every 30 milliseconds for a nice trail
    if (now - lastTime > 30) {
        new CursorBlossomPetal(e.clientX, e.clientY);
        lastTime = now;
    }
});

// ===== HOVER EFFECTS - Add extra fun when hovering over cards =====
const interestCards = document.querySelectorAll('.interest-card');
interestCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 10px 30px rgba(255, 179, 217, 0.4)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.boxShadow = '0 5px 15px rgba(255, 179, 217, 0.15)';
    });
});

const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 10px 30px rgba(197, 185, 232, 0.4)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.boxShadow = '0 5px 15px rgba(197, 185, 232, 0.2)';
    });
});

// ===== ANIMATION ON SCROLL - Make elements appear as you scroll down =====
function animateOnScroll() {
    const elements = document.querySelectorAll('section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Run animation when the page loads
animateOnScroll();

// ===== BUTTON CLICK FEEDBACK - Make buttons feel interactive =====
const contactButtons = document.querySelectorAll('.contact-btn');
contactButtons.forEach(button => {
    button.addEventListener('click', function(e) {
        // Only prevent default for demo buttons (those with href="#")
        if (this.getAttribute('href') === '#') {
            e.preventDefault();
            alert('🎮 Coming soon! Keep checking back!');
        }
        // Real email and links work normally
    });
});

// ===== CONSOLE EASTER EGG - Fun message in developer console =====
console.log('%c🌟 Welcome to my website! 🌟', 'font-size: 20px; color: #c084d0; font-weight: bold;');
console.log('%cI love Pokemon and coding! 🐾💻', 'font-size: 16px; color: #ffb3d9;');
console.log('%cMove your cursor to see cherry blossom petals! 🌸', 'font-size: 14px; color: #c084d0;');
console.log('%cWatch as petals fall from the sky! 🌸✨', 'font-size: 14px; color: #c084d0;');