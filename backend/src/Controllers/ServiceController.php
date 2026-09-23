<?php
// src/Controllers/ServiceController.php
namespace App\Controllers;

use App\Helpers\Response;
use App\Models\Service;
use Exception;

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

    /**
     * Upload service image.
     */
    public function uploadImage($id) {
        try {
            $user = $GLOBALS['user'] ?? null;
            if (!$user) {
                return Response::error('Unauthorized', 401);
            }

            // Check service exists FIRST (before touching the file)
            $service = Service::find($id);
            if (!$service) {
                return Response::notFound('Service not found');
            }

            if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                return Response::error('No image file provided or upload error', 400);
            }

            $file = $_FILES['image'];
            $originalName = $_POST['original_name'] ?? $file['name'];

            // Validate mime
            $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);

            if (!in_array($mimeType, $allowedTypes, true)) {
                return Response::error('Invalid image type. Allowed: JPEG, PNG, WEBP, GIF', 400);
            }

            // 25 MB limit
            $maxSize = 25 * 1024 * 1024;
            if ($file['size'] > $maxSize) {
                return Response::error('Image too large. Max size: 25MB', 400);
            }

            // Unique filename
            $extension     = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
            $baseName      = pathinfo($originalName, PATHINFO_FILENAME);
            $cleanBaseName = preg_replace('/[^a-zA-Z0-9_-]/', '', $baseName) ?: 'service';
            $filename      = $cleanBaseName . '_' . time() . '_' . uniqid() . '.' . $extension;

            $uploadDir = __DIR__ . '/../../uploads/services/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $targetPath = $uploadDir . $filename;
            if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
                return Response::error('Failed to upload image', 500);
            }

            $imagePath = '/uploads/services/' . $filename;

            // Delete old image if it was inside uploads/
            if (!empty($service['image'])) {
                $uploadsRoot = realpath(__DIR__ . '/../../uploads');
                $oldPath     = realpath(__DIR__ . '/../..' . $service['image']);
                if ($oldPath && $uploadsRoot && strpos($oldPath, $uploadsRoot) === 0 && file_exists($oldPath)) {
                    @unlink($oldPath);
                }
            }

            // Persist
            Service::update($id, ['image' => $imagePath]);

            return Response::success([
                'success'       => true,
                'path'          => $imagePath,
                'url'           => $this->getImageUrl($imagePath),
                'original_name' => $originalName,
            ], 'Image uploaded successfully');

        } catch (Exception $e) {
            error_log("Service uploadImage exception: " . $e->getMessage());
            return Response::error('Upload failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete service image.
     */
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

            $uploadsRoot = realpath(__DIR__ . '/../../uploads');
            $fullPath    = realpath(__DIR__ . '/../..' . $imagePath);

            if ($fullPath && $uploadsRoot && strpos($fullPath, $uploadsRoot) === 0 && file_exists($fullPath)) {
                @unlink($fullPath);
            }

            Service::update($id, ['image' => null]);

            return Response::success(null, 'Image deleted successfully');

        } catch (Exception $e) {
            error_log("Service deleteImage exception: " . $e->getMessage());
            return Response::error('Delete failed: ' . $e->getMessage(), 500);
        }
    }

    private function getImageUrl($path) {
        if (empty($path)) {
            return null;
        }
        $baseUrl = $_ENV['APP_URL'] ?? 'http://localhost:8000/';
        return rtrim($baseUrl, '/') . $path;
    }
}