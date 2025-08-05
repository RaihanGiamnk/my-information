<?php
header('Content-Type: application/json');

// Konfigurasi upload
$uploadDir = 'uploads/';
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
$maxSize = 5 * 1024 * 1024; // 5MB

// Validasi input
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_FILES['photo']) || !isset($_POST['title'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit;
}

$title = trim($_POST['title']);
$file = $_FILES['photo'];

// Validasi judul
if (empty($title)) {
    echo json_encode(['success' => false, 'message' => 'Title is required']);
    exit;
}

// Validasi file
if ($file['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'Upload error: ' . $file['error']]);
    exit;
}

if (!in_array($file['type'], $allowedTypes)) {
    echo json_encode(['success' => false, 'message' => 'Only JPG, PNG, and GIF files are allowed']);
    exit;
}

if ($file['size'] > $maxSize) {
    echo json_encode(['success' => false, 'message' => 'File size exceeds 5MB limit']);
    exit;
}

// Buat direktori upload jika belum ada
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate nama file unik
$extension = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid() . '.' . $extension;
$destination = $uploadDir . $filename;

// Pindahkan file ke direktori upload
if (move_uploaded_file($file['tmp_name'], $destination)) {
    // Simpan info foto ke database (contoh sederhana dengan file JSON)
    $galleryFile = 'gallery_data.json';
    $photos = file_exists($galleryFile) ? json_decode(file_get_contents($galleryFile), true) : [];
    
    $newPhoto = [
        'id' => uniqid(),
        'title' => $title,
        'filename' => $filename,
        'uploaded_at' => date('Y-m-d H:i:s')
    ];
    
    $photos[] = $newPhoto;
    file_put_contents($galleryFile, json_encode($photos));
    
    echo json_encode(['success' => true, 'message' => 'Upload successful', 'photo' => $newPhoto]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
}
?>