<?php
/**
 * Shared API Bootstrap
 * Included at the top of every endpoint in backend/api/.
 *
 * Why this exists: PHP notices/warnings/deprecation messages print as raw
 * HTML *before* the JSON response. Even one stray character breaks
 * response.json() on the frontend, which shows up as a generic
 * "Network error occurred" with no useful clue. This file guarantees the
 * response body is always valid JSON, and turns fatal errors into a JSON
 * 500 response instead of a blank/broken page.
 */

// Never let PHP print errors/warnings/notices into the response body.
ini_set('display_errors', '0');
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle CORS preflight requests early.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Catch fatal errors (e.g. missing PDO/MySQL extension) and still return JSON.
set_exception_handler(function ($e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Server error: " . $e->getMessage()
    ]);
    exit;
});

register_shutdown_function(function () {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        if (!headers_sent()) {
            http_response_code(500);
            header("Content-Type: application/json; charset=UTF-8");
        }
        echo json_encode([
            "success" => false,
            "message" => "Server error: " . $error['message']
        ]);
    }
});

require_once __DIR__ . '/database.php';
require_once __DIR__ . '/../auth/Auth.php';

function sofra_get_db_or_fail() {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Database connection failed. Check backend/config/database.php credentials and that MySQL is running.",
            "details" => $database->connectionError
        ]);
        exit;
    }

    return $db;
}
