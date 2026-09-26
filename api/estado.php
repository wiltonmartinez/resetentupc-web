<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
echo json_encode([
    'status' => 'success',
    'message' => 'Motor local conectado correctamente',
    'timestamp' => time()
]);

