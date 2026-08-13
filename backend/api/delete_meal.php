<?php
/**
 * Delete Meal API
 * POST /api/delete_meal.php
 * Params: id (required)
 */
require_once __DIR__ . '/../config/bootstrap.php';
$db = sofra_get_db_or_fail();
$auth = new Auth($db);

$headers = function_exists('getallheaders') ? getallheaders() : [];
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? ($_SERVER['HTTP_AUTHORIZATION'] ?? null);
$token = null;
if ($authHeader) {
    if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $m)) $token = $m[1]; else $token = trim($authHeader);
}
if (!$token) { http_response_code(401); echo json_encode(["success"=>false, "message"=>"Authentication required"]); exit; }
$session = $auth->verifySession($token);
if (!$session || empty($session['valid']) || ($session['user']['user_type'] ?? $session['user']['user_type']) !== 'admin') {
    http_response_code(403);
    echo json_encode(["success"=>false, "message"=>"Admin authorization required"]);
    exit;
}

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
if (!$id) { http_response_code(400); echo json_encode(["success"=>false, "message"=>"Meal id required"]); exit; }

try {
    // Optionally delete image file
    $stmt = $db->prepare("SELECT image_url FROM meals WHERE id = :id");
    $stmt->execute([':id'=>$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($row && !empty($row['image_url'])) {
        $localPath = __DIR__ . '/../' . ltrim(str_replace('/sofra/backend/', '', $row['image_url']), '/');
        if (file_exists($localPath)) @unlink($localPath);
    }

    $stmt = $db->prepare("DELETE FROM meals WHERE id = :id");
    $stmt->execute([':id'=>$id]);
    echo json_encode(["success"=>true, "message"=>"Meal deleted"]);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success"=>false, "message"=>"Database error: " . $e->getMessage()]);
    exit;
}
?>