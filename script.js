/**
 * Main Application Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    // YouTube API Configuration
    const YOUTUBE_API_KEY = 'AIzaSyDSpn25E7vnaiqdONYgZMYf9jg2GJ1ECRc';
    const CHANNEL_ID = 'UCIO4JfMJH2n0q4JuZDWudHA';

    // Initialize all components
    initHeaderEffects();
    initNavigation();
    initYouTubeStats(YOUTUBE_API_KEY, CHANNEL_ID);
    initYouTubeVideos(YOUTUBE_API_KEY, CHANNEL_ID);
    initAvatarEffects();
    initContactForm();
    initMoleculeBackground();
    initTypewriter();
});

/**
 * Header Effects
 */
function initHeaderEffects() {
    const header = document.querySelector('header');
    
    // Add scroll effect to header
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
}

/**
 * Navigation System
 */
function initNavigation() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', handleNavClick);
    });
    
    // Set active nav link based on scroll position
    window.addEventListener('scroll', setActiveNavLink);
}

function handleNavClick(e) {
    e.preventDefault();
    
    // Update active state
    document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
    
    // Scroll to target section
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);
    
    if (targetElement) {
        window.scrollTo({
            top: targetElement.offsetTop - 80,
            behavior: 'smooth'
        });
        
        // Load content for specific sections
        if (targetId === '#videos') {
            loadYouTubeVideos();
        }
    }
}

function setActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            document.querySelectorAll('nav a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

/**
 * YouTube Statistics
 */
function initYouTubeStats(apiKey, channelId) {
    fetchYouTubeStats(apiKey, channelId);
}

async function fetchYouTubeStats(apiKey, channelId) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelId}&key=${apiKey}`
        );
        const data = await response.json();
        
        if (data.items?.length > 0) {
            const stats = data.items[0].statistics;
            animateCounter('subscriberCount', 0, parseInt(stats.subscriberCount), 2000);
            animateCounter('videoCount', 0, parseInt(stats.videoCount), 1500);
            animateCounter('viewCount', 0, parseInt(stats.viewCount), 2500);
        } else {
            setFallbackStats();
        }
    } catch (error) {
        console.error('Error fetching YouTube stats:', error);
        setFallbackStats();
    }
}

function setFallbackStats() {
    animateCounter('subscriberCount', 0, 1000, 2000);
    animateCounter('videoCount', 0, 50, 1500);
    animateCounter('viewCount', 0, 50000, 2500);
}

function animateCounter(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    let startTimestamp = null;
    
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        element.textContent = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) window.requestAnimationFrame(step);
    };
    
    window.requestAnimationFrame(step);
}

/**
 * YouTube Videos
 */
function initYouTubeVideos(apiKey, channelId) {
    loadYouTubeVideos(apiKey, channelId);
}

async function loadYouTubeVideos(apiKey, channelId) {
    const container = document.getElementById('youtube-videos-container');
    container.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading videos...</div>';
    
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12`
        );
        const data = await response.json();
        
        if (data.items?.length > 0) {
            renderYouTubeVideos(data.items, container);
        } else {
            showNoVideosMessage(container);
        }
    } catch (error) {
        console.error('Error loading YouTube videos:', error);
        showLoadError(container);
    }
}

function renderYouTubeVideos(videos, container) {
    let videosHTML = '';
    
    videos.forEach(item => {
        if (item.id.kind === "youtube#video") {
            videosHTML += createVideoCard(item);
        }
    });
    
    container.innerHTML = videosHTML;
    setupVideoThumbnailClickHandlers();
}

function createVideoCard(video) {
    return `
        <div class="work-card">
            <div class="work-thumbnail">
                <img src="${video.snippet.thumbnails.medium.url}" 
                     alt="${video.snippet.title}"
                     class="video-thumbnail"
                     data-video-id="${video.id.videoId}">
                <div class="play-button"><i class="fas fa-play"></i></div>
            </div>
            <div class="work-info">
                <h3>${video.snippet.title}</h3>
                <div class="work-meta">
                    <span><i class="fas fa-calendar-alt"></i> ${new Date(video.snippet.publishedAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    `;
}

function setupVideoThumbnailClickHandlers() {
    document.querySelectorAll('.video-thumbnail').forEach(thumb => {
        thumb.addEventListener('click', function() {
            const videoId = this.getAttribute('data-video-id');
            this.parentElement.innerHTML = `
                <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
        });
    });
}

function showNoVideosMessage(container) {
    container.innerHTML = '<div class="error"><i class="fas fa-exclamation-circle"></i> No videos found</div>';
}

function showLoadError(container) {
    container.innerHTML = '<div class="error"><i class="fas fa-exclamation-circle"></i> Failed to load videos. Please try again later.</div>';
}

/**
 * Avatar Effects
 */
function initAvatarEffects() {
    const avatar = document.querySelector('.hero-avatar');
    if (!avatar) return;
    
    avatar.addEventListener('mousemove', handleAvatarMouseMove);
    avatar.addEventListener('mouseleave', resetAvatarPosition);
}

function handleAvatarMouseMove(e) {
    const avatar = e.currentTarget;
    const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
    const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
    avatar.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
    
    // Glow effect
    const glow = avatar.querySelector('.avatar-glow');
    const rect = avatar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glow.style.background = `radial-gradient(circle at ${x}px ${y}px, var(--primary-light), transparent 70%)`;
}

function resetAvatarPosition(e) {
    const avatar = e.currentTarget;
    avatar.style.transform = 'rotateY(0) rotateX(0)';
    const glow = avatar.querySelector('.avatar-glow');
    glow.style.background = 'radial-gradient(circle at center, var(--primary-light), transparent 70%)';
}

/**
 * Contact Form
 */
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const submitText = document.getElementById('submitText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const formMessage = document.getElementById('formMessage');
    
    // Show loading state
    submitText.textContent = 'Sending...';
    loadingSpinner.style.display = 'inline-block';
    submitBtn.disabled = true;
    formMessage.style.display = 'none';
    
    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
            showFormSuccess(formMessage);
            form.reset();
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        console.error('Error:', error);
        showFormError(formMessage);
    } finally {
        resetFormButton(submitText, loadingSpinner, submitBtn);
    }
}

function showFormSuccess(formMessage) {
    formMessage.textContent = 'Message sent successfully! I will get back to you soon.';
    formMessage.className = 'form-message success';
    formMessage.style.display = 'block';
}

function showFormError(formMessage) {
    formMessage.textContent = 'Failed to send message. Please try again later or contact me directly at rrysvsj@gmail.com';
    formMessage.className = 'form-message error';
    formMessage.style.display = 'block';
}

function resetFormButton(submitText, loadingSpinner, submitBtn) {
    submitText.textContent = 'Send Message';
    loadingSpinner.style.display = 'none';
    submitBtn.disabled = false;
}

/**
 * Molecule Background
 */
function initMoleculeBackground() {
    const canvas = document.getElementById('molecules');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Configuration
    const config = {
        particleCount: 50,
        particleMaxSize: 3,
        lineMaxDistance: 150,
        particleSpeed: 0.5,
        hue: 260, // Purple hue to match your theme
        repulsionDistance: 100
    };
    
    // Initialize particles
    const particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height, config));
    }
    
    // Mouse position tracking
    const mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });
    
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });
    
    // Handle resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    // Start animation
    animateParticles();
    
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        const avatar = document.querySelector('.hero-avatar');
        particles.forEach(particle => {
            particle.update(mouse, avatar);
            particle.draw(ctx);
        });
        
        // Draw connections between particles
        drawParticleConnections(particles, ctx, config);
        
        requestAnimationFrame(animateParticles);
    }
}

class Particle {
    constructor(canvasWidth, canvasHeight, config) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * config.particleMaxSize + 1;
        this.speedX = (Math.random() - 0.5) * config.particleSpeed;
        this.speedY = (Math.random() - 0.5) * config.particleSpeed;
        this.hue = config.hue;
    }
    
    update(mouse, avatar) {
        // Avatar interaction
        if (avatar) {
            const avatarRect = avatar.getBoundingClientRect();
            const avatarCenter = {
                x: avatarRect.left + avatarRect.width/2,
                y: avatarRect.top + avatarRect.height/2
            };
            const dxAvatar = this.x - avatarCenter.x;
            const dyAvatar = this.y - avatarCenter.y;
            const distanceAvatar = Math.sqrt(dxAvatar * dxAvatar + dyAvatar * dyAvatar);
            
            if (distanceAvatar < 200) {
                const force = (200 - distanceAvatar) / 200;
                this.x += dxAvatar * 0.01 * force;
                this.y += dyAvatar * 0.01 * force;
            }
        }
        
        // Mouse interaction
        if (mouse.x && mouse.y) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < config.repulsionDistance) {
                const angle = Math.atan2(dy, dx);
                const force = (config.repulsionDistance - distance) / config.repulsionDistance;
                this.x -= Math.cos(angle) * force * 5;
                this.y -= Math.sin(angle) * force * 5;
                return; // Skip normal movement when repulsed
            }
        }
        
        // Boundary check
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        
        // Normal movement
        this.x += this.speedX;
        this.y += this.speedY;
    }
    
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 80%, 60%, 0.8)`;
        ctx.fill();
    }
}

function drawParticleConnections(particles, ctx, config) {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < config.lineMaxDistance) {
                const opacity = 1 - (distance / config.lineMaxDistance);
                ctx.beginPath();
                ctx.strokeStyle = `hsla(${config.hue}, 80%, 60%, ${opacity * 0.3})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    }
}

/**
 * Typewriter Effect
 */
function initTypewriter() {
    const heroTitle = document.querySelector('.hero-text h1');
    if (!heroTitle) return;
    
    const originalText = heroTitle.textContent;
    heroTitle.textContent = '';
    
    let i = 0;
    const typing = setInterval(() => {
        if (i < originalText.length) {
            heroTitle.textContent += originalText.charAt(i);
            i++;
        } else {
            clearInterval(typing);
        }
    }, 100);
}