<?php
/**
 * Login API Endpoint
 * POST /api/login.php
 */

require_once __DIR__ . '/../config/bootstrap.php';

$db = sofra_get_db_or_fail();
$auth = new Auth($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (
    !empty($data->email) &&
    !empty($data->password) &&
    !empty($data->user_type)
) {
    // Login user
    $result = $auth->login($data->email, $data->password, $data->user_type);

    // Set response code
    if ($result['success']) {
        http_response_code(200);
    } else {
        http_response_code(401);
    }

    // Return result
    echo json_encode($result);
} else {
    // Set response code
    http_response_code(400);

    // Tell the user
    echo json_encode(array("success" => false, "message" => "Incomplete data. Please provide email, password, and user type."));
}
