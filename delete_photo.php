<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE' || !isset($_GET['id'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid request']);
    exit;
}

$photoId = $_GET['id'];
$galleryFile = 'gallery_data.json';
$uploadDir = 'uploads/';

if (!file_exists($galleryFile)) {
    echo json_encode(['success' => false, 'message' => 'Gallery data not found']);
    exit;
}

$photos = json_decode(file_get_contents($galleryFile), true);
$found = false;

foreach ($photos as $index => $photo) {
    if ($photo['id'] === $photoId) {
        // Hapus file dari server
        $filePath = $uploadDir . $photo['filename'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }
        
        // Hapus dari daftar
        array_splice($photos, $index, 1);
        $found = true;
        break;
    }
}

if ($found) {
    file_put_contents($galleryFile, json_encode($photos));
    echo json_encode(['success' => true, 'message' => 'Photo deleted']);
} else {
    echo json_encode(['success' => false, 'message' => 'Photo not found']);
}
?>