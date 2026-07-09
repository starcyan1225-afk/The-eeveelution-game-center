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

// ===== HOVER EFFECTS - Add extra fun when hovering over cards =====
const interestCards = document.querySelectorAll('.interest-card');
interestCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 10px 30px rgba(118, 75, 162, 0.4)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
    });
});

const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
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

// ===== DARK MODE TOGGLE (Optional - for future enhancement) =====
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

// ===== CONSOLE EASTER EGG - Fun message in developer console =====
console.log('%c🌟 Welcome to my website! 🌟', 'font-size: 20px; color: #764ba2; font-weight: bold;');
console.log('%cI love Pokemon and coding! 🐾💻', 'font-size: 16px; color: #667eea;');
console.log('%cFeel free to explore and have fun!', 'font-size: 14px; color: #764ba2;');