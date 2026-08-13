<?php
/**
 * Update Meal API
 * POST /api/update_meal.php
 * Fields: id (required), name, description, price, category_id, is_available, image (optional file)
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

// Accept form-data
$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
if (!$id) { http_response_code(400); echo json_encode(["success"=>false, "message"=>"Meal id required"]); exit; }

$data = [];
if (isset($_POST['name'])) $data['name'] = $_POST['name'];
if (isset($_POST['description'])) $data['description'] = $_POST['description'];
if (isset($_POST['price'])) $data['price'] = (float)$_POST['price'];
if (isset($_POST['category_id'])) $data['category_id'] = (int)$_POST['category_id'];
if (isset($_POST['is_available'])) $data['is_available'] = ($_POST['is_available'] != '0') ? 1 : 0;
if (isset($_POST['badge'])) $data['badge'] = $_POST['badge'];
if (isset($_POST['ingredients'])) $data['ingredients'] = $_POST['ingredients'];

// Handle image
$imageUrl = null;
if (!empty($_FILES['mealImage']) && $_FILES['mealImage']['error'] === UPLOAD_ERR_OK) {
    $uploadDir = __DIR__ . '/../uploads/meals/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
    $fname = basename($_FILES['mealImage']['name']);
    $ext = pathinfo($fname, PATHINFO_EXTENSION);
    $newName = uniqid('meal_') . '.' . $ext;
    $dest = $uploadDir . $newName;
    if (move_uploaded_file($_FILES['mealImage']['tmp_name'], $dest)) {
        $imagePath = '/sofra/backend/uploads/meals/' . $newName;
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $host = $_SERVER['HTTP_HOST'] ?? '';
        if ($host) {
            $imageUrl = $scheme . '://' . $host . $imagePath;
        } else {
            $imageUrl = $imagePath;
        }
    }
}

try {
    $upd = [];
    $params = [':id'=>$id];
    if (isset($data['category_id'])) { $upd[] = 'category_id = :category_id'; $params[':category_id']=$data['category_id']; }
    if (isset($data['name'])) { $upd[] = 'name = :name'; $params[':name']=$data['name']; }
    if (isset($data['description'])) { $upd[] = 'description = :description'; $params[':description']=$data['description']; }
    if (isset($data['price'])) { $upd[] = 'price = :price'; $params[':price']=$data['price']; }
    if (isset($data['is_available'])) { $upd[] = 'is_available = :is_available'; $params[':is_available']=$data['is_available']; }
    if (isset($data['badge'])) { $upd[] = 'badge = :badge'; $params[':badge']=$data['badge']; }
    if (isset($data['ingredients'])) { $upd[] = 'ingredients = :ingredients'; $params[':ingredients']=$data['ingredients']; }
    if ($imageUrl) { $upd[] = 'image_url = :image_url'; $params[':image_url']=$imageUrl; }

    if (count($upd) === 0) {
        echo json_encode(["success"=>false, "message"=>"No fields to update"]);
        exit;
    }

    $sql = "UPDATE meals SET " . implode(', ', $upd) . " WHERE id = :id";
    $stmt = $db->prepare($sql);
    foreach ($params as $k=>$v) $stmt->bindValue($k, $v);
    $stmt->execute();
    echo json_encode(["success"=>true, "message"=>"Meal updated"]);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success"=>false, "message"=>"Database error: " . $e->getMessage()]);
    exit;
}
?>