<?php
/**
 * Validate Session API Endpoint
 * GET /api/validate.php
 */

require_once __DIR__ . '/../config/bootstrap.php';

$db = sofra_get_db_or_fail();
$auth = new Auth($db);

// Get session token from Authorization header
$headers = getallheaders();
$session_token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';

if (empty($session_token)) {
    http_response_code(401);
    echo json_encode(array("success" => false, "message" => "No session token provided"));
    exit;
}

// Validate session
$result = $auth->verifySession($session_token);

if ($result['valid']) {
    http_response_code(200);
    echo json_encode(array("success" => true, "user" => $result['user']));
} else {
    http_response_code(401);
    echo json_encode(array("success" => false, "message" => $result['message']));
}
