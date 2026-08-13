<?php
/**
 * Get Categories API
 * GET /api/get_categories.php
 * Public endpoint — used by the menu page (future filters) and by the
 * admin "Add/Edit Meal" form to populate the category dropdown from the
 * real `categories` table instead of a hardcoded, mismatched list.
 */
require_once __DIR__ . '/../config/bootstrap.php';
$db = sofra_get_db_or_fail();

try {
    $stmt = $db->prepare("SELECT id, name, description, image_url FROM categories ORDER BY name ASC");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "results" => $rows]);
    exit;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    exit;
}
?>
