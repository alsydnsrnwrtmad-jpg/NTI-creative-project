<?php
/**
 * Sofra — Register API Endpoint
 * المسؤول عن استقبال البيانات، تنظيفها، فحصها، وتجميع الأخطاء في مصفوفة
 */

// 1. إخبار المتصفح أن الرد سيكون بصيغة JSON
header('Content-Type: application/json; charset=UTF-8');

// استدعاء ملف التهيئة وقاعدة البيانات
require_once __DIR__ . '/../config/bootstrap.php';

$db = sofra_get_db_or_fail();
$auth = new Auth($db);

// 2. استقبال البيانات الواردة كـ JSON من الجافاسكريبت وفك تشفيرها
$inputData = json_decode(file_get_contents("php://input"));

$errors = array();

// 3. تنظيف البيانات وحمايتها من الثغرات (مثل XSS أو الفراغات الزائدة)
$first_name       = isset($inputData->first_name) ? strip_tags(trim($inputData->first_name)) : '';
$last_name        = isset($inputData->last_name) ? strip_tags(trim($inputData->last_name)) : '';
$email            = isset($inputData->email) ? filter_var(trim($inputData->email), FILTER_SANITIZE_EMAIL) : '';
$password = isset($inputData->password) ? trim($inputData->password) : '';
$confirm_password = isset($inputData->confirm_password) ? trim($inputData->confirm_password) : '';
$terms            = isset($inputData->terms) ? filter_var($inputData->terms, FILTER_VALIDATE_BOOLEAN) : false;
$user_type        = isset($inputData->user_type) ? strip_tags(trim($inputData->user_type)) : 'user';

// 4. الفحص (Validation) وتجميع كل الأخطاء في مصفوفة errors
if (empty($first_name)) {
    $errors[] = "First name is required.";
}

if (empty($last_name)) {
    $errors[] = "Last name is required.";
}

if (empty($email)) {
    $errors[] = "Email address is required.";
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Invalid email format. Please provide a valid email address.";
}

if (empty($password)) {
    $errors[] = "Password is required.";
}

if (empty($confirm_password)) {
    $errors[] = "Please confirm your password.";
}

// فحص الشروط والأحكام (الـ Checkbox)
if (!$terms) {
    $errors[] = "You must accept the terms of service and privacy policy.";
}

// فحص تطابق كلمات المرور
if (!empty($password) && !empty($confirm_password) && $password !== $confirm_password) {
    $errors[] = "Passwords do not match.";
}

// فحص قوة كلمة المرور (حرف كبير، حرف صغير، أرقام، رموز خاصة، 8 أحرف فأكثر)
$pattern = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/';
if (!empty($password) && !preg_match($pattern, $password)) {
    $errors[] = "Password must contain at least one uppercase letter, one lowercase letter,numbers and be at least 8 characters long.";
}

// 5. النقطة الفاصلة: لو مصفوفة الأخطاء فيها أي عنصر، نوقف الكود ونرجعها للجافاسكريبت
if (!empty($errors)) {
    http_response_code(400); // Bad Request
    echo json_encode(array(
        "success" => false,
        "errors" => $errors // دي المصفوفة اللي الجافاسكريبت هيعملها foreach
    ));
    exit(); // إيقاف تام لتنفيذ الكود لمنع أي تسجيل خاطئ
}

// 6. لو كله تمام، نجهز البيانات ونبعتها لقاعدة البيانات عبر كلاس الـ Auth
$user_data = array(
    'email' => $email,
    'password' => $password,
    'first_name' => $first_name,
    'last_name' => $last_name,
    'user_type' => $user_type
);

$result = $auth->register($user_data);

if ($result['success']) {
    http_response_code(201); // Created
    echo json_encode($result);
} else {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "errors" => array($result['message'] ?? "Registration failed. Email might already exist.")
    ));
}