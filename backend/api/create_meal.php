<?php
/**
 * Create Meal API
 * POST /api/create_meal.php
 * Expects multipart/form-data (for image) or JSON. Requires admin session Bearer token.
 */
require_once __DIR__ . '/../config/bootstrap.php';

$db = sofra_get_db_or_fail();
$auth = new Auth($db);

// Get Authorization token
$headers = function_exists('getallheaders') ? getallheaders() : [];
$authHeader = null;
if (!empty($headers) && isset($headers['Authorization'])) $authHeader = $headers['Authorization'];
elseif (!empty($headers) && isset($headers['authorization'])) $authHeader = $headers['authorization'];
elseif (!empty($_SERVER['HTTP_AUTHORIZATION'])) $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
$token = null;
if ($authHeader) {
    if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $m)) $token = $m[1];
    else $token = trim($authHeader);
}
if (!$token) {
    http_response_code(401);
    echo json_encode(["success"=>false, "message"=>"Authentication required"]);
    exit;
}
$session = $auth->verifySession($token);
if (!$session || empty($session['valid']) || ($session['user']['user_type'] ?? $session['user']['user_type']) !== 'admin') {
    http_response_code(403);
    echo json_encode(["success"=>false, "message"=>"Admin authorization required"]);
    exit;
}

// Accept both JSON and multipart/form-data
$data = [];
if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== false) {
    $data = json_decode(file_get_contents('php://input'), true);
} else {
    $data['name'] = $_POST['name'] ?? '';
    $data['description'] = $_POST['description'] ?? '';
    $data['price'] = isset($_POST['price']) ? (float)$_POST['price'] : 0;
    $data['category_id'] = isset($_POST['category_id']) ? (int)$_POST['category_id'] : null;
    $data['is_available'] = (isset($_POST['is_available']) && $_POST['is_available']!='0') ? 1 : 0;
    $data['badge'] = $_POST['badge'] ?? '';
    $data['ingredients'] = $_POST['ingredients'] ?? '';
}

if (empty($data['name']) || $data['price'] <= 0) {
    http_response_code(400);
    echo json_encode(["success"=>false, "message"=>"Missing required fields: name and price"]);
    exit;
}

// Handle uploaded image if present
$imageUrl = '';
if (!empty($_FILES['mealImage']) && $_FILES['mealImage']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../uploads/meals/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
    $fname = basename($_FILES['mealImage']['name']);
    $ext = pathinfo($fname, PATHINFO_EXTENSION);
    $newName = uniqid('meal_') . '.' . $ext;
    $dest = $uploadDir . $newName;
    if (move_uploaded_file($_FILES['mealImage']['tmp_name'], $dest)) {
        // Build a web-accessible path (assumes /sofra/backend/uploads/meals/)
        $imagePath = '/sofra/backend/uploads/meals/' . $newName;
        // Try to convert to full URL
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? '';
        if ($host) {
            $imageUrl = $scheme . '://' . $host . $imagePath;
        } else {
            $imageUrl = $imagePath;
        }
    }
} elseif (!empty($data['image_url'])) {
    $imageUrl = $data['image_url'];
}

try {
    $stmt = $db->prepare("INSERT INTO meals (category_id, name, description, price, image_url, badge, ingredients, is_available) VALUES (:category_id, :name, :description, :price, :image_url, :badge, :ingredients, :is_available)");
    $stmt->bindParam(':category_id', $data['category_id']);
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':description', $data['description']);
    $stmt->bindParam(':price', $data['price']);
    $stmt->bindParam(':image_url', $imageUrl);
    $stmt->bindParam(':badge', $data['badge']);
    $stmt->bindParam(':ingredients', $data['ingredients']);
    $stmt->bindParam(':is_available', $data['is_available']);
    $stmt->execute();
    $mealId = $db->lastInsertId();
    echo json_encode(["success"=>true, "meal_id"=>$mealId, "message"=>"Meal created"]);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success"=>false, "message"=>"Database error: " . $e->getMessage()]);
    exit;
}

?>