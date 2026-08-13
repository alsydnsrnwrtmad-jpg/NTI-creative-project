<?php
/**
 * Create Order API Endpoint
 * POST /api/create_order.php
 * Requires Authorization: Bearer <session_token>
 */

require_once __DIR__ . '/../config/bootstrap.php';

$db = sofra_get_db_or_fail();
$auth = new Auth($db);

// Get Authorization header (Bearer token)
$headers = null;
if (function_exists('getallheaders')) {
    $headers = getallheaders();
}
$authHeader = null;
if (!empty($headers) && isset($headers['Authorization'])) {
    $authHeader = $headers['Authorization'];
} elseif (!empty($headers) && isset($headers['authorization'])) {
    $authHeader = $headers['authorization'];
} elseif (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
}

$token = null;
if ($authHeader) {
    if (preg_match('/Bearer\s+(\S+)/i', $authHeader, $matches)) {
        $token = $matches[1];
    } else {
        $token = trim($authHeader);
    }
}

// Require login
if (!$token) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Authentication required"]);
    exit;
}

$session = $auth->verifySession($token);
if (!$session || empty($session['valid'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Invalid or expired session"]);
    exit;
}

$user = $session['user'];
$user_id = $user['user_id'] ?? $user['id'] ?? null;
if (!$user_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Unable to determine user from session"]);
    exit;
}

// Read request body
$data = json_decode(file_get_contents('php://input'), true);
if (!$data || empty($data['cart']) || !is_array($data['cart'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid payload. 'cart' array required."]);
    exit;
}

$cart = $data['cart'];
$delivery_fee = isset($data['delivery_fee']) ? (float)$data['delivery_fee'] : 0.0;
$payment_method = isset($data['payment_method']) ? $data['payment_method'] : 'cash';
$delivery_address = isset($data['delivery_address']) ? $data['delivery_address'] : '';
$phone = isset($data['phone']) ? $data['phone'] : '';
$notes = isset($data['notes']) ? $data['notes'] : '';

// Calculate total from cart (defensive)
$subtotal = 0.0;
foreach ($cart as $item) {
    $price = isset($item['price']) ? (float)$item['price'] : 0.0;
    $qty = isset($item['quantity']) ? (int)$item['quantity'] : 0;
    $subtotal += $price * $qty;
}
$total = $subtotal + $delivery_fee;

try {
    // Start transaction
    $db->beginTransaction();

    // Insert order
    $orderQuery = "INSERT INTO orders (user_id, total_amount, status, payment_method, payment_status, delivery_address, phone, notes) VALUES (:user_id, :total_amount, 'pending', :payment_method, 'pending', :delivery_address, :phone, :notes)";
    $stmt = $db->prepare($orderQuery);
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->bindParam(':total_amount', $total);
    $stmt->bindParam(':payment_method', $payment_method);
    $stmt->bindParam(':delivery_address', $delivery_address);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':notes', $notes);
    $stmt->execute();

    $order_id = $db->lastInsertId();

    // Insert order items
    $itemQuery = "INSERT INTO order_items (order_id, meal_id, quantity, price) VALUES (:order_id, :meal_id, :quantity, :price)";
    $itemStmt = $db->prepare($itemQuery);
    foreach ($cart as $item) {
        $meal_id = isset($item['id']) ? (int)$item['id'] : null;
        $qty = isset($item['quantity']) ? (int)$item['quantity'] : 0;
        $price = isset($item['price']) ? (float)$item['price'] : 0.0;
        if (!$meal_id || $qty <= 0) continue;
        $itemStmt->bindParam(':order_id', $order_id, PDO::PARAM_INT);
        $itemStmt->bindParam(':meal_id', $meal_id, PDO::PARAM_INT);
        $itemStmt->bindParam(':quantity', $qty, PDO::PARAM_INT);
        $itemStmt->bindParam(':price', $price);
        $itemStmt->execute();
    }

    $db->commit();

    // Optional: try to notify admin by email (best-effort)
    $adminEmail = 'admin@sofra.com';
    $subject = "New order #$order_id received";
    $message = "A new order (ID: $order_id) was placed by user ID $user_id. Total: $total.\n\nNotes: $notes";
    // Suppress errors from mail() to avoid breaking API response
    @mail($adminEmail, $subject, $message);

    // Ensure notifications table exists (it's also created by schema.sql, this
    // is just a safety net for MySQL), then insert an in-app notification for admin
    try {
        $db->exec("CREATE TABLE IF NOT EXISTS notifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            body TEXT NOT NULL,
            is_read TINYINT(1) DEFAULT 0,
            meta TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        $notifStmt = $db->prepare("INSERT INTO notifications (title, body, is_read, meta) VALUES (:title, :body, 0, :meta)");
        $notifStmt->execute([
            ':title' => $subject,
            ':body' => $message,
            ':meta' => json_encode(['order_id'=>$order_id, 'user_id'=>$user_id, 'total'=>$total])
        ]);
    } catch (PDOException $e) {
        // ignore notification errors (don't fail order creation because of notifications)
        error_log('Notification insert failed: ' . $e->getMessage());
    }

    echo json_encode(["success" => true, "order_id" => $order_id, "message" => "Order created and admin notified (if mail configured)."]);
    exit;
} catch (PDOException $e) {
    if ($db->inTransaction()) $db->rollBack();
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    exit;
}

?>