// Updated script.js
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
    initGallery();
    initTestimonials();
    initTimeline();
    initLightbox();
});

/* ====== New Functions ====== */

// Initialize Gallery
function initGallery() {
    // In a real implementation, you would load gallery images from an API or JSON file
    // For this example, we'll use placeholder images
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    // Sample gallery data (replace with your actual images)
    const galleryItems = [
        { src: 'images/gallery1.jpg', category: 'photography', caption: 'Creative Shoot' },
        { src: 'images/gallery2.jpg', category: 'behind-scenes', caption: 'Behind the Scenes' },
        { src: 'images/gallery3.jpg', category: 'photography', caption: 'Portrait Session' },
        { src: 'images/gallery4.jpg', category: 'behind-scenes', caption: 'Video Shoot' },
        { src: 'images/gallery5.jpg', category: 'photography', caption: 'Urban Photography' },
        { src: 'images/gallery6.jpg', category: 'behind-scenes', caption: 'Editing Process' }
    ];
    
    // Render gallery items
    galleryGrid.innerHTML = '';
    galleryItems.forEach(item => {
        const galleryItem = document.createElement('div');
        galleryItem.className = `gallery-item ${item.category}`;
        galleryItem.innerHTML = `
            <a href="${item.src}" data-lightbox="gallery" data-title="${item.caption}">
                <img src="${item.src}" alt="${item.caption}">
                <div class="gallery-caption">${item.caption}</div>
            </a>
        `;
        galleryGrid.appendChild(galleryItem);
    });
    
    // Initialize gallery filters
    initGalleryFilters();
}

// Initialize Gallery Filters
function initGalleryFilters() {
    const filterButtons = document.querySelectorAll('.gallery-filters .filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter gallery items
            const filter = button.dataset.filter;
            const galleryItems = document.querySelectorAll('.gallery-item');
            
            galleryItems.forEach(item => {
                if (filter === 'all' || item.classList.contains(filter)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Initialize Testimonials Slider
function initTestimonials() {
    const testimonials = document.querySelectorAll('.testimonial-item');
    const dotsContainer = document.querySelector('.testimonial-dots');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    
    if (!testimonials.length) return;
    
    // Create dots
    testimonials.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `testimonial-dot ${index === 0 ? 'active' : ''}`;
        dot.dataset.index = index;
        dotsContainer.appendChild(dot);
    });
    
    const dots = document.querySelectorAll('.testimonial-dot');
    let currentIndex = 0;
    
    // Show testimonial
    function showTestimonial(index) {
        testimonials.forEach(testimonial => testimonial.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        testimonials[index].classList.add('active');
        dots[index].classList.add('active');
        currentIndex = index;
    }
    
    // Next testimonial
    function nextTestimonial() {
        let newIndex = currentIndex + 1;
        if (newIndex >= testimonials.length) newIndex = 0;
        showTestimonial(newIndex);
    }
    
    // Previous testimonial
    function prevTestimonial() {
        let newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = testimonials.length - 1;
        showTestimonial(newIndex);
    }
    
    // Auto-rotate testimonials
    let testimonialInterval = setInterval(nextTestimonial, 5000);
    
    // Event listeners
    nextBtn.addEventListener('click', () => {
        clearInterval(testimonialInterval);
        nextTestimonial();
        testimonialInterval = setInterval(nextTestimonial, 5000);
    });
    
    prevBtn.addEventListener('click', () => {
        clearInterval(testimonialInterval);
        prevTestimonial();
        testimonialInterval = setInterval(nextTestimonial, 5000);
    });
    
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            clearInterval(testimonialInterval);
            showTestimonial(parseInt(dot.dataset.index));
            testimonialInterval = setInterval(nextTestimonial, 5000);
        });
    });
}

// Initialize Timeline Animation
function initTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    function checkTimelineVisibility() {
        timelineItems.forEach(item => {
            const itemTop = item.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (itemTop < windowHeight * 0.8) {
                item.classList.add('visible');
            }
        });
    }
    
    // Initial check
    checkTimelineVisibility();
    
    // Check on scroll
    window.addEventListener('scroll', checkTimelineVisibility);
}

// Initialize Lightbox
function initLightbox() {
    // This is handled by the lightbox2 library we included
    // Additional customizations can be added here if needed
    lightbox.option({
        'resizeDuration': 200,
        'wrapAround': true,
        'fadeDuration': 300,
        'imageFadeDuration': 300
    });
}

/* ====== Enhanced Existing Functions ====== */

// Enhanced YouTube Videos Loading
async function loadYouTubeVideos(apiKey, channelId, maxResults = 12, pageToken = '') {
    const container = document.getElementById('youtube-videos-container');
    const featuredContainer = document.querySelector('.featured-video');
    
    try {
        // Load featured video (most popular)
        const featuredResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=viewCount&maxResults=1`
        );
        const featuredData = await featuredResponse.json();
        
        if (featuredData.items?.length > 0) {
            const featuredVideo = featuredData.items[0];
            featuredContainer.innerHTML = `
                <iframe src="https://www.youtube.com/embed/${featuredVideo.id.videoId}?autoplay=0" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
        }
        
        // Load other videos
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${maxResults}&pageToken=${pageToken}`
        );
        const data = await response.json();
        
        if (data.items?.length > 0) {
            renderYouTubeVideos(data.items, container);
            
            // Show load more button if there are more videos
            if (data.nextPageToken) {
                document.getElementById('loadMoreVideos').style.display = 'inline-flex';
                document.getElementById('loadMoreVideos').onclick = () => {
                    loadYouTubeVideos(apiKey, channelId, maxResults, data.nextPageToken);
                };
            } else {
                document.getElementById('loadMoreVideos').style.display = 'none';
            }
        } else {
            showNoVideosMessage(container);
        }
    } catch (error) {
        console.error('Error loading YouTube videos:', error);
        showLoadError(container);
    }
}

// Enhanced Video Filtering
function initVideoFilters() {
    const filterButtons = document.querySelectorAll('.video-filters .filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter videos (in a real implementation, you would sort the videos)
            // This is just a placeholder for the functionality
            const videosContainer = document.getElementById('youtube-videos-container');
            videosContainer.classList.add('filtering');
            
            setTimeout(() => {
                videosContainer.classList.remove('filtering');
            }, 500);
        });
    });
}

// Enhanced Avatar Effects
function initAvatarEffects() {
    const avatar = document.querySelector('.hero-avatar');
    if (!avatar) return;
    
    avatar.addEventListener('mousemove', handleAvatarMouseMove);
    avatar.addEventListener('mouseleave', resetAvatarPosition);
    
    // Create avatar particles
    createAvatarParticles();
}

function createAvatarParticles() {
    const container = document.querySelector('.avatar-particles');
    if (!container) return;
    
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'avatar-particle';
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random size and animation
        const size = Math.random() * 4 + 2;
        const duration = Math.random() * 10 + 5;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            left: ${x}%;
            top: ${y}%;
            width: ${size}px;
            height: ${size}px;
            background: var(--secondary-light);
            animation: float ${duration}s ease-in-out ${delay}s infinite;
            opacity: ${Math.random() * 0.5 + 0.3};
        `;
        
        container.appendChild(particle);
    }
}

// Add this to your CSS for the avatar particles:
/*
.avatar-particle {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    z-index: 3;
}

@keyframes float {
    0%, 100% {
        transform: translate(0, 0);
    }
    25% {
        transform: translate(10px, -10px);
    }
    50% {
        transform: translate(-5px, 5px);
    }
    75% {
        transform: translate(5px, -5px);
    }
}
*/
