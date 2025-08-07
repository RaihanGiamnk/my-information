// avatar-ar.js - Augmented Reality Avatar System
class ARAvatarSystem {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.avatar = null;
    this.controls = null;
    this.markerRoot = null;
    this.arToolkitSource = null;
    this.arToolkitContext = null;
    this.animationMixer = null;
    this.currentAnimation = null;
    this.isARSupported = false;
    this.isAvatarLoaded = false;
    this.animations = {};
  }

  init() {
    // Check if WebGL and AR are supported
    if (!this.checkARSupport()) {
      console.log("AR not supported on this device");
      this.showARNotSupportedMessage();
      return;
    }

    this.isARSupported = true;
    this.createARScene();
    this.setupEventListeners();
  }

  checkARSupport() {
    return (
      navigator.xr &&
      navigator.xr.isSessionSupported &&
      WebGL.isWebGLAvailable()
    );
  }

  showARNotSupportedMessage() {
    const arButton = document.getElementById("ar-button");
    if (arButton) {
      arButton.innerHTML =
        '<i class="fas fa-exclamation-circle"></i> AR Not Supported';
      arButton.classList.add("disabled");
    }
  }

  createARScene() {
    // Create Three.js scene
    this.scene = new THREE.Scene();
    this.scene.background = null;

    // Create AR source
    this.arToolkitSource = new THREEx.ArToolkitSource({
      sourceType: "webcam",
    });

    // Initialize AR source
    this.arToolkitSource.init(() => {
      this.onSourceInitialized();
    });
  }

  onSourceInitialized() {
    // Create AR context
    this.arToolkitContext = new THREEx.ArToolkitContext({
      cameraParametersUrl: "assets/data/camera_para.dat",
      detectionMode: "mono",
    });

    // Initialize AR context
    this.arToolkitContext.init(() => {
      this.onContextInitialized();
    });
  }

  onContextInitialized() {
    // Create camera
    this.camera = new THREE.Camera();
    this.scene.add(this.camera);

    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    document
      .getElementById("ar-container")
      .appendChild(this.renderer.domElement);

    // Create marker controls
    this.markerRoot = new THREE.Group();
    this.scene.add(this.markerRoot);

    // Load avatar model
    this.loadAvatarModel();

    // Start AR session
    this.startARSession();
  }

  loadAvatarModel() {
    const loader = new THREE.GLTFLoader();
    loader.load(
      "assets/models/avatar.glb", // Path ke model 3D
      (gltf) => {
        // Model berhasil dimuat
        this.avatar = gltf.scene;
        this.avatar = gltf.scene;
        this.avatar.scale.set(0.5, 0.5, 0.5);
        this.avatar.position.y = -0.5;

        // Set up animations
        this.animationMixer = new THREE.AnimationMixer(this.avatar);
        const clips = gltf.animations;

        // Store animations
        this.animations = {
          idle: clips.find((clip) => clip.name === "Idle"),
          wave: clips.find((clip) => clip.name === "Wave"),
          dance: clips.find((clip) => clip.name === "Dance"),
        };

        // Play idle animation by default
        this.playAnimation("idle");

        this.markerRoot.add(this.avatar);
        this.isAvatarLoaded = true;

        console.log("Avatar loaded successfully");
      },
      undefined,
      (error) => {
        console.error("Error loading avatar model:", error);
      }
    );
  }

  playAnimation(name) {
    if (!this.animations[name] || !this.animationMixer) return;

    if (this.currentAnimation) {
      this.currentAnimation.stop();
    }

    this.currentAnimation = this.animationMixer.clipAction(
      this.animations[name]
    );
    this.currentAnimation.play();
  }

  startARSession() {
    // Create marker controls
    const markerControls = new THREEx.ArMarkerControls(
      this.arToolkitContext,
      this.markerRoot,
      {
        type: "pattern",
        patternUrl: "assets/data/pattern-marker.patt", // Path ke pattern marker
      }
    );
    // Start animation loop
    this.animate();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (this.arToolkitSource.ready) {
      this.arToolkitContext.update(this.arToolkitSource.domElement);
    }

    if (this.animationMixer) {
      this.animationMixer.update(0.016); // Update animations
    }

    this.renderer.render(this.scene, this.camera);
  }

  setupEventListeners() {
    // Add button to trigger AR
    const arButton = document.createElement("a");
    arButton.id = "ar-button";
    arButton.className = "btn btn-primary";
    arButton.innerHTML = '<i class="fas fa-mobile-alt"></i> View AR Avatar';
    arButton.style.marginTop = "1rem"; // Tambahkan margin
    arButton.style.display = "inline-block"; // Pastikan ditampilkan
    arButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.showARModal();
    });

    // Tempatkan tombol di dalam div hero-btns
    const heroBtns = document.querySelector(".hero-btns");
    if (heroBtns) {
      heroBtns.appendChild(arButton);
    }

    // Add modal for AR view
    this.createARModal();
  }

  createARModal() {
    const modal = document.createElement("div");
    modal.id = "ar-modal";
    modal.className = "modal";
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h3>AR Avatar Experience</h3>
        <p>Point your camera at the marker to see the AR avatar</p>
        <div id="ar-container"></div>
        <div class="ar-controls">
          <button class="btn btn-secondary" id="wave-btn">
            <i class="fas fa-hand-paper"></i> Wave
          </button>
          <button class="btn btn-secondary" id="dance-btn">
            <i class="fas fa-music"></i> Dance
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Close modal
    modal.querySelector(".close-modal").addEventListener("click", () => {
      modal.style.display = "none";
      this.stopARSession();
    });

    // Animation controls
    document.getElementById("wave-btn")?.addEventListener("click", () => {
      this.playAnimation("wave");
      setTimeout(() => this.playAnimation("idle"), 2000);
    });

    document.getElementById("dance-btn")?.addEventListener("click", () => {
      this.playAnimation("dance");
      setTimeout(() => this.playAnimation("idle"), 5000);
    });
  }

  showARModal() {
    if (!this.isARSupported) {
      this.showARNotSupportedMessage();
      return;
    }

    const modal = document.getElementById("ar-modal");
    modal.style.display = "block";
  }

  stopARSession() {
    // Clean up resources
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const arAvatarSystem = new ARAvatarSystem();
  arAvatarSystem.init();
});
