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
        // First fetch the videos
        const searchResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12`
        );
        const searchData = await searchResponse.json();
        
        if (searchData.items?.length > 0) {
            // Get video IDs for statistics
            const videoIds = searchData.items
                .filter(item => item.id.kind === "youtube#video")
                .map(item => item.id.videoId)
                .join(',');
            
            // Fetch statistics for these videos
            const statsResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=statistics`
            );
            const statsData = await statsResponse.json();
            
            // Combine video data with statistics
            const videosWithStats = searchData.items.map(item => {
                if (item.id.kind === "youtube#video") {
                    const stats = statsData.items.find(v => v.id === item.id.videoId)?.statistics || {};
                    return {
                        ...item,
                        statistics: stats
                    };
                }
                return item;
            });
            
            renderYouTubeVideos(videosWithStats, container);
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
    const viewCount = video.statistics?.viewCount ? formatNumber(video.statistics.viewCount) : 'N/A';
    const likeCount = video.statistics?.likeCount ? formatNumber(video.statistics.likeCount) : 'N/A';
    
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
                    <span><i class="fas fa-eye"></i> ${viewCount}</span>
                    <span><i class="fas fa-thumbs-up"></i> ${likeCount}</span>
                </div>
            </div>
        </div>
    `;
}

// Helper function to format numbers
function formatNumber(num) {
    return parseInt(num).toLocaleString();
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
 * Molecule Background - Enhanced Version
 */
function initMoleculeBackground() {
    const canvas = document.getElementById('molecules');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    
    // Configuration
    const config = {
        particleCount: 80,
        particleMaxSize: 4,
        lineMaxDistance: 150,
        particleSpeed: 0.7,
        hue: 260, // Purple hue to match your theme
        repulsionDistance: 120,
        attractionDistance: 200,
        avatarInteraction: true
    };
    
    // Particle class
    class Particle {
        constructor() {
            this.reset(canvas.width, canvas.height);
            this.baseX = this.x;
            this.baseY = this.y;
            this.size = Math.random() * config.particleMaxSize + 1;
            this.density = (Math.random() * 30) + 1;
            this.hueVariation = Math.random() * 30 - 15;
        }
        
        reset(width, height) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.speedX = (Math.random() - 0.5) * config.particleSpeed;
            this.speedY = (Math.random() - 0.5) * config.particleSpeed;
        }
        
        update(mouse, avatar) {
            // Boundary check with bounce
            if (this.x < 0 || this.x > canvas.width) {
                this.speedX *= -0.8;
                this.x = this.x < 0 ? 0 : canvas.width;
            }
            if (this.y < 0 || this.y > canvas.height) {
                this.speedY *= -0.8;
                this.y = this.y < 0 ? 0 : canvas.height;
            }
            
            // Mouse interaction - repulsion
            if (mouse.x && mouse.y) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.repulsionDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (config.repulsionDistance - distance) / config.repulsionDistance;
                    
                    this.x -= forceDirectionX * force * this.density * 0.5;
                    this.y -= forceDirectionY * force * this.density * 0.5;
                }
            }
            
            // Avatar interaction - attraction
            if (config.avatarInteraction && avatar) {
                const avatarRect = avatar.getBoundingClientRect();
                const avatarCenter = {
                    x: avatarRect.left + avatarRect.width/2,
                    y: avatarRect.top + avatarRect.height/2
                };
                const dxAvatar = this.x - avatarCenter.x;
                const dyAvatar = this.y - avatarCenter.y;
                const distanceAvatar = Math.sqrt(dxAvatar * dxAvatar + dyAvatar * dyAvatar);
                
                if (distanceAvatar < config.attractionDistance) {
                    const forceDirectionX = dxAvatar / distanceAvatar;
                    const forceDirectionY = dyAvatar / distanceAvatar;
                    const force = (config.attractionDistance - distanceAvatar) / config.attractionDistance;
                    
                    this.x -= forceDirectionX * force * 0.3;
                    this.y -= forceDirectionY * force * 0.3;
                }
            }
            
            // Normal movement with slight floating effect
            this.x += this.speedX;
            this.y += this.speedY + Math.sin(Date.now() * 0.001 + this.x * 0.01) * 0.3;
        }
        
        draw(ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${config.hue + this.hueVariation}, 80%, 60%, ${0.3 + Math.random() * 0.3})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = `hsla(${config.hue}, 80%, 60%, 0.5)`;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }
    
    // Initialize particles
    const particles = [];
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
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
        resizeCanvas();
        particles.forEach(particle => particle.reset(canvas.width, canvas.height));
    });
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw connections first (behind particles)
        drawParticleConnections(particles, ctx, config);
        
        // Update and draw particles
        const avatar = document.querySelector('.hero-avatar');
        particles.forEach(particle => {
            particle.update(mouse, avatar);
            particle.draw(ctx);
        });
        
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
}

function drawParticleConnections(particles, ctx, config) {
    // Create a gradient for connection lines
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, `hsla(${config.hue}, 80%, 60%, 0.1)`);
    gradient.addColorStop(1, `hsla(${config.hue + 30}, 80%, 60%, 0.1)`);
    
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < config.lineMaxDistance) {
                const opacity = 1 - (distance / config.lineMaxDistance);
                ctx.beginPath();
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 0.5 * opacity;
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
        
