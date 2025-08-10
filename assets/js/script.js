// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Then initialize other components
  const YOUTUBE_API_KEY = "AIzaSyAP7z29WBP7AOfbAfDHURZ-HtgpnqneRNQ";
  const CHANNEL_ID = "UCIO4JfMJH2n0q4JuZDWudHA";

  initHeaderEffects();
  initNavigation();
  initYouTubeStats(YOUTUBE_API_KEY, CHANNEL_ID);
  initYouTubeVideos(YOUTUBE_API_KEY, CHANNEL_ID);
  initAvatarEffects();
  initContactForm();
  initMoleculeBackground();
  initTypewriter();
  initFloatingParticles();
});

/**
 * Header Effects
 */
function initHeaderEffects() {
  const header = document.querySelector("header");

  // Add scroll effect to header
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 50);
  });
}

/**
 * Navigation System
 */
function initNavigation() {
  // Smooth scrolling for navigation links
  document.querySelectorAll("nav a").forEach((anchor) => {
    anchor.addEventListener("click", handleNavClick);
  });

  // Set active nav link based on scroll position
  window.addEventListener("scroll", setActiveNavLink);
}

function handleNavClick(e) {
  e.preventDefault();

  // Update active state
  document
    .querySelectorAll("nav a")
    .forEach((l) => l.classList.remove("active"));
  this.classList.add("active");

  // Scroll to target section
  const targetId = this.getAttribute("href");
  const targetElement = document.querySelector(targetId);

  if (targetElement) {
    window.scrollTo({
      top: targetElement.offsetTop - 80,
      behavior: "smooth",
    });

    // Load content for specific sections
    if (targetId === "#videos") {
      loadYouTubeVideos();
    }
  }
}

function setActiveNavLink() {
  const sections = document.querySelectorAll("section");
  const scrollPosition = window.scrollY + 100;

  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute("id");

    if (
      scrollPosition >= sectionTop &&
      scrollPosition < sectionTop + sectionHeight
    ) {
      document.querySelectorAll("nav a").forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${sectionId}`) {
          link.classList.add("active");
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
      animateCounter(
        "subscriberCount",
        0,
        parseInt(stats.subscriberCount),
        2000
      );
      animateCounter("videoCount", 0, parseInt(stats.videoCount), 1500);
      animateCounter("viewCount", 0, parseInt(stats.viewCount), 2500);
    } else {
      setFallbackStats();
    }
  } catch (error) {
    console.error("Error fetching YouTube stats:", error);
    setFallbackStats();
  }
}

function setFallbackStats() {
  animateCounter("subscriberCount", 0, 1000, 2000);
  animateCounter("videoCount", 0, 50, 1500);
  animateCounter("viewCount", 0, 50000, 2500);
}

function animateCounter(elementId, start, end, duration) {
  const element = document.getElementById(elementId);
  let startTimestamp = null;

  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    element.textContent = Math.floor(
      progress * (end - start) + start
    ).toLocaleString();
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
  const container = document.getElementById("youtube-videos-container");
  container.innerHTML =
    '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading videos...</div>';

  try {
    // First fetch the videos
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=12`
    );

    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return showNoVideosMessage(container);
    }

    // Filter only videos (not playlists or channels)
    const videoItems = searchData.items.filter(
      (item) => item.id.kind === "youtube#video"
    );

    if (videoItems.length === 0) {
      return showNoVideosMessage(container);
    }

    // Get video IDs for statistics
    const videoIds = videoItems.map((item) => item.id.videoId).join(",");

    // Fetch statistics for these videos
    const statsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=statistics`
    );

    if (!statsResponse.ok) {
      console.warn(
        "Failed to fetch video statistics, showing videos without stats"
      );
      return renderYouTubeVideos(videoItems, container);
    }

    const statsData = await statsResponse.json();

    // Combine video data with statistics
    const videosWithStats = videoItems.map((item) => {
      const stats =
        statsData.items.find((v) => v.id === item.id.videoId)?.statistics || {};
      return {
        ...item,
        statistics: stats,
      };
    });

    renderYouTubeVideos(videosWithStats, container);
  } catch (error) {
    console.error("Error loading YouTube videos:", error);
    showLoadError(container);
  }
}

function renderYouTubeVideos(videos, container) {
  let videosHTML = "";

  videos.forEach((item) => {
    if (item.id.kind === "youtube#video") {
      videosHTML += createVideoCard(item);
    }
  });

  container.innerHTML = videosHTML;
  setupVideoThumbnailClickHandlers();
}

function createVideoCard(video) {
  const formatStat = (stat) => {
    if (!stat) return "0";
    const num = parseInt(stat);
    return num.toLocaleString();
  };

  const viewCount = formatStat(video.statistics?.viewCount);
  const likeCount = formatStat(video.statistics?.likeCount);
  const publishDate = new Date(video.snippet.publishedAt).toLocaleDateString(
    "id-ID"
  );

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
                <h3>
                    <a href="https://www.youtube.com/watch?v=${video.id.videoId}" 
                       target="_blank" 
                       class="video-link">
                       ${video.snippet.title}
                    </a>
                </h3>
                <div class="work-meta">
                    <span><i class="fas fa-calendar-alt"></i> ${publishDate}</span>
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
  document.querySelectorAll(".video-thumbnail").forEach((thumb) => {
    thumb.addEventListener("click", function (e) {
      e.preventDefault();
      const videoId = this.getAttribute("data-video-id");
      // Buka tab baru ke video YouTube
      window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
    });
  });
}

function showNoVideosMessage(container) {
  container.innerHTML =
    '<div class="error"><i class="fas fa-exclamation-circle"></i> No videos found</div>';
}

function showLoadError(container) {
  container.innerHTML =
    '<div class="error"><i class="fas fa-exclamation-circle"></i> Failed to load videos. Please try again later.</div>';
}

/**
 * Avatar Effects
 */
function initAvatarEffects() {
  const avatar = document.querySelector(".hero-avatar");
  if (!avatar) return;

  avatar.addEventListener("mousemove", handleAvatarMouseMove);
  avatar.addEventListener("mouseleave", resetAvatarPosition);
}

function handleAvatarMouseMove(e) {
  const avatar = e.currentTarget;
  const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
  const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
  avatar.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;

  // Glow effect
  const glow = avatar.querySelector(".avatar-glow");
  const rect = avatar.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  glow.style.background = `radial-gradient(circle at ${x}px ${y}px, var(--primary-light), transparent 70%)`;
}

function resetAvatarPosition(e) {
  const avatar = e.currentTarget;
  avatar.style.transform = "rotateY(0) rotateX(0)";
  const glow = avatar.querySelector(".avatar-glow");
  glow.style.background =
    "radial-gradient(circle at center, var(--primary-light), transparent 70%)";
}

/**
 * Contact Form
 */
function initContactForm() {
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", handleFormSubmit);
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;

  const submitBtn = form.querySelector('button[type="submit"]');
  const submitText = document.getElementById("submitText");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const formMessage = document.getElementById("formMessage");

  // Show loading state
  submitText.textContent = "Sending...";
  loadingSpinner.style.display = "inline-block";
  submitBtn.disabled = true;
  formMessage.style.display = "none";

  try {
    const response = await fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      showFormSuccess(formMessage);
      form.reset();
    } else {
      throw new Error("Form submission failed");
    }
  } catch (error) {
    console.error("Error:", error);
    showFormError(formMessage);
  } finally {
    resetFormButton(submitText, loadingSpinner, submitBtn);
  }
}

function showFormSuccess(formMessage) {
  formMessage.textContent =
    "Message sent successfully! I will get back to you soon.";
  formMessage.className = "form-message success";
  formMessage.style.display = "block";
}

function showFormError(formMessage) {
  formMessage.textContent =
    "Failed to send message. Please try again later or contact me directly at rrysvsj@gmail.com";
  formMessage.className = "form-message error";
  formMessage.style.display = "block";
}

function resetFormButton(submitText, loadingSpinner, submitBtn) {
  submitText.textContent = "Send Message";
  loadingSpinner.style.display = "none";
  submitBtn.disabled = false;
}

/**
 * Molecule Background - Enhanced Version
 */
function initMoleculeBackground() {
  const canvas = document.getElementById("molecules");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

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
    avatarInteraction: true,
  };

  // Particle class
  class Particle {
    constructor() {
      this.reset(canvas.width, canvas.height);
      this.baseX = this.x;
      this.baseY = this.y;
      this.size = Math.random() * config.particleMaxSize + 1;
      this.density = Math.random() * 30 + 1;
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
          const force =
            (config.repulsionDistance - distance) / config.repulsionDistance;

          this.x -= forceDirectionX * force * this.density * 0.5;
          this.y -= forceDirectionY * force * this.density * 0.5;
        }
      }

      // Avatar interaction - attraction
      if (config.avatarInteraction && avatar) {
        const avatarRect = avatar.getBoundingClientRect();
        const avatarCenter = {
          x: avatarRect.left + avatarRect.width / 2,
          y: avatarRect.top + avatarRect.height / 2,
        };
        const dxAvatar = this.x - avatarCenter.x;
        const dyAvatar = this.y - avatarCenter.y;
        const distanceAvatar = Math.sqrt(
          dxAvatar * dxAvatar + dyAvatar * dyAvatar
        );

        if (distanceAvatar < config.attractionDistance) {
          const forceDirectionX = dxAvatar / distanceAvatar;
          const forceDirectionY = dyAvatar / distanceAvatar;
          const force =
            (config.attractionDistance - distanceAvatar) /
            config.attractionDistance;

          this.x -= forceDirectionX * force * 0.3;
          this.y -= forceDirectionY * force * 0.3;
        }
      }

      // Normal movement with slight floating effect
      this.x += this.speedX;
      this.y +=
        this.speedY + Math.sin(Date.now() * 0.001 + this.x * 0.01) * 0.3;
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${config.hue + this.hueVariation}, 80%, 60%, ${
        0.3 + Math.random() * 0.3
      })`;
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
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Handle resize
  window.addEventListener("resize", () => {
    resizeCanvas();
    particles.forEach((particle) =>
      particle.reset(canvas.width, canvas.height)
    );
  });

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections first (behind particles)
    drawParticleConnections(particles, ctx, config);

    // Update and draw particles
    const avatar = document.querySelector(".hero-avatar");
    particles.forEach((particle) => {
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
        const opacity = 1 - distance / config.lineMaxDistance;
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
  const heroTitle = document.querySelector(".hero-text h1");
  if (!heroTitle) return;

  const originalText = heroTitle.textContent;
  heroTitle.textContent = "";

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

function showLoadError(container) {
  container.innerHTML = `
        <div class="error">
            <i class="fas fa-exclamation-circle"></i>
            <p>Failed to load videos. Please try again later.</p>
            <p><small>If the problem persists, check your YouTube API key and quota.</small></p>
        </div>
    `;
}
function initFloatingParticles() {
  const particlesContainer = document.getElementById("particles");
  if (!particlesContainer) return;

  const particleCount = 50;
  const colors = [
    "rgba(138, 43, 226, 0.5)", // Purple
    "rgba(0, 245, 212, 0.5)", // Teal
    "rgba(255, 32, 110, 0.5)", // Pink
    "rgba(255, 255, 255, 0.3)", // White
  ];

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div");
    particle.classList.add("particle");

    // Random properties
    const size = Math.random() * 5 + 1;
    const posX = Math.random() * 100;
    const duration = Math.random() * 20 + 10;
    const delay = Math.random() * 20;
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Apply styles
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${posX}vw`;
    particle.style.bottom = `-10px`;
    particle.style.background = color;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;

    particlesContainer.appendChild(particle);
  }
}

// Tambahkan ini ke DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // ... kode yang ada ...
  initFloatingParticles();
});
/**
 * Bold Interactive Particle Background
 */
function initBoldParticleBackground() {
  const canvas = document.getElementById("interactive-bg");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Enhanced settings for bold effects
  const settings = {
    particleCount: 80,
    baseRadius: 3,
    maxRadius: 6,
    lineWidth: 1.5,
    mouseRadius: 150,
    repulsionStrength: 0.8,
    connectionDistance: 120,
    colors: [
      "hsla(260, 90%, 70%, 0.8)",
      "hsla(270, 90%, 70%, 0.8)",
      "hsla(280, 90%, 70%, 0.8)",
    ],
  };

  const particles = [];
  const mouse = { x: null, y: null };

  // Bold Particle Class
  class Particle {
    constructor() {
      this.reset();
      this.color =
        settings.colors[Math.floor(Math.random() * settings.colors.length)];
      this.targetRadius =
        Math.random() * (settings.maxRadius - settings.baseRadius) +
        settings.baseRadius;
      this.currentRadius = 0; // Start at 0 for grow-in effect
      this.growthRate = Math.random() * 0.1 + 0.05;
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.baseX = this.x;
      this.baseY = this.y;
      this.density = Math.random() * 30 + 10;
      this.velocity = {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
      };
    }

    draw() {
      // Grow particle to target size
      if (this.currentRadius < this.targetRadius) {
        this.currentRadius += this.growthRate;
      }

      // Main particle
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;

      // Glow effect
      ctx.shadowBlur = this.currentRadius * 3;
      ctx.shadowColor = this.color;
      ctx.fill();

      // Reset shadow for other drawings
      ctx.shadowBlur = 0;
    }

    update() {
      // Mouse interaction - bold repulsion
      if (mouse.x && mouse.y) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < settings.mouseRadius) {
          const force =
            (settings.mouseRadius - distance) / settings.mouseRadius;
          const forceX =
            (dx / distance) * force * this.density * settings.repulsionStrength;
          const forceY =
            (dy / distance) * force * this.density * settings.repulsionStrength;

          this.velocity.x -= forceX;
          this.velocity.y -= forceY;
        }
      }

      // Apply velocity with damping
      this.velocity.x *= 0.92;
      this.velocity.y *= 0.92;

      // Move particle
      this.x += this.velocity.x;
      this.y += this.velocity.y;

      // Return to base position with smooth easing
      const returnForce = 0.02;
      this.velocity.x += (this.baseX - this.x) * returnForce;
      this.velocity.y += (this.baseY - this.y) * returnForce;

      // Boundary check with bounce
      if (this.x < 0 || this.x > canvas.width) {
        this.velocity.x *= -0.7;
        this.x = Math.max(0, Math.min(canvas.width, this.x));
      }
      if (this.y < 0 || this.y > canvas.height) {
        this.velocity.y *= -0.7;
        this.y = Math.max(0, Math.min(canvas.height, this.y));
      }
    }
  }

  // Initialize particles
  function initParticles() {
    for (let i = 0; i < settings.particleCount; i++) {
      particles.push(new Particle());
    }
  }

  // Draw bold connections
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < settings.connectionDistance) {
          const opacity = 1 - distance / settings.connectionDistance;

          // Bold connection line
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `hsla(265, 90%, 70%, ${opacity * 0.6})`;
          ctx.lineWidth = settings.lineWidth + opacity * 2;
          ctx.stroke();

          // Connection glow
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `hsla(265, 100%, 80%, ${opacity * 0.3})`;
          ctx.lineWidth = settings.lineWidth + opacity * 4;
          ctx.stroke();
        }
      }
    }
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Semi-transparent background overlay
    ctx.fillStyle = "rgba(10, 5, 20, 0.2)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawConnections();

    particles.forEach((particle) => {
      particle.update();
      particle.draw();
    });

    requestAnimationFrame(animate);
  }

  // Mouse events
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
  });

  // Handle resize
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  // Start animation
  initParticles();
  animate();
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initBoldParticleBackground);
function initDynamicBackground() {
  const bg = document.getElementById("interactive-bg");
  const sections = document.querySelectorAll("section");

  window.addEventListener("scroll", () => {
    const scrollPosition = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = scrollPosition / docHeight;

    // Change hue based on scroll position
    const hue = 260 + scrollPercent * 40;
    bg.style.background = `linear-gradient(135deg, hsl(${hue}, 70%, 10%) 0%, hsl(${
      hue + 20
    }, 70%, 15%) 100%)`;

    // Pulse effect when reaching sections
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (
        rect.top < window.innerHeight / 2 &&
        rect.bottom > window.innerHeight / 2
      ) {
        section.style.animation = "sectionPulse 1s ease";
        setTimeout(() => (section.style.animation = ""), 1000);
      }
    });
  });
}
function initCustomCursor() {
  const cursor = document.createElement("div");
  cursor.className = "custom-cursor";
  document.body.appendChild(cursor);

  document.addEventListener("mousemove", (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });

  document.querySelectorAll("a, button, .video-thumbnail").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("cursor-hover");
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("cursor-hover");
    });
  });
}
function initAudioVisualizer() {
  const canvas = document.createElement("canvas");
  canvas.id = "audio-visualizer";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "-1";
  canvas.style.opacity = "0.3";
  canvas.style.pointerEvents = "none";

  let audioContext, analyser, dataArray;

  document.addEventListener("click", initAudio, { once: true });

  function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        visualize();
      })
      .catch((err) => {
        console.log("Audio not available:", err);
        // Fallback to simulated visualization
        simulateVisualization();
      });
  }

  function visualize() {
    requestAnimationFrame(visualize);
    analyser.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / dataArray.length) * 2.5;
    let x = 0;

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = dataArray[i] * 1.5;
      const hue = 260 + i * 2;

      ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.7)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  function simulateVisualization() {
    requestAnimationFrame(simulateVisualization);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barCount = 100;
    const barWidth = canvas.width / barCount;
    let x = 0;

    for (let i = 0; i < barCount; i++) {
      const randomHeight = Math.random() * canvas.height * 0.3;
      const hue = 260 + i * 1.5;
      const barHeight =
        randomHeight + Math.sin(Date.now() * 0.001 + i * 0.1) * 50;

      ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.5)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth;
    }
  }
}

// Setup event listeners
function setupEventListeners() {
  // Show login modal
  document.getElementById("showLoginModal")?.addEventListener("click", (e) => {
    e.preventDefault();
    loginModal.style.display = "block";
  });

  // Close modals
  closeModals.forEach((btn) => {
    btn.addEventListener("click", () => {
      loginModal.style.display = "none";
      uploadModal.style.display = "none";
    });
  });

  // Click outside modal to close
  window.addEventListener("click", (e) => {
    if (e.target === loginModal) loginModal.style.display = "none";
    if (e.target === uploadModal) uploadModal.style.display = "none";
  });

  // Login form
  loginForm?.addEventListener("submit", handleLogin);

  // Logout button
  logoutBtn?.addEventListener("click", handleLogout);

  // Add photo button
  addPhotoBtn?.addEventListener("click", () => {
    uploadModal.style.display = "block";
  });

  // Upload form
  uploadForm?.addEventListener("submit", handlePhotoUpload);
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const loginForm = document.getElementById("loginForm");

  if (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  ) {
    localStorage.setItem("adminLoggedIn", "true");
    hideLoginModal();
    showAdminControls();
    loadGallery();
    showToast("Login successful!", "success");
  } else {
    // Add shake effect
    loginForm.classList.add("shake");
    setTimeout(() => loginForm.classList.remove("shake"), 500);

    showToast("Invalid credentials", "error");

    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }
}

// Handle logout
function handleLogout() {
  localStorage.removeItem("adminLoggedIn");
  adminControls.style.display = "none";
  document.getElementById("adminLoginBtn")?.remove();
  addLoginButton();
  loadGallery(); // Reload gallery without edit controls
  showToast("Logged out successfully", "success");
}

// Show admin controls
function showAdminControls() {
  adminControls.style.display = "flex";
  if (document.getElementById("adminLoginBtn")) {
    document.getElementById("adminLoginBtn").style.display = "none";
  }
}

// Load gallery from localStorage
function loadGallery() {
  const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
  const gallery = JSON.parse(localStorage.getItem("gallery")) || [];

  if (!galleryContainer) return;

  if (gallery.length === 0) {
    galleryContainer.innerHTML = `
            <div class="gallery-placeholder">
                <i class="fas fa-image"></i>
                <p>No photos yet. ${
                  isLoggedIn
                    ? 'Click "Add Photo" to upload.'
                    : "Check back later."
                }</p>
            </div>
        `;
  } else {
    galleryContainer.innerHTML = gallery
      .map(
        (item, index) => `
            <div class="gallery-item">
                <img src="${item.image}" alt="${
          item.title
        }" class="gallery-img">
                <h3>${item.title}</h3>
                ${
                  isLoggedIn
                    ? `<button class="delete-btn" data-index="${index}"><i class="fas fa-trash"></i></button>`
                    : ""
                }
            </div>
        `
      )
      .join("");

    if (isLoggedIn) {
      document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          deletePhoto(parseInt(btn.dataset.index));
        });
      });
    }
  }
}

// Add this to your DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", () => {
  // ... existing code ...
  initAdminSystem();
});
function initAchievements() {
  const achievements = {
    firstVisit: {
      title: "First Visit",
      message: "Welcome to my website! Thanks for visiting.",
      earned: false,
    },
    watchedVideo: {
      title: "Video Watcher",
      message: "You watched a video! Awesome!",
      earned: false,
    },
    sentMessage: {
      title: "Social Butterfly",
      message: "You sent a message in the chat!",
      earned: false,
    },
    exploredAll: {
      title: "Explorer",
      message: "You visited all sections of the website!",
      earned: false,
    },
  };

  // Check for first visit
  if (!localStorage.getItem("visited")) {
    unlockAchievement("firstVisit");
    localStorage.setItem("visited", "true");
  }

  // Track section visits
  const sections = ["home", "videos", "gallery", "about", "contact"];
  const visitedSections = new Set();

  function trackSectionVisit(sectionId) {
    visitedSections.add(sectionId);
    if (
      visitedSections.size === sections.length &&
      !achievements.exploredAll.earned
    ) {
      unlockAchievement("exploredAll");
    }
  }

  // Unlock achievement
  function unlockAchievement(achievementId) {
    const achievement = achievements[achievementId];
    if (!achievement || achievement.earned) return;

    achievement.earned = true;
    showAchievementToast(achievement.message);
  }

  // Show achievement toast
  function showAchievementToast(message) {
    const toast = document.getElementById("achievementToast");
    const messageElement = document.getElementById("achievementMessage");

    messageElement.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 5000);
  }

  // Track video watching
  document.addEventListener("click", (e) => {
    if (
      e.target.closest(".video-thumbnail") &&
      !achievements.watchedVideo.earned
    ) {
      unlockAchievement("watchedVideo");
    }
  });

  // Track chat messages
  document.addEventListener("chatMessage", () => {
    if (!achievements.sentMessage.earned) {
      unlockAchievement("sentMessage");
    }
  });

  // Track section visits
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          trackSectionVisit(sectionId);
        }
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach((sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) observer.observe(section);
  });
}

// Tambahkan ke DOMContentLoaded
document.addEventListener("DOMContentLoaded", initAchievements);
// Support Button Click Effect
document.querySelector(".support-btn")?.addEventListener("click", (e) => {
  e.preventDefault();
  const url = e.currentTarget.getAttribute("href");

  // Create toast notification
  const toast = document.createElement("div");
  toast.className = "support-toast";
  toast.innerHTML = `
    <i class="fas fa-heart"></i>
    <span>Terima kasih atas dukunganmu!</span>
  `;
  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  // Redirect after 1.5 seconds
  setTimeout(() => {
    window.open(url, "_blank");
  }, 1500);

  // Remove toast
  setTimeout(() => {
    toast.remove();
  }, 3000);
});
// Easter Egg System
function initEasterEgg() {
  const secretCode = ["f", "a"]; // Kode rahasia "rg"
  let typedKeys = [];
  let touchStartY = 0;
  let touchEndY = 0;
  let tapCount = 0;
  let lastTapTime = 0;
  const egg = document.getElementById("easter-egg");

  // Pastikan Easter Egg awalnya tersembunyi
  egg.style.display = "none";

  // Reset Easter Egg setelah selesai
  function resetEgg() {
    egg.style.display = "none";
    egg.classList.remove("active");
  }

  // Tampilkan Easter Egg
  function showEgg() {
    egg.style.display = "block";
    egg.classList.add("active");

    // Sembunyikan setelah 3 detik
    setTimeout(resetEgg, 3000);

    // Getaran jika didukung
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }
  }

  // Deteksi keyboard untuk desktop
  document.addEventListener("keydown", (e) => {
    // Abaikan jika Easter Egg sedang aktif
    if (egg.classList.contains("active")) return;

    typedKeys.push(e.key.toLowerCase());

    // Batasi panjang array sesuai panjang kode rahasia
    if (typedKeys.length > secretCode.length) {
      typedKeys.shift();
    }

    // Cocokkan dengan kode rahasia
    if (typedKeys.join("") === secretCode.join("")) {
      showEgg();
      typedKeys = []; // Reset
    }
  });

  // Deteksi gesture untuk mobile (3x tap + swipe up)
  document.addEventListener(
    "touchstart",
    (e) => {
      // Abaikan jika Easter Egg sedang aktif
      if (egg.classList.contains("active")) return;

      touchStartY = e.changedTouches[0].screenY;

      // Hitung tap cepat
      const now = Date.now();
      if (now - lastTapTime < 300) {
        // Dalam 300ms
        tapCount++;
      } else {
        tapCount = 1;
      }
      lastTapTime = now;
    },
    false
  );

  document.addEventListener(
    "touchend",
    (e) => {
      // Abaikan jika Easter Egg sedang aktif
      if (egg.classList.contains("active")) return;

      touchEndY = e.changedTouches[0].screenY;

      // Deteksi swipe up (minimal 100px) setelah 3x tap
      if (tapCount >= 3 && touchStartY - touchEndY > 100) {
        showEgg();
        tapCount = 0; // Reset
      }
    },
    false
  );
}

// Panggil setelah semua konten dimuat
document.addEventListener("DOMContentLoaded", function () {
  // Tunggu 1 detik setelah DOM selesai dimuat
  setTimeout(initEasterEgg, 1000);
});
// Tambahkan di dalam DOMContentLoaded
function initSkillsInteraction() {
  const skillItems = document.querySelectorAll(".skill-item");

  skillItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Jika skill ini sudah aktif, nonaktifkan
      if (this.classList.contains("active")) {
        this.classList.remove("active");
      } else {
        // Nonaktifkan semua skill lainnya
        skillItems.forEach((skill) => {
          skill.classList.remove("active");
        });
        // Aktifkan skill yang diklik
        this.classList.add("active");
      }
    });
  });

  // Tutup skill saat klik di luar
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".skill-item")) {
      skillItems.forEach((skill) => {
        skill.classList.remove("active");
      });
    }
  });
}

// Panggil fungsi ini di DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // ... kode yang ada ...
  initSkillsInteraction();
});
function initSkillsInteraction() {
  const skillItems = document.querySelectorAll(".skill-item");

  skillItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Add slight glow effect
      const glow = document.createElement("div");
      glow.className = "skill-glow";
      this.appendChild(glow);

      setTimeout(() => {
        glow.remove();
      }, 500);

      if (this.classList.contains("active")) {
        this.classList.remove("active");
      } else {
        skillItems.forEach((skill) => {
          skill.classList.remove("active");
        });
        this.classList.add("active");
      }
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".skill-item")) {
      skillItems.forEach((skill) => {
        skill.classList.remove("active");
      });
    }
  });
}
// Add to your script.js
function initSkillsInteraction() {
  const skillItems = document.querySelectorAll(".skill-item");

  skillItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Add slight glow effect
      const glow = document.createElement("div");
      glow.className = "skill-glow";
      this.appendChild(glow);

      setTimeout(() => {
        glow.remove();
      }, 500);

      if (this.classList.contains("active")) {
        this.classList.remove("active");
      } else {
        skillItems.forEach((skill) => {
          skill.classList.remove("active");
        });
        this.classList.add("active");
      }
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".skill-item")) {
      skillItems.forEach((skill) => {
        skill.classList.remove("active");
      });
    }
  });
}
