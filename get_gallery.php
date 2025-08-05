<?php
header('Content-Type: application/json');

$galleryFile = 'gallery_data.json';

if (file_exists($galleryFile)) {
    $photos = json_decode(file_get_contents($galleryFile), true);
    echo json_encode($photos ?: []);
} else {
    echo json_encode([]);
}
?>