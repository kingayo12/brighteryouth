<?php
header('Content-Type: application/json');

// Database credentials
$servername = "https:\\togetheraiding.com"; // usually "localhost" in cPanel
$username = "zjjinlsh_kingsdev";
$password = "Kings1245!@#";
$dbname = "zjjinlsh_brighter_youth"; // e.g. brighteryouth_db

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed."]);
    exit;
}

// Read POST data
$data = json_decode(file_get_contents("php://input"), true);
$email = $data["email"] ?? "";
$passwordInput = $data["password"] ?? "";

if (empty($email) || empty($passwordInput)) {
    echo json_encode(["success" => false, "message" => "Email and password are required."]);
    exit;
}

// Get user
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    $storedHash = $user["password_hash"];

    if (hash('sha256', $passwordInput) === $storedHash) {
        echo json_encode([
            "success" => true,
            "message" => "Login successful!",
            "username" => $user["username"]
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Invalid password."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "User not found."]);
}

$stmt->close();
$conn->close();
?>
