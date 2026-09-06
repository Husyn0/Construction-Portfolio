<?php
// index.php
require_once __DIR__ . '/vendor/autoload.php';

// Load environment variables
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Error handling
if ($_ENV['APP_DEBUG'] ?? false) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Constants
$api = '/api/v1';
$controllers = 'App\\Controllers\\';

// CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (preg_match('/^http:\/\/localhost:\d+$/', $origin)) {
    header('Access-Control-Allow-Origin: ' . ($_ENV['CORS_ORIGIN'] ?? '*'));
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Initialize router
$router = new App\Routes\Router();

// Auth Routes
$router->post("$api/auth/login", [$controllers . 'AuthController', 'login']);
$router->post("$api/auth/register", [$controllers . 'AuthController', 'register']);
$router->get("$api/auth/me", [$controllers . 'AuthController', 'me']);
$router->post("$api/auth/logout", [$controllers . 'AuthController', 'logout']);
$router->put("$api/auth/update", [$controllers . 'AuthController', 'updateProfile']);

// Content Routes (Hero, About, Services, Contact)
$router->get("$api/content/{section}", [$controllers . 'ContentController', 'get']);
$router->get("$api/content/all", [$controllers . 'ContentController', 'getAll']);
$router->put("$api/content/{section}", [$controllers . 'ContentController', 'update']);
$router->get("$api/content/{section}/history", [$controllers . 'ContentController', 'history']);
$router->post("$api/content/{section}/revert/{version}", [$controllers . 'ContentController', 'revert']);

// Image upload routes for content sections
$router->post("$api/content/{section}/upload-image", [$controllers . 'ContentController', 'uploadImage']);
$router->put("$api/content/{section}/upload-image", [$controllers . 'ContentController', 'uploadImage']);
$router->delete("$api/content/{section}/delete-image", [$controllers . 'ContentController', 'deleteImage']);

// Project Routes (separate table)
$router->get("$api/projects", [$controllers . 'ProjectController', 'index']);
$router->get("$api/projects/{id}", [$controllers . 'ProjectController', 'show']);
$router->post("$api/projects", [$controllers . 'ProjectController', 'store']);
$router->put("$api/projects/{id}", [$controllers . 'ProjectController', 'update']);
$router->delete("$api/projects/{id}", [$controllers . 'ProjectController', 'delete']);
$router->put("$api/projects/reorder", [$controllers . 'ProjectController', 'reorder']);

// Service Routes (separate table)
$router->get("$api/services", [$controllers . 'ServiceController', 'index']);
$router->get("$api/services/{id}", [$controllers . 'ServiceController', 'show']);
$router->post("$api/services", [$controllers . 'ServiceController', 'store']);
$router->put("$api/services/{id}", [$controllers . 'ServiceController', 'update']);
$router->delete("$api/services/{id}", [$controllers . 'ServiceController', 'delete']);
$router->put("$api/services/reorder", [$controllers . 'ServiceController', 'reorder']);

// Team Routes (separate table)
$router->get("$api/team", [$controllers . 'TeamController', 'index']);
$router->get("$api/team/{id}", [$controllers . 'TeamController', 'show']);
$router->post("$api/team", [$controllers . 'TeamController', 'store']);
$router->put("$api/team/{id}", [$controllers . 'TeamController', 'update']);
$router->delete("$api/team/{id}", [$controllers . 'TeamController', 'delete']);
$router->put("$api/team/reorder", [$controllers . 'TeamController', 'reorder']);



// Dispatch
$router->dispatch();