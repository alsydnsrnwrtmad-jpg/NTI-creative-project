<?php
/**
 * Database Configuration
 * Sofra Restaurant Management System
 */

class Database {
    private $host = "localhost";
    private $db_name = "sofra_db";
    private $username = "root";
    // Empty by default to match a stock XAMPP install (root has no password
    // out of the box). Change this to your own MySQL root password if you
    // set one, otherwise every API call will fail with "Database connection
    // failed" (see the "details" field in the JSON response for the exact
    // PDO error, e.g. "Access denied for user 'root'@'localhost'").
    private $password = "1234";
    public $conn;

    public $connectionError = null;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            // Never echo here: any stray output before json_encode() in the
            // API endpoints corrupts the JSON response and breaks fetch() on
            // the frontend with "Network error occurred". Store the message
            // instead so the calling endpoint can return it as clean JSON.
            $this->connectionError = $exception->getMessage();
            $this->conn = null;
        }

        return $this->conn;
    }
}
?>
