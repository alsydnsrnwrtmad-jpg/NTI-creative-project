<?php
/**
 * Get Meals API
 * GET /api/get_meals.php
 * Optional params: available=1 to filter available only
 */
require_once __DIR__ . '/../config/bootstrap.php';
$db = sofra_get_db_or_fail();

$availableOnly = isset($_GET['available']) ? (int)$_GET['available'] : 1;
$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
// Turn the comma-separated ingredients column into an array for the frontend.
function sofra_format_meal($row) {
    if (!$row) return $row;
    if (isset($row['ingredients']) && $row['ingredients'] !== null && $row['ingredients'] !== '') {
        $row['ingredients'] = array_map('trim', explode(',', $row['ingredients']));
    } else {
        $row['ingredients'] = [];
    }
    return $row;
}

try {
    $cols = "id, category_id, name, description, price, image_url, badge, ingredients, is_available";
    if ($id) {
        $stmt = $db->prepare("SELECT $cols FROM meals WHERE id = :id LIMIT 1");
        $stmt->execute([':id'=>$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(["success"=>true, "result"=>sofra_format_meal($row)]);
        exit;
    }

    if ($availableOnly) {
        $stmt = $db->prepare("SELECT $cols FROM meals WHERE is_available = 1 ORDER BY created_at DESC");
        $stmt->execute();
    } else {
        $stmt = $db->prepare("SELECT $cols FROM meals ORDER BY created_at DESC");
        $stmt->execute();
    }
    $rows = array_map('sofra_format_meal', $stmt->fetchAll(PDO::FETCH_ASSOC));
    echo json_encode(["success" => true, "results" => $rows]);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    exit;
}
?>