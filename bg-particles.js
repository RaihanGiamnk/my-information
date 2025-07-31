document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('interactive-bg');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Particle settings
    const particles = [];
    const particleCount = Math.min(Math.floor(window.innerWidth * window.innerHeight / 5000), 150);
    const mouse = { x: null, y: null, radius: 100 };
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.speedY = (Math.random() - 0.5) * 0.5;
            this.density = (Math.random() * 10) + 5;
            this.color = `hsla(${260 + Math.random() * 20}, 80%, 60%, ${Math.random() * 0.2 + 0.1})`;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.closePath();
            ctx.fill();
        }
        
        update() {
            // Boundary check with bounce
            if (this.x < 0 || this.x > canvas.width) {
                this.speedX *= -0.8;
                this.x = this.x < 0 ? 0 : canvas.width;
            }
            if (this.y < 0 || this.y > canvas.height) {
                this.speedY *= -0.8;
                this.y = this.y < 0 ? 0 : canvas.height;
            }
            
            // Mouse interaction
            if (mouse.x && mouse.y) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const directionX = dx / distance * force * this.density;
                    const directionY = dy / distance * force * this.density;
                    
                    this.x -= directionX;
                    this.y -= directionY;
                } else {
                    // Return to original position with floating movement
                    if (Math.abs(this.x - this.baseX) > 0.1) {
                        this.x -= (this.x - this.baseX) / 10;
                    }
                    if (Math.abs(this.y - this.baseY) > 0.1) {
                        this.y -= (this.y - this.baseY) / 10;
                    }
                }
            }
            
            // Apply random movement
            this.x += this.speedX;
            this.y += this.speedY;
            
            // Add slight floating effect
            this.y += Math.sin(Date.now() * 0.001 + this.x * 0.01) * 0.3;
            
            this.draw();
        }
    }
    
    // Create particles
    function init() {
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Semi-transparent background to create motion blur effect
        ctx.fillStyle = 'rgba(10, 5, 20, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw connections
        drawConnections();
        
        // Update particles
        particles.forEach(particle => particle.update());
        
        requestAnimationFrame(animate);
    }
    
    // Draw lines between particles
    function drawConnections() {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.strokeStyle = `hsla(260, 80%, 60%, ${0.3 - distance/300})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    // Mouse events
    window.addEventListener('mousemove', function(e) {
        mouse.x = e.x;
        mouse.y = e.y;
    });
    
    window.addEventListener('mouseout', function() {
        mouse.x = undefined;
        mouse.y = undefined;
    });
    
    // Handle resize
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    // Start animation
    init();
    animate();
});