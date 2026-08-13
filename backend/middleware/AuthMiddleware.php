<?php
/**
 * Authentication Middleware
 * Validates session tokens and user permissions
 */

class AuthMiddleware {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Validate session and return user data
    public function validateSession() {
        $headers = getallheaders();
        $session_token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : '';
        
        if (empty($session_token)) {
            http_response_code(401);
            echo json_encode(array("success" => false, "message" => "No session token provided"));
            exit;
        }
        
        try {
            $query = "SELECT s.user_id, s.expires_at, u.email, u.first_name, u.last_name, u.user_type
                      FROM sessions s
                      JOIN users u ON s.user_id = u.id
                      WHERE s.session_token = :session_token AND s.expires_at > NOW() AND u.is_active = TRUE
                      LIMIT 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":session_token", $session_token);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                return $row;
            } else {
                http_response_code(401);
                echo json_encode(array("success" => false, "message" => "Invalid or expired session"));
                exit;
            }
        } catch(PDOException $exception) {
            http_response_code(500);
            echo json_encode(array("success" => false, "message" => "Database error: " . $exception->getMessage()));
            exit;
        }
    }
    
    // Check if user is admin
    public function requireAdmin() {
        $user = $this->validateSession();
        
        if ($user['user_type'] !== 'admin') {
            http_response_code(403);
            echo json_encode(array("success" => false, "message" => "Admin access required"));
            exit;
        }
        
        return $user;
    }
    
    // Check if user is regular user
    public function requireUser() {
        $user = $this->validateSession();
        
        if ($user['user_type'] !== 'user') {
            http_response_code(403);
            echo json_encode(array("success" => false, "message" => "User access required"));
            exit;
        }
        
        return $user;
    }
}
?>
