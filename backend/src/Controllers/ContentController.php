<?php
// src/Controllers/ContentController.php
namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\Database;
use App\Models\Content;
use Exception;
use PDO;
// Add at the top of the file
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '/tmp/php_errors.log');

class ContentController {
    
    /**
     * Get content for a specific section
     */
    public function get($section) {
        $content = Content::getLatest($section);
        if (!$content) {
            return Response::notFound('Content not found');
        }
    
        // Decode data
        $data = $content['data'];
        if (is_string($data)) {
            $decoded = json_decode($data, true);
            if ($decoded === null && is_string($data)) {
                $cleanData = trim($data);
                if (strpos($cleanData, '"') === 0) {
                    $cleanData = stripslashes($cleanData);
                    $cleanData = trim($cleanData, '"');
                    $cleanData = stripslashes($cleanData);
                    $decoded = json_decode($cleanData, true);
                }
            }
            $data = $decoded ?: [];
        }
        
        // Add image fields to response
        $response = $data;
        if (is_array($response)) {
            $response['image_1'] = $content['image_1'] ?? null;
            $response['image_1_alt'] = $content['image_1_alt'] ?? null;
            $response['image_2'] = $content['image_2'] ?? null;
            $response['image_2_alt'] = $content['image_2_alt'] ?? null;
        }

        return Response::success($response);
    }

    /**
     * Get all content sections
     */
    public function getAll() {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->query("
            SELECT *
            FROM content 
            ORDER BY section, created_at DESC
        ");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($results)) {
            return Response::success([]);  
        }
        
        // Group by section and get latest for each
        $sections = [];
        foreach ($results as $row) {
            $section = $row['section'];
            if (!isset($sections[$section])) {
                // Decode data
                $data = $row['data'];
                if (is_string($data)) {
                    $decoded = json_decode($data, true);
                    if ($decoded === null && is_string($data)) {
                        $cleanData = trim($data);
                        if (strpos($cleanData, '"') === 0) {
                            $cleanData = stripslashes($cleanData);
                            $cleanData = trim($cleanData, '"');
                            $cleanData = stripslashes($cleanData);
                            $decoded = json_decode($cleanData, true);
                        }
                    }
                    $data = $decoded ?: [];
                }
                
                $sections[$section] = [
                    'section' => $section,
                    'data' => $data,
                    'image_1' => $row['image_1'],
                    'image_1_alt' => $row['image_1_alt'],
                    'image_2' => $row['image_2'],
                    'image_2_alt' => $row['image_2_alt'],
                    'is_published' => $row['is_published'],
                    'created_at' => $row['created_at'],
                    'updated_at' => $row['updated_at']
                ];
            }
        }
        
        return Response::success(array_values($sections));
    }

    /**
     * Get content history for a section
     */
    public function history($section) {
        $history = Content::getHistory($section);
        if (empty($history)) {
            return Response::notFound('No history found for this section');
        }
        
        // Process each history entry
        foreach ($history as &$entry) {
            if (isset($entry['data']) && is_string($entry['data'])) {
                $decoded = json_decode($entry['data'], true);
                if ($decoded === null) {
                    $cleanData = trim($entry['data']);
                    if (strpos($cleanData, '"') === 0) {
                        $cleanData = stripslashes($cleanData);
                        $cleanData = trim($cleanData, '"');
                        $cleanData = stripslashes($cleanData);
                        $decoded = json_decode($cleanData, true);
                    }
                }
                $entry['data'] = $decoded ?: [];
            }
        }
        
        return Response::success($history);
    }

    /**
     * Update content for a specific section
     */
    public function update($section) {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['data'])) {
            return Response::error('Data is required', 400);
        }
        
        $user = $GLOBALS['user'] ?? null;
        $isPublished = $input['is_published'] ?? true;
        $data = $input['data'];
        
        // Extract image fields from INPUT root level
        $image1 = $input['image_1'] ?? null;
        $image1Alt = $input['image_1_alt'] ?? null;
        $image2 = $input['image_2'] ?? null;
        $image2Alt = $input['image_2_alt'] ?? null;
        
        // Remove from data if they exist there
        unset($data['image_1']);
        unset($data['image_1_alt']);
        unset($data['image_2']);
        unset($data['image_2_alt']);
        
        // Create new version
        $result = Content::create([
            'section' => $section,
            'data' => json_encode($data),
            'last_modified_by' => $user ? $user['id'] : null,
            'is_published' => $isPublished,
            'image_1' => $image1,
            'image_1_alt' => $image1Alt,
            'image_2' => $image2,
            'image_2_alt' => $image2Alt
        ]);
        
        if (!$result) {
            return Response::error('Failed to update content', 500);
        }
        
        return Response::success([
            'section' => $section,
            'data' => $data,
            'image_1' => $image1,
            'image_1_alt' => $image1Alt,
            'image_2' => $image2,
            'image_2_alt' => $image2Alt
        ], 'Content updated successfully');
    }

    /**
     * Upload image for content section
     */
public function uploadImage($section) {
    try {
        // Log everything
        error_log("=== UPLOAD IMAGE CALLED ===");
        error_log("Section: " . $section);
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
        $imageField = $_POST['field'] ?? 'image_1';
        $originalName = $_POST['original_name'] ?? $file['name'];
        
        error_log("Image Field: " . $imageField);
        error_log("Original Name: " . $originalName);
        error_log("Temp File: " . $file['tmp_name']);
        
        // Validate image type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        error_log("MIME Type: " . $mimeType);
        
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
        $uploadDir = __DIR__ . '/../../uploads/content/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
            error_log("Created upload directory: " . $uploadDir);
        }
        
        // Move uploaded file
        $targetPath = $uploadDir . $filename;
        error_log("Target Path: " . $targetPath);
        
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            error_log("Failed to move uploaded file");
            return Response::error('Failed to upload image', 500);
        }
        
        $imagePath = '/uploads/content/' . $filename;
        error_log("Image Path: " . $imagePath);
        
        // Update database
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM content WHERE section = ? ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([$section]);
        $currentContent = $stmt->fetch(PDO::FETCH_ASSOC);
        
        error_log("Current Content: " . print_r($currentContent, true));
        
        if ($currentContent) {
            error_log("Updating existing record ID: " . $currentContent['id']);
            $stmt = $db->prepare("UPDATE content SET {$imageField} = ? WHERE id = ?");
            $result = $stmt->execute([$imagePath, $currentContent['id']]);
            error_log("Update result: " . ($result ? 'SUCCESS' : 'FAILED'));
        } else {
            error_log("Creating new record");
            $stmt = $db->prepare("INSERT INTO content (section, data, {$imageField}, is_published) VALUES (?, '{}', ?, 1)");
            $result = $stmt->execute([$section, $imagePath]);
            error_log("Insert result: " . ($result ? 'SUCCESS' : 'FAILED'));
        }
        
        return Response::success([
            'success' => true,
            'path' => $imagePath,
            'url' => $this->getImageUrl($imagePath),
            'original_name' => $originalName,
            'field' => $imageField
        ], 'Image uploaded successfully');
        
    } catch (Exception $e) {
        error_log("EXCEPTION: " . $e->getMessage());
        error_log("Stack trace: " . $e->getTraceAsString());
        return Response::error('Upload failed: ' . $e->getMessage(), 500);
    }
}

    /**
     * Delete image for content section
     */
    public function deleteImage($section) {
        try {
            $user = $GLOBALS['user'] ?? null;
            if (!$user) {
                return Response::error('Unauthorized', 401);
            }
            
            $imageField = $_POST['field'] ?? 'image_1';
            
            $db = Database::getInstance()->getConnection();

            // Get current image path
            $stmt = $db->prepare("SELECT {$imageField} FROM content WHERE section = ? ORDER BY created_at DESC LIMIT 1");
            $stmt->execute([$section]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$result || empty($result[$imageField])) {
                return Response::error('No image to delete', 404);
            }
            
            $imagePath = $result[$imageField];
            
            // Delete physical file
            $fullPath = __DIR__ . '/../..' . $imagePath;
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
            
            // Remove from database
            $stmt = $db->prepare("UPDATE content SET {$imageField} = NULL WHERE section = ? ORDER BY created_at DESC LIMIT 1");
            $stmt->execute([$section]);
            
            return Response::success(null, 'Image deleted successfully');
            
        } catch (Exception $e) {
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