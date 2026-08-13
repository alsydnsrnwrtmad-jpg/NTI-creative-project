<?php
/**
 * Search API Endpoint
 * GET /api/search.php?q=...
 * Returns JSON list of meals matching query. If no exact matches, returns closest matches using levenshtein.
 */
require_once __DIR__ . '/../config/bootstrap.php';

$db = sofra_get_db_or_fail();

$q = isset($_GET['q']) ? trim($_GET['q']) : '';
if ($q === '') {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Query parameter 'q' is required", "results" => []]);
    exit;
}

try {
    // Prepare wildcard
    $wild = '%' . $q . '%';

    // First try straightforward LIKE search on name and description
    $sql = "SELECT id, category_id, name, description, price, image_url, is_available FROM meals WHERE is_available = 1 AND (name LIKE ? OR description LIKE ?) ORDER BY (name LIKE ?) DESC, name LIMIT 50";
    $stmt = $db->prepare($sql);
    $stmt->execute([$wild, $wild, $q]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($rows && count($rows) > 0) {
        echo json_encode(["success" => true, "results" => $rows, "closest" => false]);
        exit;
    }

    // If no results, attempt tokenized wildcard search (split words) to get partial matches
    $tokens = preg_split('/\s+/', $q);
    $likeParts = [];
    $params = [];
    foreach ($tokens as $t) {
        $t = trim($t);
        if ($t === '') continue;
        $likeParts[] = "(name LIKE ? OR description LIKE ? )";
        $params[] = '%' . $t . '%';
        $params[] = '%' . $t . '%';
    }

    if (count($likeParts) > 0) {
        $where = implode(' OR ', $likeParts);
        $sql2 = "SELECT id, category_id, name, description, price, image_url, is_available FROM meals WHERE is_available = 1 AND (" . $where . ") LIMIT 50";
        $stmt2 = $db->prepare($sql2);
        $stmt2->execute($params);
        $rows2 = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        if ($rows2 && count($rows2) > 0) {
            echo json_encode(["success" => true, "results" => $rows2, "closest" => false]);
            exit;
        }
    }

    // Final fallback: fetch a manageable list of meals and compute levenshtein distance in PHP to find closest names
    $stmtAll = $db->prepare("SELECT id, category_id, name, description, price, image_url, is_available FROM meals WHERE is_available = 1 LIMIT 200");
    $stmtAll->execute();
    $all = $stmtAll->fetchAll(PDO::FETCH_ASSOC);

    $distances = [];
    foreach ($all as $r) {
        $name = strtolower($r['name']);
        $d = levenshtein(mb_strtolower($q), $name);
        $distances[] = ['row' => $r, 'dist' => $d];
    }

    usort($distances, function($a, $b) { return $a['dist'] - $b['dist']; });

    $closest = array_slice(array_map(function($x){ return $x['row']; }, $distances), 0, 8);

    echo json_encode(["success" => true, "results" => $closest, "closest" => true, "message" => "No exact matches found; showing closest results."]);
    exit;

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage(), "results" => []]);
    exit;
}

?>