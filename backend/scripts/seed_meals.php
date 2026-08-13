<?php
/**
 * Seed sample meals for testing. Run via browser or CLI: php seed_meals.php
 */
require_once __DIR__ . '/../config/bootstrap.php';
$db = sofra_get_db_or_fail();

$samples = [
    ['name'=>'Margherita Pizza','description'=>'Classic Neapolitan pizza with fresh basil & mozzarella','price'=>149,'image_url'=>'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80','is_available'=>1,'category_id'=>1],
    ['name'=>'Four Cheese Pizza','description'=>'Mozzarella, cheddar, parmesan and blue cheese','price'=>179,'image_url'=>'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80','is_available'=>1,'category_id'=>1],
    ['name'=>'Chicken Avocado Bowl','description'=>'Grilled chicken, avocado, rice and fresh vegetables','price'=>169,'image_url'=>'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80','is_available'=>1,'category_id'=>6],
    ['name'=>'Pepperoni Pizza','description'=>'Pepperoni, mozzarella and tomato sauce','price'=>199,'image_url'=>'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=800&q=80','is_available'=>1,'category_id'=>1],
];

try {
    $countStmt = $db->query("SELECT COUNT(1) AS c FROM meals");
    $cnt = (int)$countStmt->fetchColumn();
    if ($cnt > 0) {
        echo "Meals table already has entries ($cnt). Aborting seed.\n";
        exit;
    }

    // created_at is left out on purpose: the column already has
    // DEFAULT CURRENT_TIMESTAMP in schema.sql, and MySQL doesn't understand
    // SQLite's datetime('now') function.
    $stmt = $db->prepare("INSERT INTO meals (category_id, name, description, price, image_url, is_available) VALUES (:category_id, :name, :description, :price, :image_url, :is_available)");
    foreach ($samples as $s) {
        $stmt->execute([
            ':category_id'=>$s['category_id'], ':name'=>$s['name'], ':description'=>$s['description'], ':price'=>$s['price'], ':image_url'=>$s['image_url'], ':is_available'=>$s['is_available']
        ]);
    }
    echo "Seeded " . count($samples) . " meals.\n";
} catch (PDOException $e){
    echo "Error seeding meals: " . $e->getMessage();
}

?>