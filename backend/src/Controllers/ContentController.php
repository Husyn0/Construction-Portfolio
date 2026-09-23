<?php
// src/Controllers/ContentController.php
namespace App\Controllers;

use App\Helpers\Response;
use App\Helpers\Database;
use App\Models\Content;
use Exception;
use PDO;

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '/tmp/php_errors.log');

class ContentController {

    /**
     * Decode the JSON payload stored in content.data
     * (handles double-encoded legacy rows).
     */
    private function decodeData($data) {
        if (!is_string($data)) {
            return is_array($data) ? $data : [];
        }

        $decoded = json_decode($data, true);
        if ($decoded !== null) {
            return $decoded;
        }

        // Try to un-double-encode legacy rows like: "\"{...}\""
        $clean = trim($data);
        if (strpos($clean, '"') === 0) {
            $clean = stripslashes($clean);
            $clean = trim($clean, '"');
            $clean = stripslashes($clean);
            $decoded = json_decode($clean, true);
        }

        return $decoded ?: [];
    }

    /**
     * Get content for a specific section.
     */
    public function get($section) {
        $content = Content::getLatest($section);
        if (!$content) {
            return Response::notFound('Content not found');
        }

        $data = $this->decodeData($content['data']);

        $response = is_array($data) ? $data : [];
        $response['image_1']     = $content['image_1']     ?? null;
        $response['image_1_alt'] = $content['image_1_alt'] ?? null;
        $response['image_2']     = $content['image_2']     ?? null;
        $response['image_2_alt'] = $content['image_2_alt'] ?? null;

        return Response::success($response);
    }

    /**
     * Get all content sections.
     */
    public function getAll() {
        $db = Database::getInstance()->getConnection();
        $stmt = $db->query("SELECT * FROM content ORDER BY section");
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($results)) {
            return Response::success([]);
        }

        $sections = [];
        foreach ($results as $row) {
            $section = $row['section'];
            if (isset($sections[$section])) {
                continue;
            }

            $sections[$section] = [
                'section'        => $section,
                'data'           => $this->decodeData($row['data']),
                'image_1'        => $row['image_1'],
                'image_1_alt'    => $row['image_1_alt'],
                'image_2'        => $row['image_2'],
                'image_2_alt'    => $row['image_2_alt'],
                'is_published'   => $row['is_published'],
                'created_at'     => $row['created_at'],
                'updated_at'     => $row['updated_at'],
            ];
        }

        return Response::success(array_values($sections));
    }

    /**
     * Get content history for a section.
     */
    public function history($section) {
        $history = Content::getHistory($section);
        if (empty($history)) {
            return Response::notFound('No history found for this section');
        }

        foreach ($history as &$entry) {
            $entry['data'] = $this->decodeData($entry['data'] ?? []);
        }

        return Response::success($history);
    }

    /**
     * Update content for a section (upsert — one row per section).
     */
    public function update($section) {
        $input = json_decode(file_get_contents('php://input'), true);

        if (!isset($input['data'])) {
            return Response::error('Data is required', 400);
        }

        $user = $GLOBALS['user'] ?? null;
        $data = $input['data'];

        // Existing row (if any) — keep images that weren't provided
        $existing = Content::getLatest($section);

        $image1    = $input['image_1']     ?? null;
        $image1Alt = $input['image_1_alt'] ?? null;
        $image2    = $input['image_2']     ?? null;
        $image2Alt = $input['image_2_alt'] ?? null;

        if ($existing) {
            if ($image1 === null && !empty($existing['image_1'])) {
                $image1 = $existing['image_1'];
            }
            if ($image1Alt === null && !empty($existing['image_1_alt'])) {
                $image1Alt = $existing['image_1_alt'];
            }
            if ($image2 === null && !empty($existing['image_2'])) {
                $image2 = $existing['image_2'];
            }
            if ($image2Alt === null && !empty($existing['image_2_alt'])) {
                $image2Alt = $existing['image_2_alt'];
            }
        }

        // Don't store images in the JSON blob
        unset(
            $data['image_1'], $data['image_1_alt'],
            $data['image_2'], $data['image_2_alt']
        );

        $ok = Content::upsert($section, [
            'data'             => $data,
            'image_1'          => $image1,
            'image_1_alt'      => $image1Alt,
            'image_2'          => $image2,
            'image_2_alt'      => $image2Alt,
            'is_published'     => $input['is_published'] ?? 1,
            'last_modified_by' => $user['id'] ?? null,
        ]);

        if (!$ok) {
            return Response::error('Failed to update content', 500);
        }

        return Response::success([
            'section'        => $section,
            'data'           => $data,
            'image_1'        => $image1,
            'image_1_alt'    => $image1Alt,
            'image_2'        => $image2,
            'image_2_alt'    => $image2Alt,
        ], 'Content updated successfully');
    }

    /**
     * Upload an image for a content section (image_1 or image_2).
     */
    public function uploadImage($section) {
        try {
            $user = $GLOBALS['user'] ?? null;
            if (!$user) {
                return Response::error('Unauthorized', 401);
            }

            if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
                return Response::error('No image file provided or upload error', 400);
            }

            $file = $_FILES['image'];
            $imageField   = $_POST['field'] ?? 'image_1';
            $originalName = $_POST['original_name'] ?? $file['name'];

            // Whitelist image field name
            if (!in_array($imageField, ['image_1', 'image_2'], true)) {
                return Response::error("Invalid field '{$imageField}'. Must be image_1 or image_2.", 400);
            }

            // Validate mime
            $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $file['tmp_name']);
            finfo_close($finfo);

            if (!in_array($mimeType, $allowedTypes, true)) {
                return Response::error('Invalid image type. Allowed: JPEG, PNG, WEBP, GIF', 400);
            }

            // 25 MB limit — php.ini upload_max_filesize / post_max_size must match
            $maxSize = 25 * 1024 * 1024;
            if ($file['size'] > $maxSize) {
                return Response::error('Image too large. Max size: 25MB', 400);
            }

            // Unique filename
            $extension     = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
            $baseName      = pathinfo($originalName, PATHINFO_FILENAME);
            $cleanBaseName = preg_replace('/[^a-zA-Z0-9_-]/', '', $baseName) ?: 'image';
            $filename      = $cleanBaseName . '_' . time() . '_' . uniqid() . '.' . $extension;

            $uploadDir = __DIR__ . '/../../uploads/content/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            $targetPath = $uploadDir . $filename;
            if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
                return Response::error('Failed to upload image', 500);
            }

            $imagePath = '/uploads/content/' . $filename;

            // Upsert into content (one row per section)
            $existing = Content::getLatest($section);
            $db = Database::getInstance()->getConnection();

            if ($existing) {
                $stmt = $db->prepare("UPDATE content SET {$imageField} = ? WHERE section = ?");
                $stmt->execute([$imagePath, $section]);
            } else {
                $stmt = $db->prepare("INSERT INTO content (section, data, {$imageField}, is_published) VALUES (?, '{}', ?, 1)");
                $stmt->execute([$section, $imagePath]);
            }

            return Response::success([
                'success'       => true,
                'path'          => $imagePath,
                'url'           => $this->getImageUrl($imagePath),
                'original_name' => $originalName,
                'field'         => $imageField,
            ], 'Image uploaded successfully');

        } catch (Exception $e) {
            error_log("uploadImage exception: " . $e->getMessage());
            return Response::error('Upload failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete an image (image_1 or image_2) for a content section.
     * DELETE bodies are NOT parsed into $_POST by PHP — parse php://input manually.
     */
    public function deleteImage($section) {
        try {
            $user = $GLOBALS['user'] ?? null;
            if (!$user) {
                return Response::error('Unauthorized', 401);
            }

            $imageField = 'image_1';

            if (isset($_POST['field'])) {
                $imageField = $_POST['field'];
            } else {
                $rawInput    = file_get_contents('php://input');
                $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

                if (strpos($contentType, 'multipart/form-data') !== false) {
                    if (preg_match('/name="field"\s*\r?\n\r?\n([^\r\n]+)/', $rawInput, $m)) {
                        $imageField = trim($m[1]);
                    }
                } elseif (strpos($contentType, 'application/x-www-form-urlencoded') !== false) {
                    parse_str($rawInput, $parsed);
                    if (isset($parsed['field'])) {
                        $imageField = $parsed['field'];
                    }
                } elseif (strpos($contentType, 'application/json') !== false) {
                    $parsed = json_decode($rawInput, true);
                    if (isset($parsed['field'])) {
                        $imageField = $parsed['field'];
                    }
                }
            }

            if (!in_array($imageField, ['image_1', 'image_2'], true)) {
                return Response::error("Invalid field '{$imageField}'. Must be image_1 or image_2.", 400);
            }

            $db = Database::getInstance()->getConnection();

            // Find the row for this section (one row per section now)
            $stmt = $db->prepare("SELECT id, {$imageField} AS img FROM content WHERE section = ? LIMIT 1");
            $stmt->execute([$section]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$row || empty($row['img'])) {
                return Response::error('No image to delete', 404);
            }

            $imagePath = $row['img'];

            // Delete physical file (only if inside uploads/)
            $uploadsRoot = realpath(__DIR__ . '/../../uploads');
            $fullPath    = realpath(__DIR__ . '/../..' . $imagePath);

            if ($fullPath && $uploadsRoot && strpos($fullPath, $uploadsRoot) === 0 && file_exists($fullPath)) {
                @unlink($fullPath);
            }

            // NULL out only this row
            $stmt = $db->prepare("UPDATE content SET {$imageField} = NULL WHERE id = ?");
            $stmt->execute([$row['id']]);

            return Response::success(null, 'Image deleted successfully');

        } catch (Exception $e) {
            error_log("deleteImage exception: " . $e->getMessage());
            return Response::error('Delete failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Build absolute URL for an image path.
     */
    private function getImageUrl($path) {
        if (empty($path)) {
            return null;
        }
        $baseUrl = $_ENV['APP_URL'] ?? 'http://localhost:8000/';
        return rtrim($baseUrl, '/') . $path;
    }
}