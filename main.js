// main.js

// ============================================
// LANGUAGE DETECTION & SWITCHING
// ============================================

let currentLanguage = 'en';

// Detect browser language
function detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0]; // Get 'en' from 'en-US'
    
    // Check if we support this language
    const supportedLanguages = ['en', 'de', 'es', 'fr'];
    return supportedLanguages.includes(langCode) ? langCode : 'en';
}

// Load language from localStorage or detect
function getInitialLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
        return savedLang;
    }
    return detectBrowserLanguage();
}

// Translate page content
function translatePage(lang) {
    currentLanguage = lang;
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Save preference
    localStorage.setItem('preferredLanguage', lang);
    
    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    
    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', lang);
    
    // Trigger custom event for other components
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}


// Smooth scroll animation observer
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
        }
    });
}, observerOptions);

// Observe all elements with data-aos attribute
// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    const initialLang = getInitialLanguage();
    translatePage(initialLang);
    
    // Setup language switcher buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            translatePage(lang);
            
            // Add click animation
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
    });
    
    // Rest of your existing DOMContentLoaded code...
    const elementsToAnimate = document.querySelectorAll('[data-aos]');
    elementsToAnimate.forEach(el => {
        const delay = el.getAttribute('data-aos-delay');
        if (delay) {
            el.style.transitionDelay = `${delay}ms`;
        }
        animateOnScroll.observe(el);
    });
});

// Listen for language changes to update dynamic content
window.addEventListener('languageChanged', (e) => {
    console.log(`Language changed to: ${e.detail.language}`);
    // You can update any dynamic content here
});


// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-content');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        hero.style.opacity = 1 - (scrolled / 600);
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add ripple effect to streaming buttons
document.querySelectorAll('.streaming-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Cursor trail effect
const cursor = {
    x: 0,
    y: 0,
    trails: []
};

for (let i = 0; i < 5; i++) {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.cssText = `
        position: fixed;
        width: 8px;
        height: 8px;
        background: rgba(171, 23, 7, ${0.5 - i * 0.1});
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        transition: transform 0.1s ease-out;
        mix-blend-mode: screen;
    `;
    document.body.appendChild(trail);
    cursor.trails.push(trail);
}

document.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX;
    cursor.y = e.clientY;
});

function animateTrails() {
    let x = cursor.x;
    let y = cursor.y;
    
    cursor.trails.forEach((trail, index) => {
        trail.style.transform = `translate(${x - 4}px, ${y - 4}px) scale(${1 - index * 0.15})`;
        
        const nextTrail = cursor.trails[index + 1];
        if (nextTrail) {
            const rect = trail.getBoundingClientRect();
            x = rect.left + 4;
            y = rect.top + 4;
        }
    });
    
    requestAnimationFrame(animateTrails);
}

animateTrails();

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Randomly place crow images in hero section
const heroSection = document.querySelector('.hero');
if (heroSection) {
    const crowFiles = ['crow1.png', 'crow2.png', 'crow3.png']; // you can add more
    const minScale = 0.05; // minimum scale
    const maxScale = 0.10; // maximum scale

    for (let i = 0; i < 30; i++) {
        const img = document.createElement('img');
        const crow = crowFiles[Math.floor(Math.random() * crowFiles.length)];

        const scale = Math.random() * (maxScale - minScale) + minScale;
        const rotation = Math.random() * 360; // degrees

        img.src = `public/crows/${crow}`;
        img.style.cssText = `
            position: absolute;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            transform: translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg);
            transform-origin: center;
            pointer-events: none;
            user-select: none;
        `;
        heroSection.appendChild(img);
    }
}

// Streaming button hover sound effect (visual only)
document.querySelectorAll('.streaming-btn').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.setProperty('--hover-intensity', '1');
    });
    
    btn.addEventListener('mouseleave', function() {
        this.style.setProperty('--hover-intensity', '0');
    });
});

// Release card play button functionality
document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Pulse animation
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            btn.style.transform = 'scale(1.1)';
        }, 100);
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
        }, 200);
    });
});

// Continuation of main.js

// Scroll progress indicator (continued)
const progressBar = document.createElement('div');
progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--red-accent), var(--red-dark));
    width: 0%;
    z-index: 10000;
    transition: width 0.1s ease;
    box-shadow: 0 0 10px rgba(171, 23, 7, 0.5);
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (window.pageYOffset / windowHeight) * 100;
    progressBar.style.width = scrolled + '%';
});

// Add hover effect for social links
document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('mouseenter', function() {
        const icon = this.querySelector('.social-icon');
        icon.style.filter = 'brightness(1.2) drop-shadow(0 0 20px rgba(171, 23, 7, 0.6))';
    });
    
    link.addEventListener('mouseleave', function() {
        const icon = this.querySelector('.social-icon');
        icon.style.filter = 'none';
    });
});

// Animate release cards on scroll with stagger effect
const releaseCards = document.querySelectorAll('.release-card');
const releaseObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0) scale(1)';
            }, index * 150);
        }
    });
}, { threshold: 0.2 });

releaseCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px) scale(0.95)';
    card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    releaseObserver.observe(card);
});

// Interactive glow effect following cursor on cards
document.querySelectorAll('.streaming-btn, .release-card, .social-link').forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.style.setProperty('--mouse-x', `${x}px`);
        this.style.setProperty('--mouse-y', `${y}px`);
        
        // Create glow effect
        if (!this.querySelector('.card-glow')) {
            const glow = document.createElement('div');
            glow.className = 'card-glow';
            glow.style.cssText = `
                position: absolute;
                width: 200px;
                height: 200px;
                background: radial-gradient(circle, rgba(171, 23, 7, 0.3) 0%, transparent 70%);
                border-radius: 50%;
                pointer-events: none;
                transform: translate(-50%, -50%);
                transition: opacity 0.3s ease;
            `;
            this.appendChild(glow);
        }
        
        const glow = this.querySelector('.card-glow');
        if (glow) {
            glow.style.left = `${x}px`;
            glow.style.top = `${y}px`;
            glow.style.opacity = '1';
        }
    });
    
    card.addEventListener('mouseleave', function() {
        const glow = this.querySelector('.card-glow');
        if (glow) {
            glow.style.opacity = '0';
        }
    });
});

// Typing animation for tagline
const tagline = document.querySelector('.tagline');
if (tagline) {
    const text = tagline.textContent;
    tagline.textContent = '';
    tagline.style.opacity = '1';
    
    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            tagline.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        }
    };
    
    setTimeout(typeWriter, 1000);
}

// Add pulse animation to logo on scroll
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    const logo = document.querySelector('.logo-image');
    
    if (logo && currentScroll > lastScroll && currentScroll < 500) {
        logo.style.transform = 'scale(1.05) rotate(2deg)';
    } else if (logo) {
        logo.style.transform = 'scale(1) rotate(0deg)';
    }
    
    lastScroll = currentScroll;
});

// Easter egg: Konami code
let konamiCode = [];
const konamiSequence = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];

document.addEventListener('keydown', (e) => {
    konamiCode.push(e.keyCode);
    konamiCode.splice(-konamiSequence.length - 1, konamiCode.length - konamiSequence.length);
    
    if (konamiCode.join('').includes(konamiSequence.join(''))) {
        activateEasterEgg();
    }
});

function activateEasterEgg() {
    document.body.style.animation = 'rainbow 2s linear infinite';
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        document.body.style.animation = '';
        style.remove();
    }, 5000);
}

// Preload images for smooth experience
const imagesToPreload = [
    'public/blue.png',
    'public/yellow.png',
    'public/red.png',
    'public/grey.png'
];

imagesToPreload.forEach(src => {
    const img = new Image();
    img.src = src;
});

// Performance optimization: Lazy load iframes
const iframeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const iframe = entry.target;
            if (iframe.dataset.src) {
                iframe.src = iframe.dataset.src;
                iframe.removeAttribute('data-src');
            }
            iframeObserver.unobserve(iframe);
        }
    });
}, { rootMargin: '200px' });

document.querySelectorAll('iframe[data-src]').forEach(iframe => {
    iframeObserver.observe(iframe);
});

// Add touch support for mobile
let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    const diff = touchStartY - touchY;
    
    if (Math.abs(diff) > 5) {
        document.body.classList.add('scrolling');
    }
});

document.addEventListener('touchend', () => {
    setTimeout(() => {
        document.body.classList.remove('scrolling');
    }, 100);
});

// Add reduced motion support for accessibility
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    document.querySelectorAll('*').forEach(el => {
        el.style.animation = 'none';
        el.style.transition = 'none';
    });
}

// Console easter egg
console.log('%c🎵 Welcome to the Artist Page! 🎵', 'font-size: 20px; color: #ab1707; font-weight: bold;');
console.log('%cLike what you see? Follow us on social media!', 'font-size: 14px; color: #fffefa;');