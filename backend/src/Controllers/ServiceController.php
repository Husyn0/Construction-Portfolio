<?php
// backend/src/Controllers/ServiceController.php
namespace App\Controllers;

use App\Helpers\Response;
use App\Models\Service;

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '/tmp/php_errors.log');

class ServiceController {
    public function index() {
        $services = Service::getAll();
        return Response::success($services);
    }

    public function show($id) {
        $service = Service::find($id);
        if (!$service) {
            return Response::notFound('Service not found');
        }
        return Response::success($service);
    }

    public function store() {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $required = ['title', 'icon', 'description'];
        foreach ($required as $field) {
            if (empty($input[$field])) {
                return Response::error("Field '{$field}' is required", 400);
            }
        }
        
        $result = Service::create($input);
        if ($result) {
            return Response::success(null, 'Service created successfully', 201);
        }
        return Response::error('Failed to create service', 500);
    }

    public function update($id) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        $service = Service::find($id);
        if (!$service) {
            return Response::notFound('Service not found');
        }
        
        $result = Service::update($id, $input);
        if ($result) {
            return Response::success(null, 'Service updated successfully');
        }
        return Response::error('Failed to update service', 500);
    }

    public function delete($id) {
        $service = Service::find($id);
        if (!$service) {
            return Response::notFound('Service not found');
        }
        
        $result = Service::delete($id);
        if ($result) {
            return Response::success(null, 'Service deleted successfully');
        }
        return Response::error('Failed to delete service', 500);
    }

    // public function uploadImage($id) {
    //     try {
    //         $user = $GLOBALS['user'] ?? null;
    //         if (!$user) {
    //             return Response::error('Unauthorized', 401);
    //         }
            
    //         if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    //             return Response::error('No image file provided or upload error', 400);
    //         }
            
    //         $file = $_FILES['image'];
    //         $originalName = $_POST['original_name'] ?? $file['name'];
            
    //         // Validate image type
    //         $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    //         $finfo = finfo_open(FILEINFO_MIME_TYPE);
    //         $mimeType = finfo_file($finfo, $file['tmp_name']);
    //         finfo_close($finfo);
            
    //         if (!in_array($mimeType, $allowedTypes)) {
    //             return Response::error('Invalid image type. Allowed: JPEG, PNG, WEBP, GIF', 400);
    //         }
            
    //         // Validate file size (5MB max)
    //         $maxSize = 5 * 1024 * 1024;
    //         if ($file['size'] > $maxSize) {
    //             return Response::error('Image too large. Max size: 5MB', 400);
    //         }
            
    //         // Check if service exists
    //         $service = Service::find($id);
    //         if (!$service) {
    //             return Response::notFound('Service not found');
    //         }
            
    //         // Generate unique filename
    //         $extension = pathinfo($originalName, PATHINFO_EXTENSION);
    //         $baseName = pathinfo($originalName, PATHINFO_FILENAME);
    //         $cleanBaseName = preg_replace('/[^a-zA-Z0-9_-]/', '', $baseName);
    //         $filename = $cleanBaseName . '_' . time() . '_' . uniqid() . '.' . $extension;
            
    //         // Create upload directory if it doesn't exist
    //         $uploadDir = __DIR__ . '/../../uploads/services/';
    //         if (!is_dir($uploadDir)) {
    //             mkdir($uploadDir, 0755, true);
    //         }
            
    //         // Move uploaded file
    //         $targetPath = $uploadDir . $filename;
    //         if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    //             return Response::error('Failed to upload image', 500);
    //         }
            
    //         $imagePath = '/uploads/services/' . $filename;
            
    //         // Update service with image path
    //         $result = Service::update($id, ['image' => $imagePath]);
            
    //         if ($result) {
    //             return Response::success([
    //                 'success' => true,
    //                 'path' => $imagePath,
    //                 'url' => $this->getImageUrl($imagePath),
    //                 'original_name' => $originalName
    //             ], 'Image uploaded successfully');
    //         }
            
    //         return Response::error('Failed to update service with image', 500);
            
    //     } catch (\Exception $e) {
    //         return Response::error('Upload failed: ' . $e->getMessage(), 500);
    //     }
    // }


public function uploadImage($id) {
    try {
        // Log everything
        error_log("=== SERVICE UPLOAD IMAGE CALLED ===");
        error_log("Service ID: " . $id);
        error_log("FILES: " . print_r($_FILES, true));
        error_log("POST: " . print_r($_POST, true));
        
        $user = $GLOBALS['user'] ?? null;
        if (!$user) {
            error_log("User not authenticated");
            return Response::error('Unauthorized', 401);
        }
        
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            error_log("File upload error: " . ($_FILES['image']['error'] ?? 'No file'));
            return Response::error('No image file provided or upload error', 400);
        }
        
        $file = $_FILES['image'];
        $originalName = $_POST['original_name'] ?? $file['name'];
        
        // Validate image type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!in_array($mimeType, $allowedTypes)) {
            return Response::error('Invalid image type. Allowed: JPEG, PNG, WEBP, GIF', 400);
        }
        
        // Validate file size (5MB max)
        $maxSize = 5 * 1024 * 1024;
        if ($file['size'] > $maxSize) {
            return Response::error('Image too large. Max size: 5MB', 400);
        }
        
        // Generate unique filename
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $baseName = pathinfo($originalName, PATHINFO_FILENAME);
        $cleanBaseName = preg_replace('/[^a-zA-Z0-9_-]/', '', $baseName);
        $filename = $cleanBaseName . '_' . time() . '_' . uniqid() . '.' . $extension;
        
        // Create upload directory if it doesn't exist
        $uploadDir = __DIR__ . '/../../uploads/services/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Move uploaded file
        $targetPath = $uploadDir . $filename;
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            error_log("Failed to move uploaded file");
            return Response::error('Failed to upload image', 500);
        }
        
        $imagePath = '/uploads/services/' . $filename;
        
        // Check if service exists
        $service = Service::find($id);
        if (!$service) {
            error_log("Service not found: " . $id);
            return Response::notFound('Service not found');
        }
        
        // Update service with image path
        $result = Service::update($id, ['image' => $imagePath]);
        error_log("Update result: " . ($result ? 'SUCCESS' : 'FAILED'));
        
        if ($result) {
            return Response::success([
                'success' => true,
                'path' => $imagePath,
                'url' => $this->getImageUrl($imagePath),
                'original_name' => $originalName
            ], 'Image uploaded successfully');
        }
        
        return Response::error('Failed to update service with image', 500);
        
    } catch (Exception $e) {
        error_log("EXCEPTION: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        return Response::error('Upload failed: ' . $e->getMessage(), 500);
    }
}

    public function deleteImage($id) {
        try {
            $user = $GLOBALS['user'] ?? null;
            if (!$user) {
                return Response::error('Unauthorized', 401);
            }
            
            $service = Service::find($id);
            if (!$service) {
                return Response::notFound('Service not found');
            }
            
            if (empty($service['image'])) {
                return Response::error('No image to delete', 404);
            }
            
            $imagePath = $service['image'];
            
            // Delete physical file
            $fullPath = __DIR__ . '/../..' . $imagePath;
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
            
            // Remove image from database
            $result = Service::update($id, ['image' => null]);
            
            if ($result) {
                return Response::success(null, 'Image deleted successfully');
            }
            
            return Response::error('Failed to delete image', 500);
            
        } catch (\Exception $e) {
            return Response::error('Delete failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Helper: Get full image URL
     */
    private function getImageUrl($path) {
        if (empty($path)) {
            return null;
        }
        
        $baseUrl = $_ENV['APP_URL'] ?? 'http://localhost:8000/';
        return rtrim($baseUrl, '/') . $path;
    }
}