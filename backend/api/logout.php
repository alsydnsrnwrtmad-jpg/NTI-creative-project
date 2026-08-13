<?php
/**
 * Logout API Endpoint
 * POST /api/logout.php
 */

require_once __DIR__ . '/../config/bootstrap.php';

$db = sofra_get_db_or_fail();
$auth = new Auth($db);

// Get session token from Authorization header
$headers = getallheaders();
$session_token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';

if (empty($session_token)) {
    http_response_code(400);
    echo json_encode(array("success" => false, "message" => "No session token provided"));
    exit;
}

// Logout user
$result = $auth->logout($session_token);

if ($result['success']) {
    http_response_code(200);
} else {
    http_response_code(500);
}

echo json_encode($result);
