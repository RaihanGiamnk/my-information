// Replace your bg-particles.js with this
document.addEventListener("DOMContentLoaded", function () {
  // Wait for splash screen to finish
  setTimeout(initParticleBackground, 2500);
});

function initParticleBackground() {
  const canvas = document.getElementById("interactive-bg");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Enhanced particle settings
  const settings = {
    particleCount: Math.min(
      Math.floor((window.innerWidth * window.innerHeight) / 2500),
      200
    ),
    baseRadius: 2.5,
    maxRadius: 6,
    lineWidth: 1.2,
    mouseRadius: 180,
    repulsionStrength: 0.85,
    connectionDistance: 150,
    colors: [
      "hsla(260, 95%, 75%, 0.85)",
      "hsla(270, 95%, 75%, 0.85)",
      "hsla(280, 95%, 75%, 0.85)",
      "hsla(250, 95%, 75%, 0.85)",
    ],
    floatIntensity: 0.35,
    floatSpeed: 0.0015,
    glowIntensity: 0.8,
    connectionHue: 270,
  };

  const particles = [];
  const mouse = { x: null, y: null };
  let globalAngle = 0;

  // Enhanced Particle Class
  class Particle {
    constructor() {
      this.reset();
      this.color =
        settings.colors[Math.floor(Math.random() * settings.colors.length)];
      this.targetRadius =
        Math.random() * (settings.maxRadius - settings.baseRadius) +
        settings.baseRadius;
      this.currentRadius = 0;
      this.growthRate = Math.random() * 0.1 + 0.05;
      this.floatOffset = Math.random() * Math.PI * 2;
      this.floatAmplitude = Math.random() * 20 + 10;
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

      // Main particle with glow
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = this.currentRadius * 3;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    update() {
      // Mouse interaction
      if (mouse.x && mouse.y) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < settings.mouseRadius) {
          const force =
            (settings.mouseRadius - distance) / settings.mouseRadius;
          const directionX = dx / distance;
          const directionY = dy / distance;

          this.velocity.x -=
            directionX * force * this.density * settings.repulsionStrength;
          this.velocity.y -=
            directionY * force * this.density * settings.repulsionStrength;
        }
      }

      // Floating animation
      const floatX =
        Math.cos(globalAngle + this.floatOffset) *
        this.floatAmplitude *
        settings.floatIntensity;
      const floatY =
        Math.sin(globalAngle + this.floatOffset) *
        this.floatAmplitude *
        settings.floatIntensity;

      // Apply velocity with damping
      this.velocity.x *= 0.92;
      this.velocity.y *= 0.92;

      // Move particle
      this.x += this.velocity.x + floatX;
      this.y += this.velocity.y + floatY;

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

  // Initialize particles with entrance animation
  function initParticles() {
    for (let i = 0; i < settings.particleCount; i++) {
      const p = new Particle();
      // Start particles off-screen for entrance effect
      p.x = Math.random() > 0.5 ? -100 : canvas.width + 100;
      p.y = Math.random() * canvas.height;
      particles.push(p);
    }
  }

  // Draw connections with gradient
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
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `hsla(265, 90%, 70%, ${opacity * 0.6})`;
          ctx.lineWidth = settings.lineWidth + opacity * 1.5;
          ctx.stroke();
        }
      }
    }
  }

  // Animation loop
  function animate() {
    globalAngle += settings.floatSpeed;

    // Clear with semi-transparent for motion blur
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

  // Animate particles entering the screen
  setTimeout(() => {
    particles.forEach((p) => {
      p.baseX = Math.random() * canvas.width;
      p.baseY = Math.random() * canvas.height;
    });
  }, 100);
}
