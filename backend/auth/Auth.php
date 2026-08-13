<?php
/**
 * Authentication Class
 * Handles User Registration, Login, and Session Management
 */

class Auth {
    private $conn;
    private $table_name = "users";
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    // Register new user
    public function register($data) {
        try {
            // Check if email already exists
            $query = "SELECT id FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":email", $data['email']);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                return array("success" => false, "message" => "Email already exists");
            }
            
            // Hash password
            $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);
            
            // Insert new user
            $query = "INSERT INTO " . $this->table_name . " 
                      SET email=:email, password=:password, first_name=:first_name, 
                          last_name=:last_name, user_type=:user_type, phone=:phone";
            
            $stmt = $this->conn->prepare($query);
            
            // Sanitize data
            $data['email'] = htmlspecialchars(strip_tags($data['email']));
            $data['first_name'] = htmlspecialchars(strip_tags($data['first_name']));
            $data['last_name'] = htmlspecialchars(strip_tags($data['last_name']));
            $data['phone'] = htmlspecialchars(strip_tags($data['phone']));
            
            // Bind parameters
            $stmt->bindParam(":email", $data['email']);
            $stmt->bindParam(":password", $hashed_password);
            $stmt->bindParam(":first_name", $data['first_name']);
            $stmt->bindParam(":last_name", $data['last_name']);
            $stmt->bindParam(":user_type", $data['user_type']);
            $stmt->bindParam(":phone", $data['phone']);
            
            if ($stmt->execute()) {
                $user_id = $this->conn->lastInsertId();
                return array("success" => true, "message" => "Registration successful", "user_id" => $user_id);
            } else {
                return array("success" => false, "message" => "Registration failed");
            }
        } catch(PDOException $exception) {
            return array("success" => false, "message" => "Database error: " . $exception->getMessage());
        }
    }
    
    // Login user
    public function login($email, $password, $user_type) {
        try {
            $query = "SELECT id, email, password, first_name, last_name, user_type 
                      FROM " . $this->table_name . " 
                      WHERE email = :email AND user_type = :user_type AND is_active = TRUE LIMIT 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":email", $email);
            $stmt->bindParam(":user_type", $user_type);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if (password_verify($password, $row['password'])) {
                    // Generate session token
                    $session_token = bin2hex(random_bytes(32));
                    $expires_at = date('Y-m-d H:i:s', strtotime('+24 hours'));
                    
                    // Store session in database
                    $session_query = "INSERT INTO sessions SET user_id=:user_id, session_token=:session_token, expires_at=:expires_at";
                    $session_stmt = $this->conn->prepare($session_query);
                    $session_stmt->bindParam(":user_id", $row['id']);
                    $session_stmt->bindParam(":session_token", $session_token);
                    $session_stmt->bindParam(":expires_at", $expires_at);
                    $session_stmt->execute();
                    
                    // Return user data with session token
                    return array(
                        "success" => true,
                        "message" => "Login successful",
                        "user" => array(
                            "id" => $row['id'],
                            "email" => $row['email'],
                            "first_name" => $row['first_name'],
                            "last_name" => $row['last_name'],
                            "user_type" => $row['user_type']
                        ),
                        "session_token" => $session_token
                    );
                } else {
                    return array("success" => false, "message" => "Invalid password");
                }
            } else {
                return array("success" => false, "message" => "User not found or account inactive");
            }
        } catch(PDOException $exception) {
            return array("success" => false, "message" => "Database error: " . $exception->getMessage());
        }
    }
    
    // Verify session token
    public function verifySession($session_token) {
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
                return array("valid" => true, "user" => $row);
            } else {
                return array("valid" => false, "message" => "Invalid or expired session");
            }
        } catch(PDOException $exception) {
            return array("valid" => false, "message" => "Database error: " . $exception->getMessage());
        }
    }
    
    // Logout user
    public function logout($session_token) {
        try {
            $query = "DELETE FROM sessions WHERE session_token = :session_token";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":session_token", $session_token);
            $stmt->execute();
            
            return array("success" => true, "message" => "Logout successful");
        } catch(PDOException $exception) {
            return array("success" => false, "message" => "Database error: " . $exception->getMessage());
        }
    }
}
?>
