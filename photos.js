// photos.js - Simple photo gallery data
const galleryPhotos = [
  {
    id: "1",
    title: "Awal Merintis",
    filename: "images/Awal-Merintis.jpg",
    description: "Foto pertama saat mulai membuat konten",
    uploaded_at: "2023-01-01",
  },
  {
    id: "2",
    title: "Kondisi Sekarang",
    filename: "images/sekarang.jpg",
    description: "Perkembangan terbaru dalam pembuatan konten",
    uploaded_at: "2023-01-02",
  },
];

function loadGallery() {
  const galleryContainer = document.getElementById("galleryContainer");
  if (!galleryContainer) return;

  if (galleryPhotos.length === 0) {
    galleryContainer.innerHTML = `
      <div class="gallery-placeholder">
        <i class="fas fa-image"></i>
        <p>No photos yet. Check back later!</p>
      </div>
    `;
  } else {
    galleryContainer.innerHTML = galleryPhotos
      .map(
        (photo) => `
      <div class="gallery-item">
        <img src="${photo.filename}" alt="${photo.title}" class="gallery-img">
        <div class="gallery-info">
          <h3 class="gallery-title">${photo.title}</h3>
        </div>
      </div>
    `
      )
      .join("");
  }
}

// Panggil saat halaman dimuat
document.addEventListener("DOMContentLoaded", loadGallery);
